# PROJECT RULES — PortfolioRank

## Read this file at the start of every Cursor session.

### Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres)
- Stripe (one-time purchase)
- Deploy: Vercel

### Non-negotiable rules
1. API keys (FMP, OpenAI) must NEVER appear in client-side code. All calls go through Next.js API routes in `app/api/`.
2. The scoring engine (`src/logic/score.ts`) must be deterministic. Same inputs = same score. AI cannot alter the score.
3. Build loading states and error handling in Phase 2 — not as an afterthought.
4. Git checkpoint after every phase.
5. Check `docs/SCORING_SPEC.md` before touching any scoring logic.

### Folder structure
- `app/` — Next.js routes
- `src/lib/` — fmp.ts, ai.ts, supabase.ts
- `src/logic/` — score.ts
- `src/components/` — UI components
- `docs/` — SCORING_SPEC.md, BUILD_LOG.md