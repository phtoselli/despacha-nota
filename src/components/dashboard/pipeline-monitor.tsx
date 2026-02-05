"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, StopCircle, CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PipelineItem } from "@/types";

interface PipelineMonitorProps {
  items: PipelineItem[];
  onRefresh: () => void;
}

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  processing: { label: "Processando", icon: Loader2, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  awaiting_confirmation: { label: "Aguardando", icon: Clock, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  success: { label: "Sucesso", icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  error: { label: "Erro", icon: AlertTriangle, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  cancelled: { label: "Cancelado", icon: StopCircle, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
};

export function PipelineMonitor({ items, onRefresh }: PipelineMonitorProps) {
  const handleCancel = async (id: string) => {
    try {
      const res = await fetch("/api/pipeline/" + id + "/cancel", { method: "POST" });
      if (res.ok) {
        toast.success("Emissao cancelada");
        onRefresh();
      } else {
        toast.error("Erro ao cancelar emissao");
      }
    } catch {
      toast.error("Erro ao cancelar emissao");
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhuma emissao em andamento
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Atualizar
        </Button>
      </div>
      {items.map((item) => {
        const config = statusConfig[item.status];
        return (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <config.icon className={"h-5 w-5 " + (item.status === "processing" ? "animate-spin" : "")} />
                <div>
                  <p className="font-medium">{item.config_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.started_at).toLocaleString("pt-BR")}
                  </p>
                  {item.error_message && (
                    <p className="text-sm text-destructive mt-1">{item.error_message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={config.color}>{config.label}</Badge>
                {(item.status === "error" || item.status === "processing") && (
                  <Button variant="outline" size="sm" onClick={() => handleCancel(item.id)}>
                    <StopCircle className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
