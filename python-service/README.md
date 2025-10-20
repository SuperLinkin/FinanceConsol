# Cash Flow Calculation Service

AI-powered Python service for generating cash flow statements from consolidated trial balance data.

## Features

- **Data Ingestion**: Loads consolidated trial balance using pandas and SQLAlchemy
- **Semantic Classification**: Uses sentence-transformers for intelligent account classification
- **Indirect Method**: Proper cash flow calculations following IFRS/GAAP standards
- **AI Enhancement**: LangChain + OpenAI for validation and component naming
- **RESTful API**: FastAPI endpoints for integration with Next.js frontend

## Architecture

```
┌─────────────────┐
│  Next.js App    │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  FastAPI        │
│  (Python API)   │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬─────────┐
    ▼         ▼          ▼         ▼
┌────────┐ ┌──────┐ ┌─────────┐ ┌─────────┐
│ Pandas │ │ ST*  │ │ LangChain│ │ Supabase│
│ + NumPy│ │      │ │ + OpenAI│ │   DB    │
└────────┘ └──────┘ └─────────┘ └─────────┘
```

*ST = Sentence Transformers

## Installation

### 1. Create Virtual Environment

```bash
cd python-service
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** This will download ~2GB of ML models. First run may take 10-15 minutes.

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key (optional, for AI enhancement)

## Usage

### Start the Service

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Open `http://localhost:8000/docs` for interactive Swagger UI

### Generate Cash Flow

**Endpoint:** `POST /api/cashflow/generate`

**Request:**
```json
{
  "company_id": "uuid-here",
  "current_period": "2024-12-31",
  "previous_period": "2023-12-31",
  "use_ai": true,
  "openai_api_key": "sk-..."
}
```

**Response:**
```json
{
  "success": true,
  "current_period": "2024-12-31",
  "previous_period": "2023-12-31",
  "components": [
    {
      "id": "operating_depreciation",
      "name": "Depreciation and Amortization",
      "category": "Operating",
      "current_value": 150000.00,
      "previous_value": 120000.00,
      "movement": 30000.00,
      "cash_impact": 30000.00,
      "accounts": ["4501", "4502"],
      "formula": "Depreciation Expense + Amortization Expense",
      "confidence_score": 0.95
    }
  ],
  "operating_total": 450000.00,
  "investing_total": -250000.00,
  "financing_total": 100000.00,
  "net_cash_change": 300000.00,
  "metadata": {
    "total_components": 12,
    "ai_enhanced": true,
    "accounts_classified": 150
  }
}
```

## How It Works

### 1. Data Loading (pandas)
```python
# Load consolidated trial balance
current_tb = data_loader.load_consolidated_tb(company_id, "2024-12-31")
# Aggregates across all entities by account code
```

### 2. Account Classification (sentence-transformers)
```python
# Semantic similarity matching
classifier.classify_accounts(coa_data, tb_data)
# Maps accounts to: Operating/Investing/Financing
```

### 3. Cash Flow Calculation
```python
# Indirect method
movement = current_balance - previous_balance
cash_impact = movement * sign_multiplier

# Sign logic:
# - Current Assets (AR, Inventory): sign = -1
# - Current Liabilities (AP): sign = +1
# - Non-cash Expenses (Depreciation): sign = +1
```

### 4. AI Enhancement (LangChain + OpenAI)
```python
# Validates and enhances each component
orchestrator.enhance_components(components)
# Returns confidence scores and suggestions
```

## Tech Stack

| Library | Purpose |
|---------|---------|
| **FastAPI** | RESTful API framework |
| **Pandas** | Data manipulation and aggregation |
| **NumPy** | Numerical calculations |
| **numpy-financial** | Financial calculations |
| **sentence-transformers** | Semantic account classification |
| **LangChain** | AI orchestration |
| **OpenAI GPT-4** | Component validation and naming |
| **SQLAlchemy** | Database ORM |
| **Pydantic** | Request/response validation |

## Development

### Run with Auto-Reload

```bash
uvicorn main:app --reload --port 8000
```

### Run Tests

```bash
pytest tests/
```

### Check Logs

The service logs to stdout. For production, configure logging to file.

## Integration with Next.js

Update your Next.js API route to call the Python service:

```javascript
// app/api/cashflow/ai-generate/route.js
export async function POST(request) {
  const { company_id, current_period, previous_period } = await request.json();

  const response = await fetch('http://localhost:8000/api/cashflow/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id,
      current_period,
      previous_period,
      use_ai: true
    })
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

## Performance

- **Embedding Caching**: First run slower (~30s), subsequent runs fast (~2-3s)
- **Batch Processing**: Can handle 100+ accounts efficiently
- **AI Calls**: Optional, adds ~5-10s per component if enabled

## Troubleshooting

### Model Download Fails
```bash
# Manual download
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### Database Connection Error
Check your `DATABASE_URL` format:
```
postgresql://user:password@host:5432/database
```

### OpenAI API Errors
- Ensure API key is valid
- Check rate limits
- AI enhancement is optional - disable with `use_ai: false`

## License

Proprietary - Part of Financial Consolidation System
