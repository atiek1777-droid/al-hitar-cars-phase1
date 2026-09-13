"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { updateBookingStatus, createInvoiceFromBooking } from "@/lib/actions/bookings";
import type { BookingStatus } from "@/lib/types";

const STATUSES: BookingStatus[] = ["مسودة", "مؤكد", "جاري", "مكتمل", "ملغي"];

export function BookingStatusActions({
  bookingId,
  currentStatus,
  invoiceId
}: {
  bookingId: string;
  currentStatus: BookingStatus;
  invoiceId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [invoicing, setInvoicing] = useState(false);

  function handleStatusChange(status: BookingStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, status);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  async function handleCreateInvoice() {
    setInvoicing(true);
    const result = await createInvoiceFromBooking(bookingId);
    setInvoicing(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/invoices/${result.id}`);
  }

  return (
    <div className="card space-y-3">
      <p className="text-xs font-medium text-ink-900/50">حالة الحجز</p>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            disabled={pending}
            onClick={() => handleStatusChange(s)}
            className={
              s === currentStatus
                ? "btn-primary px-3 py-1.5 text-xs"
                : "btn-secondary px-3 py-1.5 text-xs"
            }
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="border-t border-black/5 pt-3">
        {invoiceId ? (
          <a href={`/invoices/${invoiceId}`} className="btn-secondary">
            <FileText className="h-4 w-4" /> عرض الفاتورة
          </a>
        ) : (
          <button onClick={handleCreateInvoice} disabled={invoicing} className="btn-primary">
            {invoicing && <Loader2 className="h-4 w-4 animate-spin" />}
            <FileText className="h-4 w-4" /> إنشاء فاتورة لهذا الحجز
          </button>
        )}
      </div>
    </div>
  );
}
