import Link from "next/link";
import * as SimpleIcons from "simple-icons";
import MagneticButton from "@/components/MagneticButton";
import PortfolioCounter from "@/components/PortfolioCounter";
import PortfolioRankDistributionSection from "@/components/PortfolioRankDistributionSection";
import { getTotalAnalyses } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/** Primary gold (less saturated) — homepage-only styling */
const PRIMARY_GOLD = "#d4840a";
const PRIMARY_GOLD_RGB = "212, 132, 10";
const ACCENT_GOLD = PRIMARY_GOLD;

const CAROUSEL_SLUGS = [
  "apple",
  "microsoft",
  "amazon",
  "nvidia",
  "google",
  "tesla",
  "meta",
  "netflix",
  "amd",
  "samsung",
  "spotify",
  "adobe",
  "paypal",
  "uber",
  "airbnb",
] as const;

function getIcon(slug: string): { path: string; title: string; slug: string; hex: string } | null {
  const key = "si" + slug.charAt(0).toUpperCase() + slug.slice(1).replace(/\s/g, "");
  const icon = (SimpleIcons as Record<string, { path: string; title: string; slug: string; hex: string } | undefined>)[key];
  return icon ?? null;
}

const CAROUSEL_ICONS = CAROUSEL_SLUGS.map((s) => getIcon(s)).filter(Boolean) as {
  path: string;
  title: string;
  slug: string;
  hex: string;
}[];

