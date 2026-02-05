"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TOTPInput } from "./totp-input";
import { Loader2 } from "lucide-react";

interface TOTPSetupProps {
  qrCodeDataUrl: string;
  secret: string;
  onVerify: (code: string) => Promise<boolean>;
}

export function TOTPSetup({ qrCodeDataUrl, secret, onVerify }: TOTPSetupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const success = await onVerify(code);
      if (!success) {
        setError("Codigo invalido. Tente novamente.");
      }
    } catch {
      setError("Erro ao verificar codigo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Configure seu autenticador</h3>
        <p className="text-sm text-muted-foreground">
          Escaneie o QR Code abaixo com o Google Authenticator ou outro app TOTP
        </p>
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg">
          <Image
            src={qrCodeDataUrl}
            alt="QR Code TOTP"
            width={256}
            height={256}
          />
        </div>
      </div>

      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSecret(!showSecret)}
        >
          {showSecret ? "Ocultar" : "Mostrar"} chave manual
        </Button>
        {showSecret && (
          <p className="mt-2 font-mono text-sm bg-muted p-2 rounded break-all select-all">
            {secret}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-center text-muted-foreground">
          Digite o codigo de 6 digitos do seu autenticador
        </p>
        <TOTPInput onComplete={handleVerify} disabled={loading} />
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
