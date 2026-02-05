import { Resend } from "resend";

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

interface SendInvoiceEmailParams {
  to: string;
  subject: string;
  bodyTemplate: string;
  pdfBuffer: Buffer;
  invoiceRef: string;
  variables?: Record<string, string>;
}

function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  const now = new Date();
  const builtIn: Record<string, string> = {
    data: now.toLocaleDateString("pt-BR"),
    data_extenso: now.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    mes: now.toLocaleDateString("pt-BR", { month: "long" }),
    ano: now.getFullYear().toString(),
    ...variables,
  };

  for (const [key, value] of Object.entries(builtIn)) {
    const pattern = "{{" + key + "}}";
    result = result.split(pattern).join(value);
  }
  return result;
}

export async function sendInvoiceEmail({
  to,
  subject,
  bodyTemplate,
  pdfBuffer,
  invoiceRef,
  variables = {},
}: SendInvoiceEmailParams) {
  const client = getClient();
  const body = replaceVariables(bodyTemplate, variables);
  const processedSubject = replaceVariables(subject, variables);

  const { data, error } = await client.emails.send({
    from: "Despacha Nota <noreply@despachanota.com.br>",
    to: [to],
    subject: processedSubject,
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">',
      '<h2 style="color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px;">Nota Fiscal</h2>',
      '<div style="color: #333; line-height: 1.6; white-space: pre-wrap;">' + body + "</div>",
      '<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />',
      '<p style="color: #888; font-size: 12px;">Enviado automaticamente por Despacha Nota</p>',
      "</div>",
    ].join("\n"),
    attachments: [
      {
        filename: "nota-fiscal-" + invoiceRef + ".pdf",
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error("Email send failed: " + error.message);
  }

  return data;
}
