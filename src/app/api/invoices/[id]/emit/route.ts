import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/encryption";
import { emitInvoice } from "@/lib/focus-nfe/client";

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

    // Get invoice config
    const { data: config } = await supabase
      .from("invoice_configs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!config) {
      return NextResponse.json({ error: "Configuracao nao encontrada" }, { status: 404 });
    }

    // Create emission record
    const { data: emission, error: emissionError } = await supabase
      .from("invoice_emissions")
      .insert({
        config_id: id,
        user_id: user.id,
        status: "processing",
      })
      .select()
      .single();

    if (emissionError) {
      return NextResponse.json({ error: emissionError.message }, { status: 500 });
    }

    // Decrypt document
    const recipientDocument = config.recipient_document_encrypted
      ? decrypt(config.recipient_document_encrypted)
      : "";

    const cleanDoc = recipientDocument.replace(/\D/g, "");
    const isCnpj = cleanDoc.length > 11;
    const ref = "dn-" + emission.id.replace(/-/g, "").slice(0, 20);

    const adminClient = createAdminClient();

    // Build full NFS-e payload
    const payload = {
      data_emissao: new Date().toISOString(),
      natureza_operacao: config.natureza_operacao || 1,
      optante_simples_nacional: config.optante_simples_nacional || false,
      ...(config.regime_especial_tributacao != null && { regime_especial_tributacao: config.regime_especial_tributacao }),
      cnpj_prestador: config.prestador_cnpj || "",
      inscricao_municipal_prestador: config.prestador_inscricao_municipal || "",
      codigo_municipio_emissora: config.prestador_codigo_municipio || "",
      razao_social_tomador: config.recipient_name || "",
      ...(isCnpj ? { cnpj_tomador: cleanDoc } : { cpf_tomador: cleanDoc }),
      ...(config.recipient_email && { email_tomador: config.recipient_email }),
      ...(config.tomador_telefone && { telefone_tomador: config.tomador_telefone }),
      ...(config.tomador_logradouro && { logradouro_tomador: config.tomador_logradouro }),
      ...(config.tomador_numero && { numero_tomador: config.tomador_numero }),
      ...(config.tomador_complemento && { complemento_tomador: config.tomador_complemento }),
      ...(config.tomador_bairro && { bairro_tomador: config.tomador_bairro }),
      ...(config.tomador_codigo_municipio && { codigo_municipio_tomador: config.tomador_codigo_municipio }),
      ...(config.tomador_uf && { uf_tomador: config.tomador_uf }),
      ...(config.tomador_cep && { cep_tomador: config.tomador_cep }),
      discriminacao: config.service_description || "Servico",
      valor_servicos: config.amount || 0,
      aliquota: config.servico_aliquota_iss || 0,
      iss_retido: config.servico_iss_retido || false,
      item_lista_servico: config.servico_item_lista_servico || "",
      ...(config.servico_codigo_cnae && { codigo_cnae: config.servico_codigo_cnae }),
      ...(config.servico_codigo_tributacao_municipio && { codigo_tributario_municipio: config.servico_codigo_tributacao_municipio }),
      ...(config.servico_valor_deducoes && { valor_deducoes: config.servico_valor_deducoes }),
      ...(config.servico_codigo_municipio_prestacao && { codigo_municipio_prestacao: config.servico_codigo_municipio_prestacao }),
    };

    // Emit invoice (async - don't await)
    emitInvoice(ref, payload)
      .then(async (result) => {
        await adminClient
          .from("invoice_emissions")
          .update({
            status: "success",
            government_response: result,
            pdf_url: result.url_danfe || result.caminho_danfe || null,
          })
          .eq("id", emission.id);

        await adminClient
          .from("invoice_configs")
          .update({ status: "sent" })
          .eq("id", id);
      })
      .catch(async (error) => {
        await adminClient
          .from("invoice_emissions")
          .update({
            status: "error",
            error_message: error.message || "Erro na emissao",
          })
          .eq("id", emission.id);
      });

    return NextResponse.json({ emission_id: emission.id, status: "processing" });
  } catch (error) {
    console.error("Emit invoice error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
