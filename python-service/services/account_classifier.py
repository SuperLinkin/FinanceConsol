"""
Account Classifier Service
Uses sentence-transformers for semantic account classification
"""

from sentence_transformers import SentenceTransformer, util
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import logging
import os

logger = logging.getLogger(__name__)

class AccountClassifier:
    """
    Classifies chart of accounts using semantic embeddings for cash flow categorization
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize with a sentence transformer model

        Args:
            model_name: HuggingFace model name (default: all-MiniLM-L6-v2 - fast and accurate)
        """
        logger.info(f"Loading sentence transformer model: {model_name}")
        self.model = SentenceTransformer(model_name)

        # Cash Flow Classification Templates
        self.cf_templates = {
            "operating_profit": [
                "revenue", "sales", "income", "profit", "loss",
                "cost of goods sold", "cost of sales", "gross profit"
            ],
            "depreciation_amortization": [
                "depreciation", "amortization", "accumulated depreciation",
                "non-cash expense", "write-down", "impairment"
            ],
            "working_capital_receivables": [
                "trade receivables", "accounts receivable", "debtors",
                "receivables", "AR", "customer receivables"
            ],
            "working_capital_inventory": [
                "inventory", "stock", "raw materials", "work in progress",
                "finished goods", "WIP"
            ],
            "working_capital_payables": [
                "trade payables", "accounts payable", "creditors",
                "payables", "AP", "supplier payables", "accrued expenses"
            ],
            "working_capital_other": [
                "prepayments", "accruals", "deferred revenue",
                "provisions", "other receivables", "other payables"
            ],
            "capex_ppe": [
                "property plant equipment", "PPE", "fixed assets",
                "land", "buildings", "machinery", "equipment", "vehicles"
            ],
            "capex_intangibles": [
                "intangible assets", "goodwill", "software", "patents",
                "licenses", "trademarks", "intellectual property"
            ],
            "investments": [
                "investments", "subsidiaries", "associates", "joint ventures",
                "financial assets", "securities"
            ],
            "borrowings": [
                "loans", "borrowings", "debt", "bank loans", "bonds payable",
                "notes payable", "long-term debt", "short-term loans"
            ],
            "equity": [
                "share capital", "common stock", "preferred stock",
                "retained earnings", "reserves", "equity", "capital"
            ],
            "dividends": [
                "dividends", "dividend payable", "distributions"
            ],
            "interest": [
                "interest expense", "interest income", "finance costs",
                "interest payable", "interest receivable"
            ],
            "tax": [
                "income tax", "tax payable", "tax receivable",
                "deferred tax", "tax expense"
            ]
        }

        # Pre-compute embeddings for templates
        logger.info("Computing embeddings for classification templates...")
        self.template_embeddings = {}
        for category, keywords in self.cf_templates.items():
            combined_text = " ".join(keywords)
            self.template_embeddings[category] = self.model.encode(
                combined_text,
                convert_to_tensor=True
            )

        logger.info(f"Classifier initialized with {len(self.cf_templates)} categories")

    def classify_account(self, account_name: str, account_desc: str = "") -> Dict[str, float]:
        """
        Classify a single account using semantic similarity

        Args:
            account_name: Name of the account
            account_desc: Optional description or hierarchy info

        Returns:
            Dict mapping category to confidence score
        """
        # Combine account name and description
        text = f"{account_name} {account_desc}".strip().lower()

        # Encode the account text
        account_embedding = self.model.encode(text, convert_to_tensor=True)

        # Calculate similarity scores
        scores = {}
        for category, template_embedding in self.template_embeddings.items():
            similarity = util.cos_sim(account_embedding, template_embedding).item()
            scores[category] = similarity

        return scores

    def classify_accounts(
        self,
        coa_data: pd.DataFrame,
        tb_data: pd.DataFrame = None
    ) -> Dict[str, Dict]:
        """
        Classify all accounts in the chart of accounts

        Args:
            coa_data: DataFrame with account_code, account_name, class_name, note_name, etc.
            tb_data: Optional trial balance data to prioritize material accounts

        Returns:
            Dict mapping account_code to classification result
        """
        classifications = {}

        for _, row in coa_data.iterrows():
            account_code = row['account_code']
            account_name = row['account_name']

            # Build description from hierarchy
            desc_parts = []
            if pd.notna(row.get('class_name')):
                desc_parts.append(row['class_name'])
            if pd.notna(row.get('note_name')):
                desc_parts.append(row['note_name'])
            if pd.notna(row.get('sub_note_name')):
                desc_parts.append(row['sub_note_name'])

            account_desc = " ".join(desc_parts)

            # Classify
            scores = self.classify_account(account_name, account_desc)

            # Get top category
            top_category = max(scores, key=scores.get)
            confidence = scores[top_category]

            # Map to cash flow category (Operating/Investing/Financing)
            cf_category, cf_component = self._map_to_cashflow_category(
                top_category,
                scores,
                row
            )

            classifications[account_code] = {
                "account_name": account_name,
                "top_category": top_category,
                "confidence": confidence,
                "all_scores": scores,
                "cf_category": cf_category,
                "cf_component": cf_component,
                "class_name": row.get('class_name'),
                "note_name": row.get('note_name')
            }

        logger.info(f"Classified {len(classifications)} accounts")
        return classifications

    def _map_to_cashflow_category(
        self,
        top_category: str,
        scores: Dict[str, float],
        row: pd.Series
    ) -> Tuple[str, str]:
        """
        Map the detailed classification to Operating/Investing/Financing

        Returns:
            (cf_category, cf_component) tuple
        """
        # Operating Activities
        if top_category in ["operating_profit", "tax", "interest"]:
            return ("Operating", top_category)

        if top_category == "depreciation_amortization":
            return ("Operating", "Depreciation and Amortization")

        if "working_capital" in top_category:
            component_name = top_category.replace("working_capital_", "").replace("_", " ").title()
            return ("Operating", f"Change in {component_name}")

        # Investing Activities
        if top_category in ["capex_ppe", "capex_intangibles", "investments"]:
            component_map = {
                "capex_ppe": "Purchase of Property, Plant & Equipment",
                "capex_intangibles": "Purchase of Intangible Assets",
                "investments": "Net Investment Activities"
            }
            return ("Investing", component_map.get(top_category, top_category))

        # Financing Activities
        if top_category in ["borrowings", "equity", "dividends"]:
            component_map = {
                "borrowings": "Net Borrowings",
                "equity": "Net Equity Proceeds",
                "dividends": "Dividends Paid"
            }
            return ("Financing", component_map.get(top_category, top_category))

        # Default: check class_name from COA
        class_name = row.get('class_name', '').lower()
        if 'asset' in class_name or 'liability' in class_name:
            return ("Operating", "Working Capital Adjustment")

        return ("Operating", "Other Operating Items")

    def get_component_sign(self, cf_category: str, component_type: str, class_name: str) -> int:
        """
        Determine the sign multiplier for cash flow impact

        Returns:
            1 or -1 based on cash flow logic
        """
        # Operating Activities
        if cf_category == "Operating":
            # Depreciation/Amortization: Add back (positive)
            if "depreciation" in component_type.lower() or "amortization" in component_type.lower():
                return 1

            # Working Capital:
            # - Current Assets (AR, Inventory): increase = outflow (negative)
            # - Current Liabilities (AP, Accruals): increase = inflow (positive)
            if "asset" in class_name.lower():
                return -1  # Increase in assets = cash outflow
            elif "liability" in class_name.lower():
                return 1   # Increase in liabilities = cash inflow

            # Profit items: positive as is
            return 1

        # Investing Activities
        # Increase in assets (PPE, Intangibles) = cash outflow (negative)
        if cf_category == "Investing":
            return -1

        # Financing Activities
        # Increase in debt/equity = cash inflow (positive)
        # Dividends paid = cash outflow (negative)
        if cf_category == "Financing":
            if "dividend" in component_type.lower():
                return -1
            return 1

        return 1
