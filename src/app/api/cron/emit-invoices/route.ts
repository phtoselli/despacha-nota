import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/encryption";
import { emitInvoice, getInvoicePdf } from "@/lib/focus-nfe/client";
import { sendInvoiceEmail } from "@/lib/resend/client";

export async function GET() {
  try {
    const today = new Date();
    const currentDay = today.getDate();
    const supabase = createAdminClient();

    // Get all configs scheduled for today with auto_send enabled
    const { data: configs, error } = await supabase
      .from("invoice_configs")
      .select("*, user_settings!inner(government_api_key_encrypted, auto_send)")
      .eq("auto_send_enabled", true)
      .eq("send_day", currentDay)
      .eq("status", "ready");

    if (error) {
      console.error("Cron query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json({ message: "Nenhuma nota para emitir hoje", processed: 0 });
    }

    let processed = 0;
    let errorsCount = 0;

    for (const config of configs) {
      try {
        const userSettings = config.user_settings as { government_api_key_encrypted: string; auto_send: boolean };

        if (!userSettings?.government_api_key_encrypted || !userSettings.auto_send) {
          continue;
        }

        const recipientDocument = config.recipient_document_encrypted
          ? decrypt(config.recipient_document_encrypted)
          : "";

        const cleanDoc = recipientDocument.replace(/\D/g, "");
        const isCnpj = cleanDoc.length > 11;

        // Create emission record
        const { data: emission } = await supabase
          .from("invoice_emissions")
          .insert({
            config_id: config.id,
            user_id: config.user_id,
            status: "processing",
          })
          .select()
          .single();

        if (!emission) continue;

        const ref = "dn-" + emission.id.replace(/-/g, "").slice(0, 20);

        // Build full NFS-e payload
        const result = await emitInvoice(ref, {
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
        });

        const pdfUrl = result.url_danfe || result.caminho_danfe || null;

        // Update emission with success
        await supabase
          .from("invoice_emissions")
          .update({
            status: "success",
            government_response: result,
            pdf_url: pdfUrl,
          })
          .eq("id", emission.id);

        // Update config status
        await supabase
          .from("invoice_configs")
          .update({ status: "sent" })
          .eq("id", config.id);

        // Send email if configured
        if (config.email_enabled && config.email_to) {
          try {
            const pdfBuffer = await getInvoicePdf(ref);

            await sendInvoiceEmail({
              to: config.email_to,
              subject: config.email_subject || "Nota Fiscal",
              bodyTemplate: config.email_body_template || "Segue em anexo a nota fiscal.",
              pdfBuffer,
              invoiceRef: ref,
              variables: {
                valor: config.amount?.toFixed(2) || "0.00",
                destinatario: config.recipient_name || "",
              },
            });

            await supabase
              .from("invoice_emissions")
              .update({ email_sent: true })
              .eq("id", emission.id);
          } catch (emailError) {
            console.error("Email send error for config " + config.id + ":", emailError);
          }
        }

        processed++;
      } catch (emitError) {
        console.error("Emission error for config " + config.id + ":", emitError);
        errorsCount++;
      }
    }

    return NextResponse.json({
      message: "Cron executado",
      processed,
      errors: errorsCount,
      total: configs.length,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
