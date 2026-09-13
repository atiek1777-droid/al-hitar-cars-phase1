import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Wallet, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { CarForm } from "@/components/forms/car-form";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default async function CarDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  const supabase = createClient();

  const { data: car } = await supabase.from("cars").select("*").eq("id", params.id).single();
  if (!car) notFound();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_number, service_type, start_datetime, end_datetime, total_amount, status")
    .eq("car_id", params.id)
    .order("start_datetime", { ascending: false });

  const totalRevenue = (bookings ?? [])
    .filter((b) => b.status !== "ملغي")
    .reduce((sum, b) => sum + b.total_amount, 0);

  if (searchParams.edit) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title={`تعديل: ${car.plate_number}`} />
        <CarForm car={car} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={car.plate_number}
        description={`${car.make} ${car.model} — ${car.year}`}
        action={{ label: "تعديل", href: `/cars/${car.id}?edit=1`, icon: Pencil }}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs text-ink-900/50">إجمالي الإيرادات</p>
          <p className="mt-1 text-xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-ink-900/50">عدد الحجوزات</p>
          <p className="mt-1 text-xl font-bold">{bookings?.length ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-xs text-ink-900/50">الحالة الحالية</p>
          <p className="mt-1"><StatusBadge status={car.status} /></p>
        </div>
      </div>

      <div className="card mb-6 grid gap-4 sm:grid-cols-2">
        <Info label="اللون" value={car.color} />
        <Info label="النوع" value={car.car_type} />
        <Info label="نوع الملكية" value={car.ownership_type} />
        <Info label="العداد الحالي" value={`${car.current_odometer.toLocaleString("ar-YE")} كم`} />
        <Info label="سعر اليوم" value={formatCurrency(car.daily_price)} />
        <Info label="سعر الرحلة" value={car.trip_price ? formatCurrency(car.trip_price) : "—"} />
        <Info label="سعر الكيلومتر" value={car.km_price ? formatCurrency(car.km_price) : "—"} />
        <Info label="انتهاء التأمين" value={car.insurance_expiry ? formatDate(car.insurance_expiry) : "—"} />
        <Info label="انتهاء الرخصة" value={car.license_expiry ? formatDate(car.license_expiry) : "—"} />
        {car.notes && <Info label="ملاحظات" value={car.notes} />}
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900/70">
        <CalendarClock className="h-4 w-4" /> سجل الحجوزات
      </h2>
      {bookings && bookings.length > 0 ? (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>الخدمة</th>
                <th>من</th>
                <th>إلى</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/bookings/${b.id}`} className="font-medium text-brand-700">
                      #{b.booking_number}
                    </Link>
                  </td>
                  <td>{b.service_type}</td>
                  <td>{formatDateTime(b.start_datetime)}</td>
                  <td>{formatDateTime(b.end_datetime)}</td>
                  <td>{formatCurrency(b.total_amount)}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-900/40">لا توجد حجوزات لهذه السيارة بعد</p>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-900/50">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
