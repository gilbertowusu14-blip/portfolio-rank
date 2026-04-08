console.log("[AI route] FILE LOADED");
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * AI narrative (summary, strengths, weaknesses, actions, blueprint) is generated
 * at ANALYSIS TIME when the result page loads — not at payment time.
 * Flow: result page → POST /api/analyze → POST /api/ai (this route) → state set.
 * On Unlock, store-report saves that snapshot to Supabase. Premium page later
 * retrieves the stored report. So updated prompts only apply to NEW analyses;
 * clear premium_reports and re-run analyze → result → unlock to see new output.
 */

interface HoldingInput {
  ticker: string;
  weight: number;
  type: string;
}

interface SubscoresInput {
  diversification: number;
  concentrationRisk: number;
  growthQuality: number;
  valuationRisk: number;
  drawdownExposure: number;
  marketComparison: number;
}

interface AiRequestBody {
  holdings: HoldingInput[];
  riskTolerance: string;
  timeHorizon: string;
  score: number;
  label: string;
  subscores: SubscoresInput;
}

export interface AiNarrative {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actions: string[];
  blueprint: string;
}

interface OpenAIChatCompletionResponse {
  choices: {
    message?: {
      content?: string | null;
    };
  }[];
}

const SYSTEM_PROMPT = `You are a portfolio analyst. Return ONLY a valid JSON object with exactly these fields — no markdown, no explanation, no extra text:

summary: 2–3 sentences for the free preview. Every sentence must tie to this portfolio: name real tickers, weights, or subscore values from the payload. Invent nothing; if diversification is 82, say 82. If concentration risk is 40, say 40.
strengths: exactly 3 one-sentence strings. The first strength MUST name one subscore and its exact value (e.g. diversification 82/100) and explain why it helps this portfolio.
weaknesses: exactly 3 one-sentence strings. The first weakness MUST name one subscore and its exact value and explain the gap for this portfolio.
actions: exactly 3 one-sentence strings. The first action MUST be a concrete step based on their actual tickers and weights (trim, add, rebalance to X%). Later actions may name ETFs only where they fit the holdings and geography rules below.
blueprint: one string, exactly 6 sections. Each section MUST cite at least one real subscore number from the payload (diversification, concentration risk, growth quality, valuation risk, drawdown exposure, market comparison, and/or overall score) where it supports the point. Use these exact section headers (header, newline, then 2–4 sentences):

1. Diagnosis —
2. Risk-Adjusted Reality —
3. What an Optimised Version Looks Like —
4. Reallocation Logic —
5. Crash Resilience —
6. Path Forward —

Hard rules (violations break the product):

ETF rule — Any holding that is an ETF (type "etf" in the data, or known ETFs such as VWRP, VWRL, VUAG, QQQ, VTI, IWDA, etc.) must NEVER be framed as concentration risk, single-asset risk, or undiversified. ETFs are diversified instruments. Do not imply an ETF is like holding one stock.

Subscores are ground truth — Use only the numbers provided. Every major block (summary, each strength, each weakness, each action, each blueprint section) must reference specific subscore values, not vague language that could describe any portfolio.

No contradictions — If concentration risk is under 40, you cannot describe the portfolio as highly concentrated. If a subscore is strong, do not call that dimension weak. The narrative must agree with the numbers.

Banned phrases — Never use: "consider diversifying", "past performance is not indicative", "you should consult a financial advisor", "it's important to", "make sure to", or similar disclaimer filler.

Tone — Direct, specific, slightly analytical. Short sentences. Like a knowledgeable friend reviewing their book, not compliance or a template.

Geographic fit — Infer market from tickers (.L, UCITS symbols like VUAG, VWRL, VUSA, CSPX, IWDA): suggest UCITS ETFs for UK/EU; US-only lists → US ETFs. Do not suggest US-listed funds to clear UK/EU portfolios.

Anti-repetition — Do not repeat the same ETF name across strengths, weaknesses, actions, and blueprint. Each section adds new detail. Read holdings before suggesting anything; if they already own an exposure, do not tell them to add the same thing.

Vary by portfolio — No default basket (e.g. VTI + VXUS + XLP in every answer). If that pattern appears, you failed to read the portfolio.`;

