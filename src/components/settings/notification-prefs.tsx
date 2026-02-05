"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell } from "lucide-react";
import { toast } from "sonner";

interface NotificationPrefsProps {
  autoSend: boolean;
  requireConfirmation: boolean;
}

export function NotificationPrefs({ autoSend: initialAutoSend, requireConfirmation: initialRequireConfirmation }: NotificationPrefsProps) {
  const [autoSend, setAutoSend] = useState(initialAutoSend);
  const [requireConfirmation, setRequireConfirmation] = useState(initialRequireConfirmation);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_send: autoSend, require_confirmation: requireConfirmation }),
      });
      if (res.ok) toast.success("Preferencias salvas");
      else toast.error("Erro ao salvar preferencias");
    } catch {
      toast.error("Erro ao salvar preferencias");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferencias de Envio
        </CardTitle>
        <CardDescription>Configure como o sistema deve se comportar ao emitir notas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Envio automatico global</Label>
            <p className="text-sm text-muted-foreground">Enviar notas automaticamente no dia configurado</p>
          </div>
          <Switch checked={autoSend} onCheckedChange={setAutoSend} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Exigir confirmacao</Label>
            <p className="text-sm text-muted-foreground">Notificar e aguardar confirmacao antes de enviar</p>
          </div>
          <Switch checked={requireConfirmation} onCheckedChange={setRequireConfirmation} />
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Preferencias
        </Button>
      </CardContent>
    </Card>
  );
}
