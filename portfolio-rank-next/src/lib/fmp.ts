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

// Minimal shape from yahoo-finance2 quote() for fallback mapping.
interface YahooQuoteLike {
  symbol?: string | null;
  quoteType?: string | null;
  marketCap?: number | null;
  beta?: number | null;
  averageDailyVolume3Month?: number | null;
}

/**
 * Build FMPProfile from a Yahoo quote() result. Use displaySymbol so the profile
 * is keyed by the ticker we requested (e.g. VUAG), not the resolved symbol (e.g. VUAG.L).
 */
function profileFromQuote(quote: YahooQuoteLike, displaySymbol: string): FMPProfile {
  const qt = (quote.quoteType ?? "").toUpperCase();
  const isEtf = qt === "ETF";
  return {
    symbol: displaySymbol,
    sector: isEtf ? "ETF" : null,
    beta: quote.beta ?? null,
    mktCap: quote.marketCap ?? null,
    volAvg: quote.averageDailyVolume3Month ?? null,
    type: isEtf ? "etf" : "stock",
  };
}

/**
 * Fetch company or ETF profile: try quoteSummary first (best for US tickers),
 * then Yahoo quote() as fallback, then quote(symbol + '.L') for UK/European symbols.
 * Uses in-memory cache (60 min TTL). Throws if ticker is not found or fetch exceeds 5s.
 */
export async function fetchCompanyProfile(ticker: string): Promise<FMPProfile> {
  const key = ticker.toUpperCase().trim();
  const cached = cache.get(key);
  if (cached && !isExpired(cached)) {
    return cached.data;
  }

  const yahooFinance = new YahooFinance();

  const fetchProfile = async (): Promise<FMPProfile> => {
    // 1. Try quoteSummary first (works well for US tickers)
    try {
      const result = (await yahooFinance.quoteSummary(key, {
        modules: ["assetProfile", "summaryDetail", "price"],
      })) as QuoteSummaryResult;
      const hasData =
        result.price?.marketCap != null ||
        result.assetProfile?.sector != null ||
        (result.summaryDetail?.beta != null && !Number.isNaN(result.summaryDetail.beta));
      if (hasData) {
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
      }
    } catch {
      // fall through to Yahoo quote() fallback
    }

    // 2. Yahoo quote() fallback (covers UK/European and UCITS ETFs)
    try {
      const quote = (await yahooFinance.quote(key)) as YahooQuoteLike;
      if (quote?.marketCap != null || quote?.symbol != null) {
        const profile = profileFromQuote(quote, key);
        cache.set(key, { data: profile, fetchedAt: Date.now() });
        return profile;
      }
    } catch {
      // fall through to .L suffix try
    }

    // 3. Try with .L suffix for UK listings (e.g. VUAG -> VUAG.L)
    if (!key.endsWith(".L")) {
      const ukSymbol = `${key}.L`;
      try {
        const quote = (await yahooFinance.quote(ukSymbol)) as YahooQuoteLike;
        if (quote?.marketCap != null || quote?.symbol != null) {
          const profile = profileFromQuote(quote, key);
          cache.set(key, { data: profile, fetchedAt: Date.now() });
          return profile;
        }
      } catch {
        // fall through to throw
      }
    }

    throw new Error(`Ticker ${key} not found`);
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Ticker ${key} timed out after ${TICKER_FETCH_TIMEOUT_MS / 1000}s`)),
      TICKER_FETCH_TIMEOUT_MS
    )
  );

  return Promise.race([fetchProfile(), timeoutPromise]);
}
