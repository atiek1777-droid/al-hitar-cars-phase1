import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  // حالات السيارة
  "متاحة": "bg-emerald-50 text-emerald-700",
  "محجوزة": "bg-amber-50 text-amber-700",
  "صيانة": "bg-orange-50 text-orange-700",
  "غير نشطة": "bg-gray-100 text-gray-500",
  // حالات الحجز
  "مسودة": "bg-gray-100 text-gray-500",
  "مؤكد": "bg-blue-50 text-blue-700",
  "جاري": "bg-amber-50 text-amber-700",
  "مكتمل": "bg-emerald-50 text-emerald-700",
  "ملغي": "bg-red-50 text-red-700"
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("badge", colorMap[status] || "bg-gray-100 text-gray-600")}>{status}</span>;
}
