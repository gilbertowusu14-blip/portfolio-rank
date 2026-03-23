"use client";

import { useEffect, useMemo, useState } from "react";
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

/** 19 bins at 0.5 steps; x-axis shows only whole numbers 1–10 (half-step labels hidden). */
const LABELS = Array.from({ length: 19 }, (_, i) => {
  const v = 1 + i * 0.5;
  return Number.isInteger(v) ? String(v) : "";
});

/**
 * Single peak at 5.5 (~340); 5.0 and 6.0 slightly lower (~310) — Gaussian μ=5.5, σ≈1.16
 * so exp(-0.5²/(2σ²)) ≈ 310/340.
 */
const COUNTS = Array.from({ length: 19 }, (_, i) => {
  const x = 1 + i * 0.5;
  const mu = 5.5;
  const sigma = 1.16;
  const raw = Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
  return Math.max(4, Math.round(340 * raw));
});

const GRID = "rgba(255, 255, 255, 0.05)";

export default function PortfolioRankDistributionSection() {
  const [narrowViewport, setNarrowViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setNarrowViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
          borderRadius: 4,
          borderSkipped: false,
          order: 2,
        },
        {
          type: "line" as const,
          label: "Distribution curve",
          data: COUNTS,
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.06)",
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
      maintainAspectRatio: true,
      interaction: { mode: "index" as const, intersect: false },
      layout: {
        padding: { top: 4, right: 8, bottom: 4, left: 8 },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(15, 15, 15, 0.95)",
          titleColor: "#f1f5f9",
          bodyColor: "#cbd5e1",
          borderColor: "rgba(245, 158, 11, 0.35)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (items: { dataIndex: number }[]) => {
              const idx = items[0]?.dataIndex ?? 0;
              const score = 1 + idx * 0.5;
              return `Score ${score.toFixed(1)}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Portfolio Score",
            color: "#a1a1aa",
            font: {
              size: narrowViewport ? 11 : 13,
              weight: 500,
            },
            padding: { top: narrowViewport ? 8 : 12 },
          },
          ticks: {
            color: "#94a3b8",
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            font: { size: narrowViewport ? 7 : 10 },
          },
          grid: {
            color: GRID,
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
          grid: { color: GRID },
        },
      },
    }),
    [narrowViewport]
  );

  return (
    <section className="bg-transparent py-10 md:py-12">
      <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#0d0d0d] px-6 pb-2 pt-6 shadow-[0_2px_12px_rgba(212,132,10,0.15)] md:px-8 md:pb-2 md:pt-8">
        <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
        <h2 className="font-heading mb-8 text-center text-2xl font-semibold text-white md:text-3xl">
          Where Do Most Portfolios Rank?
        </h2>

        <div className="relative mx-auto h-56 w-full max-w-4xl md:h-72">
          <div className="relative h-full w-full">
            <ReactChart type="bar" data={data as never} options={options} />
          </div>
        </div>
      </div>
    </section>
  );
}
