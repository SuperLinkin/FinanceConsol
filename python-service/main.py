"""
Cash Flow Calculation Service
FastAPI service for AI-powered cash flow statement generation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

from services.data_loader import ConsolidationDataLoader
from services.account_classifier import AccountClassifier
from services.cashflow_calculator import CashFlowCalculator
from services.langchain_orchestrator import CashFlowOrchestrator

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Cash Flow Calculation Service",
    description="AI-powered cash flow statement generation using consolidated trial balance data",
    version="1.0.0"
)

# CORS middleware
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class CashFlowRequest(BaseModel):
    company_id: str
    current_period: str
    previous_period: str
    use_ai: bool = True
    openai_api_key: Optional[str] = None

class CashFlowComponent(BaseModel):
    id: str
    name: str
    category: str  # Operating, Investing, Financing
    current_value: float
    previous_value: float
    movement: float
    cash_impact: float
    accounts: List[str]
    formula: str
    confidence_score: Optional[float] = None

class CashFlowResponse(BaseModel):
    success: bool
    current_period: str
    previous_period: str
    components: List[CashFlowComponent]
    operating_total: float
    investing_total: float
    financing_total: float
    net_cash_change: float
    metadata: Dict[str, Any]

# Health Check
@app.get("/")
async def root():
    return {
        "service": "Cash Flow Calculation Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Main Cash Flow Generation Endpoint
@app.post("/api/cashflow/generate", response_model=CashFlowResponse)
async def generate_cashflow(request: CashFlowRequest):
    """
    Generate cash flow statement using AI-powered classification and calculation

    Process:
    1. Load consolidated trial balance data from database
    2. Classify accounts using sentence-transformers
    3. Calculate movements and cash impacts
    4. Use LangChain to orchestrate and validate
    5. Return structured cash flow statement
    """
    try:
        # Initialize services
        data_loader = ConsolidationDataLoader(os.getenv("DATABASE_URL"))
        classifier = AccountClassifier()
        calculator = CashFlowCalculator()

        # Load consolidated data
        current_data = data_loader.load_consolidated_tb(
            company_id=request.company_id,
            period=request.current_period
        )

        previous_data = data_loader.load_consolidated_tb(
            company_id=request.company_id,
            period=request.previous_period
        )

        if current_data.empty or previous_data.empty:
            raise HTTPException(
                status_code=404,
                detail="No trial balance data found for specified periods"
            )

        # Load Chart of Accounts for context
        coa_data = data_loader.load_chart_of_accounts(company_id=request.company_id)

        # Classify accounts using semantic embeddings
        classified_accounts = classifier.classify_accounts(
            coa_data=coa_data,
            tb_data=current_data
        )

        # Calculate cash flow components
        components = calculator.calculate_components(
            current_tb=current_data,
            previous_tb=previous_data,
            classifications=classified_accounts,
            coa_data=coa_data
        )

        # Use LangChain orchestration if AI is enabled
        if request.use_ai:
            api_key = request.openai_api_key or os.getenv("OPENAI_API_KEY")
            if api_key:
                orchestrator = CashFlowOrchestrator(api_key=api_key)
                components = orchestrator.enhance_components(
                    components=components,
                    current_data=current_data,
                    previous_data=previous_data,
                    coa_data=coa_data
                )

        # Calculate totals
        operating_total = sum(c['cash_impact'] for c in components if c['category'] == 'Operating')
        investing_total = sum(c['cash_impact'] for c in components if c['category'] == 'Investing')
        financing_total = sum(c['cash_impact'] for c in components if c['category'] == 'Financing')
        net_cash_change = operating_total + investing_total + financing_total

        # Build response
        response = CashFlowResponse(
            success=True,
            current_period=request.current_period,
            previous_period=request.previous_period,
            components=[CashFlowComponent(**c) for c in components],
            operating_total=operating_total,
            investing_total=investing_total,
            financing_total=financing_total,
            net_cash_change=net_cash_change,
            metadata={
                "total_components": len(components),
                "ai_enhanced": request.use_ai,
                "accounts_classified": len(classified_accounts)
            }
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Classification Testing Endpoint
@app.post("/api/cashflow/classify")
async def classify_accounts(company_id: str):
    """
    Test account classification for a company
    """
    try:
        data_loader = ConsolidationDataLoader(os.getenv("DATABASE_URL"))
        classifier = AccountClassifier()

        coa_data = data_loader.load_chart_of_accounts(company_id=company_id)

        if coa_data.empty:
            raise HTTPException(status_code=404, detail="No chart of accounts found")

        classifications = classifier.classify_accounts(coa_data=coa_data)

        return {
            "success": True,
            "total_accounts": len(classifications),
            "classifications": classifications
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8000))
    host = os.getenv("SERVICE_HOST", "0.0.0.0")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True
    )
