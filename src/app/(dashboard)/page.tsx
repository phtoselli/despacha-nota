"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { ApiStatusBadge } from "@/components/dashboard/api-status-badge";
import { PipelineMonitor } from "@/components/dashboard/pipeline-monitor";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoiceFormModal } from "@/components/invoices/invoice-form-modal";
import type { DashboardMetrics, PipelineItem, InvoiceConfigDecrypted } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceConfigDecrypted[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceConfigDecrypted | null>(null);

  const fetchDashboard = async () => {
    try {
      const [metricsRes, pipelineRes] = await Promise.all([
        fetch("/api/metrics"),
        fetch("/api/pipeline"),
      ]);
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (pipelineRes.ok) setPipeline(await pipelineRes.json());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) setInvoices(await res.json());
    } catch {
      toast.error("Erro ao carregar configuracoes");
    }
  };

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchInvoices()]).finally(() => setLoading(false));
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (data: Record<string, unknown>) => {
    const url = editingInvoice ? "/api/invoices/" + editingInvoice.id : "/api/invoices";
    const method = editingInvoice ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error("Failed to save");
    toast.success(editingInvoice ? "Configuracao atualizada" : "Configuracao criada");
    fetchInvoices();
    setEditingInvoice(null);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/invoices/" + id, { method: "DELETE" });
      if (res.ok) {
        toast.success("Configuracao excluida");
        fetchInvoices();
      } else {
        toast.error("Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleToggleAutoSend = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/invoices/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_send_enabled: enabled }),
      });
      if (res.ok) {
        setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, auto_send_enabled: enabled } : inv)));
        toast.success(enabled ? "Envio automatico ativado" : "Envio automatico desativado");
      }
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleEdit = (invoice: InvoiceConfigDecrypted) => {
    setEditingInvoice(invoice);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visao geral do sistema de notas fiscais</p>
        </div>
        <ApiStatusBadge status={metrics?.api_status || "offline"} />
      </div>

      <MetricsCards metrics={metrics} />

      <div>
        <h2 className="text-xl font-semibold mb-4">Pipeline de Emissao</h2>
        <PipelineMonitor items={pipeline} onRefresh={fetchDashboard} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Notas Fiscais</h2>
          <Button onClick={() => { setEditingInvoice(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Configuracao
          </Button>
        </div>
        <InvoiceList invoices={invoices} onEdit={handleEdit} onDelete={handleDelete} onToggleAutoSend={handleToggleAutoSend} />
      </div>

      <InvoiceFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingInvoice(null); }} onSave={handleSave} invoice={editingInvoice} />
    </div>
  );
}
