import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  let body: AiRequestBody;
  try {
    body = (await request.json()) as AiRequestBody;
  } catch {
    return NextResponse.json(FALLBACK_RESPONSE);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(FALLBACK_RESPONSE);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(body) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(FALLBACK_RESPONSE);
    }

    const json = (await response.json()) as OpenAIChatCompletionResponse;
    const content = json.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(FALLBACK_RESPONSE);
    }

    let parsed: AiNarrative;
    try {
      parsed = JSON.parse(content) as AiNarrative;
    } catch {
      return NextResponse.json(FALLBACK_RESPONSE);
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(FALLBACK_RESPONSE);
  }
}

