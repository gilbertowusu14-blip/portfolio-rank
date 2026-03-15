import Link from "next/link";

const ACCENT_PURPLE = "#7c3aed";

export default function Home() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#0a0f1e" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pr-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .pr-scroll-animate {
              animation: pr-scroll 30s linear infinite;
            }
          `,
        }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0f1e]/70 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            <span className="text-white">Portfolio</span>
            <span style={{ color: ACCENT_PURPLE }}>Rank</span>
          </Link>
          <a
            href="/analyze"
            style={{
              display: "inline-block",
              padding: "16px 40px",
              fontSize: "18px",
              fontWeight: 700,
              borderRadius: "9999px",
              color: "white",
              background: "#7c3aed",
              boxShadow: "0 0 30px rgba(124,58,237,0.6)",
            }}
          >
            Analyse My Portfolio →
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Section 1 — Hero */}
        <section className="pb-12 text-center">
          <h1 className="text-6xl font-black leading-tight tracking-tight md:text-8xl">
            <span className="text-white">How Strong Is Your</span>
            <br />
            <span className="text-purple-400">
              Investment Portfolio?
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Get an instant AI-powered score for your portfolio and discover
            exactly where it&apos;s leaking performance.
          </p>

          {/* 3 step cards */}
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6 text-left">
              <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
              <div className="text-2xl">📋</div>
              <h3 className="mt-2 font-semibold text-white">Enter Portfolio</h3>
              <p className="mt-1 text-sm text-slate-400">
                Add your holdings and weights in seconds
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6 text-left">
              <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
              <div className="text-2xl">⚡</div>
              <h3 className="mt-2 font-semibold text-white">AI Analysis</h3>
              <p className="mt-1 text-sm text-slate-400">
                Our engine scores diversification, risk & more
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6 text-left">
              <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
              <div className="text-2xl">📊</div>
              <h3 className="mt-2 font-semibold text-white">Your Score</h3>
              <p className="mt-1 text-sm text-slate-400">
                See your grade and where to improve
              </p>
            </div>
          </div>

          <div className="mt-16">
            <a
              href="/analyze"
              style={{
                display: "inline-block",
                padding: "16px 40px",
                fontSize: "18px",
                fontWeight: 700,
                borderRadius: "9999px",
                color: "white",
                background: "#7c3aed",
                boxShadow: "0 0 30px rgba(124,58,237,0.6)",
              }}
            >
              Analyse My Portfolio →
            </a>
            <p className="mt-6 text-sm text-slate-400">
              ⚡ Instant Results • 🔒 No signup required • 📊 AI Powered
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Built on 6 professional portfolio risk metrics used by institutional investors
            </p>
          </div>
        </section>

        {/* Section 2 — Logo carousel */}
        <section className="py-24">
          <h2 className="mb-8 text-center text-xl font-semibold text-white sm:text-2xl">
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
            <div className="pr-scroll-animate flex w-max gap-12 whitespace-nowrap text-slate-400">
                <span className="text-2xl font-medium">Apple</span>
                <span className="text-2xl font-medium">Microsoft</span>
                <span className="text-2xl font-medium">Amazon</span>
                <span className="text-2xl font-medium">Nvidia</span>
                <span className="text-2xl font-medium">Google</span>
                <span className="text-2xl font-medium">Tesla</span>
                <span className="text-2xl font-medium">Meta</span>
                <span className="text-2xl font-medium">Netflix</span>
                <span className="text-2xl font-medium">Berkshire</span>
                <span className="text-2xl font-medium">TSMC</span>
                <span className="text-2xl font-medium">AMD</span>
                {/* Duplicate for seamless loop */}
                <span className="text-2xl font-medium">Apple</span>
                <span className="text-2xl font-medium">Microsoft</span>
                <span className="text-2xl font-medium">Amazon</span>
                <span className="text-2xl font-medium">Nvidia</span>
                <span className="text-2xl font-medium">Google</span>
                <span className="text-2xl font-medium">Tesla</span>
                <span className="text-2xl font-medium">Meta</span>
                <span className="text-2xl font-medium">Netflix</span>
                <span className="text-2xl font-medium">Berkshire</span>
                <span className="text-2xl font-medium">TSMC</span>
                <span className="text-2xl font-medium">AMD</span>
              </div>
            </div>
        </section>

        {/* Section 3 — Stat cards */}
        <section className="py-24 bg-transparent">
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6">
            <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
            <h2 className="mb-8 text-center text-2xl font-semibold text-white">
              Most Portfolios Have Hidden Problems
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6 text-center">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
                <div
                  className="text-5xl font-black"
                  style={{ color: ACCENT_PURPLE }}
                >
                  72%
                </div>
                <p className="mt-2 text-slate-400">overconcentrated in sector</p>
                <p className="mt-1 text-sm text-slate-500">
                  Retail investors are overconcentrated in a single sector
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6 text-center">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
                <div
                  className="text-5xl font-black"
                  style={{ color: ACCENT_PURPLE }}
                >
                  &lt;5
                </div>
                <p className="mt-2 text-slate-400">average stocks held</p>
                <p className="mt-1 text-sm text-slate-500">
                  Average number of stocks held by retail investors
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6 text-center">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
                <div
                  className="text-5xl font-black"
                  style={{ color: ACCENT_PURPLE }}
                >
                  2.3×
                </div>
                <p className="mt-2 text-slate-400">higher drawdown risk</p>
                <p className="mt-1 text-sm text-slate-500">
                  Higher drawdown risk in undiversified portfolios
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — Average score */}
        <section className="flex justify-center py-24 bg-white/[0.02]">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6 text-center">
            <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
            <h2 className="text-xl font-semibold text-white">
              Average PortfolioRank Score
            </h2>
            <div
              className="mt-4 text-5xl font-bold"
              style={{ color: ACCENT_PURPLE }}
            >
              6.3 / 10
            </div>
            <span
              className="mt-2 inline-block rounded-full px-4 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${ACCENT_PURPLE}30`, color: ACCENT_PURPLE }}
            >
              ● MOST COMMON SCORE
            </span>
            {/* Simple bell curve SVG */}
            <div className="mx-auto mt-8 h-32 w-full max-w-xs">
              <svg
                viewBox="0 0 200 80"
                className="w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M 0 60 Q 50 55 100 40 T 200 60"
                  fill="none"
                  stroke="rgba(124, 58, 237, 0.5)"
                  strokeWidth="2"
                />
                <path
                  d="M 0 60 Q 50 55 100 40 T 200 60 L 200 80 L 0 80 Z"
                  fill="rgba(124, 58, 237, 0.1)"
                />
                <circle cx="95" cy="42" r="4" fill={ACCENT_PURPLE} />
              </svg>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Weak — Average — Strong — Elite
            </p>
            <a
              href="/analyze"
              className="mt-4"
              style={{
                display: "inline-block",
                padding: "16px 40px",
                fontSize: "18px",
                fontWeight: 700,
                borderRadius: "9999px",
                color: "white",
                background: "#7c3aed",
                boxShadow: "0 0 30px rgba(124,58,237,0.6)",
              }}
            >
              What&apos;s your score? →
            </a>
          </div>
        </section>

        {/* Section 5 — How scoring works */}
        <section className="py-24 bg-transparent">
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6">
            <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
            <h2 className="mb-10 text-center text-2xl font-semibold text-white">
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
                  className="relative flex gap-4 overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6"
                >
                  <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-2xl">
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — Free score */}
        <section className="py-24 text-center bg-white/[0.02]">
          <h2 className="text-2xl font-semibold text-white">
            Start With a{" "}
            <span style={{ color: ACCENT_PURPLE }}>Free</span> Portfolio Score
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-8 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 text-left">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
                <h3 className="text-lg font-semibold text-emerald-400">Free</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-emerald-400">
                    <span>✓</span> Portfolio score 0–10
                  </li>
                  <li className="flex items-center gap-2 text-emerald-400">
                    <span>✓</span> AI summary
                  </li>
                  <li className="flex items-center gap-2 text-emerald-400">
                    <span>✓</span> Optimization potential
                  </li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-white/10 border border-purple-500/40 shadow-lg shadow-purple-500/10 p-6 text-left">
                <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-purple-400">Premium</h3>
                  <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">£3.99</span>
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
          <a
            href="/analyze"
            className="mt-8 flex justify-center"
            style={{
              display: "inline-block",
              padding: "16px 40px",
              fontSize: "18px",
              fontWeight: 700,
              borderRadius: "9999px",
              color: "white",
              background: "#7c3aed",
              boxShadow: "0 0 30px rgba(124,58,237,0.6)",
            }}
          >
            Get Your Free Score →
          </a>
        </section>

        {/* Footer CTA */}
        <section className="py-24 mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6 text-center">
            <div className="absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-purple-500/5 to-transparent" />
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Your Portfolio Might Be Riskier Than You Think
            </h2>
            <p className="mt-3 text-slate-400">
              Find out in 30 seconds. No signup required.
            </p>
            <a
              href="/analyze"
              className="mt-6"
              style={{
                display: "inline-block",
                padding: "16px 40px",
                fontSize: "18px",
                fontWeight: 700,
                borderRadius: "9999px",
                color: "white",
                background: "#7c3aed",
                boxShadow: "0 0 30px rgba(124,58,237,0.6)",
              }}
            >
              Analyse My Portfolio →
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
