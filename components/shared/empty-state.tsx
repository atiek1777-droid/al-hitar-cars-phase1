import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-black/10 py-16 text-center">
      <div className="mb-3 rounded-full bg-black/5 p-3">
        <Icon className="h-6 w-6 text-ink-900/40" />
      </div>
      <p className="font-medium text-ink-900/70">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-900/40">{description}</p>}
    </div>
  );
}
