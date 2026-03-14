# PROJECT_RULES.md

Read this file at the start of every Cursor session before writing any code.

---

## Product

An AI-powered portfolio scoring platform. Users enter their stock holdings and receive a score (0–100), a label, subscores, and an AI-generated narrative. A paywall separates the free teaser from the full report.

---

## Hard Rules

### Scoring
- The score is deterministic. Same inputs always produce the same score.
- The AI layer cannot influence, adjust, or override the score in any way.
- All scoring logic lives exclusively in `/src/logic/score.ts`. Nowhere else.
- Subscores must be defined in `docs/SCORING_SPEC.md` before any code is written.

### API & Security
- FMP and AI API keys are server-side only. Never in client code.
- All external API calls go through Next.js API routes in `/app/api/`.
- No API key may ever appear in the browser, console, or client bundle.

### Architecture
- App Router only. No Pages Router.
- Business logic lives in `/src/logic/` only.
- Data fetching utilities live in `/src/lib/` only.
- UI components live in `/src/components/` only.

### Process
- No feature gets built unless it is written in `docs/BUILD_LOG.md` first.
- Commit after every phase. No exceptions.
- Do not install Stripe or Supabase until Phase 6 and Phase 5 respectively.
- Do not add features outside the current phase scope.

### Code Quality
- TypeScript strictly. No `any` types.
- Every API route must handle errors explicitly — invalid ticker, API down, rate limit.
- Loading states must be built during Phase 2, not added later.

---

## Folder Structure

```
/app
  /api
    /fmp        ← FMP proxy route
    /ai         ← AI narrative route
  /analyze      ← Portfolio input page
  /result       ← Score result page
/src
  /logic
    score.ts    ← Deterministic scoring engine only
  /lib
    fmp.ts      ← FMP fetch helpers
    ai.ts       ← AI call helpers
  /components   ← UI components
/docs
  SCORING_SPEC.md
  BUILD_LOG.md
PROJECT_RULES.md
```

---

## Current Phase

> Update this line at the start of each session.

**Phase: 0 — Setup & Specs**