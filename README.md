# Neuro Triage (CogniTriage MVP)

Multi-agent cognitive decline screening dashboard.

Structure:
- cognitriage-frontend: React + Vite + Tailwind frontend
- cognitriage-backend: FastAPI backend

Deployed:
- Frontend: https://cognitive-triage-dashboard-p8dpg3q6.devinapps.com
- Backend: https://app-xjtriknc.fly.dev (health: /healthz)

Quick demo (production):
1) Open the frontend link above
2) Click "Use Demo Case"
3) Click "Start Analysis"

Local development:

Backend
```
cd cognitriage-backend
poetry install
poetry run fastapi dev app/main.py
# http://127.0.0.1:8000/healthz
```

Frontend
```
cd cognitriage-frontend
cp .env.example .env   # points to http://localhost:8000
npm install
npm run dev
# http://localhost:5173
```

Notes
- Backend uses an in-memory job store for the MVP.
- MRI handling is simulated for demo; do not upload PHI.
- Sequential agent pipeline with per-agent status and evidence.

Requested by: loubaba@stanford.edu (@loubabaelayoubi)
# Speed test
