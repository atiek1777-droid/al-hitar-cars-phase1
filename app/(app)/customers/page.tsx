import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBox } from "@/components/shared/search-box";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";

const PAGE_SIZE = 10;

export default async function CustomersPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.q) {
    query = query.or(`full_name.ilike.%${searchParams.q}%,phone.ilike.%${searchParams.q}%`);
  }

  const { data: customers, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="العملاء"
        description="سجل العملاء الأفراد والشركات"
        action={{ label: "إضافة عميل", href: "/customers/new", icon: Plus }}
      />

      <div className="mb-4">
        <SearchBox placeholder="بحث بالاسم أو الهاتف..." />
      </div>

      {customers && customers.length > 0 ? (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>النوع</th>
                <th>الشركة</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/customers/${c.id}`} className="font-medium text-brand-700">
                      {c.full_name}
                    </Link>
                  </td>
                  <td dir="ltr" className="text-right">{c.phone}</td>
                  <td>{c.customer_type}</td>
                  <td>{c.company_name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Users} title="لا يوجد عملاء" description="ابدأ بإضافة أول عميل" />
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
