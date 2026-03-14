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

function clampScore(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function getSectorForTicker(
  ticker: string,
  profiles: FMPProfile[]
): string | null {
  const key = ticker.toUpperCase();
  const profile = profiles.find((p) => p.symbol.toUpperCase() === key);
  return profile?.sector ?? null;
}

function getBetaForTicker(ticker: string, profiles: FMPProfile[]): number {
  const key = ticker.toUpperCase();
  const profile = profiles.find((p) => p.symbol.toUpperCase() === key);
  const beta = profile?.beta;
  if (beta === null || beta === undefined || Number.isNaN(beta)) {
    return 1.0;
  }
  return beta;
}

function calculateDiversificationSubscore(
  holdings: PortfolioHolding[],
  profiles: FMPProfile[]
): number {
  const validHoldings = holdings.filter((h) => h.weight > 0);
  const count = validHoldings.length;

  let base: number;
  if (count === 0) {
    base = 0;
  } else if (count <= 2) {
    base = 10;
  } else if (count <= 5) {
    base = 40;
  } else if (count <= 10) {
    base = 70;
  } else if (count <= 15) {
    base = 90;
  } else {
    base = 100;
  }

  // Sector concentration penalty: if any single sector > 60% of portfolio, subtract 20.
  const sectorWeights = new Map<string, number>();
  for (const holding of validHoldings) {
    const sector = getSectorForTicker(holding.ticker, profiles);
    if (!sector) continue;
    const key = sector.toUpperCase();
    const existing = sectorWeights.get(key) ?? 0;
    sectorWeights.set(key, existing + holding.weight);
  }

  let maxSectorWeight = 0;
  for (const value of sectorWeights.values()) {
    if (value > maxSectorWeight) {
      maxSectorWeight = value;
    }
  }

  let score = base;
  if (maxSectorWeight > 60) {
    score -= 20;
  }

  return clampScore(score);
}

function calculateConcentrationRiskSubscore(
  holdings: PortfolioHolding[]
): number {
  const validHoldings = holdings.filter((h) => h.weight > 0);
  if (validHoldings.length === 0) {
    return 0;
  }
  const largest = validHoldings.reduce(
    (max, h) => (h.weight > max ? h.weight : max),
    0
  );

  let score: number;
  if (largest > 50) {
    score = 10;
  } else if (largest >= 35) {
    score = 30;
  } else if (largest >= 20) {
    score = 60;
  } else if (largest >= 10) {
    score = 80;
  } else {
    score = 100;
  }

  return clampScore(score);
}

function calculateGrowthQualitySubscore(
  holdings: PortfolioHolding[],
  profiles: FMPProfile[]
): number {
  const validHoldings = holdings.filter((h) => h.weight > 0);
  if (validHoldings.length === 0) {
    return 0;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const holding of validHoldings) {
    const sector = getSectorForTicker(holding.ticker, profiles);
    const normalizedSector = sector ? sector.toLowerCase() : "";

    let sectorScore: number;
    if (
      normalizedSector === "technology" ||
      normalizedSector === "healthcare" ||
      normalizedSector === "consumer discretionary"
    ) {
      sectorScore = 80;
    } else if (
      normalizedSector === "financials" ||
      normalizedSector === "industrials"
    ) {
      sectorScore = 60;
    } else if (
      normalizedSector === "utilities" ||
      normalizedSector === "energy" ||
      normalizedSector === "materials"
    ) {
      sectorScore = 40;
    } else {
      sectorScore = 50;
    }

    weightedSum += sectorScore * holding.weight;
    totalWeight += holding.weight;
  }

  if (totalWeight <= 0) {
    return 0;
  }

  const score = weightedSum / totalWeight;
  return clampScore(score);
}

function calculateValuationRiskSubscore(
  holdings: PortfolioHolding[],
  profiles: FMPProfile[]
): number {
  const validHoldings = holdings.filter((h) => h.weight > 0);
  if (validHoldings.length === 0) {
    return 0;
  }

  let techWeight = 0;

  for (const holding of validHoldings) {
    const sector = getSectorForTicker(holding.ticker, profiles);
    if (!sector) continue;
    const normalizedSector = sector.toLowerCase();
    if (normalizedSector === "technology") {
      techWeight += holding.weight;
    }
  }

  let score: number;
  if (techWeight > 50) {
    score = 30;
  } else if (techWeight >= 30) {
    score = 60;
  } else {
    score = 90;
  }

  return clampScore(score);
}

function calculateDrawdownExposureSubscore(
  holdings: PortfolioHolding[],
  profiles: FMPProfile[]
): number {
  const validHoldings = holdings.filter((h) => h.weight > 0);
  if (validHoldings.length === 0) {
    return 0;
  }

  let weightedBetaSum = 0;
  let totalWeight = 0;

  for (const holding of validHoldings) {
    const beta = getBetaForTicker(holding.ticker, profiles);
    weightedBetaSum += beta * holding.weight;
    totalWeight += holding.weight;
  }

  if (totalWeight <= 0) {
    return 0;
  }

  const portfolioBeta = weightedBetaSum / totalWeight;

  let score: number;
  if (portfolioBeta < 0.8) {
    score = 90;
  } else if (portfolioBeta <= 1.2) {
    score = 70;
  } else if (portfolioBeta <= 1.6) {
    score = 50;
  } else {
    score = 30;
  }

  return clampScore(score);
}

function calculateMarketComparisonSubscore(): number {
  return 50;
}

function labelForScore(score: number): ScoreLabel {
  if (score <= 40) {
    return "Weak";
  }
  if (score <= 60) {
    return "Average";
  }
  if (score <= 80) {
    return "Strong";
  }
  return "Elite";
}

export function scorePortfolio(inputs: ScoreInputs): ScoreResult {
  const { holdings, profiles } = inputs;

  const diversification = calculateDiversificationSubscore(holdings, profiles);
  const concentrationRisk = calculateConcentrationRiskSubscore(holdings);
  const growthQuality = calculateGrowthQualitySubscore(holdings, profiles);
  const valuationRisk = calculateValuationRiskSubscore(holdings, profiles);
  const drawdownExposure = calculateDrawdownExposureSubscore(
    holdings,
    profiles
  );
  const marketComparison = calculateMarketComparisonSubscore();

  const internalScore =
    diversification * 0.25 +
    concentrationRisk * 0.2 +
    growthQuality * 0.2 +
    valuationRisk * 0.15 +
    drawdownExposure * 0.1 +
    marketComparison * 0.1;

  const clampedInternal = clampScore(internalScore);
  const finalScore = Math.round(clampedInternal);

  const label = labelForScore(finalScore);
  const optimizationGap = Math.min(
    25,
    Math.round((100 - finalScore) * 0.4)
  );

  return {
    score: finalScore,
    label,
    optimizationGap,
    subscores: {
      diversification,
      concentrationRisk,
      growthQuality,
      valuationRisk,
      drawdownExposure,
      marketComparison,
    },
  };
}

