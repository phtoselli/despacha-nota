"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface ChangeEmailFormProps {
  currentEmail: string;
}

export function ChangeEmailForm({ currentEmail }: ChangeEmailFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Email de confirmacao enviado para o novo endereco");
        setNewEmail("");
      }
    } catch {
      toast.error("Erro ao alterar email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Alterar Email
        </CardTitle>
        <CardDescription>Email atual: {currentEmail}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_email">Novo Email</Label>
            <Input id="new_email" type="email" placeholder="novo@email.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading || !newEmail}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Alterar Email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
