import { Suspense } from "react";

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
          Loading…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
