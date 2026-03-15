"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { StoredReport } from "@/lib/report-store";

const SUBSCORE_KEYS = [
  "diversification",
  "concentrationRisk",
  "growthQuality",
  "valuationRisk",
  "drawdownExposure",
  "marketComparison",
] as const;

const SUBSCORE_LABELS: Record<(typeof SUBSCORE_KEYS)[number], string> = {
  diversification: "Diversification",
  concentrationRisk: "Concentration Risk",
  growthQuality: "Growth Quality",
  valuationRisk: "Valuation Risk",
  drawdownExposure: "Drawdown Exposure",
  marketComparison: "Market Comparison",
};

const SUBSCORE_DESCRIPTIONS: Record<(typeof SUBSCORE_KEYS)[number], string> = {
  diversification: "Spread across sectors and number of holdings",
  concentrationRisk: "How much weight sits in your top holdings",
  growthQuality: "Sector mix and earnings quality",
  valuationRisk: "Tech concentration and valuation exposure",
  drawdownExposure: "Weighted beta and volatility alignment",
  marketComparison: "Exposure to broad market vs niche assets",
};

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

const BLUEPRINT_SECTION_HEADINGS = [
  "1. Diagnosis —",
  "2. Risk-Adjusted Reality —",
  "3. What an Optimised Version Looks Like —",
  "4. Reallocation Logic —",
  "5. Crash Resilience —",
  "6. Path Forward —",
] as const;

function parseBlueprintSections(blueprint: string): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = [];
  let remaining = blueprint.trim();
  for (let i = 0; i < BLUEPRINT_SECTION_HEADINGS.length; i++) {
    const heading = BLUEPRINT_SECTION_HEADINGS[i];
    const nextHeading = BLUEPRINT_SECTION_HEADINGS[i + 1];
    const startIdx = remaining.indexOf(heading);
    if (startIdx === -1) {
      if (remaining.trim()) sections.push({ title: heading, body: remaining.trim() });
      break;
    }
    const bodyStart = startIdx + heading.length;
    const bodyEnd = nextHeading
      ? remaining.indexOf(nextHeading, bodyStart)
      : remaining.length;
    const body = remaining.slice(bodyStart, bodyEnd).trim();
    sections.push({ title: heading.replace(/\s*—\s*$/, ""), body });
    remaining = nextHeading ? remaining.slice(bodyEnd) : "";
  }
  return sections;
}

