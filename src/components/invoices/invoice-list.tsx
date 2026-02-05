"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { DeleteConfirm } from "./delete-confirm";
import type { InvoiceConfigDecrypted } from "@/types";

interface InvoiceListProps {
  invoices: InvoiceConfigDecrypted[];
  onEdit: (invoice: InvoiceConfigDecrypted) => void;
  onDelete: (id: string) => void;
  onToggleAutoSend: (id: string, enabled: boolean) => void;
}

const statusConfig = {
  ready: { label: "Pronta p/ envio", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  pending_info: { label: "Aguardando info", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  sent: { label: "Enviada", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
};

export function InvoiceList({ invoices, onEdit, onDelete, onToggleAutoSend }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma configuracao de nota fiscal encontrada.
        <br />
        Clique em &quot;Nova Configuracao&quot; para comecar.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Dia</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Envio Automatico</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const status = statusConfig[invoice.status];
            return (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.name}</TableCell>
                <TableCell>{invoice.send_day || "-"}</TableCell>
                <TableCell>
                  <Badge className={status.className}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  <Switch checked={invoice.auto_send_enabled} onCheckedChange={(checked) => onToggleAutoSend(invoice.id, checked)} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(invoice)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteConfirm name={invoice.name} onConfirm={() => onDelete(invoice.id)} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
