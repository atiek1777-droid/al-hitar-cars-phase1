"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  CalendarClock,
  FileText,
  Wallet,
  Settings,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, roles: ["owner", "accountant", "receptionist"] },
  { href: "/cars", label: "السيارات", icon: Car, roles: ["owner", "accountant", "receptionist"] },
  { href: "/customers", label: "العملاء", icon: Users, roles: ["owner", "accountant", "receptionist"] },
  { href: "/bookings", label: "الحجوزات", icon: CalendarClock, roles: ["owner", "accountant", "receptionist"] },
  { href: "/invoices", label: "الفواتير", icon: FileText, roles: ["owner", "accountant", "receptionist"] },
  { href: "/payments", label: "المدفوعات", icon: Wallet, roles: ["owner", "accountant"] },
  { href: "/settings", label: "الإعدادات", icon: Settings, roles: ["owner"] }
] as const;

export function Sidebar({
  role,
  open,
  onClose
}: {
  role: UserRole;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = navItems.filter((item) => (item.roles as readonly string[]).includes(role));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 shrink-0 border-l border-black/5 bg-white transition-transform lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-black/5 px-4">
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-16">
              <Image src="/logo.png" alt="الهتار كارز" fill className="object-contain" />
            </div>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="إغلاق القائمة">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-900/70 hover:bg-black/5"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
