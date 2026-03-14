"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RISK_OPTIONS = ["Conservative", "Balanced", "Aggressive"] as const;
const HORIZON_OPTIONS = ["<1yr", "1–3yr", "3–7yr", "7yr+"] as const;

type RiskTolerance = (typeof RISK_OPTIONS)[number];
type TimeHorizon = (typeof HORIZON_OPTIONS)[number];

interface HoldingRow {
  ticker: string;
  weight: number;
}

const STORAGE_KEY = "portfolio-rank-form";

function AnalyzePage() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<HoldingRow[]>([
    { ticker: "", weight: 0 },
  ]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("Balanced");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("3–7yr");
  const [weightError, setWeightError] = useState<string | null>(null);

  const totalWeight = holdings.reduce((sum, h) => sum + (Number.isNaN(h.weight) ? 0 : h.weight), 0);
  const canAddRow = holdings.length < 10;

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
  }

  function removeHolding(index: number) {
    if (holdings.length <= 1) return;
    setHoldings((prev) => prev.filter((_, i) => i !== index));
    setWeightError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Math.abs(totalWeight - 100) > 0.01) {
      setWeightError("Weights must sum to 100%");
      return;
    }
    const payload = {
      holdings: holdings.filter((h) => h.ticker.trim() !== ""),
      riskTolerance,
      timeHorizon,
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    router.push("/result");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-zinc-200 mb-6 inline-block"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-2">Analyse portfolio</h1>
        <p className="text-zinc-400 mb-8">Enter your holdings and preferences.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-zinc-300">Holdings</label>
              <span className="text-xs text-zinc-500">
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
                    className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
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
                    className="w-20 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                  />
                  {holdings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHolding(i)}
                      className="text-zinc-500 hover:text-red-400 text-sm px-2"
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
                className="mt-2 text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-600 rounded-lg px-4 py-2 w-full"
              >
                Add Holding
              </button>
            )}
            {weightError && (
              <p className="mt-2 text-sm text-red-400" role="alert">
                {weightError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Risk tolerance
            </label>
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value as RiskTolerance)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-50 focus:border-zinc-500 focus:outline-none"
            >
              {RISK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Time horizon
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-50 focus:border-zinc-500 focus:outline-none"
            >
              {HORIZON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-50 text-zinc-950 font-semibold py-3.5 hover:bg-zinc-200 transition-colors"
          >
            Calculate Score
          </button>
        </form>
      </div>
    </div>
  );
}

export default AnalyzePage;
