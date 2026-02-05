const ENVIRONMENTS = {
  homologacao: "https://homologacao.focusnfe.com.br",
  producao: "https://api.focusnfe.com.br",
} as const;

type Environment = keyof typeof ENVIRONMENTS;

function getBaseUrl(): string {
  const env = (process.env.FOCUS_NFE_ENVIRONMENT || "homologacao") as Environment;
  return ENVIRONMENTS[env] || ENVIRONMENTS.homologacao;
}

function getAuthHeader(): string {
  const token = process.env.FOCUS_NFE_API_TOKEN;
  if (!token) throw new Error("FOCUS_NFE_API_TOKEN not configured");
  return "Basic " + Buffer.from(token + ":").toString("base64");
}

export interface FocusNFeInvoice {
  data_emissao: string;
  natureza_operacao: number;
  optante_simples_nacional: boolean;
  regime_especial_tributacao?: number;
  // Prestador
  cnpj_prestador: string;
  inscricao_municipal_prestador: string;
  codigo_municipio_emissora: string;
  // Tomador
  razao_social_tomador: string;
  cnpj_tomador?: string;
  cpf_tomador?: string;
  email_tomador?: string;
  telefone_tomador?: string;
  logradouro_tomador?: string;
  numero_tomador?: string;
  complemento_tomador?: string;
  bairro_tomador?: string;
  codigo_municipio_tomador?: string;
  uf_tomador?: string;
  cep_tomador?: string;
  // Servico
  discriminacao: string;
  valor_servicos: number;
  aliquota: number;
  iss_retido: boolean;
  item_lista_servico: string;
  codigo_cnae?: string;
  codigo_tributario_municipio?: string;
  valor_deducoes?: number;
  codigo_municipio_prestacao?: string;
}

export interface EmissionResponse {
  ref: string;
  status: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  url_danfe?: string;
}

export async function emitInvoice(ref: string, data: FocusNFeInvoice): Promise<EmissionResponse> {
  const baseUrl = getBaseUrl();
  const response = await fetch(baseUrl + "/v2/nfse?ref=" + ref, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error("Focus NFe emission error: " + response.status + " - " + error);
  }

  return response.json();
}

export async function getInvoiceStatus(ref: string): Promise<EmissionResponse> {
  const baseUrl = getBaseUrl();
  const response = await fetch(baseUrl + "/v2/nfse/" + ref, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error("Focus NFe status error: " + response.status + " - " + error);
  }

  return response.json();
}

export async function getInvoicePdf(ref: string): Promise<Buffer> {
  const status = await getInvoiceStatus(ref);
  const pdfUrl = status.url_danfe || status.caminho_danfe;

  if (!pdfUrl) {
    throw new Error("PDF not available for this invoice");
  }

  const response = await fetch(pdfUrl, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!response.ok) {
    throw new Error("Failed to download PDF: " + response.status);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function checkApiHealth(): Promise<"online" | "offline" | "slow"> {
  const start = Date.now();
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(baseUrl + "/v2/nfse?ref=health_check", {
      method: "GET",
      headers: { Authorization: getAuthHeader() },
      signal: AbortSignal.timeout(10000),
    });
    const elapsed = Date.now() - start;

    if (!response.ok && response.status !== 404) {
      return "offline";
    }
    return elapsed > 5000 ? "slow" : "online";
  } catch {
    return "offline";
  }
}
