export interface StoredReport {
  score: {
    score: number;
    label: string;
    optimizationGap: number;
    subscores: {
      diversification: number;
      concentrationRisk: number;
      growthQuality: number;
      valuationRisk: number;
      drawdownExposure: number;
      marketComparison: number;
    };
  };
  ai: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    actions: string[];
    blueprint: string;
  };
  form: {
    holdings: { ticker: string; weight: number }[];
    riskTolerance: string;
    timeHorizon: string;
  };
}

const reportStore = new Map<string, { report: StoredReport; at: number }>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

function prune() {
  const now = Date.now();
  for (const [k, v] of reportStore.entries()) {
    if (now - v.at > TTL_MS) reportStore.delete(k);
  }
}

export function setReport(reportKey: string, report: StoredReport): void {
  prune();
  reportStore.set(reportKey, { report, at: Date.now() });
}

export function getReport(reportKey: string): StoredReport | null {
  const entry = reportStore.get(reportKey);
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) {
    reportStore.delete(reportKey);
    return null;
  }
  return entry.report;
}
