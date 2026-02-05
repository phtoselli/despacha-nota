"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { SettingsModal } from "@/components/settings/settings-modal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
