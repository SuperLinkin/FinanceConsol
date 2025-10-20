"""
Cash Flow Calculator Service
Calculates cash flow components using indirect method
"""

import pandas as pd
import numpy as np
from typing import Dict, List
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

class CashFlowCalculator:
    """
    Calculates cash flow statement components using indirect method
    """

    def calculate_components(
        self,
        current_tb: pd.DataFrame,
        previous_tb: pd.DataFrame,
        classifications: Dict[str, Dict],
        coa_data: pd.DataFrame
    ) -> List[Dict]:
        """
        Calculate all cash flow components

        Args:
            current_tb: Current period consolidated trial balance
            previous_tb: Previous period consolidated trial balance
            classifications: Account classifications from AccountClassifier
            coa_data: Chart of accounts data

        Returns:
            List of cash flow components with calculations
        """
        # Merge current and previous balances
        movements = self._calculate_movements(current_tb, previous_tb)

        # Group accounts by component
        component_groups = defaultdict(lambda: {
            'accounts': [],
            'current_total': 0,
            'previous_total': 0,
            'movement': 0,
            'category': '',
            'sign': 1
        })

        for _, row in movements.iterrows():
            account_code = row['account_code']

            if account_code not in classifications:
                continue

            classification = classifications[account_code]
            cf_category = classification['cf_category']
            cf_component = classification['cf_component']
            class_name = classification.get('class_name', '')

            # Determine sign multiplier
            sign = self._get_sign_multiplier(cf_category, cf_component, class_name)

            # Group key
            component_key = f"{cf_category}::{cf_component}"

            # Accumulate
            component_groups[component_key]['category'] = cf_category
            component_groups[component_key]['component_name'] = cf_component
            component_groups[component_key]['accounts'].append(account_code)
            component_groups[component_key]['current_total'] += row['current_balance']
            component_groups[component_key]['previous_total'] += row['previous_balance']
            component_groups[component_key]['movement'] += row['movement']
            component_groups[component_key]['sign'] = sign

        # Build components list
        components = []
        for component_key, data in component_groups.items():
            movement = data['movement']
            cash_impact = movement * data['sign']

            # Skip immaterial components (less than 1000)
            if abs(cash_impact) < 1000:
                continue

            component = {
                'id': component_key.replace('::', '_'),
                'name': data['component_name'],
                'category': data['category'],
                'current_value': float(data['current_total']),
                'previous_value': float(data['previous_total']),
                'movement': float(movement),
                'cash_impact': float(cash_impact),
                'accounts': data['accounts'],
                'formula': self._generate_formula(data['accounts'], coa_data),
                'confidence_score': None  # Will be set by LangChain if used
            }

            components.append(component)

        # Sort by category then absolute cash impact
        components.sort(
            key=lambda x: (
                self._category_order(x['category']),
                -abs(x['cash_impact'])
            )
        )

        logger.info(f"Generated {len(components)} cash flow components")
        return components

    def _calculate_movements(
        self,
        current_tb: pd.DataFrame,
        previous_tb: pd.DataFrame
    ) -> pd.DataFrame:
        """Calculate movements between periods"""
        movements = current_tb.merge(
            previous_tb,
            on='account_code',
            how='outer',
            suffixes=('_current', '_previous')
        )

        movements['net_amount_current'] = movements['net_amount_current'].fillna(0)
        movements['net_amount_previous'] = movements['net_amount_previous'].fillna(0)
        movements['movement'] = movements['net_amount_current'] - movements['net_amount_previous']

        movements['account_name'] = movements['account_name_current'].fillna(
            movements['account_name_previous']
        )

        return movements[[
            'account_code',
            'account_name',
            'net_amount_current',
            'net_amount_previous',
            'movement'
        ]].rename(columns={
            'net_amount_current': 'current_balance',
            'net_amount_previous': 'previous_balance'
        })

    def _get_sign_multiplier(
        self,
        cf_category: str,
        component_name: str,
        class_name: str
    ) -> int:
        """
        Determine sign multiplier for cash flow impact

        Returns 1 or -1 based on indirect method logic
        """
        component_lower = component_name.lower()

        # Operating Activities
        if cf_category == "Operating":
            # Add back non-cash expenses
            if any(term in component_lower for term in ["depreciation", "amortization"]):
                return 1

            # Working Capital
            if "change in" in component_lower or "working capital" in component_lower:
                # Assets: increase = outflow (negative)
                if "asset" in class_name.lower() or any(term in component_lower for term in ["receivable", "inventory", "prepayment"]):
                    return -1
                # Liabilities: increase = inflow (positive)
                elif "liability" in class_name.lower() or any(term in component_lower for term in ["payable", "accrual"]):
                    return 1

            # Profit/Loss items
            return 1

        # Investing Activities
        # Increase in long-term assets = outflow (negative)
        if cf_category == "Investing":
            if any(term in component_lower for term in ["purchase", "acquisition", "capex"]):
                return -1
            elif any(term in component_lower for term in ["disposal", "sale", "proceeds"]):
                return 1
            # Default for investing
            return -1

        # Financing Activities
        if cf_category == "Financing":
            # Dividends paid = outflow (negative)
            if "dividend" in component_lower:
                return -1
            # Repayment = outflow (negative)
            elif "repayment" in component_lower:
                return -1
            # New borrowings/equity = inflow (positive)
            else:
                return 1

        return 1

    def _generate_formula(self, account_codes: List[str], coa_data: pd.DataFrame) -> str:
        """Generate human-readable formula"""
        if not account_codes:
            return ""

        # Get account names
        account_map = dict(zip(coa_data['account_code'], coa_data['account_name']))
        account_names = [account_map.get(code, code) for code in account_codes[:5]]  # Limit to 5

        if len(account_codes) > 5:
            formula = " + ".join(account_names) + f" + {len(account_codes) - 5} more"
        else:
            formula = " + ".join(account_names)

        return formula

    def _category_order(self, category: str) -> int:
        """Return sort order for categories"""
        order = {"Operating": 0, "Investing": 1, "Financing": 2}
        return order.get(category, 99)
