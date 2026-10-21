# IdeaProof AI — AI-Powered Startup Idea Validation Platform

> **Validate Your Startup Idea Before You Build It.**  
> Turn assumptions into empirical evidence. Understand your customers, explore addressable markets, analyze competitors, run financial simulations, and make smarter startup decisions.

---

## 1. Executive Overview

**IdeaProof AI** is an enterprise-grade full-stack web platform built for students, startup founders, mentors, and university incubator administrators. It addresses the #1 reason startups fail: **building products customers do not need**.

Instead of relying on AI hallucinations or arbitrary scores, IdeaProof AI combines:
1. **Primary Customer Evidence**: Live survey builder supporting 5 question types, shareable respondent links, and quantitative Recharts analytics.
2. **Bottom-Up Market Intelligence**: Formulas and editable assumptions for TAM, SAM, and SOM calculations with 3 risk-adjusted scenarios.
3. **Competitive Matrix**: Incumbent alternative tracking with pricing, features, and white-space differentiation moats.
4. **Deterministic Python Financial Simulator**: Unit contribution, break-even customer volumes, and 12-month projections.
5. **Deterministic Validation Scoring Engine**: 6 weighted criteria totaling 100%, with evidence coverage damping so unverified claims cannot score high.
6. **Gemini AI Agent System**: 6 specialized logical agents (Idea Analysis, Market Research, Customer Validation, Competitor Analysis, Financial Analysis, Risk Assessment) orchestrated into audit-ready ReportLab PDF dossiers.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom SaaS navy, primary blue, and teal color palette
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Forms & Validation**: React Hook Form + Zod
- **Data Visualizations**: Recharts (Bar charts, Area charts, Responsive containers)
- **Testing**: Vitest

### Backend
- **Framework**: Python 3.11 + Django 5.2 + Django REST Framework 3.18
- **Database**: MongoDB (Local MongoDB Server / MongoDB Atlas via PyMongo 4.19 dedicated access layer)
- **Authentication**: Stateless JWT Authentication with bcrypt password hashing and 4-tier Role-Based Access Control (`Student`, `Startup Founder`, `Mentor`, `Incubator Administrator`)
- **Validation**: Pydantic v2 structured schemas
- **AI SDK**: Official Google Gen AI SDK (`google-genai` / `google-generativeai`) with structured JSON outputs and resilient heuristic fallbacks
- **Data & Export**: Pandas for survey CSV exports; ReportLab 5.0 for official PDF dossiers
- **Testing**: Pytest

---

## 3. Architecture & Core Modules

```
                    ┌───────────────────────────────────────────────┐
                    │               React Frontend                  │
                    │ (Vite, Tailwind, Recharts, Lucide, Router)    │
                    └───────────────────────┬───────────────────────┘
                                            │ REST / JSON (JWT)
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │            Django REST Framework              │
                    │        (MongoJWTAuth, Views, Serializers)     │
                    └───────┬───────────────┬───────────────┬───────┘
                            │               │               │
        ┌───────────────────┴───┐           │         ┌─────┴───────────────────┐
        │  PyMongo Data Layer   │           │         │  Deterministic Engines  │
        │  - users              │           │         │  - 6-Pillar Scoring     │
        │  - startup_ideas      │           │         │  - Financial Simulator  │
        │  - surveys & responses│           │         │  - Evidence Coverage    │
        │  - competitors        │           │         └─────────────────────────┘
        │  - financial_assump.  │           │
        │  - risks & roadmap    │     ┌─────┴───────────────────────┐
        │  - reports            │     │   Gemini AI Agent System    │
        └───────────────────────┘     │ - Idea Analysis Agent       │
                                      │ - Market Research Agent     │
                                      │ - Customer Validation Agent │
                                      │ - Competitor Analysis Agent │
                                      │ - Financial Analysis Agent  │
                                      │ - Risk Assessment Agent     │
                                      │ - Central AI Orchestrator   │
                                      └─────────────────────────────┘
```

---

## 4. Installation & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ (Node 20+ recommended) & npm
- MongoDB (running locally on port 27017 or a MongoDB Atlas connection string)

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and adjust as necessary
cp .env.example .env

