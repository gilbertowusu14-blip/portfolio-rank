import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Rankfolio™",
  description: "AI-powered portfolio analysis for retail investors in the UK and Europe.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/" className="text-sm text-yellow-400 hover:underline">
          ← Home
        </Link>
        <h1 className="font-heading mt-8 text-3xl font-bold text-white">About</h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-200">
          Rankfolio™ is an AI-powered portfolio analysis tool built for retail investors in the UK
          and Europe. We help you understand your portfolio&apos;s strengths, weaknesses, and exactly
          how to improve it — in seconds.
        </p>
      </div>
    </div>
  );
}
