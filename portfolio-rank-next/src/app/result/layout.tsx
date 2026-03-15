import { Suspense } from "react";

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-zinc-400" style={{ backgroundColor: "#0a0a0a" }}>
          Loading…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
