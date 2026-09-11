# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('query/', views.query_ai, name='query_ai'),
]