# Initialize Django system tables and MongoDB indexes
python manage.py migrate
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ideaproof_project.settings'); django.setup(); from api.db import init_db_indexes; init_db_indexes()"

# Run automated backend test suite
pytest -v

# Start backend development server
python manage.py runserver 8000
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend test suite
npm test

# Build production bundle
npm run build

# Start frontend development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Instant Demo Seeder ("CampusCart")

To immediately explore the platform with rich, pre-populated data without manual entry:
1. Register a new user or log in.
2. Click the **"Load Demo Idea"** button located on the top navigation bar or the dashboard banner.
3. This seeds **"CampusCart"**, an end-to-end verified student marketplace concept populated with:
   - 12 structured idea dimension fields
   - Customer survey with 10 verified student responses
   - 3 real competitor profiles (Facebook Marketplace, GroupMe chats, Chegg)
   - Bottom-up TAM/SAM/SOM market sizing model ($4.2B TAM)
   - Multi-scenario financial plan ($12 unit commission, 18% monthly growth)
   - 3x3 risk matrix with active mitigation plans
   - 4-phase actionable startup roadmap
   - Deterministic 82.5/100 readiness score and downloadable ReportLab PDF dossier

---

## 6. Environment Variables Reference

### Backend (`backend/.env`):
| Variable | Description | Default |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb://localhost:27017` |
| `MONGODB_DATABASE` | MongoDB database name | `ideaproof_ai` |
| `GEMINI_API_KEY` | Google Gemini API key (optional; system uses heuristic fallbacks if absent) | `""` |
| `GEMINI_MODEL` | Gemini model identifier | `gemini-2.5-flash` |
| `DJANGO_SECRET_KEY`| Django crypto secret key | (random key) |
| `DEBUG` | Django debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed host headers | `localhost,127.0.0.1,testserver` |
| `CORS_ALLOW_ALL_ORIGINS` | Allow cross-origin frontend requests | `True` |

### Frontend (`frontend/.env`):
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for backend API | `http://localhost:8000/api` |

---

## 7. API Documentation

### Authentication
- `POST /api/auth/register` — Register a new account (`email`, `password`, `name`, `role`).
- `POST /api/auth/login` — Sign in and receive JWT `access_token` and `refresh_token`.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `PATCH /api/auth/me` — Update name or platform role.

### Startup Ideas
- `GET /api/ideas` — List ideas accessible to current user.
- `POST /api/ideas` — Create a new startup idea (12 fields).
- `POST /api/ideas/demo/seed` — Seed comprehensive demo startup with empirical data.
- `GET /api/ideas/{id}` — Retrieve complete startup idea details.
- `PATCH /api/ideas/{id}` — Update idea parameters or saved AI analyses.
- `DELETE /api/ideas/{id}` — Cascade delete idea and all associated artifacts.

### AI Intelligence Modules
- `POST /api/ideas/{id}/analyze` — Run Idea Analysis Agent (MVP & assumption synthesis).
- `POST /api/ideas/{id}/market-research` — Run Market Research Agent & TAM/SAM/SOM model.
- `POST /api/ideas/{id}/competitor-analysis` — Run Competitor Analysis Agent.
- `POST /api/ideas/{id}/validate` — Run Central AI Orchestrator & full validation audit.

### Customer Discovery Surveys
- `GET /api/ideas/{id}/surveys` — List surveys for idea.
- `POST /api/ideas/{id}/surveys` — Create a survey with question builder.
- `GET /api/surveys/{id}` — Survey details.
- `PATCH /api/surveys/{id}` — Update survey or toggle `published`/`closed`.
- `POST /api/surveys/generate-questions` — Generate non-leading discovery questions with Gemini.
- `GET /api/public/surveys/{token}` — Public read-only survey form for respondents.
- `POST /api/public/surveys/{token}/responses` — Public survey submission with anti-spam check.
- `GET /api/surveys/{id}/analytics` — Aggregated Recharts analytics & AI response synthesis.
- `GET /api/surveys/{id}/export-csv` — Export raw survey dataset via Pandas.

