import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { BookingStatusActions } from "@/components/forms/booking-status-actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, customers(id, full_name, phone), cars(id, plate_number, make, model)")
    .eq("id", params.id)
    .single();

  if (!booking) notFound();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("booking_id", params.id)
    .maybeSingle();

  const customer = (booking as any).customers;
  const car = (booking as any).cars;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`حجز رقم #${booking.booking_number}`}
        description={booking.service_type}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card grid gap-4 sm:grid-cols-2">
            <Info label="العميل" value={
              <Link href={`/customers/${customer.id}`} className="font-medium text-brand-700">{customer.full_name}</Link>
            } />
            <Info label="هاتف العميل" value={customer.phone} />
            <Info label="السيارة" value={
              <Link href={`/cars/${car.id}`} className="font-medium text-brand-700">{car.plate_number} — {car.make} {car.model}</Link>
            } />
            <Info label="السائق" value={booking.driver_name || "—"} />
            <Info label="موقع الانطلاق" value={booking.pickup_location || "—"} />
            <Info label="موقع الوصول" value={booking.dropoff_location || "—"} />
            <Info label="من" value={formatDateTime(booking.start_datetime)} />
            <Info label="إلى" value={formatDateTime(booking.end_datetime)} />
            <Info label="نموذج التسعير" value={booking.pricing_model} />
            <Info label="الحالة" value={<StatusBadge status={booking.status} />} />
          </div>

          <div className="card grid gap-4 sm:grid-cols-2">
            <Info label="المبلغ الإجمالي" value={formatCurrency(booking.total_amount)} />
            <Info label="العربون" value={formatCurrency(booking.deposit_amount)} />
          </div>
        </div>

        <div>
          <BookingStatusActions
            bookingId={booking.id}
            currentStatus={booking.status}
            invoiceId={invoice?.id ?? null}
          />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-ink-900/50">{label}</p>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
