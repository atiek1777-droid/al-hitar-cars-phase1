import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string; icon?: LucideIcon };
}) {
  const Icon = action?.icon;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-900/50">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-primary">
          {Icon && <Icon className="h-4 w-4" />}
          {action.label}
        </Link>
      )}
    </div>
  );
}
