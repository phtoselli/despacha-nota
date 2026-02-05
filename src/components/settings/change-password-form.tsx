"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Senhas nao conferem");
      return;
    }

    if (newPassword.length < 8) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Senha deve conter maiuscula, numero e caractere especial");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(updateError.message);
      } else {
        toast.success("Senha alterada com sucesso");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Alterar Senha
        </CardTitle>
        <CardDescription>Atualize sua senha de acesso</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">Nova Senha</Label>
            <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <p className="text-xs text-muted-foreground">Min. 8 caracteres, 1 maiuscula, 1 numero, 1 especial</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
            <Input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Alterar Senha
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
