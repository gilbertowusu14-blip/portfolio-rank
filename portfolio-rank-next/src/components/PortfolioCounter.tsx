"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 1500;

/** Counts up from (target - 50) to target on mount over 1.5s. */
export default function PortfolioCounter({ targetCount }: { targetCount: number }) {
  const from = Math.max(0, targetCount - 50);
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const start = Math.max(0, targetCount - 50);
    const end = targetCount;
    const t0 = performance.now();
    let raf = 0;
    let cancelled = false;

    function frame(now: number) {
      if (cancelled) return;
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / DURATION_MS);
      const eased = 1 - (1 - t) * (1 - t);
      const value = Math.round(start + (end - start) * eased);
      setDisplay(value);
      if (t < 1) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [targetCount]);

  return (
    <p className="text-center text-base text-white">
      👥 {display.toLocaleString("en-GB")} portfolios analysed
    </p>
  );
}
