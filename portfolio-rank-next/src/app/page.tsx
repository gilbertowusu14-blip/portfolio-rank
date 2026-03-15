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
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f1e]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            <span className="text-white">Portfolio</span>
            <span style={{ color: ACCENT_PURPLE }}>Rank</span>
          </Link>
          <Link
            href="/analyze"
            className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Analyse My Portfolio →
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Section 1 — Hero */}
        <section className="mb-20 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-white">How Strong Is Your</span>
            <br />
            <span
              className="bg-gradient-to-r from-[#ec4899] to-[#7c3aed] bg-clip-text text-transparent"
              style={{ color: ACCENT_PURPLE }}
            >
              Investment Portfolio?
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Get an instant AI-powered score for your portfolio and discover
            exactly where it&apos;s leaking performance.
          </p>

          {/* 3 step cards */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
              <div className="text-2xl">📋</div>
              <h3 className="mt-2 font-semibold text-white">Enter Portfolio</h3>
              <p className="mt-1 text-sm text-slate-400">
                Add your holdings and weights in seconds
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
              <div className="text-2xl">⚡</div>
              <h3 className="mt-2 font-semibold text-white">AI Analysis</h3>
              <p className="mt-1 text-sm text-slate-400">
                Our engine scores diversification, risk & more
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
              <div className="text-2xl">📊</div>
              <h3 className="mt-2 font-semibold text-white">Your Score</h3>
              <p className="mt-1 text-sm text-slate-400">
                See your grade and where to improve
              </p>
            </div>
          </div>

          {/* Mock score card */}
          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <div className="flex items-baseline justify-between">
              <span
                className="text-3xl font-bold"
                style={{ color: ACCENT_PURPLE }}
              >
                7.4 / 10
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-sm font-medium text-emerald-400">
                Strong
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: "74%",
                  backgroundColor: ACCENT_PURPLE,
                }}
              />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Diversification</span>
                <span className="text-white">80</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Growth Quality</span>
                <span className="text-white">75</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Risk</span>
                <span className="text-white">60</span>
              </div>
            </div>
          </div>

          <Link
            href="/analyze"
            className="mt-8 inline-flex rounded-full bg-gradient-to-r from-[#ec4899] to-[#7c3aed] px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            Analyse My Portfolio →
          </Link>
          <p className="mt-6 text-sm text-slate-400">
            ⚡ Instant Results • 🔒 No signup required • 📊 AI Powered
          </p>
        </section>

        {/* Section 2 — Logo carousel */}
        <section className="mb-20">
          <h2 className="mb-8 text-center text-xl font-semibold text-white sm:text-2xl">
            Analyse portfolios containing the world&apos;s largest companies
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
        <section className="mb-20">
          <h2 className="mb-8 text-center text-2xl font-semibold text-white">
            Most Portfolios Have Hidden Problems
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div
                className="text-4xl font-bold"
                style={{ color: ACCENT_PURPLE }}
              >
                72%
              </div>
              <p className="mt-2 text-slate-400">
                overconcentrated in sector
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div
                className="text-4xl font-bold"
                style={{ color: ACCENT_PURPLE }}
              >
                &lt;5
              </div>
              <p className="mt-2 text-slate-400">average stocks held</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div
                className="text-4xl font-bold"
                style={{ color: ACCENT_PURPLE }}
              >
                2.3×
              </div>
              <p className="mt-2 text-slate-400">higher drawdown risk</p>
            </div>
          </div>
        </section>

        {/* Section 4 — Average score */}
        <section className="mb-20 flex justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
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
            <Link
              href="/analyze"
              className="mt-4 inline-block font-medium transition-opacity hover:opacity-80"
              style={{ color: ACCENT_PURPLE }}
            >
              What&apos;s your score? →
            </Link>
          </div>
        </section>

        {/* Section 5 — How scoring works */}
        <section className="mb-20">
          <h2 className="mb-10 text-center text-2xl font-semibold text-white">
            How Your Portfolio Score Is Calculated
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Diversification",
                desc: "Spread across sectors and number of holdings",
              },
              {
                name: "Concentration Risk",
                desc: "How much weight sits in your top holdings",
              },
              {
                name: "Growth Quality",
                desc: "Sector mix and earnings quality",
              },
              {
                name: "Valuation Risk",
                desc: "Tech concentration and valuation exposure",
              },
              {
                name: "Drawdown Exposure",
                desc: "Weighted beta and volatility alignment",
              },
              {
                name: "Market Comparison",
                desc: "Exposure to broad market vs niche assets",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${ACCENT_PURPLE}30`, color: ACCENT_PURPLE }}
                >
                  •
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6 — Free score */}
        <section className="mb-20 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Start With a{" "}
            <span style={{ color: ACCENT_PURPLE }}>Free</span> Portfolio Score
          </h2>
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-emerald-400">
                <span>✓</span> Instant portfolio score 0–10
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <span>✓</span> AI summary and key strengths
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <span>✓</span> No signup required
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span>🔒</span> Full 6-metric breakdown
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span>🔒</span> Weaknesses & action plan
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span>🔒</span> Optimised portfolio blueprint
              </li>
            </ul>
            <Link
              href="/analyze"
              className="mt-6 flex justify-center rounded-full bg-gradient-to-r from-[#ec4899] to-[#7c3aed] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get Your Free Score →
            </Link>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Is Your Portfolio Actually Good?
            </h2>
            <p className="mt-3 text-slate-400">
              Find out in 30 seconds. No signup required.
            </p>
            <Link
              href="/analyze"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[#ec4899] to-[#7c3aed] px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              Analyse My Portfolio →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
