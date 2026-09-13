"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { customerSchema, type CustomerInput } from "@/lib/validations";

export async function createCustomer(input: CustomerInput) {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { error: "تعذر حفظ العميل، حاول مجدداً" };

  revalidatePath("/customers");
  return { id: data.id };
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("customers").update(parsed.data).eq("id", id);

  if (error) return { error: "تعذر تحديث العميل" };

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return { id };
}
