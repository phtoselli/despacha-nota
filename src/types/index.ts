export type InvoiceStatus = "ready" | "pending_info" | "sent";
export type EmissionStatus =
  | "pending"
  | "processing"
  | "awaiting_confirmation"
  | "success"
  | "error"
  | "cancelled";
export type ApiHealthStatus = "online" | "offline" | "slow";

export interface UserSettings {
  id: string;
  user_id: string;
  government_api_key_encrypted: string | null;
  auto_send: boolean;
  require_confirmation: boolean;
  totp_secret_encrypted: string | null;
  totp_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceConfig {
  id: string;
  user_id: string;
  name: string;
  status: InvoiceStatus;
  auto_send_enabled: boolean;
  send_day: number | null;
  // Prestador (Emissor)
  prestador_cnpj: string | null;
  prestador_razao_social: string | null;
  prestador_inscricao_municipal: string | null;
  prestador_codigo_municipio: string | null;
  natureza_operacao: number | null;
  optante_simples_nacional: boolean;
  regime_especial_tributacao: number | null;
  // Tomador (Contratante)
  recipient_name: string | null;
  recipient_document_encrypted: string | null;
  recipient_email: string | null;
  tomador_telefone: string | null;
  tomador_logradouro: string | null;
  tomador_numero: string | null;
  tomador_complemento: string | null;
  tomador_bairro: string | null;
  tomador_codigo_municipio: string | null;
  tomador_uf: string | null;
  tomador_cep: string | null;
  // Servico
  service_description: string | null;
  amount: number | null;
  servico_aliquota_iss: number | null;
  servico_iss_retido: boolean;
  servico_item_lista_servico: string | null;
  servico_codigo_cnae: string | null;
  servico_codigo_tributacao_municipio: string | null;
  servico_valor_deducoes: number | null;
  servico_codigo_municipio_prestacao: string | null;
  // Email
  email_enabled: boolean;
  email_to: string | null;
  email_subject: string | null;
  email_body_template: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceConfigDecrypted
  extends Omit<InvoiceConfig, "recipient_document_encrypted"> {
  recipient_document: string | null;
}

export interface InvoiceEmission {
  id: string;
  config_id: string;
  user_id: string;
  status: EmissionStatus;
  government_response: Record<string, unknown> | null;
  pdf_url: string | null;
  email_sent: boolean;
  error_message: string | null;
  emitted_at: string;
  config_name?: string;
}

export interface DashboardMetrics {
  total_invoices: number;
  sent_this_month: number;
  pending: number;
  errors: number;
  api_status: ApiHealthStatus;
}

export interface PipelineItem {
  id: string;
  config_name: string;
  status: EmissionStatus;
  started_at: string;
  error_message: string | null;
}
