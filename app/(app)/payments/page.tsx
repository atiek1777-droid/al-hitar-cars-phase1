import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PaymentForm } from "@/components/forms/payment-form";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function PaymentsPage() {
  const profile = await requireProfile();
  await requireRole(profile, ["owner", "accountant"]);
  const supabase = createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, invoices(invoice_number, customers(full_name))")
    .order("paid_at", { ascending: false })
    .limit(50);

  const { data: openInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, total_amount, paid_amount, customers(full_name)")
    .order("created_at", { ascending: false });

  const invoiceOptions = (openInvoices ?? [])
    .filter((inv: any) => inv.total_amount - inv.paid_amount > 0)
    .map((inv: any) => ({
      id: inv.id,
      label: `#${inv.invoice_number} — ${inv.customers?.full_name ?? ""} (المتبقي: ${formatCurrency(inv.total_amount - inv.paid_amount)})`
    }));

  return (
    <div>
      <PageHeader title="المدفوعات" description="سجل جميع الدفعات المسجلة على الفواتير" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {payments && payments.length > 0 ? (
            <div className="card overflow-x-auto p-0">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>الفاتورة</th>
                    <th>العميل</th>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                    <th>الطريقة</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="font-medium text-brand-700">#{p.invoices?.invoice_number}</td>
                      <td>{p.invoices?.customers?.full_name ?? "—"}</td>
                      <td>{formatDateTime(p.paid_at)}</td>
                      <td>{formatCurrency(p.amount)}</td>
                      <td>{p.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Wallet} title="لا توجد دفعات مسجلة بعد" />
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-ink-900/70">تسجيل دفعة جديدة</h2>
          {invoiceOptions.length > 0 ? (
            <PaymentForm invoiceOptions={invoiceOptions} />
          ) : (
            <p className="text-sm text-ink-900/40">لا توجد فواتير عليها مبالغ متبقية حالياً</p>
          )}
        </div>
      </div>
    </div>
  );
}
