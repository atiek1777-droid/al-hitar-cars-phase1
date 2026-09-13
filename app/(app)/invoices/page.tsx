import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBox } from "@/components/shared/search-box";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: invoices, count } = await supabase
    .from("invoices")
    .select("id, invoice_number, total_amount, paid_amount, created_at, customers(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const filtered = searchParams.q
    ? (invoices ?? []).filter((inv: any) =>
        `${inv.customers?.full_name ?? ""} ${inv.invoice_number}`
          .toLowerCase()
          .includes(searchParams.q!.toLowerCase())
      )
    : invoices;

  return (
    <div>
      <PageHeader title="الفواتير" description="فواتير الحجوزات والمدفوعات" />

      <div className="mb-4">
        <SearchBox placeholder="بحث برقم الفاتورة أو العميل..." />
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>الرقم</th>
                <th>العميل</th>
                <th>التاريخ</th>
                <th>الإجمالي</th>
                <th>المدفوع</th>
                <th>المتبقي</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv: any) => {
                const remaining = inv.total_amount - inv.paid_amount;
                return (
                  <tr key={inv.id}>
                    <td><Link href={`/invoices/${inv.id}`} className="font-medium text-brand-700">#{inv.invoice_number}</Link></td>
                    <td>{inv.customers?.full_name ?? "—"}</td>
                    <td>{formatDate(inv.created_at)}</td>
                    <td>{formatCurrency(inv.total_amount)}</td>
                    <td>{formatCurrency(inv.paid_amount)}</td>
                    <td className={remaining > 0 ? "text-red-600" : "text-emerald-600"}>
                      {formatCurrency(remaining)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={FileText} title="لا توجد فواتير بعد" />
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
