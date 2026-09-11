from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os

app = FastAPI(
    title="Geo-Mine AI Backend Service",
    description="Backend API for RAG ingestion, vector search, and geological query processing.",
    version="1.0.0"
)

# Configure CORS so frontend (http://localhost:5173) can communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    role: Optional[str] = "officer"

class QueryResponse(BaseModel):
    response: str
    citations: List[dict] = []
    confidence: float = 0.95

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Geo-Mine AI Backend API",
        "version": "1.0.0"
    }

@app.post("/api/query", response_model=QueryResponse)
def handle_geological_query(request: QueryRequest):
    # Endpoint for your friend to connect LLM / RAG / Vector search models
    return {
        "response": f"Backend received query: '{request.query}'. Connect your RAG pipeline / model inference here.",
        "citations": [
            {
                "title": "Barakar Formation Core Sample - Jharia Sector 4",
                "clause": "DGMS Regulation 111 Compliance",
                "confidence": 0.96
            }
        ],
        "confidence": 0.96
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
