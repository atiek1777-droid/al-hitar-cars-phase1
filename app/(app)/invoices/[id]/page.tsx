import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentForm } from "@/components/forms/payment-form";
import { formatCurrency, formatDate, generateWhatsAppInvoiceLink } from "@/lib/utils";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(id, full_name, phone), bookings(booking_number, service_type)")
    .eq("id", params.id)
    .single();

  if (!invoice) notFound();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", params.id)
    .order("paid_at", { ascending: false });

  const customer = (invoice as any).customers;
  const booking = (invoice as any).bookings;
  const remaining = invoice.total_amount - invoice.paid_amount;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`فاتورة #${invoice.invoice_number}`}
        description={`${customer.full_name} — حجز ${booking?.service_type ?? ""} #${booking?.booking_number ?? ""}`}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href={`/invoices/${invoice.id}/print`} className="btn-secondary" target="_blank">
          <Printer className="h-4 w-4" /> طباعة / تصدير PDF
        </Link>
        <a
          href={generateWhatsAppInvoiceLink(customer.phone, invoice.invoice_number, invoice.total_amount)}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          <MessageCircle className="h-4 w-4" /> مشاركة عبر واتساب
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card grid gap-4 sm:grid-cols-3">
            <div><p className="text-xs text-ink-900/50">الإجمالي</p><p className="mt-1 text-lg font-bold">{formatCurrency(invoice.total_amount)}</p></div>
            <div><p className="text-xs text-ink-900/50">المدفوع</p><p className="mt-1 text-lg font-bold text-emerald-600">{formatCurrency(invoice.paid_amount)}</p></div>
            <div><p className="text-xs text-ink-900/50">المتبقي</p><p className="mt-1 text-lg font-bold text-red-600">{formatCurrency(remaining)}</p></div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-900/70">سجل الدفعات</h2>
            {payments && payments.length > 0 ? (
              <div className="card overflow-x-auto p-0">
                <table className="table-base">
                  <thead><tr><th>التاريخ</th><th>المبلغ</th><th>الطريقة</th><th>ملاحظات</th></tr></thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{formatDate(p.paid_at)}</td>
                        <td>{formatCurrency(p.amount)}</td>
                        <td>{p.payment_method}</td>
                        <td>{p.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-ink-900/40">لا توجد دفعات مسجلة بعد</p>
            )}
          </div>
        </div>

        <div>
          {remaining > 0 ? (
            <div className="card">
              <h2 className="mb-4 text-sm font-semibold text-ink-900/70">تسجيل دفعة جديدة</h2>
              <PaymentForm invoiceId={invoice.id} remaining={remaining} />
            </div>
          ) : (
            <div className="card text-center text-sm font-medium text-emerald-600">
              تم سداد الفاتورة بالكامل
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