function BlueprintCard({ blueprint }: { blueprint: string }) {
  const sections = parseBlueprintSections(blueprint);
  return (
    <section className="rounded-2xl bg-[#0d0d0d] border border-yellow-500/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🗺</span>
        <h2 className="font-heading text-sm font-semibold text-yellow-400 uppercase tracking-normal">
          Blueprint
        </h2>
      </div>
      <div className="space-y-4">
        {sections.map(({ title, body }, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-[#111111] border border-yellow-500/20 p-4"
          >
            <h3 className="font-heading text-sm font-semibold text-amber-400 mb-2">
              {title}
            </h3>
            <p className="text-white text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
      {sections.length === 0 && (
        <p className="text-slate-300 leading-relaxed">{blueprint}</p>
      )}
    </section>
  );
}

export default function PremiumPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const analysisId = searchParams.get("analysis_id");
  const [report, setReport] = useState<StoredReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId?.trim() && !analysisId?.trim()) {
      setError("Missing session. Please complete payment from the result page.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams();
    if (sessionId?.trim()) params.set("session_id", sessionId.trim());
    if (analysisId?.trim()) params.set("analysis_id", analysisId.trim());
    (async () => {
      try {
        const url = `/api/premium-report?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        console.log("[Premium] analysis_id from URL:", analysisId ?? null);
        console.log("[Premium] session_id from URL:", sessionId ?? null);
        console.log("[Premium] API response status:", res.status);
        console.log("[Premium] API response body:", data?.error ? { error: data.error, debug: data.debug } : "report received");
        if (!res.ok) {
          setError(data.error ?? "Could not load report.");
          setLoading(false);
          return;
        }
        setReport(data as StoredReport);
      } catch (e) {
        if (!cancelled) setError("Failed to load report.");
        console.error("[Premium] fetch error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, analysisId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-slate-400">Loading your report…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-amber-400">{error ?? "Report not found."}</p>
        <Link href="/result" className="text-yellow-400 hover:underline">
          ← Back to result
        </Link>
      </div>
    );
  }

  const { score, ai } = report;
  const displayScore = Number((score.score / 10).toFixed(1));
  const targetScore = Math.min(100, score.score + score.optimizationGap);
  const displayTarget = Number((targetScore / 10).toFixed(1));
  const displayGap = Number((score.optimizationGap / 10).toFixed(1));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
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

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/result" className="text-slate-400 hover:text-yellow-400 transition-colors">
            ← Back to result
          </Link>
        </div>

        <h1 className="font-heading text-2xl font-bold text-white">
          Your Full Report
        </h1>

        {/* Score Summary card */}
        <section className="rounded-2xl bg-[#111111] border border-yellow-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📊</span>
            <h2 className="font-heading text-sm font-semibold text-yellow-400 uppercase tracking-normal">
              Score Summary
            </h2>
          </div>
          <div className="text-center">
            <div className="font-heading text-5xl font-bold text-white">
              {displayScore} / 10
            </div>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full border text-sm font-medium ${labelColor(score.label)}`}>
              {score.label}
            </span>
            <p className="mt-3 text-slate-300 text-sm">
              {displayScore} → {displayTarget} possible
              {displayGap > 0 && (
                <span className="text-yellow-400 ml-1">(+{displayGap})</span>
              )}
            </p>
          </div>
        </section>

        {/* Full Metric Breakdown card */}
        <section className="rounded-2xl bg-[#111111] border border-yellow-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📈</span>
            <h2 className="font-heading text-sm font-semibold text-yellow-400 uppercase tracking-normal">
              Full Metric Breakdown
            </h2>
          </div>
          <div className="space-y-4">
            {SUBSCORE_KEYS.map((key) => {
              const value = score.subscores[key];
              const label = SUBSCORE_LABELS[key];
              const desc = SUBSCORE_DESCRIPTIONS[key];
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-medium">{label}</span>
                    <span className="text-slate-400">{value}/100</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#1a1a1a] overflow-hidden">
                    <div
                      className="h-full bg-[#f59e0b] rounded-full"
                      style={{ width: `${Math.min(value, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Strengths card */}
        <section className="rounded-2xl bg-[#111111] border border-emerald-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✓</span>
            <h2 className="font-heading text-sm font-semibold text-emerald-400 uppercase tracking-normal">
              Strengths
            </h2>
          </div>
          <ul className="space-y-2">
            {ai.strengths.map((item, idx) => (
              <li
                key={idx}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Weaknesses card */}
        <section className="rounded-2xl bg-[#111111] border border-amber-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚠</span>
            <h2 className="font-heading text-sm font-semibold text-amber-400 uppercase tracking-normal">
              Weaknesses
            </h2>
          </div>
          <ul className="space-y-2">
            {ai.weaknesses.map((item, idx) => (
              <li
                key={idx}
                className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Actions card */}
        <section className="rounded-2xl bg-[#111111] border border-yellow-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">→</span>
            <h2 className="font-heading text-sm font-semibold text-yellow-400 uppercase tracking-normal">
              Actions
            </h2>
          </div>
          <ol className="space-y-3">
            {ai.actions.map((item, idx) => (
              <li
                key={idx}
                className="flex gap-3 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="text-slate-200 text-sm">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Blueprint card */}
        <BlueprintCard blueprint={ai.blueprint} />
      </div>
    </div>
  );
}
