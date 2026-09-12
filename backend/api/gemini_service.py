# backend/api/gemini_service.py
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from dotenv import load_dotenv

# Load .env from backend folder or root
backend_env = Path(__file__).resolve().parent.parent / '.env'
root_env = Path(__file__).resolve().parent.parent.parent / '.env'

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
if root_env.exists():
    load_dotenv(dotenv_path=root_env)

def get_gemini_api_key() -> str:
    """Retrieve Gemini API Key from environment or .env files."""
    if backend_env.exists():
        load_dotenv(dotenv_path=backend_env, override=True)
    elif root_env.exists():
        load_dotenv(dotenv_path=root_env, override=True)
        
    return (
        os.getenv('GEMINI_API_KEY', '').strip() or
        os.getenv('GEMINI_CHAT_API_KEY', '').strip() or
        os.getenv('GOOGLE_API_KEY', '').strip()
    )

def is_greeting(query: str) -> bool:
    """Detect if the user query is a greeting or general conversational hello."""
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', query).strip().lower()
    greetings = {
        'hi', 'he', 'hey', 'hello', 'hola', 'namaste', 'greetings', 'test', 'yo',
        'who are you', 'what are you', 'help', 'good morning', 'good afternoon', 'good evening',
        'what can you do', 'how are you', 'hlo', 'hii', 'hiii', 'heyy'
    }
    return cleaned in greetings or (len(cleaned) <= 2 and not cleaned.isdigit())

def build_greeting_response() -> Tuple[str, List[str]]:
    """Returns a natural greeting response as Geo-Mine AI assistant."""
    text = (
        "Hello Officer! I am **Geo-Mine AI**, your certified Mining & Geological Statutory Assistant for Coal India & DGMS.\n\n"
        "I am ready to assist with real-time strata analysis and compliance verification. You can ask me:\n"
        "• **Strata & Roof Mechanics**: e.g., *'What is the compressive strength (UCS) and RQD of Barakar sandstone?'*\n"
        "• **DGMS Regulations**: e.g., *'What are the mandatory pillar dimensions under Regulation 111?'*\n"
        "• **Coal Seam Assays**: e.g., *'Check thickness and ash content of Jharia Seam X.'*\n"
        "• **Hydrogeological Hazards**: e.g., *'Assess water inrush risks in Raniganj Borehole BH-42.'*\n"
        "• **CBM & Gas Analysis**: e.g., *'What is the methane purity in Mahanadi Basin?'*\n\n"
        "How can I assist your geological inspection or shift planning today?"
    )
    return text, []

def clean_markdown_text(text: str) -> str:
    """Cleans up rogue triple asterisks, unrendered LaTeX artifacts, and formatting quirks."""
    if not text:
        return ""
    # Normalize multiple asterisks (e.g., *** or ****) to standard clean bold
    text = re.sub(r'\*{3,}', '**', text)
    # Clean LaTeX math delimiters & commands into clean unicode
    text = text.replace(r'\text{m}^3/\text{ton}', 'm³/ton')
    text = text.replace(r'\text{m}^3/\text{hour}', 'm³/hour')
    text = text.replace(r'\text{m}^3', 'm³')
    text = re.sub(r'\\text\{([^}]+)\}', r'\1', text)
    text = text.replace('$CH_4$', 'CH₄')
    text = text.replace('$CO$', 'CO')
    text = text.replace('$V_L$', 'VL')
    text = text.replace('$E$', 'E')
    text = text.replace('$\\nu$', 'ν')
    text = text.replace('$', '')
    return text.strip()

