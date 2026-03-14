/**
 * FMP (Financial Modeling Prep) API helpers.
 * Used only by server-side API routes. Never expose API key to client.
 */

const FMP_PROFILE_URL = "https://financialmodelingprep.com/api/v3/profile";

/** Raw profile object from FMP API (only fields we use) */
export interface FMPProfileRaw {
  symbol: string;
  sector: string | null;
  beta: number | null;
  mktCap: number | null;
  volAvg: number | null;
}

/** Extracted profile shape returned by the proxy */
export interface FMPProfile {
  symbol: string;
  sector: string | null;
  beta: number | null;
  mktCap: number | null;
  volAvg: number | null;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

const cache = new Map<
  string,
  { data: FMPProfile; fetchedAt: number }
>();

function isExpired(entry: { fetchedAt: number }): boolean {
  return Date.now() - entry.fetchedAt > CACHE_TTL_MS;
}

/**
 * Fetch company profile for one ticker from FMP.
 * Uses in-memory cache (60 min TTL). Does not expose API key.
 */
export async function fetchCompanyProfile(
  ticker: string,
  apiKey: string
): Promise<FMPProfile> {
  const key = ticker.toUpperCase();
  const cached = cache.get(key);
  if (cached && !isExpired(cached)) {
    return cached.data;
  }

  const url = `${FMP_PROFILE_URL}/${encodeURIComponent(ticker)}?apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    throw new Error(`FMP request failed: ${res.status}`);
  }

  const json = (await res.json()) as FMPProfileRaw[] | { "Error Message"?: string };
  if (Array.isArray(json) && json.length === 0) {
    throw new Error("Ticker not found");
  }
  if (!Array.isArray(json) || json.length === 0) {
    const msg = typeof (json as { "Error Message"?: string })["Error Message"] === "string"
      ? (json as { "Error Message": string })["Error Message"]
      : "Invalid response";
    throw new Error(msg);
  }

  const raw = json[0] as FMPProfileRaw;
  const data: FMPProfile = {
    symbol: raw.symbol ?? ticker.toUpperCase(),
    sector: raw.sector ?? null,
    beta: raw.beta ?? null,
    mktCap: raw.mktCap ?? null,
    volAvg: raw.volAvg ?? null,
  };

  cache.set(key, { data, fetchedAt: Date.now() });
  return data;
}
