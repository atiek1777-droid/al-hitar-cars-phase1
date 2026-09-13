"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { Profile } from "@/lib/types";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen lg:flex-row-reverse">
      <div className="print:hidden">
        <Sidebar role={profile.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="print:hidden">
          <Topbar profile={profile} onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 p-4 print:p-0 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
