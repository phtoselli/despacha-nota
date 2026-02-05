"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { TOTPSetup } from "./totp-setup";
import { createClient } from "@/lib/supabase/client";

type Step = "form" | "totp";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totpData, setTotpData] = useState<{ qrCode: string; secret: string; email: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar");
        return;
      }

      setTotpData(data);
      setStep("totp");
    } catch {
      setError("Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  const handleTOTPVerify = async (code: string): Promise<boolean> => {
    if (!totpData) return false;

    const res = await fetch("/api/auth/verify-totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email: totpData.email }),
    });

    if (res.ok) {
      // Sign in and redirect
      const supabase = createClient();
      await supabase.auth.signInWithPassword({ email, password });
      router.push("/");
      return true;
    }

    return false;
  };

  if (step === "totp" && totpData) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Configurar Autenticador</CardTitle>
          <CardDescription>
            Configure o autenticador para proteger sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TOTPSetup
            qrCodeDataUrl={totpData.qrCode}
            secret={totpData.secret}
            onVerify={handleTOTPVerify}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Criar Conta</CardTitle>
        <CardDescription>Preencha seus dados para se cadastrar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Minimo 8 caracteres, 1 maiuscula, 1 numero e 1 caractere especial
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Ja tem conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
