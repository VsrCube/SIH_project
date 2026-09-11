# api/admin.py
from django.contrib import admin
from .models import MockData

admin.site.register(MockData)