### Competitor Intelligence
- `GET /api/ideas/{id}/competitors` — List competitors in matrix.
- `POST /api/ideas/{id}/competitors` — Add competitor with pricing and teardown.
- `DELETE /api/competitors/{id}` — Delete competitor.

### Financial Simulator
- `GET /api/ideas/{id}/financial-analysis` — Retrieve saved model & simulation.
- `POST /api/ideas/{id}/financial-analysis` — Run multi-scenario Python mathematical simulation.

### Risk Management & Roadmap
- `GET /api/ideas/{id}/risks` — List registered risks.
- `POST /api/ideas/{id}/risks` — Log a new risk with mitigation plan.
- `PATCH /api/risks/{id}` — Update risk status (`Active`, `Mitigated`, `Monitoring`).
- `DELETE /api/risks/{id}` — Remove risk.
- `GET /api/ideas/{id}/roadmap` — Retrieve prioritized roadmap tasks.
- `POST /api/ideas/{id}/roadmap` — Add milestone task.
- `PATCH /api/roadmap/{id}` — Update task status (`Pending`, `In Progress`, `Completed`).

### Reports
- `GET /api/ideas/{id}/reports` — List generated reports for idea.
- `POST /api/ideas/{id}/reports` — Trigger full validation run and compile report.
- `GET /api/reports/{id}/download` — Download official ReportLab PDF dossier.

---

## 8. Deterministic Validation Scoring Engine

The readiness score is calculated strictly using deterministic Python formulas rather than allowing generative models to invent numbers:

$$\text{Readiness Score} = \sum (\text{Criterion Score}_i \times \text{Weight}_i)$$

### Weights:
- **Customer Problem and Demand**: 25%
- **Market Opportunity**: 20%
- **Competitor Differentiation**: 15%
- **Technical Feasibility**: 15%
- **Financial Viability**: 15%
- **Evidence Quality**: 10%
- **Total**: 100%

### Evidence Coverage Damping:
If empirical evidence coverage across the 6 pillars (survey responses, market sizing, competitors, financials, MVP definition, risks) is below 35%, confidence is flagged as **Low** and the overall readiness score is mathematically damped.

### Configurable Recommendation Bands:
- `0–39`: **Reconsider assumptions**
- `40–59`: **More validation required**
- `60–79`: **Improve and test**
- `80–100`: **Consider the next validation stage**

---

## 9. Deployment Instructions

### Frontend (Vercel)
1. Push project to GitHub.
2. In Vercel, import repository and set Root Directory to `frontend`.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Configure Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend-domain.onrender.com/api`

### Backend (Render / Railway)
1. In Render, create a new **Web Service** connected to your repository with Root Directory `backend`.
2. Set Environment to **Python 3**.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn ideaproof_project.wsgi:application`
5. Configure Environment Variables:
   - `MONGODB_URI` = `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
   - `MONGODB_DATABASE` = `ideaproof_ai`
   - `DJANGO_SECRET_KEY` = `<strong-random-key>`
   - `DEBUG` = `False`
   - `ALLOWED_HOSTS` = `.onrender.com,localhost`
   - `GEMINI_API_KEY` = `<your-google-gemini-key>`
   - `GEMINI_MODEL` = `gemini-2.5-flash`

---

## 10. Automated Testing

### Backend Tests (Pytest)
```bash
cd backend
pytest -v
```
Verifies user authentication, idea CRUD, public survey submission, survey response analytics, Pandas CSV export, financial scenario math, 6-pillar validation scoring, and ReportLab PDF compilation.

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
Verifies API client formatting, token management, recommendation band thresholds, and bottom-up market sizing mathematics.

---

## 11. Known Limitations & Future Roadmap

1. **Live Search API Hook**: Currently, market research synthesizes data via Google Gen AI models and domain models. Future integration with live web search APIs (e.g. Google Search Grounding) will allow automatic retrieval of live SEC filings and market news.
2. **Third-Party Survey Integrations**: Direct synchronization with Typeform and Google Forms via webhooks.
3. **Stripe Billing**: Production payment gateway integration for subscription tier upgrades.

---

## License

IdeaProof AI is licensed under the MIT License.
