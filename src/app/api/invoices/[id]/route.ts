import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET(
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
      .from("invoice_configs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...data,
      recipient_document: data.recipient_document_encrypted
        ? decrypt(data.recipient_document_encrypted)
        : null,
      recipient_document_encrypted: undefined,
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const { recipient_document, ...rest } = body;

    const updateData: Record<string, unknown> = { ...rest };
    if (recipient_document !== undefined) {
      updateData.recipient_document_encrypted = recipient_document
        ? encrypt(recipient_document)
        : null;
    }

    // Recalculate status
    const { data: existing } = await supabase
      .from("invoice_configs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      const merged = { ...existing, ...updateData };
      const hasRequired = merged.name
        && merged.prestador_cnpj
        && merged.prestador_razao_social
        && merged.prestador_inscricao_municipal
        && merged.prestador_codigo_municipio
        && merged.recipient_document_encrypted
        && merged.recipient_name
        && merged.service_description
        && merged.amount
        && merged.servico_aliquota_iss
        && merged.servico_item_lista_servico;
      updateData.status = hasRequired ? "ready" : "pending_info";
    }

    const { data, error } = await supabase
      .from("invoice_configs")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from("invoice_configs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
