"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
/** Site-wide CTA gold — matches homepage / analyse */
const PAYWALL_GOLD_BG = "#d4840a";
const PAYWALL_GOLD_RGB = "212, 132, 10";

const STORAGE_KEY = "portfolio-rank-form";

const LOADING_MESSAGES = [
  "Analysing your holdings...",
  "Calculating risk exposure...",
  "Scoring your portfolio...",
  "Generating your assessment...",
];

interface StoredForm {
  holdings: { ticker: string; weight: number; type?: string }[];
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
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    case "Strong":
      return "bg-sky-500/20 text-sky-400 border-sky-500/40";
    case "Average":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "Weak":
    default:
      return "bg-red-500/20 text-red-400 border-red-500/40";
  }
}

function ResultPage() {
  const searchParams = useSearchParams();
  const [stored, setStored] = useState<StoredForm | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [ai, setAi] = useState<AiNarrative | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
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
            type: h.type ?? "stock",
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
          const aiJson = (await aiRes.json()) as AiNarrative & { _error?: string };
          if (aiJson._error) alert("[AI error]: " + aiJson._error);
          console.log("[Result page] /api/ai returned — aiJson.blueprint (first 200 chars):", aiJson?.blueprint?.slice(0, 200));
          console.log("[Result page] aiJson.blueprint is fallback?", aiJson?.blueprint?.includes("Your portfolio shows structural concentration risk given the tickers and weights provided"));
          if (!cancelled) {
            setAi(aiJson);
          }
        } else {
          console.warn("[Result page] /api/ai !ok:", aiRes.status);
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

  useEffect(() => {
    if (!stored || (!loading && score && ai)) return;
    const id = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(id);
  }, [stored, loading, score, ai]);

  async function handleUnlock() {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      setError("No portfolio data found. Please analyse a portfolio first.");
      return;
    }
    let portfolioData: StoredForm;
    try {
      portfolioData = JSON.parse(raw) as StoredForm;
    } catch {
      setError("Invalid portfolio data.");
      return;
    }
    if (!score || !ai) {
      setError("Report not ready. Please wait for the analysis to complete.");
      return;
    }
    const reportKey = crypto.randomUUID();
    setUnlockLoading(true);
    try {
      const storeRes = await fetch("/api/store-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportKey,
          report: {
            score: { ...score },
            ai: { ...ai },
            form: portfolioData,
          },
        }),
      });
      if (!storeRes.ok) {
        setError("Could not prepare report. Try again.");
        return;
      }
      const sessionData = btoa(
        encodeURIComponent(JSON.stringify(portfolioData))
      );
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionData, reportKey }),
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
    <div className="min-h-screen text-white pb-24" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0a]/70 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/brand/bull-head.png" alt="Rankfolio" className="h-16 w-auto" />
            <span className="font-bold text-lg">
              <span className="text-white">Rank</span>
              <span className="text-[#d4840a]">folio™</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="relative z-0 max-w-md mx-auto px-4 pt-6 pb-4 text-center">
        <Link
          href="/analyze"
          className="text-slate-400 hover:text-yellow-400 transition-colors mb-4 inline-block"
        >
          ← Back to analyse
        </Link>

        <header className="mb-6">
          <h1 className="font-heading text-2xl font-bold tracking-tight mb-1 text-white">
            Your Free Rankfolio™ Preview
          </h1>
          <p className="text-sm text-slate-400">
            Take a screenshot and share with your friends!
          </p>
        </header>

        {stored && (
          <p className="text-xs text-slate-500 mb-4">
            {stored.holdings.length} holding
            {stored.holdings.length !== 1 ? "s" : ""} · {stored.riskTolerance} ·{" "}
            {stored.timeHorizon}
          </p>
        )}

        {stored && (loading || !score || !ai) && (
          <div
            className="flex flex-col items-center justify-center py-24 min-h-[280px] rounded-2xl bg-[#0a0a0a] border border-amber-500/20"
            style={{ backgroundColor: "#0a0a0a" }}
          >
            <div
              className="w-14 h-14 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin mb-6"
              aria-hidden
            />
            <p
              key={loadingMessageIndex}
              className="result-loading-message text-amber-400/90 text-sm font-medium min-h-[1.5rem] text-center"
            >
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes resultLoadingFade {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .result-loading-message {
                animation: resultLoadingFade 0.3s ease-out;
              }
            `}} />
          </div>
        )}

        {stored && !loading && score && ai && (
        <>
        {/* Score card */}
        <section className="mb-8 rounded-2xl bg-[#111111] border border-yellow-500/20 p-6">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="text-xs uppercase tracking-[0.18em] text-yellow-400">
              Rankfolio Score
            </div>
            <div className="flex items-baseline gap-2 justify-center">
              <span className="font-heading text-4xl font-bold leading-none text-white">
                {displayScore !== null ? displayScore.toFixed(1) : "–"}
              </span>
              <span className="text-sm text-slate-500">/10</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span
                className={`px-3 py-1 rounded-full border text-xs font-medium ${labelColor(
                  label
                )}`}
              >
                {label}
              </span>
              <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-[#0a0a0a] bg-[#f59e0b]">
                <span>
                  {displayDelta !== null
                    ? `Potential +${displayDelta.toFixed(1)} ↑`
                    : "Potential"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-slate-500">
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
            <div className="relative h-3 w-full rounded-full bg-[#1a1a1a] overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-[#f59e0b]"
                style={{ width: `${Math.min(scorePercent, 100)}%` }}
              />
              {targetPercent > 0 && (
                <div
                  className="absolute left-0 top-0 h-full bg-[repeating-linear-gradient(135deg,rgba(245,158,11,0.8)_0,rgba(245,158,11,0.8)_4px,rgba(245,158,11,0.4)_4px,rgba(245,158,11,0.4)_8px)]"
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
          <div className="rounded-2xl bg-[#111111] border border-yellow-500/20 p-6 space-y-3">
            <div className="text-[11px] font-semibold tracking-normal text-yellow-400 mb-2">
              AI ASSESSMENT
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {ai?.summary ??
                "Your portfolio preview is being generated. Based on your score, you have meaningful strengths but also clear areas to improve."}
            </p>
            {displayTarget !== null && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold text-center">
                💡 With optimisation, your portfolio could reach {displayTarget.toFixed(1)}
              </div>
            )}
            {error && (
              <p className="text-xs text-amber-400">
                {error} You can still unlock the full report below.
              </p>
            )}
          </div>
        </section>

        {!isUnlocked && (
          <section className="mb-16">
            <div className="rounded-2xl border border-yellow-500/20 bg-[#111111] px-5 py-5 shadow-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg text-yellow-400">🔒</span>
                <h2 className="font-heading text-sm font-semibold text-white">
                  Unlock Your Full Report:
                </h2>
              </div>
              <ul className="mb-4 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span aria-hidden>🔍</span>
                  <span>
                    See why your score is {displayScore != null ? displayScore.toFixed(1) : "–"}/10 — and how to reach {displayTarget != null ? displayTarget.toFixed(1) : "–"}/10
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden>⚠️</span>
                  <span>
                    The exact weaknesses dragging your portfolio down
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden>🎯</span>
                  <span>
                    A step-by-step action plan built for your specific holdings
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden>📊</span>
                  <span>
                    Full breakdown of all 6 metrics with your real numbers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden>🗺️</span>
                  <span>
                    Your personalised Portfolio Blueprint — what to buy, trim and avoid
                  </span>
                </li>
              </ul>

              <div className="mb-1 text-[10px] font-semibold tracking-[0.24em] text-slate-500">
                ONE TIME PAYMENT
              </div>
              <button
                type="button"
                onClick={handleUnlock}
                disabled={unlockLoading || (!stored && !score)}
                className="mb-1.5 w-full rounded-full py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: PAYWALL_GOLD_BG,
                  boxShadow: `0 0 30px rgba(${PAYWALL_GOLD_RGB},0.4)`,
                }}
              >
                {unlockLoading ? "Redirecting to payment…" : "Unlock Full Report — £2.49"}
              </button>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">
                  ONE-TIME PAYMENT · NO SUBSCRIPTION
                </span>
              </div>
            </div>
          </section>
        )}
        </>
        )}

      </div>

      {/* Sticky bottom bar — hidden when report unlocked */}
      {!isUnlocked && (
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-yellow-500/20 bg-[#111111]">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-white font-medium">
            Unlock Full Report £2.49
          </span>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlockLoading || (!stored && !score)}
            className="rounded-full text-sm font-semibold py-2.5 px-6 text-white disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: PAYWALL_GOLD_BG,
              boxShadow: `0 0 20px rgba(${PAYWALL_GOLD_RGB},0.4)`,
            }}
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
