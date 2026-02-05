import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Signal } from "lucide-react";
import type { ApiHealthStatus } from "@/types";

interface ApiStatusBadgeProps {
  status: ApiHealthStatus;
}

const statusConfig = {
  online: { label: "API Online", variant: "default" as const, icon: Wifi, className: "bg-green-600 hover:bg-green-700" },
  slow: { label: "API Lenta", variant: "secondary" as const, icon: Signal, className: "bg-yellow-600 hover:bg-yellow-700 text-white" },
  offline: { label: "API Offline", variant: "destructive" as const, icon: WifiOff, className: "" },
};

export function ApiStatusBadge({ status }: ApiStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={"gap-1.5 " + config.className}>
      <config.icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
