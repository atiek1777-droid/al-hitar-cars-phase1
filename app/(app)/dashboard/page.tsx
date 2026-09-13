import { Car, CalendarClock, Wallet, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { KpiCard } from "@/components/shared/kpi-card";
import { RevenueChart } from "@/components/shared/revenue-chart";
import { formatCurrency } from "@/lib/utils";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function DashboardPage() {
  const profile = await requireProfile();
  const canSeeFinancials = profile.role !== "receptionist";
  const supabase = createClient();

  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: availableCount },
    { count: bookedCount },
    { count: todaysBookingsCount },
    { data: activeBookings },
    { data: monthlyPayments },
    { data: monthlyExpenses },
    { data: invoices },
    { data: thirtyDayBookings }
  ] = await Promise.all([
    supabase.from("cars").select("id", { count: "exact", head: true }).eq("status", "متاحة"),
    supabase.from("cars").select("id", { count: "exact", head: true }).eq("status", "محجوزة"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("start_datetime", todayStart)
      .neq("status", "ملغي"),
    supabase
      .from("bookings")
      .select("total_amount, start_datetime")
      .gte("start_datetime", todayStart)
      .neq("status", "ملغي"),
    supabase.from("payments").select("amount").gte("paid_at", monthStart),
    // لا يوجد جدول مصروفات في المرحلة الأولى — القيمة صفر مؤقتاً حتى المرحلة الثانية
    Promise.resolve({ data: [] as { amount: number }[] }),
    supabase.from("invoices").select("total_amount, paid_amount"),
    supabase
      .from("bookings")
      .select("total_amount, start_datetime")
      .gte("start_datetime", thirtyDaysAgo)
      .neq("status", "ملغي")
  ]);

  const todaysRevenue = (activeBookings ?? []).reduce((sum, b) => sum + b.total_amount, 0);
  const monthlyRevenue = (monthlyPayments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const monthlyExpensesTotal = (monthlyExpenses ?? []).reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalDebt = (invoices ?? []).reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);

  const chartMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("ar-EG-u-nu-latn", { month: "2-digit", day: "2-digit" });
    chartMap.set(key, 0);
  }
  (thirtyDayBookings ?? []).forEach((b) => {
    const key = new Date(b.start_datetime).toLocaleDateString("ar-EG-u-nu-latn", { month: "2-digit", day: "2-digit" });
    if (chartMap.has(key)) chartMap.set(key, (chartMap.get(key) ?? 0) + b.total_amount);
  });
  const chartData = Array.from(chartMap.entries()).map(([date, total]) => ({ date, total }));

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">لوحة التحكم</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="سيارات متاحة" value={String(availableCount ?? 0)} icon={CheckCircle2} tone="brand" />
        <KpiCard label="سيارات محجوزة" value={String(bookedCount ?? 0)} icon={Car} tone="amber" />
        <KpiCard label="حجوزات اليوم" value={String(todaysBookingsCount ?? 0)} icon={CalendarClock} tone="brand" />
        {canSeeFinancials && (
          <>
            <KpiCard label="إيرادات اليوم" value={formatCurrency(todaysRevenue)} icon={TrendingUp} tone="brand" />
            <KpiCard label="إيرادات الشهر" value={formatCurrency(monthlyRevenue)} icon={Wallet} tone="brand" />
            <KpiCard label="مصروفات الشهر" value={formatCurrency(monthlyExpensesTotal)} icon={TrendingDown} tone="amber" />
            <KpiCard label="إجمالي ديون العملاء" value={formatCurrency(totalDebt)} icon={AlertCircle} tone="red" />
          </>
        )}
      </div>

      {canSeeFinancials && (
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-ink-900/70">إيرادات آخر ٣٠ يوم</h2>
          <RevenueChart data={chartData} />
        </div>
      )}
    </div>
  );
}
