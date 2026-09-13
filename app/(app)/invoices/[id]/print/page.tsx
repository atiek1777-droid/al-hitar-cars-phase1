import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/shared/print-button";
import { formatCurrency, formatDate, numberToArabicWords } from "@/lib/utils";

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(full_name, phone, address), bookings(*, cars(plate_number, make, model))")
    .eq("id", params.id)
    .single();

  if (!invoice) notFound();

  const customer = (invoice as any).customers;
  const booking = (invoice as any).bookings;
  const car = booking?.cars;
  const remaining = invoice.total_amount - invoice.paid_amount;

  return (
    <div className="mx-auto flex justify-center bg-ink-50 py-6 print:bg-white print:py-0">
      <div className="w-[148mm] min-h-[210mm] bg-white p-8 text-sm shadow-card print:shadow-none">
        <div className="mb-4 flex justify-end">
          <PrintButton />
        </div>

        <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
          <div>
            <h1 className="text-lg font-bold">مكتب الهتار كارز</h1>
            <p className="text-xs text-ink-900/60">AL-HITAR CARS</p>
            <p className="mt-1 text-xs text-ink-900/60">صنعاء - الحصبة، أمام بوابة حديقة الثورة الغربية</p>
            <p className="text-xs text-ink-900/60" dir="ltr">777917111 | 775555405</p>
          </div>
          <div className="relative h-16 w-28">
            <Image src="/logo.png" alt="الهتار كارز" fill className="object-contain" />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">فاتورة رقم #{invoice.invoice_number}</h2>
          <p className="text-xs text-ink-900/60">{formatDate(invoice.created_at)}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-black/[0.03] p-3 text-xs">
          <div><span className="text-ink-900/50">العميل: </span>{customer.full_name}</div>
          <div><span className="text-ink-900/50">الهاتف: </span><span dir="ltr">{customer.phone}</span></div>
          {customer.address && <div className="col-span-2"><span className="text-ink-900/50">العنوان: </span>{customer.address}</div>}
        </div>

        <table className="mb-4 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/10 text-ink-900/60">
              <th className="py-2 text-right">الخدمة</th>
              <th className="py-2 text-right">السيارة</th>
              <th className="py-2 text-right">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/5">
              <td className="py-2">{booking?.service_type ?? "—"}</td>
              <td className="py-2">{car ? `${car.plate_number} — ${car.make} ${car.model}` : "—"}</td>
              <td className="py-2">{formatCurrency(invoice.total_amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-4 flex justify-end">
          <div className="w-56 space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-ink-900/50">الإجمالي</span><span className="font-medium">{formatCurrency(invoice.total_amount)}</span></div>
            <div className="flex justify-between"><span className="text-ink-900/50">المدفوع</span><span className="font-medium text-emerald-600">{formatCurrency(invoice.paid_amount)}</span></div>
            <div className="flex justify-between border-t border-black/10 pt-1"><span className="text-ink-900/50">المتبقي</span><span className="font-bold text-red-600">{formatCurrency(remaining)}</span></div>
          </div>
        </div>

        <p className="mb-8 rounded-lg bg-black/[0.03] p-3 text-xs">
          <span className="text-ink-900/50">المبلغ كتابة: </span>{numberToArabicWords(invoice.total_amount)}
        </p>

        <div className="mt-16 flex justify-between text-xs text-ink-900/60">
          <div>توقيع المكتب</div>
          <div>توقيع العميل</div>
        </div>
      </div>
    </div>
  );
}
