import Link from "next/link";
import { Car as CarIcon, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBox } from "@/components/shared/search-box";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 10;

export default async function CarsPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("cars")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.q) {
    query = query.or(
      `plate_number.ilike.%${searchParams.q}%,make.ilike.%${searchParams.q}%,model.ilike.%${searchParams.q}%`
    );
  }

  const { data: cars, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="السيارات"
        description="إدارة أسطول السيارات وحالتها وأسعارها"
        action={{ label: "إضافة سيارة", href: "/cars/new", icon: Plus }}
      />

      <div className="mb-4">
        <SearchBox placeholder="بحث برقم اللوحة أو الماركة..." />
      </div>

      {cars && cars.length > 0 ? (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>رقم اللوحة</th>
                <th>الماركة والموديل</th>
                <th>النوع</th>
                <th>سعر اليوم</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="cursor-pointer hover:bg-black/[0.02]">
                  <td>
                    <Link href={`/cars/${car.id}`} className="font-medium text-brand-700">
                      {car.plate_number}
                    </Link>
                  </td>
                  <td>{car.make} {car.model} ({car.year})</td>
                  <td>{car.car_type}</td>
                  <td>{formatCurrency(car.daily_price)}</td>
                  <td><StatusBadge status={car.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={CarIcon} title="لا توجد سيارات" description="ابدأ بإضافة أول سيارة إلى الأسطول" />
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
