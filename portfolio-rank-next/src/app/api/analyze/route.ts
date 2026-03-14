import { NextRequest, NextResponse } from "next/server";
import { fetchCompanyProfile } from "@/lib/fmp";
import {
  scorePortfolio,
  type PortfolioHolding,
  type RiskTolerance,
  type TimeHorizon,
} from "@/logic/score";

interface AnalyzeRequestBody {
  holdings: {
    ticker: string;
    weight: number;
    type: string;
  }[];
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
}

export async function POST(request: NextRequest) {
  let body: AnalyzeRequestBody;
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { holdings, riskTolerance, timeHorizon } = body;

  if (!Array.isArray(holdings) || holdings.length === 0) {
    return NextResponse.json(
      { error: "At least one holding is required" },
      { status: 400 }
    );
  }

  const normalizedHoldings: PortfolioHolding[] = holdings.map((h) => ({
    ticker: h.ticker.toUpperCase(),
    weight: h.weight,
    type: h.type,
  }));

  const totalWeight = normalizedHoldings.reduce(
    (sum, h) => sum + (Number.isNaN(h.weight) ? 0 : h.weight),
    0
  );

  if (Math.abs(totalWeight - 100) > 0.01) {
    return NextResponse.json(
      { error: "Weights must sum to 100" },
      { status: 400 }
    );
  }

  const uniqueTickers = Array.from(
    new Set(normalizedHoldings.map((h) => h.ticker))
  );

  const profiles = [];
  for (const ticker of uniqueTickers) {
    try {
      const profile = await fetchCompanyProfile(ticker);
      profiles.push(profile);
    } catch {
      return NextResponse.json(
        { error: `Failed to fetch data for ticker ${ticker}` },
        { status: 502 }
      );
    }
  }

  const result = scorePortfolio({
    holdings: normalizedHoldings,
    profiles,
    riskTolerance,
    timeHorizon,
  });

  return NextResponse.json(result);
}

