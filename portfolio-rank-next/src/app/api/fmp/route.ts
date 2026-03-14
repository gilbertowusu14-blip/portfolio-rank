import { NextRequest, NextResponse } from "next/server";
import { fetchCompanyProfile, type FMPProfile } from "@/lib/fmp";

/** Success item returned for one ticker */
type FMPResultSuccess = FMPProfile;

/** Error item returned when a ticker fails */
interface FMPResultError {
  symbol: string;
  error: true;
}

export type FMPResultItem = FMPResultSuccess | FMPResultError;

export async function GET(request: NextRequest) {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      { error: "FMP API is not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get("tickers");
  if (!tickersParam || tickersParam.trim() === "") {
    return NextResponse.json(
      { error: "Missing or empty query parameter: tickers" },
      { status: 400 }
    );
  }

  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (tickers.length === 0) {
    return NextResponse.json(
      { error: "No valid tickers provided" },
      { status: 400 }
    );
  }

  const results: FMPResultItem[] = [];

  for (const ticker of tickers) {
    try {
      const profile = await fetchCompanyProfile(ticker, apiKey);
      results.push(profile);
    } catch {
      results.push({ symbol: ticker, error: true });
    }
  }

  return NextResponse.json(results);
}
