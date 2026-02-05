import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkApiHealth } from "@/lib/focus-nfe/client";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // Get total invoices
    const { count: totalInvoices } = await supabase
      .from("invoice_configs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get sent this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: sentThisMonth } = await supabase
      .from("invoice_emissions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "success")
      .gte("emitted_at", startOfMonth.toISOString());

    // Get pending
    const { count: pending } = await supabase
      .from("invoice_emissions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "awaiting_confirmation"]);

    // Get errors
    const { count: errors } = await supabase
      .from("invoice_emissions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "error");

    // Check API health
    const apiStatus = await checkApiHealth();

    return NextResponse.json({
      total_invoices: totalInvoices || 0,
      sent_this_month: sentThisMonth || 0,
      pending: pending || 0,
      errors: errors || 0,
      api_status: apiStatus,
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
