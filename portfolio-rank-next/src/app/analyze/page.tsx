"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
/** Site-wide CTA gold — matches MagneticButton / homepage */
const SUBMIT_GOLD_BG = "#d4840a";
const SUBMIT_GOLD_SHADOW_RGB = "212, 132, 10";

const RISK_OPTIONS = ["Conservative", "Balanced", "Aggressive"] as const;
const HORIZON_OPTIONS = ["<1yr", "1–3yr", "3–7yr", "7yr+"] as const;

type RiskTolerance = (typeof RISK_OPTIONS)[number];
type TimeHorizon = (typeof HORIZON_OPTIONS)[number];

interface HoldingRow {
  ticker: string;
  weight: number;
}

const STORAGE_KEY = "portfolio-rank-form";

type FMPResultItem =
  | { symbol: string; type: "stock" | "etf"; [key: string]: unknown }
  | { symbol: string; error: true };

function AnalyzePage() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<HoldingRow[]>([
    { ticker: "", weight: 0 },
  ]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("Balanced");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("3–7yr");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [tickerErrors, setTickerErrors] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const totalWeight = holdings.reduce((sum, h) => sum + (Number.isNaN(h.weight) ? 0 : h.weight), 0);
  const canAddRow = holdings.length < 10;

  const totalWeightColor =
    Math.abs(totalWeight - 100) < 0.01
      ? "text-amber-400"
      : "text-white";

  function addHolding() {
    if (!canAddRow) return;
    setHoldings((prev) => [...prev, { ticker: "", weight: 0 }]);
    setWeightError(null);
  }

  function updateHolding(index: number, field: keyof HoldingRow, value: string | number) {
    setHoldings((prev) =>
      prev.map((h, i) =>
        i === index ? { ...h, [field]: field === "ticker" ? value : Number(value) } : h
      )
    );
    setWeightError(null);
    setTickerErrors([]);
  }

  function removeHolding(index: number) {
    if (holdings.length <= 1) return;
    setHoldings((prev) => prev.filter((_, i) => i !== index));
    setWeightError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWeightError(null);
    setTickerErrors([]);
    if (Math.abs(totalWeight - 100) > 0.01) {
      setWeightError("Weights must sum to 100%");
      return;
    }
    const filtered = holdings.filter((h) => h.ticker.trim() !== "");
    if (filtered.length === 0) return;

    const tickers = [...new Set(filtered.map((h) => h.ticker.trim().toUpperCase()))];
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/fmp?tickers=${encodeURIComponent(tickers.join(","))}`);
      const data = (await res.json()) as FMPResultItem[];
      const failed = data.filter(
        (item): item is { symbol: string; error: true } =>
          "error" in item &&
          (item as { error: unknown }).error === true
      ).map((item) => item.symbol);
      if (failed.length > 0) {
        setTickerErrors(failed);
        return;
      }
      const typeByTicker: Record<string, "stock" | "etf"> = {};
      data.forEach((item) => {
        if (!("error" in item) && item.type) typeByTicker[item.symbol] = item.type;
      });
      const payload = {
        holdings: filtered.map((h) => ({
          ticker: h.ticker.trim(),
          weight: h.weight,
          type: typeByTicker[h.ticker.trim().toUpperCase()] ?? "stock",
        })),
        riskTolerance,
        timeHorizon,
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
      router.push("/result");
    } finally {
      setSubmitLoading(false);
    }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = submitBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.05)`;
    btn.style.boxShadow = `0 0 30px rgba(${SUBMIT_GOLD_SHADOW_RGB},0.6), 0 8px 25px rgba(${SUBMIT_GOLD_SHADOW_RGB},0.3)`;
  };
  const onMouseLeave = () => {
    const btn = submitBtnRef.current;
    if (!btn) return;
    btn.style.transform = "translate(0px, 0px) scale(1)";
    btn.style.boxShadow = `0 0 30px rgba(${SUBMIT_GOLD_SHADOW_RGB},0.4)`;
    btn.style.transition = "transform 400ms ease-out, box-shadow 400ms ease-out";
  };
  const onMouseEnter = () => {
    const btn = submitBtnRef.current;
    if (!btn) return;
    btn.style.transition = "transform 100ms ease-out, box-shadow 100ms ease-out";
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0a]/70 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/brand/bull-head.png" alt="Rankfolio" className="h-16 w-auto" />
            <span className="font-bold text-lg">
              <span className="text-white">Rank</span>
              <span className="text-yellow-400">folio</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 pt-16 pb-12">
        <Link
          href="/"
          className="text-slate-400 hover:text-yellow-400 transition-colors mb-6 inline-block"
        >
          ← Back
        </Link>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">
          Analyse Your Portfolio
        </h1>
        <p className="text-slate-400 mb-8">
          Enter your holdings and get an instant AI-powered score
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Holdings card */}
          <div className="bg-[#111111] border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-white">Holdings</label>
              <span className={`text-base font-medium ${totalWeightColor}`}>
                Total: {totalWeight.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-3">
              {holdings.map((h, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Ticker"
                    value={h.ticker}
                    onChange={(e) => updateHolding(i, "ticker", e.target.value.toUpperCase())}
                    className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-500 px-4 py-3 focus:border-yellow-500/50 focus:outline-none"
                    maxLength={10}
                  />
                  <input
                    type="number"
                    placeholder="%"
                    min={0}
                    max={100}
                    step={0.1}
                    value={h.weight || ""}
                    onChange={(e) =>
                      updateHolding(i, "weight", e.target.value === "" ? 0 : parseFloat(e.target.value))
                    }
                    className="w-24 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-500 px-4 py-3 focus:border-yellow-500/50 focus:outline-none"
                  />
                  {holdings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHolding(i)}
                      className="text-slate-500 hover:text-red-400 text-sm px-2 transition-colors"
                      aria-label="Remove holding"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            {canAddRow && (
              <button
                type="button"
                onClick={addHolding}
                className="mt-3 border border-yellow-500/30 text-yellow-400 rounded-xl py-2 px-4 hover:bg-yellow-500/10 transition-all w-full"
              >
                Add Holding
              </button>
            )}
            {weightError && (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {weightError}
              </p>
            )}
            {tickerErrors.length > 0 && (
              <div className="mt-3 space-y-1" role="alert">
                {tickerErrors.map((t) => (
                  <p key={t} className="text-sm text-red-400">
                    Ticker {t} not found — please check and try again
                  </p>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Rough estimates are fine — weights should add up to 100%
            </p>
          </div>

          {/* Risk tolerance card */}
          <div className="bg-[#111111] border border-yellow-500/20 rounded-2xl p-6">
            <label className="block text-sm font-medium text-white mb-3">
              Risk tolerance
            </label>
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value as RiskTolerance)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl text-white py-3 px-4 focus:border-yellow-500/50 focus:outline-none"
            >
              {RISK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Time horizon card */}
          <div className="bg-[#111111] border border-yellow-500/20 rounded-2xl p-6">
            <label className="block text-sm font-medium text-white mb-3">
              Time horizon
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl text-white py-3 px-4 focus:border-yellow-500/50 focus:outline-none"
            >
              {HORIZON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <button
            ref={submitBtnRef}
            type="submit"
            disabled={submitLoading}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            className="w-full rounded-full font-semibold py-4 text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: SUBMIT_GOLD_BG,
              boxShadow: `0 0 30px rgba(${SUBMIT_GOLD_SHADOW_RGB},0.4)`,
            }}
          >
            {submitLoading ? "Checking tickers…" : "Get My Portfolio Score"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AnalyzePage;
