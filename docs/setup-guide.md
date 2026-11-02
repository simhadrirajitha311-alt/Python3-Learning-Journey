# CareerBridge AI - Setup & Installation Guide

This guide details running CareerBridge AI both in local development and production environments.

## Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Python 3.10+ (Python 3.12 recommended for Django workers)
- MongoDB (Local instance or free MongoDB Atlas URI)
- Redis 7+ (for Celery background tasks)
- Google Gemini API Key

---

## 1. Quickstart (Unified Full-Stack Development)

The repository provides a single-command dev environment running React + Vite + the full `/api/v1` backend server on port 3000:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/careerbridge-ai.git
cd careerbridge-ai

# 2. Install dependencies
npm install

# 3. Create your local .env file
cp .env.example .env

# 4. Start the full-stack server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Django Backend & Celery Worker Setup (Multi-Service Architecture)

For running the standalone Django REST Framework service alongside Celery workers:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run Django migrations & check connections
python manage.py migrate

# 5. Launch the Django API server (port 8000)
python manage.py runserver 0.0.0.0:8000

# 6. In a separate terminal, start the Celery task worker
celery -A config worker --loglevel=info

# 7. In a separate terminal, start the Celery Beat scheduler
celery -A config beat --loglevel=info
```

---

## 3. Docker Compose (Production Deployment)

Run the entire cluster (React frontend, Django backend, Celery worker, Redis, and MongoDB) via Docker Compose:

```bash
docker-compose up --build -d
```
Inspect logs anytime:
```bash
docker-compose logs -f
```
