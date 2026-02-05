"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiKeyForm } from "./api-key-form";
import { NotificationPrefs } from "./notification-prefs";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";
import { TOTPManagement } from "./totp-management";
import { createClient } from "@/lib/supabase/client";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

interface SettingsData {
  hasApiKey: boolean;
  autoSend: boolean;
  requireConfirmation: boolean;
  totpConfigured: boolean;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [email, setEmail] = useState("");
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setEmail(user.email);

        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            hasApiKey: !!data.government_api_key_encrypted,
            autoSend: data.auto_send ?? false,
            requireConfirmation: data.require_confirmation ?? true,
            totpConfigured: data.totp_verified ?? false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configuracoes</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Carregando...</div>
            </div>
          ) : (
            <div className="grid gap-6">
              <ApiKeyForm hasKey={settings?.hasApiKey ?? false} />
              <NotificationPrefs
                autoSend={settings?.autoSend ?? false}
                requireConfirmation={settings?.requireConfirmation ?? true}
              />
              <ChangeEmailForm currentEmail={email} />
              <ChangePasswordForm />
              <TOTPManagement isConfigured={settings?.totpConfigured ?? false} />
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
