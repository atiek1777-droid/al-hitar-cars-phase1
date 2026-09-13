"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { carSchema, type CarInput } from "@/lib/validations";

export async function createCar(input: CarInput) {
  const parsed = carSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.from("cars").insert(parsed.data).select("id").single();

  if (error) {
    if (error.code === "23505") return { error: "رقم اللوحة مستخدم مسبقاً لسيارة أخرى" };
    return { error: "تعذر حفظ السيارة، حاول مجدداً" };
  }

  revalidatePath("/cars");
  return { id: data.id };
}

export async function updateCar(id: string, input: CarInput) {
  const parsed = carSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cars").update(parsed.data).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "رقم اللوحة مستخدم مسبقاً لسيارة أخرى" };
    return { error: "تعذر تحديث السيارة" };
  }

  revalidatePath("/cars");
  revalidatePath(`/cars/${id}`);
  return { id };
}
