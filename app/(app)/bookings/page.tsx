import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBox } from "@/components/shared/search-box";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 10;

export default async function BookingsPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("bookings")
    .select(
      "id, booking_number, service_type, start_datetime, end_datetime, total_amount, status, customers(full_name), cars(plate_number)",
      { count: "exact" }
    )
    .order("start_datetime", { ascending: false })
    .range(from, to);

  const { data: bookings, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const filtered = searchParams.q
    ? (bookings ?? []).filter((b: any) =>
        `${b.customers?.full_name ?? ""} ${b.cars?.plate_number ?? ""} ${b.booking_number}`
          .toLowerCase()
          .includes(searchParams.q!.toLowerCase())
      )
    : bookings;

  return (
    <div>
      <PageHeader
        title="الحجوزات"
        description="جميع حجوزات السيارات والخدمات"
        action={{ label: "حجز جديد", href: "/bookings/new", icon: Plus }}
      />

      <div className="mb-4">
        <SearchBox placeholder="بحث برقم الحجز أو العميل أو السيارة..." />
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>الرقم</th>
                <th>العميل</th>
                <th>السيارة</th>
                <th>الخدمة</th>
                <th>الانطلاق</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b: any) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/bookings/${b.id}`} className="font-medium text-brand-700">#{b.booking_number}</Link>
                  </td>
                  <td>{b.customers?.full_name ?? "—"}</td>
                  <td>{b.cars?.plate_number ?? "—"}</td>
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
        <EmptyState icon={CalendarClock} title="لا توجد حجوزات" description="ابدأ بإنشاء أول حجز" />
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
