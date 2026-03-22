"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1500;
const FLIP_MS = 160;

/** ~Half of digit tile size: tiles use text-2xl (1.5rem) / sm:text-3xl (1.875rem) */
const LABEL_SIZE = "text-[0.75rem] sm:text-[0.9375rem]";

function padToLength(formatted: string, len: number): string {
  return formatted.padStart(len, " ");
}

/** Single digit or comma in a scoreboard tile; digits flip on change. */
function ScoreChar({ char }: { char: string }) {
  const tileRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevRef.current === null) {
      prevRef.current = char;
      return;
    }
    if (char === prevRef.current) return;

    const el = tileRef.current;
    if (!el || !/\d/.test(char)) {
      prevRef.current = char;
      return;
    }

    prevRef.current = char;
    el.getAnimations?.().forEach((a) => a.cancel());
    el.animate(
      [
        { transform: "rotateX(0deg)", opacity: 1 },
        { transform: "rotateX(-85deg)", opacity: 0.2, offset: 0.42 },
        { transform: "rotateX(85deg)", opacity: 0.2, offset: 0.58 },
        { transform: "rotateX(0deg)", opacity: 1 },
      ],
      {
        duration: FLIP_MS,
        easing: "cubic-bezier(0.45, 0, 0.2, 1.15)",
        fill: "forwards",
      }
    );
  }, [char]);

  if (char === " ") {
    return <span className="inline-block w-2 shrink-0 sm:w-3" aria-hidden />;
  }

  if (char === ",") {
    return (
      <span
        className="mx-0.5 flex h-12 w-3 shrink-0 items-end justify-center pb-1 text-xl font-bold text-amber-500/90 sm:h-14 sm:text-2xl"
        aria-hidden
      >
        ,
      </span>
    );
  }

  return (
    <div
      ref={tileRef}
      className="scoreboard-digit relative inline-flex h-12 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border sm:h-14 sm:w-10"
      style={{
        background: "linear-gradient(180deg, #161616 0%, #0a0a0a 45%, #101010 100%)",
        borderColor: "rgba(245, 158, 11, 0.55)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 20px rgba(245, 158, 11, 0.14), 0 0 0 1px rgba(0,0,0,0.45)",
        backfaceVisibility: "hidden",
      }}
    >
      <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.85)] sm:text-3xl">
        {char}
      </span>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 border-b border-white/[0.07] bg-gradient-to-b from-white/[0.06] to-transparent"
        aria-hidden
      />
    </div>
  );
}

export default function PortfolioCounter({ targetCount }: { targetCount: number }) {
  const start = Math.max(0, targetCount - 50);
  const end = targetCount;
  const endStr = end.toLocaleString("en-GB");
  const startStr = start.toLocaleString("en-GB");
  const slotLen = Math.max(endStr.length, startStr.length);

  const rootRef = useRef<HTMLDivElement>(null);
  /** After the section has left the viewport at least once, re-entries may animate */
  const hasLeftViewport = useRef(false);
  const [playToken, setPlayToken] = useState(0);
  const [display, setDisplay] = useState(start);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (hasLeftViewport.current) {
            setDisplay(start);
            setPlayToken((t) => t + 1);
          } else {
            setDisplay(start);
          }
        } else {
          hasLeftViewport.current = true;
          setDisplay(start);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -5% 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [start]);

  useEffect(() => {
    if (playToken === 0) return;

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
  }, [playToken, start, end]);

  const line = padToLength(display.toLocaleString("en-GB"), slotLen);
  const chars = line.split("");

  return (
    <div ref={rootRef} className="flex flex-col items-center justify-center gap-4">
      <p className="sr-only">
        {display.toLocaleString("en-GB")} portfolios analysed
      </p>
      <div
        className="flex flex-wrap items-center justify-center gap-y-3"
        style={{ perspective: "720px" }}
        aria-hidden
      >
        <div
          key={playToken}
          className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1"
        >
          {chars.map((c, i) => (
            <ScoreChar key={`${playToken}-slot-${i}`} char={c} />
          ))}
        </div>
      </div>
      <p className={`text-center leading-tight text-slate-500 ${LABEL_SIZE}`}>
        portfolios analysed
      </p>
    </div>
  );
}
