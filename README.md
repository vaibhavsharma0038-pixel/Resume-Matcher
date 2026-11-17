# C9 CareerFit — Groq Edition

A placement-focused resume review app. Upload a text-based PDF resume, paste a job description, and receive a match score with reasons, skill gaps, rewritten bullets, strengths, and next steps.

## Prompt-engineering requirements
- **Role prompting:** experienced university placement resume reviewer and career coach.
- **Rubric:** required skills/tools (40), projects/experience (25), education (15), evidence/clarity (10), role alignment (10).
- **Structured output:** Groq JSON mode with a Pydantic response schema; FastAPI validates the response.
- **Honesty safeguard:** rewrites cannot invent experience, tools, metrics, or qualifications.

## Backend setup (Windows PowerShell)
```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
Create `backend/.env` with your API key:
```
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-120b
```
Create `backend/.env` and set `GROQ_API_KEY` to your private key. Keep `.env` out of GitHub.

Start backend:
```powershell
uvicorn app:app --reload --port 8000
```
Check `http://localhost:8000/api/health`; `api_key_configured` should be `true`.

In a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open the Vite URL, normally `http://localhost:5173`.

## Model
Default is `openai/gpt-oss-120b` on Groq. If you wish to use another model, choose a currently available model on [Groq Console](https://console.groq.com) and set `GROQ_MODEL` in `.env` accordingly.

## Notes
- Text-based PDFs only; scanned PDFs require OCR.
- The app does not save resumes or analysis results to a database.
- API usage is subject to the Groq API plan, model availability, quotas, and rate limits.
- The match score is advisory, not an ATS score or hiring decision.
