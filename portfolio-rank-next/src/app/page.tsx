import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <main className="w-full max-w-lg mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-50 mb-4">
          PortfolioRank
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10">
          Find out if your portfolio is actually good.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center justify-center rounded-lg bg-zinc-50 text-zinc-950 font-semibold px-8 py-3.5 hover:bg-zinc-200 transition-colors"
        >
          Analyse My Portfolio
        </Link>
      </main>
    </div>
  );
}
