"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "portfolio-rank-form";

interface StoredForm {
  holdings: { ticker: string; weight: number }[];
  riskTolerance: string;
  timeHorizon: string;
}

interface ScoreSubscores {
  diversification: number;
  concentrationRisk: number;
  growthQuality: number;
  valuationRisk: number;
  drawdownExposure: number;
  marketComparison: number;
}

interface ScoreResult {
  score: number;
  label: string;
  optimizationGap: number;
  subscores: ScoreSubscores;
}

interface AiNarrative {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actions: string[];
  blueprint: string;
}

function labelColor(label: string): string {
  switch (label) {
    case "Elite":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "Strong":
      return "bg-sky-500/20 text-sky-300 border-sky-500/40";
    case "Average":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    case "Weak":
    default:
      return "bg-rose-500/20 text-rose-300 border-rose-500/40";
  }
}

function ResultPage() {
  const searchParams = useSearchParams();
  const [stored, setStored] = useState<StoredForm | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [ai, setAi] = useState<AiNarrative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (typeof window === "undefined") return;
      setLoading(true);
      setError(null);

      let parsed: StoredForm | null = null;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw) as unknown;
          if (
            data &&
            typeof data === "object" &&
            Array.isArray((data as StoredForm).holdings) &&
            (data as StoredForm).holdings.length > 0
          ) {
            parsed = data as StoredForm;
          }
        }
      } catch {
        parsed = null;
      }

      if (!parsed) {
        if (!cancelled) {
          setStored(null);
          setScore(null);
          setAi(null);
          setError("No portfolio data found. Please analyse a portfolio first.");
          setLoading(false);
        }
        return;
      }

      setStored(parsed);

      try {
        const analyzePayload = {
          holdings: parsed.holdings.map((h) => ({
            ticker: h.ticker.toUpperCase(),
            weight: h.weight,
            type: "Stock",
          })),
          riskTolerance: parsed.riskTolerance,
          timeHorizon: parsed.timeHorizon,
        };

        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(analyzePayload),
        });

        if (!analyzeRes.ok) {
          throw new Error("Analyze request failed");
        }

        const analyzeJson = (await analyzeRes.json()) as ScoreResult;
        if (!cancelled) {
          setScore(analyzeJson);
        }

        const aiRes = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...analyzePayload,
            score: analyzeJson.score,
            label: analyzeJson.label,
            subscores: analyzeJson.subscores,
          }),
        });

        if (aiRes.ok) {
          const aiJson = (await aiRes.json()) as AiNarrative;
          if (!cancelled) {
            setAi(aiJson);
          }
        }
      } catch {
        if (!cancelled) {
          setError(
            "We had trouble generating your report. Try again in a moment."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unlocked = searchParams.get("unlocked");
    const sessionId = searchParams.get("session_id");
    if (unlocked !== "true" || !sessionId?.trim()) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { paid: boolean; sessionData?: string };
        if (!cancelled && data.paid) {
          setIsUnlocked(true);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleUnlock() {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      setError("No portfolio data found. Please analyse a portfolio first.");
      return;
    }
    let portfolioData: unknown;
    try {
      portfolioData = JSON.parse(raw);
    } catch {
      setError("Invalid portfolio data.");
      return;
    }
    const sessionData = btoa(
      encodeURIComponent(JSON.stringify(portfolioData))
    );
    setUnlockLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionData }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error ?? "Checkout failed. Try again.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Checkout failed. Try again.");
    } finally {
      setUnlockLoading(false);
    }
  }

  const scoreValue = score?.score ?? null;
  const label = score?.label ?? "Strong";
  const gap = score?.optimizationGap ?? 0;
  const targetScore =
    scoreValue !== null ? Math.min(100, scoreValue + gap) : null;

  const displayScore =
    scoreValue !== null ? Number((scoreValue / 10).toFixed(1)) : null;
  const displayTarget =
    targetScore !== null ? Number((targetScore / 10).toFixed(1)) : null;
  const displayDelta =
    scoreValue !== null ? Number((gap / 10).toFixed(1)) : null;

  const scorePercent =
    displayScore !== null ? (displayScore / 10) * 100 : 0;
  const targetPercent =
    displayTarget !== null
      ? Math.max((displayTarget - (displayScore ?? 0)) / 10 * 100, 0)
      : 0;

  return (
    <div className="min-h-screen text-zinc-50 pb-24" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="max-w-xl mx-auto px-4 pt-6 pb-4">
        <Link
          href="/analyze"
          className="text-sm text-zinc-400 hover:text-zinc-200 mb-4 inline-block"
        >
          ← Back to analyse
        </Link>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            Your Free Rankfolio™ Preview
          </h1>
          <p className="text-sm text-zinc-400">
            Take a screenshot and share with your friends!
          </p>
        </header>

        {stored && (
          <p className="text-xs text-zinc-500 mb-4">
            {stored.holdings.length} holding
            {stored.holdings.length !== 1 ? "s" : ""} · {stored.riskTolerance} ·{" "}
            {stored.timeHorizon}
          </p>
        )}

        {/* Score card */}
        <section className="mb-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 px-5 py-6 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-1">
                Rankfolio Score
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold leading-none">
                  {displayScore !== null ? displayScore.toFixed(1) : "–"}
                </span>
                <span className="text-sm text-zinc-500">/10</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full border text-xs font-medium ${labelColor(
                  label
                )}`}
              >
                {label}
              </span>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-300">
                <span>
                  {displayDelta !== null
                    ? `Potential +${displayDelta.toFixed(1)} ↑`
                    : "Potential"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Current</span>
              {targetScore !== null && (
                <span>
                  Potential{" "}
                  {displayTarget !== null
                    ? displayTarget.toFixed(1)
                    : "-"}
                  /10
                </span>
              )}
            </div>
            <div className="relative h-3 w-full rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-sky-400 to-sky-500"
                style={{ width: `${Math.min(scorePercent, 100)}%` }}
              />
              {targetPercent > 0 && (
                <div
                  className="absolute left-0 top-0 h-full bg-[repeating-linear-gradient(135deg,rgba(16,185,129,0.7)_0,rgba(16,185,129,0.7)_4px,rgba(16,185,129,0.3)_4px,rgba(16,185,129,0.3)_8px)]"
                  style={{
                    width: `${Math.min(scorePercent + targetPercent, 100)}%`,
                    maskImage: `linear-gradient(to right, transparent ${scorePercent}%, white ${scorePercent}%)`,
                  }}
                />
              )}
            </div>
          </div>
        </section>

        {/* AI assessment */}
        <section className="mb-8">
          <div className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500 mb-2">
            AI ASSESSMENT
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-4 space-y-3">
            <p className="text-sm text-zinc-200 leading-relaxed">
              {ai?.summary ??
                "Your portfolio preview is being generated. Based on your score, you have meaningful strengths but also clear areas to improve."}
            </p>
            {displayTarget !== null && (
              <p className="text-sm text-emerald-300 flex items-center gap-1">
                <span>💡</span>
                <span>
                  With optimisation, your portfolio could reach{" "}
                  {displayTarget.toFixed(1)}!
                </span>
              </p>
            )}
            {loading && (
              <p className="text-xs text-zinc-500">
                Analysing your holdings with AI…
              </p>
            )}
            {error && (
              <p className="text-xs text-amber-400">
                {error} You can still unlock the full report below.
              </p>
            )}
          </div>
        </section>

        {/* Full report section — blurred when locked */}
        <section className="relative mb-16">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-5 space-y-5 overflow-hidden">
            <div
              className={isUnlocked ? "" : "blur-sm opacity-60"}
            >
              {/* Subscores */}
              {score && (
                <div className="space-y-3 mb-4">
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.18em]">
                    Full Metric Breakdown
                  </h2>
                  {(
                    Object.entries(score.subscores) as [keyof ScoreSubscores, number][]
                  ).map(([key, value]) => {
                    const labelText =
                      key === "concentrationRisk"
                        ? "Concentration Risk"
                        : key === "growthQuality"
                        ? "Growth Quality"
                        : key === "valuationRisk"
                        ? "Valuation Risk"
                        : key === "drawdownExposure"
                        ? "Drawdown Exposure"
                        : key === "marketComparison"
                        ? "Market Comparison"
                        : "Diversification";
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>{labelText}</span>
                          <span className="text-zinc-200 font-medium">
                            {value}/100
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-fuchsia-400 to-sky-400"
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Strengths / weaknesses / actions / blueprint */}
              {ai && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-[0.18em] mb-1">
                      Strengths
                    </h3>
                    <ul className="text-sm text-zinc-200 space-y-1.5 list-disc list-inside">
                      {ai.strengths.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-rose-300 uppercase tracking-[0.18em] mb-1">
                      Weaknesses
                    </h3>
                    <ul className="text-sm text-zinc-200 space-y-1.5 list-disc list-inside">
                      {ai.weaknesses.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-sky-300 uppercase tracking-[0.18em] mb-1">
                      Actions
                    </h3>
                    <ul className="text-sm text-zinc-200 space-y-1.5 list-disc list-inside">
                      {ai.actions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-[0.18em] mb-1">
                      Blueprint
                    </h3>
                    <p className="text-sm text-zinc-200 leading-relaxed">
                      {ai.blueprint}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Dark overlay card — hidden when unlocked */}
            {!isUnlocked && (
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/85 to-zinc-950/95 flex items-center justify-center px-4">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-950/95 px-5 py-5 shadow-2xl shadow-black/60">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔒</span>
                  <h2 className="text-sm font-semibold">
                    Unlock Your Full Report:
                  </h2>
                </div>
                <ul className="text-xs text-zinc-200 space-y-1.5 mb-4">
                  <li>
                    <span className="font-semibold">
                      Full breakdown of all 6 portfolio metrics
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">
                      3 specific weaknesses dragging your score down
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">
                      Step-by-step action plan to reach your potential
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">
                      Optimised Portfolio Blueprint — what to buy and sell
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">
                      AI-powered analysis of your exact holdings
                    </span>
                  </li>
                </ul>

                <div className="text-[10px] font-semibold tracking-[0.24em] text-zinc-500 mb-1">
                  ONE TIME PAYMENT
                </div>
                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={unlockLoading || (!stored && !score)}
                  className="w-full mb-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-sm font-semibold py-2.5 text-white shadow-lg shadow-fuchsia-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {unlockLoading ? "Redirecting to payment…" : "Unlock Full Report — £4"}
                </button>
                <div className="flex items-center justify-between text-[10px] mt-1">
                  <span className="text-emerald-300 font-semibold">
                    READY IN 30 SECONDS
                  </span>
                  <span className="text-orange-300">
                    ⚠️ Price increase incoming
                  </span>
                </div>
              </div>
            </div>
            )}
          </div>
        </section>
      </div>

      {/* Sticky bottom bar — hidden when report unlocked */}
      {!isUnlocked && (
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">
              Unlock Full Report
            </span>
            <span className="text-sm font-semibold text-zinc-100">£4</span>
          </div>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlockLoading || (!stored && !score)}
            className="flex-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-sm font-semibold py-2.5 text-white text-center shadow-lg shadow-fuchsia-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {unlockLoading ? "Redirecting to payment…" : "Unlock Now"}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

export default ResultPage;
