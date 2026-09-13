import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, FileText, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { CustomerForm } from "@/components/forms/customer-form";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function CustomerDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  const supabase = createClient();

  const { data: customer } = await supabase.from("customers").select("*").eq("id", params.id).single();
  if (!customer) notFound();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_number, service_type, start_datetime, total_amount, status")
    .eq("customer_id", params.id)
    .order("start_datetime", { ascending: false });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, total_amount, paid_amount, created_at")
    .eq("customer_id", params.id)
    .order("created_at", { ascending: false });

  const outstanding = (invoices ?? []).reduce(
    (sum, inv) => sum + (inv.total_amount - inv.paid_amount),
    0
  );

  if (searchParams.edit) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title={`تعديل: ${customer.full_name}`} />
        <CustomerForm customer={customer} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={customer.full_name}
        description={customer.customer_type === "شركة" ? customer.company_name ?? "" : "عميل فرد"}
        action={{ label: "تعديل", href: `/customers/${customer.id}?edit=1`, icon: Pencil }}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs text-ink-900/50">الرصيد المستحق</p>
          <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(outstanding)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-ink-900/50">عدد الحجوزات</p>
          <p className="mt-1 text-xl font-bold">{bookings?.length ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-xs text-ink-900/50">عدد الفواتير</p>
          <p className="mt-1 text-xl font-bold">{invoices?.length ?? 0}</p>
        </div>
      </div>

      <div className="card mb-6 grid gap-4 sm:grid-cols-2">
        <Info label="الهاتف" value={customer.phone} />
        <Info label="هاتف إضافي" value={customer.phone2 || "—"} />
        <Info label="رقم الهوية" value={customer.national_id || "—"} />
        <Info label="العنوان" value={customer.address || "—"} />
        {customer.notes && <Info label="ملاحظات" value={customer.notes} />}
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900/70">
        <CalendarClock className="h-4 w-4" /> الحجوزات
      </h2>
      {bookings && bookings.length > 0 ? (
        <div className="card mb-6 overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr><th>رقم الحجز</th><th>الخدمة</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><Link href={`/bookings/${b.id}`} className="font-medium text-brand-700">#{b.booking_number}</Link></td>
                  <td>{b.service_type}</td>
                  <td>{formatDateTime(b.start_datetime)}</td>
                  <td>{formatCurrency(b.total_amount)}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-6 text-sm text-ink-900/40">لا توجد حجوزات لهذا العميل بعد</p>
      )}

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900/70">
        <FileText className="h-4 w-4" /> الفواتير
      </h2>
      {invoices && invoices.length > 0 ? (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr><th>رقم الفاتورة</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th></tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td><Link href={`/invoices/${inv.id}`} className="font-medium text-brand-700">#{inv.invoice_number}</Link></td>
                  <td>{formatCurrency(inv.total_amount)}</td>
                  <td>{formatCurrency(inv.paid_amount)}</td>
                  <td>{formatCurrency(inv.total_amount - inv.paid_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-900/40">لا توجد فواتير لهذا العميل بعد</p>
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
