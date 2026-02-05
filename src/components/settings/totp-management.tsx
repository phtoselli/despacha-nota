"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOTPSetup } from "@/components/auth/totp-setup";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface TOTPManagementProps {
  isConfigured: boolean;
}

export function TOTPManagement({ isConfigured }: TOTPManagementProps) {
  const [resetting, setResetting] = useState(false);
  const [totpData, setTotpData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_totp" }),
      });
      if (res.ok) {
        const data = await res.json();
        setTotpData({ qrCode: data.qrCode, secret: data.secret });
        setResetting(true);
      } else {
        toast.error("Erro ao resetar autenticador");
      }
    } catch {
      toast.error("Erro ao resetar autenticador");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code: string): Promise<boolean> => {
    const res = await fetch("/api/auth/verify-totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      toast.success("Autenticador reconfigurado com sucesso");
      setResetting(false);
      setTotpData(null);
      return true;
    }
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Autenticacao em Dois Fatores (TOTP)
        </CardTitle>
        <CardDescription>Gerencie a conexao com seu aplicativo autenticador</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!resetting ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Badge variant={isConfigured ? "default" : "destructive"}>
                {isConfigured ? "Configurado" : "Nao configurado"}
              </Badge>
            </div>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isConfigured ? "Reconfigurar Autenticador" : "Configurar Autenticador"}
            </Button>
          </>
        ) : totpData ? (
          <TOTPSetup qrCodeDataUrl={totpData.qrCode} secret={totpData.secret} onVerify={handleVerify} />
        ) : null}
      </CardContent>
    </Card>
  );
}
