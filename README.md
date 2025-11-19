# brain-dev-trial
8FigureOS – Knowledge Extraction API


## Design Decisions & Trade-offs

| Choice                  | Why I chose it                                    | Trade-off / Next improvement                     |
|-------------------------|----------------------------------------------------|--------------------------------------------------|
| Express + tsx           | Fastest iteration, zero boilerplate               | Could migrate to NestJS for large team           |
| SQLite + Prisma         | Zero-setup, perfect for trial                     | Production → PostgreSQL + pgvector               |
| Real OpenAI (no mocks)  | Shows real prompt engineering + cost awareness    | Added bulletproof date parser for reliability    |
| Next.js 14 App Router   | Best DX + built-in API routes if needed           | Could add React Query for advanced caching      |
| Simple cosine in-memory | Fast, readable, works perfectly for < 10k items   | Scale → dedicated vector DB (Weaviate/Pinecone)  |

With more time I’d add:
- Zod validation + error boundaries
- Participant fuzzy deduplication (“Mike” ↔ “Michael Rodriguez”)
- Dark mode + filters in dashboard
- Docker Compose + Vercel/Railway deployment

