"use client";

import { Menu, LogOut } from "lucide-react";
import type { Profile } from "@/lib/types";

const roleLabels: Record<string, string> = {
  owner: "المالك",
  accountant: "المحاسب",
  receptionist: "موظف الاستقبال"
};

export function Topbar({ profile, onMenuClick }: { profile: Profile; onMenuClick: () => void }) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/5 bg-white/80 px-4 backdrop-blur">
      <button className="lg:hidden" onClick={onMenuClick} aria-label="فتح القائمة">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="text-left">
          <p className="text-sm font-medium">{profile.full_name}</p>
          <p className="text-xs text-ink-900/50">{roleLabels[profile.role]}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-ink-900/70 hover:bg-black/5"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </div>
    </header>
  );
}
