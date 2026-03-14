import YahooFinance from "yahoo-finance2";

/**
 * Profile shape returned by our proxy.
 * Mirrors the previous FMP-based structure so the rest of the app can stay the same.
 */
export interface FMPProfile {
  symbol: string;
  sector: string | null;
  beta: number | null;
  mktCap: number | null;
  volAvg: number | null;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

const cache = new Map<string, { data: FMPProfile; fetchedAt: number }>();

function isExpired(entry: { fetchedAt: number }): boolean {
  return Date.now() - entry.fetchedAt > CACHE_TTL_MS;
}

// Minimal subset of the yahoo-finance2 quoteSummary shape that we care about.
interface QuoteSummaryPrice {
  marketCap?: number | null;
  averageVolume?: number | null;
}

interface QuoteSummarySummaryDetail {
  beta?: number | null;
}

interface QuoteSummaryAssetProfile {
  sector?: string | null;
}

interface QuoteSummaryResult {
  price?: QuoteSummaryPrice;
  summaryDetail?: QuoteSummarySummaryDetail;
  assetProfile?: QuoteSummaryAssetProfile;
}

/**
 * Fetch company profile for one ticker using yahoo-finance2.
 * Uses in-memory cache (60 min TTL) and does not require any API key.
 */
export async function fetchCompanyProfile(ticker: string): Promise<FMPProfile> {
  const key = ticker.toUpperCase();
  const cached = cache.get(key);
  if (cached && !isExpired(cached)) {
    return cached.data;
  }

  const yahooFinance = new YahooFinance();
  const result = (await yahooFinance.quoteSummary(key, {
    modules: ["assetProfile", "summaryDetail", "price"],
  })) as QuoteSummaryResult;

  const profile: FMPProfile = {
    symbol: key,
    sector: result.assetProfile?.sector ?? null,
    beta: result.summaryDetail?.beta ?? null,
    mktCap: result.price?.marketCap ?? null,
    volAvg: result.price?.averageVolume ?? null,
  };

  cache.set(key, { data: profile, fetchedAt: Date.now() });
  return profile;
}
