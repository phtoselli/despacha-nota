"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailConfigSection } from "./email-config-section";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { InvoiceConfigDecrypted } from "@/types";

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  invoice?: InvoiceConfigDecrypted | null;
}

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const NATUREZA_OPTIONS = [
  { value: "1", label: "1 - Tributacao no municipio" },
  { value: "2", label: "2 - Tributacao fora do municipio" },
  { value: "3", label: "3 - Isencao" },
  { value: "4", label: "4 - Imune" },
  { value: "5", label: "5 - Exigibilidade suspensa (judicial)" },
  { value: "6", label: "6 - Exigibilidade suspensa (administrativo)" },
];

const REGIME_OPTIONS = [
  { value: "0", label: "0 - Nenhum" },
  { value: "1", label: "1 - Microempresa Municipal" },
  { value: "2", label: "2 - Estimativa" },
  { value: "3", label: "3 - Sociedade de Profissionais" },
  { value: "4", label: "4 - Cooperativa" },
  { value: "5", label: "5 - MEI" },
  { value: "6", label: "6 - ME/EPP Simples Nacional" },
];

const defaultForm = {
  name: "",
  auto_send_enabled: false,
  send_day: "",
  prestador_cnpj: "",
  prestador_razao_social: "",
  prestador_inscricao_municipal: "",
  prestador_codigo_municipio: "",
  natureza_operacao: "1",
  optante_simples_nacional: false,
  regime_especial_tributacao: "",
  recipient_name: "",
  recipient_document: "",
  recipient_email: "",
  tomador_telefone: "",
  tomador_logradouro: "",
  tomador_numero: "",
  tomador_complemento: "",
  tomador_bairro: "",
  tomador_codigo_municipio: "",
  tomador_uf: "",
  tomador_cep: "",
  service_description: "",
  amount: "",
  servico_aliquota_iss: "",
  servico_iss_retido: false,
  servico_item_lista_servico: "",
  servico_codigo_cnae: "",
  servico_codigo_tributacao_municipio: "",
  servico_valor_deducoes: "",
  servico_codigo_municipio_prestacao: "",
  email_enabled: false,
  email_to: "",
  email_subject: "",
  email_body_template: "",
};

const STEPS = [
  { number: 1, title: "Emissor" },
  { number: 2, title: "Contratante" },
  { number: 3, title: "Servico" },
] as const;