export default async function Home() {
  const portfolioCount = await getTotalAnalyses();

  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
          `,
        }}
      />

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
          <a
            href="/analyze"
            className="inline-block rounded-full font-semibold text-[#0a0a0a] px-2.5 py-1 text-[11px] leading-tight sm:px-3 sm:py-1.5 sm:text-xs"
            style={{
              backgroundColor: PRIMARY_GOLD,
              boxShadow: `0 0 10px rgba(${PRIMARY_GOLD_RGB}, 0.16)`,
            }}
          >
            Analyse My Portfolio →
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        {/* Section 1 — Hero */}
        <section className="pb-7 text-center md:pb-9">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-black text-center leading-tight tracking-tight">
              <span className="text-white">How Strong Is Your</span>
              <br />
              <span className="whitespace-nowrap text-[#d4840a]">
                Investment Portfolio?
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-slate-200 text-center font-medium">
              Developed in the UK · Privacy First
            </p>

            {/* 3 step cards */}
            <div className="mt-6 grid gap-1.5 sm:mt-8 sm:grid-cols-3 sm:gap-3">
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-2 text-left sm:p-3">
                <div className="text-xl">📋</div>
                <h3 className="font-heading mt-1.5 font-semibold text-white text-sm sm:mt-2 sm:text-base">
                  Enter Portfolio
                </h3>
                <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                  Add your holdings and weights in seconds
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-2 text-left sm:p-3">
                <div className="text-xl">⚡</div>
                <h3 className="font-heading mt-1.5 font-semibold text-white text-sm sm:mt-2 sm:text-base">
                  AI Analysis
                </h3>
                <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                  Our engine scores diversification, risk & more
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-2 text-left sm:p-3">
                <div className="text-xl">📊</div>
                <h3 className="font-heading mt-1.5 font-semibold text-white text-sm sm:mt-2 sm:text-base">
                  Your Score
                </h3>
                <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                  Get an accurate, free and personalised score in 10 seconds
                </p>
              </div>
            </div>

            <div className="mt-12 md:mt-16">
              <MagneticButton href="/analyze">
                Analyse My Portfolio →
              </MagneticButton>
              <div className="mt-[42px] mb-5 flex flex-wrap justify-center gap-2 md:mb-7">
                <span className="inline-flex items-center rounded-full border border-yellow-500/25 bg-[#1a1a1a] px-3 py-1.5 text-xs sm:text-sm text-slate-200">
                  ⚡ Instant Results
                </span>
                <span className="inline-flex items-center rounded-full border border-yellow-500/25 bg-[#1a1a1a] px-3 py-1.5 text-xs sm:text-sm text-slate-200">
                  🔒 No signup required
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 mt-4 px-4 md:mb-8 md:mt-6">
          <PortfolioCounter targetCount={portfolioCount} />
        </div>

        {/* Section 2 — Logo carousel */}
        <section className="pb-12 pt-2 md:pb-14">
          <h2 className="font-heading mb-8 text-center text-xl font-semibold text-white sm:text-2xl">
            Works with any portfolio of stocks or ETFs
          </h2>
          <div
            className="relative overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div className="flex w-max gap-12 items-center animate-scroll">
              {CAROUSEL_ICONS.length > 0 && (
                <>
                  {CAROUSEL_ICONS.map((si, i) => {
                    const fill = si.hex === "000000" ? "ffffff" : si.hex;
                    return (
                    <svg
                      key={`1-${si.slug}-${i}`}
                      role="img"
                      viewBox="0 0 24 24"
                      className="w-12 h-12 opacity-80 hover:opacity-100 transition-opacity shrink-0"
                      style={{ fill: `#${fill}` }}
                      aria-label={si.title}
                    >
                      <path d={si.path} />
                    </svg>
                    );
                  })}
                  {CAROUSEL_ICONS.map((si, i) => {
                    const fill = si.hex === "000000" ? "ffffff" : si.hex;
                    return (
                    <svg
                      key={`2-${si.slug}-${i}`}
                      role="img"
                      viewBox="0 0 24 24"
                      className="w-12 h-12 opacity-80 hover:opacity-100 transition-opacity shrink-0"
                      style={{ fill: `#${fill}` }}
                      aria-label={si.title}
                    >
                      <path d={si.path} />
                    </svg>
                    );
                  })}
                </>
              )}
            </div>
            </div>
        </section>

        {/* Section 3 — Stat cards */}
        <section className="bg-transparent pb-10 pt-10 md:pb-12 md:pt-12">
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6 shadow-[0_2px_12px_rgba(212,132,10,0.15)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(212,132,10,0.28)]">
            <h2 className="font-heading mb-8 text-center text-2xl font-semibold text-white">
              Most Portfolios Have Hidden Problems
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-8">
              <div className="relative rounded-2xl border border-yellow-500/20 bg-[#111111] p-3 text-center md:p-8">
                <div
                  className="text-4xl font-black md:text-5xl"
                  style={{ color: ACCENT_GOLD }}
                >
                  72%
                </div>
                <p className="mt-2 text-xs leading-snug text-slate-400 md:text-sm">
                  Often too concentrated in one sector
                </p>
              </div>
              <div className="relative rounded-2xl border border-yellow-500/20 bg-[#111111] p-3 text-center md:p-8">
                <div
                  className="font-heading text-4xl font-black md:text-5xl"
                  style={{ color: ACCENT_GOLD }}
                >
                  &lt;5
                </div>
                <p className="mt-2 text-xs leading-snug text-slate-400 md:text-sm">
                  Typical retail portfolio size
                </p>
              </div>
              <div className="col-span-2 flex justify-center md:col-span-1 md:block">
                <div className="w-[calc((100%-0.75rem)/2)] md:w-full">
                  <div className="relative rounded-2xl border border-yellow-500/20 bg-[#111111] p-3 text-center md:p-8">
                    <div
                      className="font-heading text-4xl font-black md:text-5xl"
                      style={{ color: ACCENT_GOLD }}
                    >
                      2.3×
                    </div>
                    <p className="mt-2 text-xs leading-snug text-slate-400 md:text-sm">
                      Drawdown risk when undiversified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PortfolioRankDistributionSection />

        {/* Section 5 — How scoring works */}
        <section className="bg-transparent py-12 md:py-14">
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6 shadow-[0_2px_12px_rgba(212,132,10,0.15)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(212,132,10,0.28)]">
            <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4840a]/50 to-transparent" />
            <h2 className="font-heading mb-10 text-center text-2xl font-semibold text-white">
              How Your Portfolio Score Is Calculated
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {[
                {
                  name: "Diversification",
                  desc: "Spread across sectors and number of holdings",
                  icon: "📊",
                },
                {
                  name: "Concentration Risk",
                  desc: "How much weight sits in your top holdings",
                  icon: "🎯",
                },
                {
                  name: "Growth Quality",
                  desc: "Sector mix and earnings quality",
                  icon: "📈",
                },
                {
                  name: "Valuation Risk",
                  desc: "Tech concentration and valuation exposure",
                  icon: "⚖️",
                },
                {
                  name: "Drawdown Exposure",
                  desc: "Weighted beta and volatility alignment",
                  icon: "🌊",
                },
                {
                  name: "Market Comparison",
                  desc: "Exposure to broad market vs niche assets",
                  icon: "📉",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="relative flex gap-3 overflow-hidden rounded-xl border border-yellow-500/20 bg-[#111111] px-3 py-2.5 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-3"
                >
                  <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4840a]/50 to-transparent" />
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg sm:h-12 sm:w-12 sm:text-2xl">
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — Free score */}
        <section className="pb-10 pt-10 text-center md:pb-12 md:pt-12">
          <h2 className="font-heading text-2xl font-semibold text-white">
            Start With a{" "}
            <span style={{ color: ACCENT_GOLD }}>Free</span> Portfolio Score
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-8 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6 text-left shadow-[0_2px_12px_rgba(212,132,10,0.15)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(212,132,10,0.28)]">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4840a]/50 to-transparent" />
                <h3 className="font-heading text-lg font-semibold text-white">Free</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Portfolio score 0–10
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> AI summary
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Optimization potential
                  </li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6 text-left shadow-[0_2px_12px_rgba(212,132,10,0.15)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(212,132,10,0.28)]">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4840a]/50 to-transparent" />
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-semibold text-[#d4840a]">Premium</h3>
                  <span className="rounded-full bg-[#d4840a] px-2 py-0.5 text-xs font-semibold text-white">£2.49</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <span>🔒</span> Full metric breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🔒</span> 3 strengths & 3 weaknesses
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🔒</span> Step-by-step action plan
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🔒</span> Optimised portfolio blueprint
                  </li>
                </ul>
              </div>
            </div>
          <MagneticButton href="/analyze" className="mt-8 flex justify-center">
            Get Your Free Score →
          </MagneticButton>
        </section>

        <div className="flex justify-center items-center pt-8 pb-6 md:pt-10 md:pb-8">
          <img
            src="/brand/bull-mascot.png"
            alt="Rankfolio Bull"
            className="w-56 md:w-64 drop-shadow-2xl"
          />
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <span className="font-semibold text-[#d4840a]">Rankfolio™</span>
            <nav
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-slate-300"
              aria-label="Footer"
            >
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
              <span className="text-slate-600" aria-hidden>
                ·
              </span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-600" aria-hidden>
                ·
              </span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="text-slate-600" aria-hidden>
                ·
              </span>
              <a
                href="mailto:hello@rankfolio.app"
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
          <p className="mt-8 text-center text-xs text-slate-500">
            © 2026 Rankfolio™. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
