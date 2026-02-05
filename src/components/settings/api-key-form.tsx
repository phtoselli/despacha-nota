"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyFormProps {
  hasKey: boolean;
}

export function ApiKeyForm({ hasKey }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ government_api_key: apiKey }),
      });
      if (res.ok) {
        toast.success("Chave da API salva com sucesso");
        setApiKey("");
      } else {
        toast.error("Erro ao salvar chave");
      }
    } catch {
      toast.error("Erro ao salvar chave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Chave da API do Governo
        </CardTitle>
        <CardDescription>
          {hasKey
            ? "Uma chave ja esta configurada. Insira uma nova para substitui-la."
            : "Configure sua chave de acesso a API de emissao de notas fiscais."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api_key">Chave da API (Focus NFe)</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api_key"
                type={showKey ? "text" : "password"}
                placeholder="Cole sua chave aqui"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleSave} disabled={loading || !apiKey.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
        {hasKey && (
          <p className="text-sm text-muted-foreground">
            A chave e armazenada de forma criptografada (AES-256-GCM).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
