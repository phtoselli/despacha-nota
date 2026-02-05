"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";

interface EmailConfigSectionProps {
  emailEnabled: boolean;
  emailTo: string;
  emailSubject: string;
  emailBodyTemplate: string;
  onChange: (field: string, value: string | boolean) => void;
}

export function EmailConfigSection({
  emailEnabled,
  emailTo,
  emailSubject,
  emailBodyTemplate,
  onChange,
}: EmailConfigSectionProps) {
  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Configuracao de Email</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Configure o envio automatico de email com o PDF da nota fiscal apos emissao
      </p>

      <div className="flex items-center justify-between">
        <Label htmlFor="email_enabled">Enviar email apos emissao</Label>
        <Switch
          id="email_enabled"
          checked={emailEnabled}
          onCheckedChange={(checked) => onChange("email_enabled", checked)}
        />
      </div>

      {emailEnabled && (
        <div className="space-y-4 pl-2 border-l-2 border-muted ml-2">
          <div className="space-y-2">
            <Label htmlFor="email_to">Destinatario</Label>
            <Input
              id="email_to"
              type="email"
              placeholder="destinatario@email.com"
              value={emailTo}
              onChange={(e) => onChange("email_to", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email_subject">Assunto</Label>
            <Input
              id="email_subject"
              placeholder="Nota Fiscal - {{mes}}/{{ano}}"
              value={emailSubject}
              onChange={(e) => onChange("email_subject", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email_body_template">Corpo do Email</Label>
            <Textarea
              id="email_body_template"
              placeholder={"Prezado(a),\n\nSegue em anexo a nota fiscal referente ao mes de {{mes}} de {{ano}}.\n\nData de emissao: {{data}}\n\nAtenciosamente"}
              value={emailBodyTemplate}
              onChange={(e) => onChange("email_body_template", e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Variaveis disponiveis: {"{{data}}"}, {"{{data_extenso}}"}, {"{{mes}}"}, {"{{ano}}"}, {"{{valor}}"}, {"{{destinatario}}"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