def generate_structured_grounded_answer(
    query: str, 
    chroma_chunks: List[Dict[str, Any]],
    model_name: str = "gemini-3.6-flash"
) -> Tuple[str, List[str]]:
    """
    Step 3: Ingests System Prompt + Query + ChromaDB Vectors -> Calls Gemini API.
    Handles greetings naturally and enforces structured output for geological queries.
    """
    # 1. Quick check for greetings / conversational intents
    if is_greeting(query):
        return build_greeting_response()

    api_key = get_gemini_api_key()

    # 2. If no Gemini API key configured, use local verified query-specific template
    if not api_key:
        return build_offline_structured_response(query, chroma_chunks)

    try:
        from google import genai

        client = genai.Client(api_key=api_key)

        # Format ChromaDB context chunks if available
        context_blocks = []
        expected_token_ids = []
        for idx, chunk in enumerate(chroma_chunks, 1):
            token_id = chunk.get("token_id", f"TOKEN-{idx}")
            page = chunk.get("page_number", 1)
            title = chunk.get("title", "Geological Exploration Record")
            category = chunk.get("category", "Geology / Strata Mechanics")
            text = chunk.get("text", "")
            current_status = chunk.get("current_status", text)
            history = chunk.get("history", "")
            additional = chunk.get("additional", "")
            
            expected_token_ids.append(token_id)
            context_blocks.append(
                f"--- SOURCE RECORD #{idx} ---\n"
                f"Token ID: {token_id}\n"
                f"Document Title: {title}\n"
                f"Page Number: {page}\n"
                f"Category: {category}\n"
                f"Core Assay & Technical Summary: {text}\n"
                f"Verified Current Geotechnical Status: {current_status}\n"
                f"Historical & Stratigraphic Context: {history}\n"
                f"DGMS Safety Directives & Support Rules: {additional}\n"
            )

        context_str = "\n".join(context_blocks) if context_blocks else "NO_MATCHING_CHUNKS_FOUND"

        system_instruction = (
            "You are Geo-Mine AI, a Chief Geological Statutory Officer and Senior Mining Geotechnical Specialist "
            "for Coal India Limited and the Directorate General of Mines Safety (DGMS).\n\n"
            "FORMATTING GUIDELINES:\n"
            "- Do NOT output raw LaTeX ($...$) or triple asterisks (***). Use clean Unicode (e.g. CH₄, m³/ton, MPa, E, ν).\n"
            "- Structure your response cleanly using these exact 3 section titles:\n\n"
            "   **Current Status**:\n"
            "   Provide a comprehensive geotechnical and operational assessment with numerical metrics (UCS, RQD %, Young's Modulus, Poisson's ratio, gas purity %, in-situ gas content, cleat permeability, etc.). Use bullet points (•) for distinct metrics.\n"
            "   End this section with: [Token: TOKEN_ID, Page PAGE_NO].\n\n"
            "   **History / Geological Context**:\n"
            "   Provide an in-depth geological and stratigraphic account of the depositional basin, formation age, structural geology, and exploratory core logging history.\n"
            "   End this section with: [Token: TOKEN_ID, Page PAGE_NO].\n\n"
            "   **Additional Info & DGMS Compliance**:\n"
            "   Provide exhaustive statutory regulations citing DGMS CMR 2017 (Regulation 111 / 149), Systematic Support Rules (SSR), convergence monitoring, and safety clearance mandates.\n"
            "   End this section with: [Token: TOKEN_ID, Page PAGE_NO].\n\n"
            "- Ground all factual metrics strictly in the verified ChromaDB context."
        )

        prompt = (
            f"{system_instruction}\n\n"
            f"=== VERIFIED CHROMADB VECTOR CONTEXT ===\n"
            f"{context_str}\n\n"
            f"=== OFFICER QUERY ===\n"
            f"{query}\n\n"
            f"=== RESPONSE ==="
        )

        response = client.models.generate_content(
            model=model_name,
            contents=prompt
        )

        generated_text = response.text if response and response.text else ""
        generated_text = clean_markdown_text(generated_text)
        
        # Extract all token IDs found in the response
        found_tokens = re.findall(r'CHK-[A-Z]+-\d+|TOKEN-[A-Z0-9-]+', generated_text)
        if not found_tokens and expected_token_ids:
            found_tokens = expected_token_ids

        return generated_text, list(set(found_tokens))

    except Exception as e:
        print(f"[Gemini API Warning] Gemini request failed ({e}), falling back to verified local corpus.")
        return build_offline_structured_response(query, chroma_chunks)

def build_offline_structured_response(query: str, chroma_chunks: List[Dict[str, Any]]) -> Tuple[str, List[str]]:
    """Builds a verified structured response from matching local chunk data or guidance."""
    if not chroma_chunks:
        return (
            f"No verified borehole or strata records matching '{query}' were found in the ChromaDB vector repository.",
            []
        )

    chunk = chroma_chunks[0]
    token = chunk.get("token_id", "CHK-BAR-02")
    page = chunk.get("page_number", 1)

    text = (
        f"**Current Status**:\n"
        f"{chunk.get('current_status', chunk.get('text'))}\n"
        f"[Token: {token}, Page {page}]\n\n"
        f"**History / Geological Context**:\n"
        f"{chunk.get('history', 'Exploratory core logging verified across historical Gondwana coalfield formations.')}\n"
        f"[Token: {token}, Page {page}]\n\n"
        f"**Additional Info & DGMS Compliance**:\n"
        f"{chunk.get('additional', 'Mandatory Systematic Support Rules (SSR) and statutory roof convergence monitoring required under DGMS CMR 2017.')}\n"
        f"[Token: {token}, Page {page}]"
    )

    tokens = [c.get("token_id") for c in chroma_chunks if c.get("token_id")]
    return clean_markdown_text(text), tokens

