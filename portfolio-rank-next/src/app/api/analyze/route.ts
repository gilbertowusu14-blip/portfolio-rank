import { NextRequest, NextResponse } from "next/server";
import { incrementTotalAnalyses } from "@/lib/analytics";
import { fetchCompanyProfile, type FMPProfile } from "@/lib/fmp";
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

  const profiles: FMPProfile[] = [];
  for (const ticker of uniqueTickers) {
    try {
      const profile = await fetchCompanyProfile(ticker);
      profiles.push(profile);
    } catch {
      return NextResponse.json(
        { error: `Ticker ${ticker} not found — please check and try again` },
        { status: 502 }
      );
    }
  }

  const holdingsWithType: PortfolioHolding[] = normalizedHoldings.map((h) => {
    const profile = profiles.find((p) => p.symbol === h.ticker);
    return { ...h, type: profile?.type ?? h.type ?? "stock" };
  });

  const result = scorePortfolio({
    holdings: holdingsWithType,
    profiles,
    riskTolerance,
    timeHorizon,
  });

  void incrementTotalAnalyses();

  return NextResponse.json(result);
}

