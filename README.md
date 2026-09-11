# Geo-Mine AI (SIH26023)

AI-Powered Geological & DGMS Mining Statutory Reporting Assistant with Grounded RAG Intelligence.

---

# SIH Project - React & Django Integration

A full-stack web application featuring a modern React frontend (Vite + Tailwind CSS) and a robust Django backend.

---

## 📁 Repository Structure

```text
├── frontend/               # React + Vite + Tailwind CSS Frontend
│   ├── src/                # Application source code (components, pages, context)
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
│
└── backend/                # Python / Django Backend Service
    ├── backend_core/       # Django core settings & configurations
    ├── api/                # API endpoints and logic
    ├── manage.py           # Django management script
    └── .env                # Environment variables (Secret Key - Ignored by Git)

```

---

## 🚀 Quick Start

### 1. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`

### 2. Run Backend
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt  # (or install required packages like django, djangorestframework)
python manage.py migrate
python manage.py runserver
```
Backend API will run at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`)
