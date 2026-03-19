import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getReport } from "@/lib/report-store";
import { getSupabase, PREMIUM_REPORTS_TABLE } from "@/lib/supabase-server";

async function getReportByKey(reportKey: string) {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from(PREMIUM_REPORTS_TABLE)
      .select("report")
      .eq("id", reportKey)
      .single();
    if (!error && data?.report) return data.report as unknown;
    if (error) console.error("premium-report Supabase select error:", error.message);
  }
  return getReport(reportKey);
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const analysisId = request.nextUrl.searchParams.get("analysis_id");

  let reportKey: string | null = analysisId?.trim() || null;

  if (!reportKey && sessionId?.trim()) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 503 });
    }
    const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId.trim());
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 403 });
      }
      reportKey = (session.metadata?.reportKey as string) || null;
    } catch (err) {
      console.error("premium-report Stripe retrieve error:", err);
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
  }

  if (!reportKey) {
    return NextResponse.json(
      { error: "No report found for this session", debug: { session_id: sessionId ?? null, analysis_id: analysisId ?? null } },
      { status: 404 }
    );
  }

  const report = await getReportByKey(reportKey);
  if (!report) {
    return NextResponse.json(
      { error: "Report expired or not found", debug: { reportKey, hasSupabase: !!getSupabase() } },
      { status: 404 }
    );
  }
  return NextResponse.json(report);
}
