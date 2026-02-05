import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { DashboardMetrics } from "@/types";

interface MetricsCardsProps {
  metrics: DashboardMetrics | null;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    { title: "Total de Notas", value: metrics?.total_invoices ?? 0, icon: FileText, color: "text-blue-600" },
    { title: "Enviadas este Mes", value: metrics?.sent_this_month ?? 0, icon: CheckCircle, color: "text-green-600" },
    { title: "Pendentes", value: metrics?.pending ?? 0, icon: Clock, color: "text-yellow-600" },
    { title: "Erros", value: metrics?.errors ?? 0, icon: AlertTriangle, color: "text-red-600" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
