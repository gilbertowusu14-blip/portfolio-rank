import Link from "next/link";
import * as SimpleIcons from "simple-icons";
import MagneticButton from "@/components/MagneticButton";

const ACCENT_GOLD = "#f59e0b";

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

export default function Home() {
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
              <span className="text-yellow-400">folio™</span>
            </span>
          </Link>
          <a
            href="/analyze"
            className="inline-block rounded-full font-bold text-[#0a0a0a] bg-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.5)] text-sm px-3 py-2 md:text-base md:px-6 md:py-3"
          >
            Analyse My Portfolio →
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Section 1 — Hero */}
        <section className="pb-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-black text-center leading-tight tracking-tight">
              <span className="text-white">How Strong Is Your</span>
              <br />
              <span className="text-yellow-400 whitespace-nowrap">
                Investment Portfolio?
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-slate-200 text-center font-medium">
              Developed in the UK · Privacy First
            </p>

            {/* 3 step cards */}
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6 text-left">
                <div className="text-2xl">📋</div>
                <h3 className="font-heading mt-2 font-semibold text-white">Enter Portfolio</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Add your holdings and weights in seconds
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6 text-left">
                <div className="text-2xl">⚡</div>
                <h3 className="font-heading mt-2 font-semibold text-white">AI Analysis</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Our engine scores diversification, risk & more
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6 text-left">
                <div className="text-2xl">📊</div>
                <h3 className="font-heading mt-2 font-semibold text-white">Your Score</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Get an accurate, free and personalised score in 10 seconds
                </p>
              </div>
            </div>

            <div className="mt-16">
              <MagneticButton href="/analyze">
                Analyse My Portfolio →
              </MagneticButton>
              <div className="mt-[42px] flex flex-wrap justify-center gap-2">
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

        <div className="flex justify-center items-center py-0 mb-2">
          <img
            src="/brand/bull-mascot.png"
            alt="Rankfolio Bull"
            className="w-56 md:w-64 drop-shadow-2xl"
          />
        </div>

        {/* Section 2 — Logo carousel */}
        <section className="pb-24">
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
        <section className="pt-8 pb-16 bg-transparent">
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6">
            <h2 className="font-heading mb-8 text-center text-2xl font-semibold text-white">
              Most Portfolios Have Hidden Problems
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="relative rounded-2xl border border-yellow-500/20 bg-[#111111] p-8 text-center">
                <div
                  className="text-5xl font-black"
                  style={{ color: ACCENT_GOLD }}
                >
                  72%
                </div>
                <p className="mt-2 text-slate-400">Overconcentrated in sector</p>
                <p className="mt-1 text-sm text-slate-500">
                  Retail investors are overconcentrated in a single sector
                </p>
              </div>
              <div className="relative rounded-2xl border border-yellow-500/20 bg-[#111111] p-8 text-center">
                <div
                  className="font-heading text-5xl font-black"
                  style={{ color: ACCENT_GOLD }}
                >
                  &lt;5
                </div>
                <p className="mt-2 text-slate-400">Average stocks held</p>
                <p className="mt-1 text-sm text-slate-500">
                  Average number of stocks held by retail investors
                </p>
              </div>
              <div className="relative rounded-2xl border border-yellow-500/20 bg-[#111111] p-8 text-center">
                <div
                  className="font-heading text-5xl font-black"
                  style={{ color: ACCENT_GOLD }}
                >
                  2.3×
                </div>
                <p className="mt-2 text-slate-400">Higher drawdown risk</p>
                <p className="mt-1 text-sm text-slate-500">
                  Higher drawdown risk in undiversified portfolios
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — How scoring works */}
        <section className="py-24 bg-transparent">
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6">
            <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            <h2 className="font-heading mb-10 text-center text-2xl font-semibold text-white">
              How Your Portfolio Score Is Calculated
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="relative flex gap-4 overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6"
                >
                  <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl">
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
        <section className="pt-8 pb-16 text-center">
          <h2 className="font-heading text-2xl font-semibold text-white">
            Start With a{" "}
            <span style={{ color: ACCENT_GOLD }}>Free</span> Portfolio Score
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-8 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl bg-[#111111] border border-yellow-500/20 p-6 text-left">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
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
              <div className="relative overflow-hidden rounded-2xl bg-[#111111] border border-yellow-500/20 p-6 text-left">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-semibold text-yellow-400">Premium</h3>
                  <span className="rounded-full bg-yellow-600 px-2 py-0.5 text-xs font-semibold text-white">£2.49</span>
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

        {/* Footer CTA */}
        <section className="py-24 mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#111111] p-6 text-center">
            <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            <h2 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
              Your Portfolio Might Be Riskier Than You Think
            </h2>
            <p className="mt-3 text-slate-400">
              Find out in 30 seconds. No signup required.
            </p>
            <MagneticButton href="/analyze" className="mt-6">
              Analyse My Portfolio →
            </MagneticButton>
          </div>
        </section>
      </main>
    </div>
  );
}
