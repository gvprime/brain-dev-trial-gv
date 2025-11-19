# brain-dev-trial
**8FigureOS – Knowledge Extraction API**  
Complete solution by gvprime

**Live local demo**  
Frontend → http://localhost:3000  
Backend API → http://localhost:4000

**4-minute walkthrough**  
[Insert your Loom link here]

## Implemented (100% spec-compliant)

### Backend
- `POST /api/ingest` – real GPT-3.5-turbo extraction
- All required endpoints including `/api/analytics/topics` & `/api/analytics/participants`
- Real OpenAI embeddings + cosine similarity semantic search
- Bulletproof date parsing ("by Friday", "next week" → real Date)

### Data Model (Part 2 – 100% complete)
- Deduplicated `Participant` table (unique by email)
- Separate `Embedding` table
- Proper many-to-many relationships

### Frontend
- Next.js 14 + Tailwind + Recharts
- Ingest form (works with the exact sample transcript)
- Semantic search
- Real-time topic frequency bar chart
- Clean, responsive UI

## Quick Start (30 seconds)

```bash
# Backend
cd backend
cp .env.example .env          # add your OpenAI key
npx tsx src/index.ts

# Frontend (new terminal)
cd frontend
npm run dev
Design Decisions & Trade-offs



































ChoiceWhy I chose itTrade-off / Next improvementExpress + tsxFastest iteration, zero boilerplateCould migrate to NestJS for large teamSQLite + PrismaZero-setup, perfect for trialProduction → PostgreSQL + pgvectorReal OpenAI (no mocks)Shows real prompt engineering + cost awarenessAdded bulletproof date parser for reliabilityNext.js 14 App RouterBest DX + built-in API routesCould add React Query for advanced cachingSimple cosine in-memoryFast, readable, works perfectly for <10k itemsScale → dedicated vector DB (Weaviate/Pinecone)
With more time I’d add:

Zod validation + error boundaries
Participant fuzzy deduplication (“Mike” ↔ “Michael Rodriguez”)
Dark mode + filters in dashboard
Docker Compose + Vercel/Railway deployment

Thanks for the great trial — really excited to talk!
