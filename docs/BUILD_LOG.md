BUILD_LOG.md
No feature gets built unless it is logged here first. Log the date, what you built, and any decisions made.

Phase 0 — Setup & Specs
Goal: Project created, folder structure in place, all spec files written.
Checklist:
[ ] Next.js project created (App Router + TypeScript)
[ ] Git initialised
[ ] Pushed to GitHub
[ ] /docs folder created
[ ] PROJECT_RULES.md written
[ ] SCORING_SPEC.md skeleton written
[ ] BUILD_LOG.md started
[ ] /src/logic and /src/lib folders created
[ ] Phase 0 committed
Decisions log:
Score scale: 0–100
Labels: Weak / Average / Strong / Elite
MVP subscores: Diversification, Concentration Risk, Volatility Alignment, Market Exposure
Data source: FMP (Financial Modelling Prep)
AI layer: TBD (Claude or OpenAI)
Scoring is deterministic — AI cannot affect score

Phase 1 — Core Flow (UI skeleton)
Goal: App flow works with placeholder data. No real API calls yet.
Features to build:
[ ] / Home page (simple headline + CTA)
[ ] /analyze Portfolio input form
[ ] Add/remove holdings rows (ticker + weight)
[ ] Risk tolerance selector (Low / Medium / High)
[ ] Validation: weights must sum to 100, tickers required
[ ] /result Result page with placeholder score card layout
[ ] Phase 1 committed
Decisions log: (log any decisions made during this phase)

Phase 2 — FMP Data + Loading/Error States
Goal: Real ticker data flows through. Errors handled gracefully.
Features to build:
[ ] /app/api/fmp/route.ts — server-side FMP proxy
[ ] Client calls /api/fmp, never FMP directly
[ ] Loading state per ticker
[ ] "Analysing..." state before result
[ ] Error UI: invalid ticker, API down, rate limit, partial failures
[ ] Basic in-memory cache (simple Map)
[ ] Phase 2 committed
Decisions log: (log any decisions made during this phase)

Phase 3 — Scoring Engine
Goal: Deterministic score calculated from real data.
Pre-condition: All formulas in SCORING_SPEC.md must be finalised before any code is written.
Features to build:
[ ] Finalise all subscore formulas in SCORING_SPEC.md
[ ] Implement src/logic/score.ts
[ ] Test with at least 3 example portfolios manually
[ ] Wire score into result page
[ ] Render: overall score, subscores, label, 3 key metrics, optimization gap
[ ] Phase 3 committed
Decisions log: (log any decisions made during this phase)

Phase 4 — AI Narrative Layer
Goal: AI generates a human-readable assessment based on computed scores.
Features to build:
[ ] /app/api/ai/route.ts — server-side AI proxy
[ ] Prompt built from: tickers + weights + subscores + score + risk tolerance
[ ] AI returns: paragraph + strength + weakness + action
[ ] Render AI output on result page
[ ] Guardrail: AI output cannot affect or reference a different score
[ ] Phase 4 committed
Decisions log: (log any decisions made during this phase)

Phase 5 — Auth + History (Supabase)
Do not start until Phase 4 is committed.
Features to build:
[ ] Supabase Auth setup
[ ] Protected history route
[ ] analyses table: inputs, outputs, user_id, created_at
[ ] Save analysis after each run
[ ] History page: list + view past result
[ ] Phase 5 committed

Phase 6 — Paywall (Stripe)
Do not start until Phase 5 is committed.
Features to build:
[ ] Stripe one-time purchase
[ ] Free result: score + label + 2 weaknesses + teaser
[ ] Paid result: full breakdown + AI report + blueprint
[ ] Purchase state stored in Supabase
[ ] Webhook handling
[ ] Unlock persists across refresh and login
[ ] Phase 6 committed

Phase 7 — Polish + Launch
Features to build:
[ ] Mobile-first UI pass
[ ] Copywriting pass
[ ] Basic analytics
[ ] Landing page
[ ] Demo recording
[ ] Launch posts (Reddit, TikTok, X)

