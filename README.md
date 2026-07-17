# FinPulse AI 📊

> AI-Powered Smart Financial Analyzer — Built with FastAPI + Claude + React + AWS

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- Anthropic API Key → https://console.anthropic.com/

---

### Step 1 — Clone & Setup Environment

```bash
git clone <your-repo-url>
cd finpulse-ai

# Create .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

---

### Step 2 — Run Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend running at → http://localhost:8000

---

### Step 3 — Run Frontend (React + Vite)

Open a NEW terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend running at → http://localhost:5173

The Vite dev server automatically proxies `/api/*` calls to the backend.

---

## 🐳 Docker (Single Container)

```bash
# 1. Build the image
docker build -t finpulse-ai .

# 2. Run with your API key
docker run -p 8000:8000 -e ANTHROPIC_API_KEY=your_key_here finpulse-ai

# OR using docker-compose (reads from .env file)
docker-compose up --build
```

App available at → http://localhost:8000

---

## ☁️ AWS Deployment (App Runner)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — FinPulse AI"
git remote add origin https://github.com/your-username/finpulse-ai.git
git push -u origin main
```

### Step 2 — Create App Runner Service

1. Go to **AWS Console** → Search "App Runner"
2. Click **Create Service**
3. Source: **Source code repository** → Connect your GitHub
4. Select your `finpulse-ai` repo and `main` branch
5. Runtime: **Docker** (auto-detected from Dockerfile)
6. **Environment Variables** → Add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `your_actual_api_key`
7. Port: `8000`
8. Click **Create & Deploy**

AWS will build your Docker image and give you a public HTTPS URL like:
`https://xxxxxxxx.us-east-1.awsapprunner.com`

> ⚠️ Set up a **Billing Budget Alert** in AWS to avoid unexpected charges!

---

## 🏗️ Architecture

```
User Browser
     │
     ▼
React Frontend (Vite)
 HTML / CSS / JS
     │
     │  POST /api/analyze
     │  (Server-Sent Events / Streaming)
     ▼
FastAPI Backend (Python)
     │
     │  Anthropic SDK
     │  Streaming Messages API
     ▼
Claude Sonnet (LLM)
     │
     ▼  Word-by-word tokens streamed back
User sees real-time response
```

**Docker build:** React is compiled first (Stage 1), then the built files are served as static assets by FastAPI (Stage 2) — single container, single port.

---

## 📁 Project Structure

```
finpulse-ai/
├── backend/
│   ├── main.py            # FastAPI app + streaming endpoint
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles + Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js     # API proxy for local dev
│   ├── tailwind.config.js
│   └── postcss.config.js
├── Dockerfile             # Multi-stage build
├── docker-compose.yml
├── .env.example           # Template for environment variables
├── .gitignore             # Protects secrets from Git
└── README.md
```

---

## ✅ Assignment Checklist

| Requirement | Status |
|---|---|
| Functional frontend (React) | ✅ |
| Responsive (desktop + mobile) | ✅ |
| FastAPI backend | ✅ |
| LLM API integration (Claude) | ✅ |
| Real-time streaming responses | ✅ |
| File upload (CSV/PDF) | ✅ |
| Docker containerization | ✅ |
| AWS deployment ready | ✅ |
| API keys in env variables | ✅ |
| Keys NOT in frontend code | ✅ |

---

## 🔐 Security

- API keys are stored in `.env` (never in frontend code)
- `.env` is in `.gitignore` — will never be committed
- On AWS, keys are stored as environment variables in App Runner (not in code)
- CORS configured for production use
