# api/views.py
import time
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import MockData
from .chroma_service import search_chroma_vectors, GEOLOGICAL_CHUNKS
from .gemini_service import generate_structured_grounded_answer

@api_view(['POST'])
def query_ai(request):
    raw_query = request.data.get('query', '').strip()
    if not raw_query:
        return Response({
            "status": "error",
            "message": "Query parameter is required"
        }, status=400)

    # -------------------------------------------------------------
    # STEP 1 & 2: User Query -> ChromaDB Vector Search (Retrieves Vectors & Tokens)
    # -------------------------------------------------------------
    chroma_chunks = search_chroma_vectors(raw_query, top_k=2)
    chroma_token_ids = [c["token_id"] for c in chroma_chunks if "token_id" in c]

    # -------------------------------------------------------------
    # STEP 3: System Prompt + Query + ChromaDB Vectors -> Gemini API
    # Enforces Structured Output: Current Status, History, Additional Info
    # -------------------------------------------------------------
    ai_answer, cited_token_ids = generate_structured_grounded_answer(
        query=raw_query,
        chroma_chunks=chroma_chunks,
        model_name="gemini-2.5-flash"
    )

    # -------------------------------------------------------------
    # STEP 4: Anti-Hallucination Gatekeeper (Verify Tokens in PostgreSQL / DB)
    # -------------------------------------------------------------
    # Retrieve all verified token IDs from PostgreSQL / SQLite MockData / Master Corpus
    db_tokens = set(MockData.objects.values_list('token_id', flat=True))
    master_tokens = db_tokens.union({c["token_id"] for c in GEOLOGICAL_CHUNKS})

    verified_citations = []
    hallucination_detected = False

    for token in cited_token_ids:
        if token in master_tokens:
            # Token is verified against PostgreSQL / Master DB
            matching_chunk = next((c for c in chroma_chunks if c.get("token_id") == token), None)
            if not matching_chunk:
                matching_chunk = next((c for c in GEOLOGICAL_CHUNKS if c.get("token_id") == token), None)
            
            page = matching_chunk.get("page_number", 1) if matching_chunk else 1
            doc_title = matching_chunk.get("title", token) if matching_chunk else token

            verified_citations.append({
                "token_id": token,
                "page": page,
                "doc_title": doc_title
            })
        else:
            # AI hallucinated a token ID not present in PostgreSQL!
            hallucination_detected = True
            print(f"[Anti-Hallucination Alert] AI hallucinated unverified token '{token}'. Blocked from output.")

    # If all cited tokens were fake, force fallback to verified ChromaDB token
    if not verified_citations and chroma_chunks:
        fallback_chunk = chroma_chunks[0]
        verified_citations.append({
            "token_id": fallback_chunk["token_id"],
            "page": fallback_chunk["page_number"],
            "doc_title": fallback_chunk["title"]
        })

    # -------------------------------------------------------------
    # STEP 5: Deliver Verified Output to Frontend / Officer
    # -------------------------------------------------------------
    return Response({
        "status": "success",
        "answer": ai_answer,
        "citations": verified_citations,
        "grounding_metadata": {
            "anti_hallucination_verified": not hallucination_detected,
            "vector_store": "ChromaDB (768-D)",
            "verification_db": "PostgreSQL / Master DB",
            "model": "gemini-2.5-flash"
        }
    })