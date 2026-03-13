# SCORING_SPEC.md

This document defines the scoring engine. No scoring code may be written until this spec is complete.
Formulas are locked here. The AI layer reads from this output — it cannot change it.

---

## SECTION 1 — Score Philosophy

The score measures **risk-adjusted portfolio structure**.

A high score means:
- The portfolio is well diversified across sectors and geographies
- Concentration in any single stock or sector is within healthy limits
- The portfolio's volatility (beta) is aligned with the user's stated risk tolerance
- The portfolio has meaningful exposure to broader market performance

A low score means:
- Heavy concentration in one stock or sector
- Volatility that mismatches the user's risk tolerance
- Overexposure to correlated assets
- Weak diversification relative to portfolio size

The score does NOT measure:
- Past or future returns
- Whether individual stocks are good picks
- Timing or market conditions

---

## SECTION 2 — Final Score Scale

- Scale: **0 to 100**
- Labels:
  - 0–39 → **Weak**
  - 40–59 → **Average**
  - 60–79 → **Strong**
  - 80–100 → **Elite**

---

## SECTION 3 — Subscores (MVP: 4 subscores)

Each subscore is 0–100. The final score is a weighted average.

| Subscore | Weight | What it measures |
|---|---|---|
| Diversification | 30% | Spread across sectors and number of holdings |
| Concentration Risk | 30% | How much weight sits in the top 1–3 holdings |
| Volatility Alignment | 25% | Whether portfolio beta matches user risk tolerance |
| Market Exposure | 15% | Exposure to broad market vs niche/illiquid assets |

> Weights must sum to 100%. Do not change weights without updating this table.

---

### Subscore 1 — Diversification (30%)

**Inputs:**
- Number of holdings
- Sector of each holding (from FMP)
- Weight of each holding

**Logic (to be defined in Phase 3):**
- Penalise portfolios with fewer than 5 holdings
- Penalise portfolios where 1 sector exceeds X% of total weight
- Reward spread across 4+ distinct sectors

**Formula:** TBD in Phase 3 — define exact thresholds before coding

---

### Subscore 2 — Concentration Risk (30%)

**Inputs:**
- Weight of each holding

**Logic (to be defined in Phase 3):**
- Calculate weight of top 1 holding
- Calculate combined weight of top 3 holdings
- Higher concentration = lower score

**Formula:** TBD in Phase 3 — define exact thresholds before coding

---

### Subscore 3 — Volatility Alignment (25%)

**Inputs:**
- Beta of each holding (from FMP)
- Weighted average portfolio beta
- User's stated risk tolerance (Low / Medium / High)

**Logic (to be defined in Phase 3):**
- Low risk user + high beta portfolio = penalise heavily
- High risk user + high beta portfolio = acceptable
- Define target beta ranges per risk tolerance level

**Formula:** TBD in Phase 3 — define exact thresholds before coding

---

### Subscore 4 — Market Exposure (15%)

**Inputs:**
- Market cap of each holding (from FMP)
- Sector classification

**Logic (to be defined in Phase 3):**
- Large cap / broad market holdings score higher
- Heavy concentration in micro/small cap = lower score

**Formula:** TBD in Phase 3 — define exact thresholds before coding

---

## SECTION 4 — Required Data Inputs from FMP

Per ticker, fetch:

| Field | FMP Endpoint | Required? |
|---|---|---|
| Sector | `/profile` | Yes |
| Market cap | `/profile` | Yes |
| Beta | `/profile` | Yes |
| Company name | `/profile` | Yes |
| P/E ratio | `/profile` | Optional (Phase 3+) |

User inputs (from the form):
- Ticker symbol
- Weight (%) — must sum to 100
- Risk tolerance: Low / Medium / High
- Investment horizon: Short / Medium / Long (for later phases)

---

## SECTION 5 — Optimization Gap (define before Phase 3)

The optimization gap is the difference between the user's current score and their estimated score if they rebalanced to reduce the top weakness.

**Formula:** TBD — define before Phase 3 coding begins.

Example output: *"With rebalancing, your score could improve from 58 → 74."*

---

## SECTION 6 — AI Narrative Inputs

The AI receives only:
- Tickers + weights
- Computed subscores
- Final score
- User risk tolerance
- 3 key metric values (e.g. top sector %, top holding %, weighted beta)

The AI returns only:
- 1 short assessment paragraph (3–4 sentences)
- 1 strength
- 1 weakness
- 1 action

The AI cannot return a score. The AI cannot suggest a different score.