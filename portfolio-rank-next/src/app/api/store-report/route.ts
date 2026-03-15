import { NextRequest, NextResponse } from "next/server";
import { setReport, type StoredReport } from "@/lib/report-store";
import { getSupabase, PREMIUM_REPORTS_TABLE } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  let body: { reportKey: string; report: StoredReport };
  try {
    body = (await request.json()) as { reportKey: string; report: StoredReport };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { reportKey, report } = body;
  if (!reportKey || typeof reportKey !== "string" || !report?.score || !report?.ai || !report?.form) {
    return NextResponse.json({ error: "Missing reportKey or report" }, { status: 400 });
  }
  setReport(reportKey, report);

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from(PREMIUM_REPORTS_TABLE).upsert(
      { id: reportKey, report, created_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    if (error) {
      console.error("store-report Supabase upsert error:", error.message, error);
      return NextResponse.json({ error: "Failed to save report", detail: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
