# api/views.py
import time
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import MockData

@api_view(['POST'])
def query_ai(request):
    user_query = request.data.get('query', '').lower()
    
    # Illusion of AI processing (1.5 seconds)
    time.sleep(1.5)
    
    # Database mein check kar raha hai ki user query ka keyword exist karta hai kya
    # Jaise agar user ne "Jharia 2018 output" likha, aur DB me keyword "jharia" hai, toh match ho jayega.
    mock_records = MockData.objects.all()
    
    for record in mock_records:
        if record.query_keyword.lower() in user_query:
            return Response({
                "status": "success",
                "answer": record.answer,
                "citations": [
                    {
                        "token_id": record.token_id,
                        "page": record.page_number
                    }
                ]
            })
            
    # Fallback agar koi aur question puch le jo DB me na ho
    return Response({
        "status": "success",
        "answer": "Based on the internal geological survey, the metrics show standard operational output. [Source: TOKEN-CIL-DEFAULT, Page 1]",
        "citations": [
            {
                "token_id": "TOKEN-CIL-DEFAULT",
                "page": 1
            }
        ]
    })