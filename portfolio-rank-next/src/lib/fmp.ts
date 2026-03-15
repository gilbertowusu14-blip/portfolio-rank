import YahooFinance from "yahoo-finance2";

const TICKER_FETCH_TIMEOUT_MS = 5000;

/**
 * Profile shape returned by our proxy.
 * type is "stock" or "etf" so holdings can be passed correctly to scoring and AI.
 */
export interface FMPProfile {
  symbol: string;
  sector: string | null;
  beta: number | null;
  mktCap: number | null;
  volAvg: number | null;
  type: "stock" | "etf";
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
  quoteType?: string | null;
}

/**
 * Fetch company or ETF profile for one ticker using yahoo-finance2.
 * Uses in-memory cache (60 min TTL). Throws if ticker is not found or fetch exceeds 5s.
 */
export async function fetchCompanyProfile(ticker: string): Promise<FMPProfile> {
  const key = ticker.toUpperCase();
  const cached = cache.get(key);
  if (cached && !isExpired(cached)) {
    return cached.data;
  }

  const fetchProfile = async (): Promise<FMPProfile> => {
    const yahooFinance = new YahooFinance();
    const result = (await yahooFinance.quoteSummary(key, {
      modules: ["assetProfile", "summaryDetail", "price"],
    })) as QuoteSummaryResult;

    const isEtf =
      (result.quoteType?.toUpperCase?.() ?? "") === "ETF" ||
      (result.assetProfile?.sector == null && result.price?.marketCap != null);

    const profile: FMPProfile = {
      symbol: key,
      sector: isEtf ? "ETF" : (result.assetProfile?.sector ?? null),
      beta: result.summaryDetail?.beta ?? null,
      mktCap: result.price?.marketCap ?? null,
      volAvg: result.price?.averageVolume ?? null,
      type: isEtf ? "etf" : "stock",
    };

    cache.set(key, { data: profile, fetchedAt: Date.now() });
    return profile;
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Ticker ${key} timed out after ${TICKER_FETCH_TIMEOUT_MS / 1000}s`)),
      TICKER_FETCH_TIMEOUT_MS
    )
  );

  return Promise.race([fetchProfile(), timeoutPromise]);
}
