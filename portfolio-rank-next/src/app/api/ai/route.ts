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

const SYSTEM_PROMPT = `You are a portfolio analyst talking to an investor one-to-one. Sound like a smart friend who knows investing: direct, confident, not corporate or academic. Return ONLY a valid JSON object with exactly these fields — no markdown, no explanation, no extra text:

summary: a 2-3 sentence paragraph for the free preview. Be specific to this portfolio. Lead with the insight and character of the portfolio; mention the biggest risk. Do not open with a score — use a number only once, as supporting evidence.
strengths: array of exactly 3 strings, each one sentence: a specific strength. Insight first; if you mention a subscore, use it once to confirm the point.
weaknesses: array of exactly 3 strings, each one sentence: a specific weakness. Same rule — insight first, score as back-up only.
actions: array of exactly 3 strings, each a concrete step they can take. Where adding exposure makes sense, name specific ETFs when relevant (e.g. VTI for broad US, VXUS for international, XLV for healthcare, XLP for consumer staples). Keep it actionable.
blueprint: a single string with exactly 6 sections for the premium report. Use these exact section headers (each on its own line, then a newline, then 2-4 sentences). Do not repeat what the previous section said — diagnosis sets the problem, each section builds on it.

1. Diagnosis —
Name the core structural issue with this portfolio in plain language. Use their actual tickers; mention diversification or concentration only as supporting evidence, not as the first words of a sentence.

2. Risk-Adjusted Reality —
Say whether this portfolio is earning enough for the risk they're taking. Shape this around their risk profile and time horizon (e.g. aggressive + 3-7yr vs conservative + 10yr+). Acknowledge their approach, then give the reality. Use growth quality or valuation subscores once to back the point.

3. What an Optimised Version Looks Like —
Concrete target: number of positions, sectors or asset types to add, rough weights. Specific to what they're missing. Suggest named ETFs where it helps (VTI, VXUS, XLV, XLP, etc.).

4. Reallocation Logic —
Why those changes help. Which subscores improve and why. No re-stating the diagnosis — build on it.

5. Crash Resilience —
What would happen to this portfolio in a sharp downturn? Vary the example by portfolio: tech-heavy → e.g. 2022 tech correction; energy-heavy → e.g. 2020; single-stock heavy → company-specific risk. Make it relevant to their actual holdings. Use drawdown exposure once as evidence.

6. Path Forward —
How to act progressively: the single first move, then next steps. Realistic and specific.

Rules: Risk profile and time horizon must shape the whole response. Never lead a sentence with a score. Each section flows from the last without repeating it. Reference their tickers, weights, and subscores; keep tone direct and human.

Additional rules (anti-repetition and geographic fit):
Geographic awareness: Look at the tickers in the portfolio to determine the user's likely market. If they hold LSE-listed tickers (ending in .L) or UCITS ETFs (VUAG, VWRL, VUSA, CSPX, IWDA etc), they are a UK/European investor — suggest UCITS ETFs only (VWRL, VUAG, VUSA, CSPX, SWRD). If they hold US-listed tickers only, suggest US ETFs (VTI, VXUS, QQQ etc). Never suggest US-listed ETFs to a UK investor.
No repetition: Never suggest the same ETFs in strengths, weaknesses, actions AND blueprint. Each section must add new information. If you mention VTI in actions do not mention it again in the blueprint.
Vary by portfolio: The suggestions must be specific to what is actually missing. If the portfolio already has international exposure don't suggest international ETFs. If it already has defensive exposure don't suggest defensive ETFs. Read the actual holdings before making any suggestion.
No default basket: Never default to a fixed set of suggestions. VTI, VXUS and XLP should not appear together in every response — this pattern means you are not reading the portfolio.`;

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

