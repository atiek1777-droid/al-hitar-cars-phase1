"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { paymentSchema, type PaymentInput } from "@/lib/validations";

export async function createPayment(input: PaymentInput) {
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = createClient();

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, total_amount, paid_amount")
    .eq("id", parsed.data.invoice_id)
    .single();

  if (invoiceError || !invoice) return { error: "لم يتم العثور على الفاتورة" };

  const remaining = invoice.total_amount - invoice.paid_amount;
  if (parsed.data.amount > remaining) {
    return { error: `المبلغ أكبر من المتبقي على الفاتورة (المتبقي: ${remaining.toLocaleString("ar-YE")} ريال)` };
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: parsed.data.invoice_id,
      amount: parsed.data.amount,
      payment_method: parsed.data.payment_method,
      notes: parsed.data.notes ?? null
    })
    .select("id")
    .single();

  if (error) return { error: "تعذر تسجيل الدفعة" };

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ paid_amount: invoice.paid_amount + parsed.data.amount })
    .eq("id", invoice.id);

  if (updateError) return { error: "تم تسجيل الدفعة لكن تعذر تحديث رصيد الفاتورة" };

  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath("/dashboard");
  return { id: payment.id };
}
