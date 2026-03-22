import { NextResponse } from "next/server";
import { getTotalAnalyses } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const totalAnalyses = await getTotalAnalyses();
  return NextResponse.json({ totalAnalyses });
}
