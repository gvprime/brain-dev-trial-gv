# brain-dev-trial
**8FigureOS – Knowledge Extraction API**  
Complete solution by gvprime

**Live local demo**  
Frontend → http://localhost:3000  
Backend API → http://localhost:4000

**4-minute walkthrough**  
https://www.loom.com/share/99ccb2065bb849878a8527720fc8ee18

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

## Design Decisions & Trade-offs

| Choice                  | Why I chose it                               | Trade-off / Next improvement                     |
|-------------------------|----------------------------------------------|--------------------------------------------------|
| Express + tsx           | Fastest iteration, zero boilerplate          | Could migrate to NestJS for large team           |
| SQLite + Prisma         | Zero-setup, perfect for trial                | Production → PostgreSQL + pgvector               |
| Real OpenAI (no mocks)  | Shows real prompt engineering + cost awareness | Added bulletproof date parser for reliability    |
| Next.js 14 App Router   | Best DX + built-in API routes                | Could add React Query for advanced caching       |
| Simple cosine in-memory | Fast, readable, works perfectly for <10k items| Scale → dedicated vector DB (Weaviate/Pinecone)  |

With more time I’d add:
- Zod validation + error boundaries
- Participant fuzzy deduplication (“Mike” ↔ “Michael Rodriguez”)
- Dark mode + filters in dashboard
- Docker Compose + Vercel/Railway deployment
  
## Quick Start (30 seconds)

```bash
# Backend
cd backend
cp .env.example .env          # add your OpenAI key
npx tsx src/index.ts

# Frontend (new terminal)
cd frontend
npm run dev
