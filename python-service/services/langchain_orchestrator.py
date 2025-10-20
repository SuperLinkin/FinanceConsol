"""
LangChain Orchestrator Service
Uses LangChain to enhance and validate cash flow components with AI
"""

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import pandas as pd
import logging
import json

logger = logging.getLogger(__name__)

class ComponentEnhancement(BaseModel):
    """Output schema for component enhancement"""
    confidence_score: float = Field(description="Confidence score 0-1 for this classification")
    suggested_name: Optional[str] = Field(description="Improved component name if needed")
    notes: Optional[str] = Field(description="Explanation or notes about this component")

class CashFlowOrchestrator:
    """
    Uses LangChain and OpenAI to enhance cash flow components with AI reasoning
    """

    def __init__(self, api_key: str, model: str = "gpt-4"):
        self.llm = ChatOpenAI(
            api_key=api_key,
            model=model,
            temperature=0.1  # Low temperature for consistent financial analysis
        )

        # Create prompt template
        self.enhancement_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert financial analyst specializing in cash flow statements under IFRS and GAAP.

Your task is to review automatically generated cash flow components and:
1. Validate the classification (Operating/Investing/Financing)
2. Assess confidence in the categorization
3. Suggest improvements to component naming if needed
4. Flag any unusual patterns

Consider the indirect method:
- Operating: Start with profit, adjust for non-cash items, working capital changes
- Investing: Long-term asset transactions (PPE, intangibles, investments)
- Financing: Equity and debt transactions, dividends

Working capital logic:
- Current assets increase = cash outflow (negative)
- Current liabilities increase = cash inflow (positive)"""),

            ("human", """Analyze this cash flow component:

Component Name: {component_name}
Category: {category}
Accounts Included: {accounts}
Current Period Value: {current_value:,.2f}
Previous Period Value: {previous_value:,.2f}
Movement: {movement:,.2f}
Calculated Cash Impact: {cash_impact:,.2f}

Provide:
1. Confidence score (0-1) for this classification
2. Suggested improved name (if current name is unclear)
3. Brief notes on correctness and any concerns

Return your analysis as JSON with keys: confidence_score, suggested_name, notes""")
        ])

    def enhance_components(
        self,
        components: List[Dict],
        current_data: pd.DataFrame,
        previous_data: pd.DataFrame,
        coa_data: pd.DataFrame
    ) -> List[Dict]:
        """
        Enhance components with AI validation and suggestions

        Args:
            components: List of calculated components
            current_data: Current period trial balance
            previous_data: Previous period trial balance
            coa_data: Chart of accounts

        Returns:
            Enhanced components list
        """
        logger.info(f"Enhancing {len(components)} components with AI...")

        enhanced_components = []

        for component in components:
            try:
                # Get account names for context
                account_codes = component['accounts'][:10]  # Limit to 10 for token efficiency
                account_map = dict(zip(coa_data['account_code'], coa_data['account_name']))
                account_names = [account_map.get(code, code) for code in account_codes]

                # Format prompt
                prompt_values = {
                    "component_name": component['name'],
                    "category": component['category'],
                    "accounts": ", ".join(account_names),
                    "current_value": component['current_value'],
                    "previous_value": component['previous_value'],
                    "movement": component['movement'],
                    "cash_impact": component['cash_impact']
                }

                # Call LLM
                messages = self.enhancement_prompt.format_messages(**prompt_values)
                response = self.llm(messages)

                # Parse response
                try:
                    enhancement = json.loads(response.content)

                    # Update component
                    component['confidence_score'] = enhancement.get('confidence_score', 0.8)

                    # Use suggested name if confidence is high and name is provided
                    if enhancement.get('suggested_name') and enhancement.get('confidence_score', 0) > 0.7:
                        component['ai_suggested_name'] = enhancement['suggested_name']

                    if enhancement.get('notes'):
                        component['ai_notes'] = enhancement['notes']

                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse AI response for component: {component['name']}")
                    component['confidence_score'] = 0.8  # Default

            except Exception as e:
                logger.error(f"Error enhancing component {component['name']}: {str(e)}")
                component['confidence_score'] = 0.7  # Default for errors

            enhanced_components.append(component)

        logger.info("AI enhancement complete")
        return enhanced_components

    def validate_cashflow_statement(
        self,
        components: List[Dict],
        net_cash_change: float
    ) -> Dict:
        """
        Use AI to validate the overall cash flow statement

        Returns validation result with warnings and suggestions
        """
        validation_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert financial auditor reviewing a cash flow statement.

Check for:
1. Reasonableness of operating cash flow vs profit
2. Expected patterns in working capital
3. Material investing or financing activities
4. Overall cash flow health
5. Any red flags or unusual patterns"""),

            ("human", """Review this consolidated cash flow statement:

Components:
{components_summary}

Net Cash Change: {net_cash_change:,.2f}

Provide a brief validation report highlighting:
- Key observations
- Warnings or red flags (if any)
- Suggestions for improvement

Return as JSON with keys: status (OK/WARNING/ERROR), observations (list), warnings (list), suggestions (list)""")
        ])

        # Summarize components
        summary_lines = []
        for comp in components:
            summary_lines.append(
                f"- {comp['category']}: {comp['name']} = {comp['cash_impact']:,.2f}"
            )

        try:
            messages = validation_prompt.format_messages(
                components_summary="\n".join(summary_lines),
                net_cash_change=net_cash_change
            )

            response = self.llm(messages)
            validation = json.loads(response.content)

            logger.info(f"Validation status: {validation.get('status', 'UNKNOWN')}")
            return validation

        except Exception as e:
            logger.error(f"Error validating statement: {str(e)}")
            return {
                "status": "ERROR",
                "observations": [],
                "warnings": [f"Validation failed: {str(e)}"],
                "suggestions": []
            }
