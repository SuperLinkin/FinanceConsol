"""
Data Loader Service
Loads consolidated trial balance and chart of accounts data using pandas
"""

import pandas as pd
from sqlalchemy import create_engine, text
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class ConsolidationDataLoader:
    """
    Loads and processes consolidated financial data from Supabase/PostgreSQL
    """

    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)

    def load_consolidated_tb(self, company_id: str, period: str) -> pd.DataFrame:
        """
        Load consolidated trial balance for a specific period

        Returns DataFrame with columns:
        - account_code
        - account_name
        - debit (consolidated across all entities)
        - credit (consolidated across all entities)
        - net_amount (debit - credit)
        """
        query = text("""
            SELECT
                tb.account_code,
                tb.account_name,
                SUM(tb.debit) as total_debit,
                SUM(tb.credit) as total_credit,
                SUM(tb.debit - tb.credit) as net_amount
            FROM trial_balance tb
            INNER JOIN entities e ON tb.entity_id = e.id
            WHERE e.company_id = :company_id
            AND tb.period = :period
            GROUP BY tb.account_code, tb.account_name
            ORDER BY tb.account_code
        """)

        with self.engine.connect() as conn:
            df = pd.read_sql(query, conn, params={"company_id": company_id, "period": period})

        logger.info(f"Loaded {len(df)} consolidated accounts for period {period}")
        return df

    def load_chart_of_accounts(self, company_id: str) -> pd.DataFrame:
        """
        Load chart of accounts with full hierarchy

        Returns DataFrame with columns:
        - account_code
        - account_name
        - class_name (Assets, Liabilities, Equity, Revenue, Expenses)
        - sub_class_name
        - note_name
        - sub_note_name
        - account_type
        - normal_balance (Debit/Credit)
        """
        query = text("""
            SELECT DISTINCT
                coa.account_code,
                coa.account_name,
                coa.class_name,
                coa.subclass_name as sub_class_name,
                coa.note_name,
                coa.subnote_name as sub_note_name,
                coa.account_type,
                coa.normal_balance
            FROM chart_of_accounts coa
            INNER JOIN entities e ON coa.entity_id = e.id
            WHERE e.company_id = :company_id
            AND coa.is_active = true
            ORDER BY coa.account_code
        """)

        with self.engine.connect() as conn:
            df = pd.read_sql(query, conn, params={"company_id": company_id})

        logger.info(f"Loaded {len(df)} accounts from COA")
        return df

    def get_account_movements(
        self,
        current_tb: pd.DataFrame,
        previous_tb: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculate movements between two periods

        Returns DataFrame with:
        - account_code
        - account_name
        - current_balance
        - previous_balance
        - movement (current - previous)
        """
        # Merge on account_code
        movements = current_tb.merge(
            previous_tb,
            on='account_code',
            how='outer',
            suffixes=('_current', '_previous')
        )

        # Fill NaN with 0 for accounts that don't exist in both periods
        movements['net_amount_current'] = movements['net_amount_current'].fillna(0)
        movements['net_amount_previous'] = movements['net_amount_previous'].fillna(0)

        # Calculate movement
        movements['movement'] = movements['net_amount_current'] - movements['net_amount_previous']

        # Use current account name, fallback to previous if null
        movements['account_name'] = movements['account_name_current'].fillna(movements['account_name_previous'])

        # Select relevant columns
        result = movements[[
            'account_code',
            'account_name',
            'net_amount_current',
            'net_amount_previous',
            'movement'
        ]].rename(columns={
            'net_amount_current': 'current_balance',
            'net_amount_previous': 'previous_balance'
        })

        logger.info(f"Calculated movements for {len(result)} accounts")
        return result
