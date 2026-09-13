"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { paymentSchema, type PaymentInput } from "@/lib/validations";
import { createPayment } from "@/lib/actions/payments";

const PAYMENT_METHODS = ["نقداً", "تحويل بنكي", "محفظة إلكترونية"];

export function PaymentForm({
  invoiceId,
  remaining,
  onSuccess,
  invoiceOptions
}: {
  invoiceId?: string;
  remaining?: number;
  onSuccess?: () => void;
  /** عند عدم تمرير invoiceId، تُعرض قائمة اختيار الفاتورة (تُستخدم في صفحة /payments) */
  invoiceOptions?: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { invoice_id: invoiceId, payment_method: "نقداً", amount: remaining }
  });

  async function onSubmit(values: PaymentInput) {
    setServerError(null);
    setLoading(true);
    const result = await createPayment(values);
    setLoading(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    reset();
    if (onSuccess) onSuccess();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

      {invoiceId ? (
        <input type="hidden" {...register("invoice_id")} />
      ) : (
        <div>
          <label className="label-field">الفاتورة</label>
          <select className="input-field" {...register("invoice_id")}>
            <option value="">اختر الفاتورة...</option>
            {(invoiceOptions ?? []).map((inv) => (
              <option key={inv.id} value={inv.id}>{inv.label}</option>
            ))}
          </select>
          {errors.invoice_id && <p className="error-text">{errors.invoice_id.message}</p>}
        </div>
      )}

      <div>
        <label className="label-field">المبلغ (ريال)</label>
        <input type="number" className="input-field" {...register("amount")} />
        {errors.amount && <p className="error-text">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="label-field">طريقة الدفع</label>
        <select className="input-field" {...register("payment_method")}>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="label-field">ملاحظات</label>
        <input className="input-field" {...register("notes")} />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        تسجيل الدفعة
      </button>
    </form>
  );
}
