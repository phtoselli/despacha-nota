import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/encryption";
import { invoiceConfigSchema } from "@/lib/validations/schemas";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("invoice_configs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Decrypt sensitive fields
    const decrypted = data.map((config) => ({
      ...config,
      recipient_document: config.recipient_document_encrypted
        ? decrypt(config.recipient_document_encrypted)
        : null,
      recipient_document_encrypted: undefined,
    }));

    return NextResponse.json(decrypted);
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = invoiceConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { recipient_document, ...rest } = parsed.data;

    // Determine status based on minimum required fields for NFS-e emission
    const hasRequired = rest.name
      && rest.prestador_cnpj
      && rest.prestador_razao_social
      && rest.prestador_inscricao_municipal
      && rest.prestador_codigo_municipio
      && recipient_document
      && rest.recipient_name
      && rest.service_description
      && rest.amount
      && rest.servico_aliquota_iss
      && rest.servico_item_lista_servico;
    const status = hasRequired ? "ready" : "pending_info";

    const { data, error } = await supabase
      .from("invoice_configs")
      .insert({
        user_id: user.id,
        ...rest,
        recipient_document_encrypted: recipient_document ? encrypt(recipient_document) : null,
        status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
