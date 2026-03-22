"use client";

import { useMemo } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Chart as ReactChart } from "react-chartjs-2";

const ACCENT = "#f59e0b";

/** Explicit registration — required for Chart.js tree-shaking + Next.js client bundle */
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

/** Hardcoded distribution (normal-ish, peak ~5.5–6) */
const SCORE_COUNTS: Record<number, number> = {
  1: 20,
  2: 45,
  3: 120,
  4: 280,
  5: 420,
  6: 480,
  7: 350,
  8: 180,
  9: 80,
  10: 25,
};

const LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const COUNTS = LABELS.map((_, i) => SCORE_COUNTS[i + 1] ?? 0);

const AVG_SCORE = 5.8;
/** Linear position along 1–10 for overlay (matches category centres in a uniform axis). */
const AVG_LINE_LEFT_PCT = ((AVG_SCORE - 1) / (10 - 1)) * 100;

export default function PortfolioRankDistributionSection() {
  const data = useMemo(
    () => ({
      labels: LABELS,
      datasets: [
        {
          type: "bar" as const,
          label: "Portfolios",
          data: COUNTS,
          backgroundColor: COUNTS.map(() => "rgba(245, 158, 11, 0.78)"),
          borderColor: "rgba(251, 191, 36, 0.95)",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          order: 2,
        },
        {
          type: "line" as const,
          label: "Distribution curve",
          data: COUNTS,
          borderColor: "rgba(244, 114, 182, 0.95)",
          backgroundColor: "rgba(251, 191, 36, 0.12)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 4,
          order: 1,
        },
      ],
    }),
    []
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      layout: {
        padding: { top: 4, right: 8, bottom: 4, left: 8 },
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            color: "#94a3b8",
            font: { size: 12 },
            usePointStyle: true,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 15, 15, 0.95)",
          titleColor: "#f1f5f9",
          bodyColor: "#cbd5e1",
          borderColor: "rgba(245, 158, 11, 0.35)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (items: { label: string }[]) => `Score ${items[0]?.label ?? ""}`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Portfolio Score",
            color: "#a1a1aa",
            font: { size: 13, weight: 500 },
            padding: { top: 12 },
          },
          ticks: { color: "#94a3b8" },
          grid: {
            color: "rgba(255, 255, 255, 0.06)",
            drawTicks: true,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Portfolios",
            color: "#a1a1aa",
            font: { size: 13, weight: 500 },
            padding: { bottom: 8 },
          },
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255, 255, 255, 0.06)" },
        },
      },
    }),
    []
  );

  return (
    <section className="bg-transparent pb-20 pt-12 md:pb-28 md:pt-16">
      <div className="card-glow-amber relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#0d0d0d] p-6 md:p-8">
        <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
        <h2 className="font-heading mb-8 text-center text-2xl font-semibold text-white md:text-3xl">
          Where Do Most Portfolios Rank?
        </h2>

        <div className="relative mx-auto h-[min(360px,55vw)] w-full max-w-4xl">
          <div className="relative h-full w-full">
            <ReactChart type="bar" data={data as never} options={options} />
            {/* HTML/CSS average line — avoids chartjs-plugin-annotation SSR/runtime issues */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                padding: "4px 8px 4px 8px",
              }}
              aria-hidden
            >
              <div className="relative h-full w-full">
                <div
                  className="absolute bottom-[18%] top-[14%] w-0 border-l-2 border-dashed border-amber-400/95"
                  style={{
                    left: `${AVG_LINE_LEFT_PCT}%`,
                    transform: "translateX(-50%)",
                    boxShadow: "0 0 12px rgba(251, 191, 36, 0.35)",
                  }}
                />
                <div
                  className="absolute rounded-md border border-amber-500/40 bg-[#111111]/95 px-2 py-0.5 text-[11px] font-bold text-amber-400 shadow-md"
                  style={{
                    left: `${AVG_LINE_LEFT_PCT}%`,
                    top: "11%",
                    transform: "translateX(-50%)",
                  }}
                >
                  Avg: 5.8
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:flex-wrap sm:gap-6">
          <p className="font-heading text-2xl font-bold text-white md:text-3xl">
            Average Rankfolio Score:{" "}
            <span style={{ color: ACCENT }}>{AVG_SCORE.toFixed(1)}/10</span>
          </p>
          <span className="inline-flex items-center rounded-full border border-amber-500/50 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            Most Common Score
            <span className="ml-2 rounded-md bg-amber-500/25 px-2 py-0.5 text-amber-200">
              6
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
