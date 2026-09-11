# Geo-Mine AI (SIH26023)

AI-Powered Geological & DGMS Mining Statutory Reporting Assistant with Grounded RAG Intelligence.

---

## 📁 Repository Structure

```
├── frontend/             # React + Vite + Tailwind CSS Frontend
│   ├── src/              # Application source code
│   │   ├── components/   # UI components (RoleSlider, AppSidebar, CitationModal, etc.)
│   │   ├── config/       # Firebase auth & Cloud Firestore configuration
│   │   ├── context/      # Role, theme, and document state management
│   │   ├── pages/        # LoginPage, OfficerDashboard, AdminDashboard
│   │   └── ...
│   ├── package.json      # Frontend npm dependencies
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/              # Python / FastAPI Backend Service
    ├── main.py           # FastAPI entrypoint & API routes
    ├── requirements.txt  # Python package dependencies
    └── README.md         # Backend setup instructions
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
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Backend API will run at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`)