const FALLBACK_RESPONSE: AiNarrative = {
  summary:
    "Your portfolio shows concentrated exposure with strong growth characteristics. While your holdings are high quality, the lack of diversification creates meaningful downside risk in a sector rotation.",
  strengths: [
    "Strong exposure to high-growth technology sector",
    "Holdings show above-average earnings quality",
    "Portfolio aligns well with a long-term growth time horizon",
  ],
  weaknesses: [
    "Concentrated in a single sector creating correlation risk",
    "High valuation multiples leave little margin of safety",
    "Limited defensive exposure increases drawdown vulnerability",
  ],
  actions: [
    "Add 2-3 holdings from healthcare or consumer staples to reduce sector concentration",
    "Trim your largest position to below 20% of total portfolio weight",
    "Add one international ETF to reduce US market dependency if your holdings are US-heavy",
  ],
  blueprint:
    "1. Diagnosis —\nYour portfolio shows structural concentration risk given the tickers and weights provided. The diversification and concentration subscores indicate where the main gaps are.\n\n2. Risk-Adjusted Reality —\nGrowth quality and valuation risk subscores suggest whether you are being compensated for the risk you take.\n\n3. What an Optimised Version Looks Like —\nA better structure would include more positions and sectors based on your current holdings.\n\n4. Reallocation Logic —\nShifting weights would improve diversification, concentration risk, and drawdown exposure subscores.\n\n5. Crash Resilience —\nDrawdown exposure and sector concentration indicate how this portfolio would behave in a sharp correction.\n\n6. Path Forward —\nAct progressively; start with the single highest-impact change from the actions above.",
};

function buildPortfolioDataBlock(body: AiRequestBody): string {
  const holdingsLine =
    body.holdings
      .filter((h) => h.ticker?.trim())
      .map((h) => `${h.ticker.trim()} ${Number(h.weight)}%`)
      .join(", ") || "none";
  const subscores = body.subscores;
  const subscoreLines = [
    `Diversification ${subscores.diversification}/100`,
    `Concentration Risk ${subscores.concentrationRisk}/100`,
    `Growth Quality ${subscores.growthQuality}/100`,
    `Valuation Risk ${subscores.valuationRisk}/100`,
    `Drawdown Exposure ${subscores.drawdownExposure}/100`,
    `Market Comparison ${subscores.marketComparison}/100`,
  ].join(", ");
  return [
    "Portfolio holdings: " + holdingsLine,
    "Subscores: " + subscoreLines,
    "Risk profile: " + body.riskTolerance,
    "Time horizon: " + body.timeHorizon,
    "Overall score: " + body.score + "/100",
    "Label: " + body.label,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  let body: AiRequestBody;
  try {
    body = (await request.json()) as AiRequestBody;
  } catch (e) {
    console.error("[AI route] Request body parse failed — using fallback:", e);
    return NextResponse.json({ ...FALLBACK_RESPONSE, _error: `Request body parse failed: ${String(e)}` });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[AI route] OPENAI_API_KEY missing — using fallback");
    return NextResponse.json({ ...FALLBACK_RESPONSE, _error: "OPENAI_API_KEY missing" });
  }

  const portfolioDataBlock = buildPortfolioDataBlock(body);
  const userMessage = `${portfolioDataBlock}\n\n---\n\nUsing this exact portfolio data above (tickers, weights, subscores, risk profile, time horizon), generate the JSON response. Every part of your output must reference these concrete numbers and tickers — never give generic advice.`;

  const messages: { role: "system" | "user"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  console.log("[AI route] Request body received:", {
    holdings: body.holdings,
    subscores: body.subscores,
    riskTolerance: body.riskTolerance,
    timeHorizon: body.timeHorizon,
    score: body.score,
    label: body.label,
  });
  console.log("[AI route] Full user message sent to OpenAI:\n", userMessage);
  console.log("[AI route] System prompt length (chars):", SYSTEM_PROMPT.length);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI route] OpenAI API !ok:", response.status, errText);
      return NextResponse.json({ ...FALLBACK_RESPONSE, _error: `OpenAI !ok: ${response.status} ${errText}` });
    }

    const json = (await response.json()) as OpenAIChatCompletionResponse;
    console.log("[AI route] Raw OpenAI response (full):", JSON.stringify(json, null, 2));
    const content = json.choices[0]?.message?.content;
    if (!content) {
      console.error("[AI route] No content in choices[0].message — using fallback");
      return NextResponse.json({ ...FALLBACK_RESPONSE, _error: "No content in choices[0].message" });
    }
    console.log("[AI route] Raw content string from OpenAI:", content);

    let parsed: AiNarrative;
    try {
      parsed = JSON.parse(content) as AiNarrative;
    } catch (parseErr) {
      console.error("[AI route] JSON.parse failed — using fallback. Error:", parseErr);
      console.error("[AI route] Content that failed to parse:", content.slice(0, 500));
      return NextResponse.json({ ...FALLBACK_RESPONSE, _error: `JSON.parse failed: ${String(parseErr)}` });
    }

    if (!parsed.blueprint || typeof parsed.blueprint !== "string") {
      console.error("[AI route] Parsed object missing or invalid blueprint:", typeof parsed?.blueprint);
      return NextResponse.json({ ...FALLBACK_RESPONSE, _error: `Parsed object missing or invalid blueprint: ${typeof parsed?.blueprint}` });
    }
    console.log("[AI route] Returning parsed response, blueprint length:", parsed.blueprint.length);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[AI route] Caught error — using fallback:", err);
    return NextResponse.json({ ...FALLBACK_RESPONSE, _error: `Caught: ${String(err)}` });
  }
}

