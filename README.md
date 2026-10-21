# ClearClause — Frontend

ClearClause is an AI contract analyser. Upload a PDF lease, employment contract or terms of service and it flags risky fine print, explains each clause in plain English, gives negotiation tips and an overall fairness score.

This repo is the web UI. The API lives in **[clearclause-backend](https://github.com/Deepanshu16125/clearclause-backend)** (FastAPI).

## Features
- PDF upload (choose / remove file)
- Executive summary and a 0–100 fairness score (colour-coded)
- Per-clause cards: category, original text, HIGH / MEDIUM / LOW risk badge, "what this actually means", negotiation advice
- Clear error message when the backend is offline

## Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Lucide React icons

## Setup
Requires Node.js 20+ and the backend running on `http://localhost:8000`.

```bash
npm install
npm run dev
```
Open http://localhost:3000.

## How it talks to the backend
`app/page.tsx` sends the file as `multipart/form-data` (field `file`) via `POST http://localhost:8000/api/analyze-pdf` and expects:

```json
{
  "fairness_score": 0,
  "summary": "...",
  "clauses": [
    { "category": "...", "original_text": "...", "risk_level": "HIGH|MEDIUM|LOW",
      "plain_english": "...", "negotiation_tip": "..." }
  ]
}
```

## Environment variables
None. The frontend doesn't need any env vars, and the backend URL is set in `app/page.tsx`. The OpenAI API key is configured in the backend only.

## Scripts
`npm run dev` · `npm run build` · `npm start` · `npm run lint`
