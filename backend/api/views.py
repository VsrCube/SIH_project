# api/views.py
import os
from dotenv import load_dotenv
from rest_framework.response import Response
from rest_framework.decorators import api_view
from google import genai
from .models import MockData

# Server start hote hi ek baar .env load karega
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, '.env')
load_dotenv(env_path)

api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

@api_view(['POST'])
def query_ai(request):
    if not client:
        return Response({"status": "error", "answer": "API Key is missing from .env!", "citations": []})
        
    user_query = request.data.get('query', '').lower()
    
    mock_records = MockData.objects.all()
    matched_record = None
    
    for record in mock_records:
        if record.query_keyword.lower() in user_query:
            matched_record = record
            break
            
    if matched_record:
        context_data = matched_record.answer
        citations = [{"token_id": matched_record.token_id, "page": matched_record.page_number}]
    else:
        context_data = "Based on the internal geological survey, the metrics show standard operational output."
        citations = [{"token_id": "TOKEN-CIL-DEFAULT", "page": 1}]
        
    prompt = f"""
    You are Geo-Mine AI, a professional DGMS Statutory Reporting Assistant.
    User Query: {user_query}
    Retrieved Database Context: {context_data}
    Instructions: Answer the User Query based strictly on the Retrieved Database Context. Format nicely.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        ai_generated_answer = response.text
    except Exception as e:
        ai_generated_answer = f"Error communicating with AI: {str(e)}"
        
    return Response({
        "status": "success",
        "answer": ai_generated_answer,
        "citations": citations
    })