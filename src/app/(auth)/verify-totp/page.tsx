"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TOTPInput } from "@/components/auth/totp-input";
import { Loader2, ShieldCheck } from "lucide-react";

export default function VerifyTOTPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        setError("Codigo invalido. Tente novamente.");
      }
    } catch {
      setError("Erro ao verificar codigo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verificacao 2FA</CardTitle>
        <CardDescription>
          Digite o codigo do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TOTPInput onComplete={handleVerify} disabled={loading} />
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </CardContent>
    </Card>
  );
}
