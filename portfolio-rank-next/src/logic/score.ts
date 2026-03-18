import type { FMPProfile } from "@/lib/fmp";

export type RiskTolerance = "Conservative" | "Balanced" | "Aggressive";

export type TimeHorizon =
  | "<1yr"
  | "1-3yr"
  | "1–3yr"
  | "3-7yr"
  | "3–7yr"
  | "7yr+";

export interface PortfolioHolding {
  ticker: string;
  weight: number;
  type: string;
}

export interface ScoreSubscores {
  diversification: number;
  concentrationRisk: number;
  growthQuality: number;
  valuationRisk: number;
  drawdownExposure: number;
  marketComparison: number;
}

export type ScoreLabel = "Weak" | "Average" | "Strong" | "Elite";

export interface ScoreResult {
  score: number;
  label: ScoreLabel;
  optimizationGap: number;
  subscores: ScoreSubscores;
}

export interface ScoreInputs {
  holdings: PortfolioHolding[];
  profiles: FMPProfile[];
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
}

// --- Tier 1: Broad market ETFs (inherently diversified)
const TIER1_TICKERS = new Set(
  [
    "VUAG",
    "VWRL",
    "VTI",
    "VOO",
    "SPY",
    "IWDA",
    "VUSA",
    "CSPX",
    "SWRD",
    "FWRG",
    "VWCE",
    "ISF",
  ].map((s) => s.toUpperCase())
);

// --- Tier 2: Sector ETFs (and any ETF not Tier 1)
const TIER2_TICKERS = new Set(
  ["QQQ", "XLV", "XLP", "XLE", "XLF", "XLK", "ARKK"].map((s) => s.toUpperCase())
);

const BLUE_CHIP_MKCAP = 100e9; // $100bn
const BETA_BLUE_CHIP_MAX = 1.5;
const SMALL_WEIGHT_PCT = 5;
const OVERLAP_TIER1_CAP = 88;
const SECTOR_CLUSTER_PENALTY = 15;
const MIN_WEIGHT_FOR_DIV_CREDIT = 5;

type Tier = 1 | 2 | 3 | 4;

function getProfile(ticker: string, profiles: FMPProfile[]): FMPProfile | undefined {
  const key = ticker.toUpperCase();
  return profiles.find((p) => p.symbol.toUpperCase() === key);
}

function classifyHolding(
  holding: PortfolioHolding,
  profile: FMPProfile | undefined
): Tier {
  const ticker = holding.ticker.toUpperCase();
  const type = (holding.type || profile?.type || "").toLowerCase();
  const isEtf = type === "etf";
  const mktCap = profile?.mktCap ?? 0;
  const beta = profile?.beta;
  const betaNum =
    beta != null && !Number.isNaN(beta) ? beta : isEtf ? 1.0 : 1.4;

  if (TIER1_TICKERS.has(ticker)) return 1;
  if (isEtf || TIER2_TICKERS.has(ticker)) {
    return 2;
  }
  if (mktCap > BLUE_CHIP_MKCAP && betaNum < BETA_BLUE_CHIP_MAX) {
    return 3;
  }
  return 4;
}

function diversificationCredit(tier: Tier): number {
  switch (tier) {
    case 1:
      return 85;
    case 2:
      return 50;
    case 3:
      return 20;
    case 4:
    default:
      return 5;
  }
}

// --- Step 1: Classify all holdings
function assignTiers(
  holdings: PortfolioHolding[],
  profiles: FMPProfile[]
): { holding: PortfolioHolding; profile: FMPProfile | undefined; tier: Tier }[] {
  const valid = holdings.filter((h) => h.weight > 0);
  return valid.map((holding) => {
    const profile = getProfile(holding.ticker, profiles);
    const tier = classifyHolding(holding, profile);
    return { holding, profile, tier };
  });
}

