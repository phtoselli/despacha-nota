import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um caractere especial"),
});

export const totpSchema = z.object({
  code: z
    .string()
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d+$/, "Apenas números"),
  email: z.string().email().optional(),
});

export const invoiceConfigSchema = z.object({
  // Config
  name: z.string().min(1, "Nome é obrigatório").max(100),
  auto_send_enabled: z.boolean().default(false),
  send_day: z.number().int().min(1).max(28).nullable(),
  // Prestador (Emissor)
  prestador_cnpj: z.string().max(14).nullable(),
  prestador_razao_social: z.string().max(200).nullable(),
  prestador_inscricao_municipal: z.string().max(20).nullable(),
  prestador_codigo_municipio: z.string().max(7).nullable(),
  natureza_operacao: z.number().int().min(1).max(6).nullable(),
  optante_simples_nacional: z.boolean().default(false),
  regime_especial_tributacao: z.number().int().min(0).max(6).nullable(),
  // Tomador (Contratante)
  recipient_name: z.string().max(200).nullable(),
  recipient_document: z.string().max(18).nullable(),
  recipient_email: z.string().email("Email inválido").nullable().or(z.literal("")),
  tomador_telefone: z.string().max(20).nullable(),
  tomador_logradouro: z.string().max(200).nullable(),
  tomador_numero: z.string().max(20).nullable(),
  tomador_complemento: z.string().max(100).nullable(),
  tomador_bairro: z.string().max(100).nullable(),
  tomador_codigo_municipio: z.string().max(7).nullable(),
  tomador_uf: z.string().max(2).nullable(),
  tomador_cep: z.string().max(8).nullable(),
  // Servico
  service_description: z.string().max(2000).nullable(),
  amount: z.number().positive("Valor deve ser positivo").nullable(),
  servico_aliquota_iss: z.number().min(0).max(100).nullable(),
  servico_iss_retido: z.boolean().default(false),
  servico_item_lista_servico: z.string().max(10).nullable(),
  servico_codigo_cnae: z.string().max(10).nullable(),
  servico_codigo_tributacao_municipio: z.string().max(20).nullable(),
  servico_valor_deducoes: z.number().min(0).nullable(),
  servico_codigo_municipio_prestacao: z.string().max(7).nullable(),
  // Email
  email_enabled: z.boolean().default(false),
  email_to: z.string().email("Email inválido").nullable().or(z.literal("")),
  email_subject: z.string().max(200).nullable(),
  email_body_template: z.string().max(2000).nullable(),
});

export const settingsSchema = z.object({
  government_api_key: z.string().optional(),
  auto_send: z.boolean().optional(),
  require_confirmation: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter pelo menos um número")
      .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um caractere especial"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Senhas não conferem",
    path: ["confirmNewPassword"],
  });

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória para confirmação"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TOTPInput = z.infer<typeof totpSchema>;
export type InvoiceConfigInput = z.infer<typeof invoiceConfigSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
