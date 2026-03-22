import { getSupabase } from "@/lib/supabase-server";

const ANALYTICS_TABLE = "analytics";
const DEFAULT_COUNT = 2000;

export async function getTotalAnalyses(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return DEFAULT_COUNT;
  const { data, error } = await supabase
    .from(ANALYTICS_TABLE)
    .select("total_analyses")
    .eq("id", 1)
    .maybeSingle();
  if (error || data == null || typeof data.total_analyses !== "number") {
    return DEFAULT_COUNT;
  }
  return data.total_analyses;
}

/** Call after a successful portfolio analysis. Failures are logged only. */
export async function incrementTotalAnalyses(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.rpc("increment_total_analyses");
  if (error) {
    console.error("[analytics] increment_total_analyses failed:", error.message);
  }
}
