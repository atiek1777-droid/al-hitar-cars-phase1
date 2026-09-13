import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "brand"
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "brand" | "red" | "amber";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700"
  } as const;

  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-xs text-ink-900/50">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
      <div className={`rounded-lg p-2.5 ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
