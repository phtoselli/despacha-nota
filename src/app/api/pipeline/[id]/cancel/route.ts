import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("invoice_emissions")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "error"])
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Emissao nao encontrada ou nao pode ser cancelada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel emission error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