export function InvoiceFormModal({ open, onClose, onSave, invoice }: InvoiceFormModalProps) {
  const [form, setForm] = useState(defaultForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (invoice) {
      setForm({
        name: invoice.name || "",
        auto_send_enabled: invoice.auto_send_enabled,
        send_day: invoice.send_day?.toString() || "",
        prestador_cnpj: invoice.prestador_cnpj || "",
        prestador_razao_social: invoice.prestador_razao_social || "",
        prestador_inscricao_municipal: invoice.prestador_inscricao_municipal || "",
        prestador_codigo_municipio: invoice.prestador_codigo_municipio || "",
        natureza_operacao: invoice.natureza_operacao?.toString() || "1",
        optante_simples_nacional: invoice.optante_simples_nacional,
        regime_especial_tributacao: invoice.regime_especial_tributacao?.toString() || "",
        recipient_name: invoice.recipient_name || "",
        recipient_document: invoice.recipient_document || "",
        recipient_email: invoice.recipient_email || "",
        tomador_telefone: invoice.tomador_telefone || "",
        tomador_logradouro: invoice.tomador_logradouro || "",
        tomador_numero: invoice.tomador_numero || "",
        tomador_complemento: invoice.tomador_complemento || "",
        tomador_bairro: invoice.tomador_bairro || "",
        tomador_codigo_municipio: invoice.tomador_codigo_municipio || "",
        tomador_uf: invoice.tomador_uf || "",
        tomador_cep: invoice.tomador_cep || "",
        service_description: invoice.service_description || "",
        amount: invoice.amount?.toString() || "",
        servico_aliquota_iss: invoice.servico_aliquota_iss?.toString() || "",
        servico_iss_retido: invoice.servico_iss_retido,
        servico_item_lista_servico: invoice.servico_item_lista_servico || "",
        servico_codigo_cnae: invoice.servico_codigo_cnae || "",
        servico_codigo_tributacao_municipio: invoice.servico_codigo_tributacao_municipio || "",
        servico_valor_deducoes: invoice.servico_valor_deducoes?.toString() || "",
        servico_codigo_municipio_prestacao: invoice.servico_codigo_municipio_prestacao || "",
        email_enabled: invoice.email_enabled,
        email_to: invoice.email_to || "",
        email_subject: invoice.email_subject || "",
        email_body_template: invoice.email_body_template || "",
      });
    } else {
      setForm(defaultForm);
    }
    setStep(1);
    setError("");
  }, [invoice, open]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!form.name.trim()) return "Nome da configuracao e obrigatorio";
      if (!form.prestador_cnpj.trim()) return "CNPJ do prestador e obrigatorio";
      if (!form.prestador_razao_social.trim()) return "Razao social do prestador e obrigatoria";
      if (!form.prestador_inscricao_municipal.trim()) return "Inscricao municipal e obrigatoria";
      if (!form.prestador_codigo_municipio.trim()) return "Codigo do municipio e obrigatorio";
    }
    if (s === 2) {
      if (!form.recipient_name.trim()) return "Razao social do contratante e obrigatoria";
      if (!form.recipient_document.trim()) return "CPF/CNPJ do contratante e obrigatorio";
    }
    if (s === 3) {
      if (!form.service_description.trim()) return "Discriminacao do servico e obrigatoria";
      if (!form.amount) return "Valor do servico e obrigatorio";
      if (!form.servico_aliquota_iss) return "Aliquota ISS e obrigatoria";
      if (!form.servico_item_lista_servico.trim()) return "Item da lista de servico e obrigatorio";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep(step);
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      await onSave({
        name: form.name,
        auto_send_enabled: form.auto_send_enabled,
        send_day: form.send_day ? parseInt(form.send_day) : null,
        prestador_cnpj: form.prestador_cnpj || null,
        prestador_razao_social: form.prestador_razao_social || null,
        prestador_inscricao_municipal: form.prestador_inscricao_municipal || null,
        prestador_codigo_municipio: form.prestador_codigo_municipio || null,
        natureza_operacao: form.natureza_operacao ? parseInt(form.natureza_operacao) : null,
        optante_simples_nacional: form.optante_simples_nacional,
        regime_especial_tributacao: form.regime_especial_tributacao ? parseInt(form.regime_especial_tributacao) : null,
        recipient_name: form.recipient_name || null,
        recipient_document: form.recipient_document || null,
        recipient_email: form.recipient_email || null,
        tomador_telefone: form.tomador_telefone || null,
        tomador_logradouro: form.tomador_logradouro || null,
        tomador_numero: form.tomador_numero || null,
        tomador_complemento: form.tomador_complemento || null,
        tomador_bairro: form.tomador_bairro || null,
        tomador_codigo_municipio: form.tomador_codigo_municipio || null,
        tomador_uf: form.tomador_uf || null,
        tomador_cep: form.tomador_cep || null,
        service_description: form.service_description || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        servico_aliquota_iss: form.servico_aliquota_iss ? parseFloat(form.servico_aliquota_iss) : null,
        servico_iss_retido: form.servico_iss_retido,
        servico_item_lista_servico: form.servico_item_lista_servico || null,
        servico_codigo_cnae: form.servico_codigo_cnae || null,
        servico_codigo_tributacao_municipio: form.servico_codigo_tributacao_municipio || null,
        servico_valor_deducoes: form.servico_valor_deducoes ? parseFloat(form.servico_valor_deducoes) : null,
        servico_codigo_municipio_prestacao: form.servico_codigo_municipio_prestacao || null,
        email_enabled: form.email_enabled,
        email_to: form.email_to || null,
        email_subject: form.email_subject || null,
        email_body_template: form.email_body_template || null,
      });
      onClose();
    } catch {
      setError("Erro ao salvar configuracao");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{invoice ? "Editar" : "Nova"} Configuracao de Nota</DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 pb-2">
          {STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                step >= s.number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step > s.number ? <Check className="h-4 w-4" /> : s.number}
              </div>
              <span className={`text-sm hidden sm:inline ${step === s.number ? "font-semibold" : "text-muted-foreground"}`}>
                {s.title}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <ScrollArea className="max-h-[65vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Emissor */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da configuracao *</Label>
                  <Input id="name" placeholder="Ex: Nota mensal Cliente X" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="send_day">Dia do envio (1-28)</Label>
                    <Input id="send_day" type="number" min={1} max={28} placeholder="15" value={form.send_day} onChange={(e) => handleChange("send_day", e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch id="auto_send" checked={form.auto_send_enabled} onCheckedChange={(checked) => handleChange("auto_send_enabled", checked)} />
                    <Label htmlFor="auto_send">Envio automatico</Label>
                  </div>
                </div>
                <div className="border-t pt-4 mt-2">
                  <h3 className="font-semibold mb-3">Dados do Emissor (Prestador)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prestador_cnpj">CNPJ *</Label>
                    <Input id="prestador_cnpj" placeholder="00000000000000" maxLength={14} value={form.prestador_cnpj} onChange={(e) => handleChange("prestador_cnpj", e.target.value.replace(/\D/g, ""))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prestador_inscricao_municipal">Inscricao Municipal *</Label>
                    <Input id="prestador_inscricao_municipal" placeholder="12345" value={form.prestador_inscricao_municipal} onChange={(e) => handleChange("prestador_inscricao_municipal", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prestador_razao_social">Razao Social *</Label>
                  <Input id="prestador_razao_social" placeholder="Empresa Ltda" value={form.prestador_razao_social} onChange={(e) => handleChange("prestador_razao_social", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prestador_codigo_municipio">Codigo Municipio (IBGE) *</Label>
                    <Input id="prestador_codigo_municipio" placeholder="3550308" maxLength={7} value={form.prestador_codigo_municipio} onChange={(e) => handleChange("prestador_codigo_municipio", e.target.value.replace(/\D/g, ""))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="natureza_operacao">Natureza da Operacao *</Label>
                    <Select value={form.natureza_operacao} onValueChange={(v) => handleChange("natureza_operacao", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {NATUREZA_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 pt-2">
                    <Switch id="optante_simples" checked={form.optante_simples_nacional} onCheckedChange={(checked) => handleChange("optante_simples_nacional", checked)} />
                    <Label htmlFor="optante_simples">Optante Simples Nacional</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regime_especial">Regime Especial</Label>
                    <Select value={form.regime_especial_tributacao} onValueChange={(v) => handleChange("regime_especial_tributacao", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {REGIME_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contratante */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Dados do Contratante (Tomador)</h3>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Razao Social / Nome *</Label>
                  <Input id="recipient_name" placeholder="Razao Social ou Nome Completo" value={form.recipient_name} onChange={(e) => handleChange("recipient_name", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient_document">CPF/CNPJ *</Label>
                    <Input id="recipient_document" placeholder="Somente numeros" value={form.recipient_document} onChange={(e) => handleChange("recipient_document", e.target.value.replace(/\D/g, ""))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient_email">Email</Label>
                    <Input id="recipient_email" type="email" placeholder="contato@empresa.com" value={form.recipient_email} onChange={(e) => handleChange("recipient_email", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tomador_telefone">Telefone</Label>
                  <Input id="tomador_telefone" placeholder="11999999999" value={form.tomador_telefone} onChange={(e) => handleChange("tomador_telefone", e.target.value)} />
                </div>
                <div className="border-t pt-4 mt-2">
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Endereco</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="tomador_logradouro">Logradouro</Label>
                    <Input id="tomador_logradouro" placeholder="Rua, Av, etc" value={form.tomador_logradouro} onChange={(e) => handleChange("tomador_logradouro", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tomador_numero">Numero</Label>
                    <Input id="tomador_numero" placeholder="123" value={form.tomador_numero} onChange={(e) => handleChange("tomador_numero", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tomador_complemento">Complemento</Label>
                    <Input id="tomador_complemento" placeholder="Sala 1, Bloco A" value={form.tomador_complemento} onChange={(e) => handleChange("tomador_complemento", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tomador_bairro">Bairro</Label>
                    <Input id="tomador_bairro" placeholder="Centro" value={form.tomador_bairro} onChange={(e) => handleChange("tomador_bairro", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tomador_codigo_municipio">Cod. Municipio</Label>
                    <Input id="tomador_codigo_municipio" placeholder="3550308" maxLength={7} value={form.tomador_codigo_municipio} onChange={(e) => handleChange("tomador_codigo_municipio", e.target.value.replace(/\D/g, ""))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tomador_uf">UF</Label>
                    <Select value={form.tomador_uf} onValueChange={(v) => handleChange("tomador_uf", v)}>
                      <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        {UF_OPTIONS.map((uf) => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tomador_cep">CEP</Label>
                    <Input id="tomador_cep" placeholder="01001000" maxLength={8} value={form.tomador_cep} onChange={(e) => handleChange("tomador_cep", e.target.value.replace(/\D/g, ""))} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Servico */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Dados do Servico</h3>
                <div className="space-y-2">
                  <Label htmlFor="service_description">Discriminacao do Servico *</Label>
                  <Textarea id="service_description" placeholder="Descreva detalhadamente o servico prestado" value={form.service_description} onChange={(e) => handleChange("service_description", e.target.value)} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor do Servico (R$) *</Label>
                    <Input id="amount" type="number" step="0.01" min="0" placeholder="1000.00" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servico_aliquota_iss">Aliquota ISS (%) *</Label>
                    <Input id="servico_aliquota_iss" type="number" step="0.01" min="0" max="100" placeholder="2.00" value={form.servico_aliquota_iss} onChange={(e) => handleChange("servico_aliquota_iss", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servico_item_lista_servico">Item Lista de Servico (LC 116) *</Label>
                    <Input id="servico_item_lista_servico" placeholder="1.06" value={form.servico_item_lista_servico} onChange={(e) => handleChange("servico_item_lista_servico", e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch id="servico_iss_retido" checked={form.servico_iss_retido} onCheckedChange={(checked) => handleChange("servico_iss_retido", checked)} />
                    <Label htmlFor="servico_iss_retido">ISS Retido</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servico_codigo_cnae">Codigo CNAE</Label>
                    <Input id="servico_codigo_cnae" placeholder="6201501" value={form.servico_codigo_cnae} onChange={(e) => handleChange("servico_codigo_cnae", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servico_codigo_tributacao_municipio">Cod. Tributacao Municipal</Label>
                    <Input id="servico_codigo_tributacao_municipio" placeholder="010601" value={form.servico_codigo_tributacao_municipio} onChange={(e) => handleChange("servico_codigo_tributacao_municipio", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servico_valor_deducoes">Valor Deducoes (R$)</Label>
                    <Input id="servico_valor_deducoes" type="number" step="0.01" min="0" placeholder="0.00" value={form.servico_valor_deducoes} onChange={(e) => handleChange("servico_valor_deducoes", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servico_codigo_municipio_prestacao">Cod. Municipio Prestacao</Label>
                    <Input id="servico_codigo_municipio_prestacao" placeholder="3550308" maxLength={7} value={form.servico_codigo_municipio_prestacao} onChange={(e) => handleChange("servico_codigo_municipio_prestacao", e.target.value.replace(/\D/g, ""))} />
                  </div>
                </div>
                <EmailConfigSection emailEnabled={form.email_enabled} emailTo={form.email_to} emailSubject={form.email_subject} emailBodyTemplate={form.email_body_template} onChange={handleChange} />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-between pt-4 border-t">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                {step < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Proximo
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {invoice ? "Salvar" : "Criar"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
