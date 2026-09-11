# Geo-Mine AI - Backend Service

FastAPI / Python backend service for Geo-Mine AI RAG ingestion, vector search, and model inference.

## Getting Started

### 1. Create a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Development Server
```bash
python main.py
# Or with uvicorn:
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
Swagger API documentation: `http://localhost:8000/docs`