// --- Step 2.1 Diversification Score
function computeDiversificationScore(
  classified: { holding: PortfolioHolding; profile: FMPProfile | undefined; tier: Tier }[],
  profiles: FMPProfile[]
): number {
  if (classified.length === 0) return 0;

  const totalWeight = classified.reduce((s, c) => s + c.holding.weight, 0);
  if (totalWeight <= 0) return 0;

  const tier1Items = classified.filter((c) => c.tier === 1 && c.holding.weight >= MIN_WEIGHT_FOR_DIV_CREDIT);
  let tier1Contrib = tier1Items.reduce((s, c) => s + (c.holding.weight / 100) * 85, 0);
  if (tier1Items.length >= 2) {
    tier1Contrib = Math.min(tier1Contrib, OVERLAP_TIER1_CAP);
  }

  let otherContrib = 0;
  for (const { holding, tier } of classified) {
    if (holding.weight < MIN_WEIGHT_FOR_DIV_CREDIT) continue;
    if (tier === 1) continue;
    otherContrib += (holding.weight / 100) * diversificationCredit(tier);
  }

  let score = (tier1Contrib + otherContrib) / (totalWeight / 100);

  const sectorCounts = new Map<string, number>();
  for (const { tier, profile } of classified) {
    if (tier >= 3 && profile?.sector) {
      const sec = profile.sector.toUpperCase();
      sectorCounts.set(sec, (sectorCounts.get(sec) ?? 0) + 1);
    }
  }
  for (const n of sectorCounts.values()) {
    if (n >= 3) {
      score -= SECTOR_CLUSTER_PENALTY;
      break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// --- Step 2.2 Concentration Risk (higher = more risk = worse)
function computeConcentrationRiskScore(
  classified: { holding: PortfolioHolding; tier: Tier }[]
): number {
  if (classified.length === 0) return 0;

  const maxWeight = Math.max(...classified.map((c) => c.holding.weight));
  const maxItem = classified.find((c) => c.holding.weight === maxWeight)!;
  const tierMultiplier = { 1: 0.3, 2: 0.6, 3: 0.9, 4: 1.2 } as const;
  let penalty = maxWeight * tierMultiplier[maxItem.tier];
  if (maxWeight > 40 && maxItem.tier >= 3) {
    penalty *= 1.5;
  }
  return Math.min(100, penalty * 2);
}

// --- Step 2.3 Growth Quality
function tierQualityBase(tier: Tier): number {
  switch (tier) {
    case 1:
      return 70;
    case 2:
      return 60;
    case 3:
      return 65;
    case 4:
    default:
      return 30;
  }
}

function computeGrowthQualityScore(
  classified: { holding: PortfolioHolding; tier: Tier }[]
): number {
  if (classified.length === 0) return 0;

  const totalWeight = classified.reduce((s, c) => s + c.holding.weight, 0);
  if (totalWeight <= 0) return 0;

  const weightedSum = classified.reduce(
    (s, c) => s + (c.holding.weight / 100) * tierQualityBase(c.tier),
    0
  );
  let score = (weightedSum / (totalWeight / 100));

  const hasEtf = classified.some((c) => c.tier === 1 || c.tier === 2);
  const hasStock = classified.some((c) => c.tier === 3 || c.tier === 4);
  if (hasEtf && hasStock) score += 10;

  return Math.min(100, Math.max(0, score));
}

// --- Step 2.4 Valuation Risk (higher = more risk)
function valuationRiskBase(tier: Tier): number {
  switch (tier) {
    case 1:
      return 20;
    case 2:
      return 40;
    case 3:
      return 50;
    case 4:
    default:
      return 80;
  }
}

function computeValuationRiskScore(
  classified: { holding: PortfolioHolding; tier: Tier }[],
  timeHorizon: TimeHorizon
): number {
  if (classified.length === 0) return 0;

  const totalWeight = classified.reduce((s, c) => s + c.holding.weight, 0);
  if (totalWeight <= 0) return 0;

  let score = classified.reduce(
    (s, c) => s + (c.holding.weight / 100) * valuationRiskBase(c.tier),
    0
  );
  score = score / (totalWeight / 100);

  const longHorizon = timeHorizon === "7yr+";
  if (longHorizon) score -= 10;

  return Math.max(0, Math.min(100, score));
}

// --- Step 2.5 Drawdown Exposure (higher = more risk)
function defaultBetaForTier(tier: Tier): number {
  switch (tier) {
    case 1:
      return 1.0;
    case 2:
      return 1.1;
    case 3:
      return 1.0;
    case 4:
    default:
      return 1.4;
  }
}

function computeDrawdownExposureScore(
  classified: { holding: PortfolioHolding; profile: FMPProfile | undefined; tier: Tier }[],
  riskTolerance: RiskTolerance
): number {
  if (classified.length === 0) return 0;

  const totalWeight = classified.reduce((s, c) => s + c.holding.weight, 0);
  if (totalWeight <= 0) return 0;

  let weightedBeta = 0;
  for (const { holding, profile, tier } of classified) {
    const beta = profile?.beta;
    const b = beta != null && !Number.isNaN(beta) ? beta : defaultBetaForTier(tier);
    weightedBeta += (holding.weight / 100) * b;
  }
  weightedBeta /= totalWeight / 100;

  let score = Math.min(100, weightedBeta * 50);
  if (riskTolerance === "Aggressive") score -= 10;
  if (riskTolerance === "Conservative") score += 15;

  return Math.max(0, Math.min(100, score));
}

// --- Step 2.6 Market Comparison
function computeMarketComparisonScore(
  classified: { holding: PortfolioHolding; tier: Tier }[]
): number {
  const etfWeight = classified
    .filter((c) => c.tier === 1 || c.tier === 2)
    .reduce((s, c) => s + c.holding.weight, 0);
  if (etfWeight <= 0) return 10;
  return Math.min(80, etfWeight);
}

// --- Step 3: Fit Score
function isShortHorizon(timeHorizon: TimeHorizon): boolean {
  return timeHorizon === "<1yr" || timeHorizon === "1-3yr" || timeHorizon === "1–3yr";
}

function isLongHorizon(timeHorizon: TimeHorizon): boolean {
  return timeHorizon === "7yr+";
}

function getWeightedBeta(
  classified: { holding: PortfolioHolding; profile: FMPProfile | undefined; tier: Tier }[]
): number {
  const totalWeight = classified.reduce((s, c) => s + c.holding.weight, 0);
  if (totalWeight <= 0) return 1;
  let sum = 0;
  for (const { holding, profile, tier } of classified) {
    const beta = profile?.beta;
    const b = beta != null && !Number.isNaN(beta) ? beta : defaultBetaForTier(tier);
    sum += (holding.weight / 100) * b;
  }
  return sum / (totalWeight / 100);
}

function computeRiskFit(weightedBeta: number, riskTolerance: RiskTolerance): number {
  if (riskTolerance === "Conservative") {
    if (weightedBeta > 1.2) return 20;
    if (weightedBeta >= 0.8 && weightedBeta <= 1.2) return 60;
    return 90;
  }
  if (riskTolerance === "Balanced") {
    if (weightedBeta > 1.4) return 40;
    if (weightedBeta >= 0.9 && weightedBeta <= 1.4) return 75;
    return 50;
  }
  return 80; // Aggressive
}

function computeHorizonFit(
  classified: { holding: PortfolioHolding; tier: Tier }[],
  timeHorizon: TimeHorizon
): number {
  const tier4Weight = classified.filter((c) => c.tier === 4).reduce((s, c) => s + c.holding.weight, 0);
  const tier12Weight = classified.filter((c) => c.tier === 1 || c.tier === 2).reduce((s, c) => s + c.holding.weight, 0);

  if (isShortHorizon(timeHorizon)) {
    if (tier4Weight > 20) return 20;
    return 75;
  }
  if (timeHorizon === "3-7yr" || timeHorizon === "3–7yr") {
    return 70;
  }
  if (isLongHorizon(timeHorizon)) {
    if (tier4Weight > 20 || classified.some((c) => c.tier === 4)) return 80;
    if (tier12Weight >= 80) return 85;
    return 75;
  }
  return 70;
}

function computeIntentionality(
  classified: { holding: PortfolioHolding; tier: Tier }[]
): number {
  let score = 50; // base

  const etfCount = classified.filter((c) => c.tier === 1 || c.tier === 2).length;
  const stockCount = classified.filter((c) => c.tier === 3 || c.tier === 4).length;
  const tier1Tickers = new Set(classified.filter((c) => c.tier === 1).map((c) => c.holding.ticker.toUpperCase()));

  if (etfCount >= 1 && etfCount <= 3 && stockCount <= 5) score += 20;
  if (classified.length > 8 && etfCount === 0) score -= 15;

  for (const { holding } of classified) {
    if (holding.weight < 3) score -= 5;
  }

  const overlapPairs = [
    ["VUAG", "VWRL"],
    ["VUAG", "SPY"],
    ["VWRL", "SPY"],
    ["VTI", "VOO"],
    ["VTI", "SPY"],
  ];
  for (const [a, b] of overlapPairs) {
    if (tier1Tickers.has(a) && tier1Tickers.has(b)) {
      score -= 10;
      break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

function computeFitScore(
  classified: { holding: PortfolioHolding; profile: FMPProfile | undefined; tier: Tier }[],
  inputs: ScoreInputs
): number {
  const weightedBeta = getWeightedBeta(classified);
  const riskFit = computeRiskFit(weightedBeta, inputs.riskTolerance);
  const horizonFit = computeHorizonFit(classified, inputs.timeHorizon);
  const intentionality = computeIntentionality(classified);

  return (riskFit * 0.4 + horizonFit * 0.35 + intentionality * 0.25);
}

// --- Step 4 & 5 & 6
export function scorePortfolio(inputs: ScoreInputs): ScoreResult {
  const { holdings, profiles, riskTolerance, timeHorizon } = inputs;

  const classified = assignTiers(holdings, profiles);

  const diversification = computeDiversificationScore(classified, profiles);
  const concentrationRisk = computeConcentrationRiskScore(classified);
  const growthQuality = computeGrowthQualityScore(classified);
  const valuationRisk = computeValuationRiskScore(classified, timeHorizon);
  const drawdownExposure = computeDrawdownExposureScore(classified, riskTolerance);
  const marketComparison = computeMarketComparisonScore(classified);

  const structureScore =
    ((100 - concentrationRisk) * 0.25 +
      diversification * 0.3 +
      growthQuality * 0.2 +
      (100 - valuationRisk) * 0.1 +
      (100 - drawdownExposure) * 0.1 +
      marketComparison * 0.05) /
    10;

  const fitTotal = computeFitScore(classified, inputs);
  const fitScore = fitTotal / 10;

  let final: number;
  if (riskTolerance === "Conservative") {
    final = fitScore * 0.6 + structureScore * 0.4;
  } else if (riskTolerance === "Aggressive") {
    final = fitScore * 0.4 + structureScore * 0.6;
  } else {
    final = fitScore * 0.5 + structureScore * 0.5;
  }

  // Hard cap: if a single non-ETF position dominates (>= 90%),
  // the portfolio is always "Weak" regardless of risk tolerance.
  const maxNonEtfWeight = classified
    .filter((c) => c.tier === 3 || c.tier === 4)
    .reduce((max, c) => Math.max(max, c.holding.weight), 0);
  if (maxNonEtfWeight >= 90) {
    final = Math.min(final, 3.9);
  }

  final = Math.max(1.0, Math.min(10.0, final));
  final = Math.round(final * 10) / 10;

  let gap = 0;
  if (diversification < 40) gap += 1.5;
  if (concentrationRisk > 60) gap += 1.0;
  if (fitTotal < 50) gap += 1.5;
  if (growthQuality < 50) gap += 0.5;
  gap = Math.min(2.5, Math.max(0.3, gap));

  const label: ScoreLabel =
    final <= 3.9
      ? "Weak"
      : final <= 5.9
        ? "Average"
        : final <= 7.4
          ? "Strong"
          : "Elite";

  return {
    score: Math.round(final * 10),
    label,
    optimizationGap: Math.round(gap * 10),
    subscores: {
      diversification: Math.round(diversification),
      concentrationRisk: Math.round(concentrationRisk),
      growthQuality: Math.round(growthQuality),
      valuationRisk: Math.round(valuationRisk),
      drawdownExposure: Math.round(drawdownExposure),
      marketComparison: Math.round(marketComparison),
    },
  };
}
