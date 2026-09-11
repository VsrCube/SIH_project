# api/models.py
from django.db import models

class MockData(models.Model):
    query_keyword = models.CharField(max_length=100, help_text="Word to trigger this answer (e.g., 'Jharia')")
    answer = models.TextField()
    token_id = models.CharField(max_length=50)
    page_number = models.IntegerField(default=1)
    
    def __str__(self):
        return f"Trigger: {self.query_keyword}"