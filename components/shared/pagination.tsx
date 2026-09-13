"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        className="btn-secondary px-3 py-1.5"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="text-sm text-ink-900/60">
        صفحة {page} من {totalPages}
      </span>
      <button
        className="btn-secondary px-3 py-1.5"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
}
