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
blueprint: 3-4 sentence paragraph describing what the optimised portfolio should look like — specific sectors to add, what to reduce, expected benefit`;

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
    "An optimised version of this portfolio would hold 8-12 positions across at least 4 sectors, with no single stock exceeding 20% weight. Adding defensive exposure would reduce volatility while maintaining growth potential.",
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

