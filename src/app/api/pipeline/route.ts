import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("invoice_emissions")
      .select(`
        id,
        status,
        error_message,
        emitted_at,
        config_id,
        invoice_configs (name)
      `)
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "awaiting_confirmation", "error"])
      .order("emitted_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || []).map((item) => ({
      id: item.id,
      status: item.status,
      error_message: item.error_message,
      started_at: item.emitted_at,
      config_name: (item.invoice_configs as unknown as { name: string } | null)?.name || "Desconhecido",
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Pipeline error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
