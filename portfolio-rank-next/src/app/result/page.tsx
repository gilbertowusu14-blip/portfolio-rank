"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "portfolio-rank-form";

interface StoredForm {
  holdings: { ticker: string; weight: number }[];
  riskTolerance: string;
  timeHorizon: string;
}

const PLACEHOLDER_SUBSCORES = [
  { name: "Diversification", value: 80 },
  { name: "Concentration Risk", value: 60 },
  { name: "Growth Quality", value: 70 },
];

function ResultPage() {
  const [data, setData] = useState<StoredForm | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as StoredForm);
    } catch {
      setData(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/analyze"
          className="text-sm text-zinc-400 hover:text-zinc-200 mb-6 inline-block"
        >
          ← Back to analyse
        </Link>

        <h1 className="text-2xl font-bold mb-2">Your score</h1>
        {data && (
          <p className="text-zinc-400 text-sm mb-8">
            {data.holdings?.length ? `${data.holdings.length} holding(s)` : ""}
            {data.riskTolerance && ` · ${data.riskTolerance}`}
            {data.timeHorizon && ` · ${data.timeHorizon}`}
          </p>
        )}

        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8 text-center mb-8">
          <div className="text-5xl font-bold text-zinc-50 mb-1">72</div>
          <div className="text-lg font-medium text-zinc-300">Strong</div>
        </div>

        <div className="space-y-4 mb-10">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Subscores
          </h2>
          {PLACEHOLDER_SUBSCORES.map(({ name, value }) => (
            <div
              key={name}
              className="flex justify-between items-center rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3"
            >
              <span className="text-zinc-300">{name}</span>
              <span className="font-semibold text-zinc-50">{value}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="w-full rounded-lg bg-zinc-50 text-zinc-950 font-semibold py-3.5 hover:bg-zinc-200 transition-colors"
        >
          Get Full Report
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
