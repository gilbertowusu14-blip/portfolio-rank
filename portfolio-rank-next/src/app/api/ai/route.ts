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

const SYSTEM_PROMPT = `You are a professional portfolio analyst advising a retail investor. Based on the portfolio data provided, return ONLY a valid JSON object with exactly these fields — no markdown, no explanation, no extra text:

summary: a 2-3 sentence paragraph for a free preview. Be specific about this actual portfolio, mention its character and its biggest risk. Make it feel personalised, not generic.
strengths: array of exactly 3 strings, each one sentence describing a specific portfolio strength
weaknesses: array of exactly 3 strings, each one sentence describing a specific portfolio weakness
actions: array of exactly 3 strings, each a concrete actionable step the investor should take
blueprint: a single string containing exactly 6 clearly labelled sections for a premium report. The blueprint must be specific to their actual holdings and subscores — never generic. Reference the actual tickers and subscore values passed in the request. Format each section as: a line with the section number and title exactly as below, followed by 2-4 sentences. Use these exact section headers (each on its own line, followed by a newline and the paragraph):

1. Diagnosis —
Name the core structural problem with this specific portfolio directly. Reference their actual tickers and what the diversification and concentration scores reveal.

2. Risk-Adjusted Reality —
Explain in plain English whether this portfolio earns enough return for the risk it takes. Use the growth quality and valuation risk subscores as evidence. Frame it simply — e.g. "you are taking on equity-level risk without equity-level reward."

3. What an Optimised Version Looks Like —
Give a concrete target structure: number of positions, sectors to add, rough weight ranges. Make it specific to what they're missing based on their actual holdings.

4. Reallocation Logic —
Explain why those specific changes would improve the portfolio. Reference which subscores would improve and why — diversification, concentration risk, drawdown exposure.

5. Crash Resilience —
Tell them plainly what would happen to this portfolio in a sharp market downturn or sector selloff (e.g. a 2022-style tech correction). Reference their drawdown exposure score and any single-sector concentration.

6. Path Forward —
Give 2-3 sentences on how to act on this progressively and realistically. Not all at once. What is the single first move they should make?

No waffle, no filler. Each section must reference the actual portfolio data (tickers, weights, subscores) provided.`;

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
    "Consider adding one international ETF to reduce US market dependency",
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

