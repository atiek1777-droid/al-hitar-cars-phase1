"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, type BookingInput } from "@/lib/validations";

/** يعيد قائمة السيارات المتاحة (غير محجوزة فعلياً) خلال الفترة الزمنية المطلوبة */
export async function getAvailableCars(start: string, end: string, excludeBookingId?: string) {
  const supabase = createClient();

  const { data: allCars } = await supabase
    .from("cars")
    .select("*")
    .neq("status", "غير نشطة")
    .neq("status", "صيانة")
    .order("plate_number");

  if (!allCars) return [];
  if (!start || !end) return allCars;

  let overlapQuery = supabase
    .from("bookings")
    .select("car_id")
    .neq("status", "ملغي")
    .lt("start_datetime", end)
    .gt("end_datetime", start);

  if (excludeBookingId) {
    overlapQuery = overlapQuery.neq("id", excludeBookingId);
  }

  const { data: overlapping } = await overlapQuery;
  const bookedCarIds = new Set((overlapping ?? []).map((b) => b.car_id));

  return allCars.filter((car) => !bookedCarIds.has(car.id));
}

export async function createBooking(input: BookingInput) {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert(parsed.data)
    .select("id, booking_number")
    .single();

  if (error) {
    // انتهاك قيد منع التعارض الزمني على نفس السيارة (exclusion constraint)
    if (error.code === "23P01") {
      return { error: "هذه السيارة محجوزة بالفعل خلال هذه الفترة الزمنية" };
    }
    return { error: "تعذر إنشاء الحجز، حاول مجدداً" };
  }

  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/cars");
  return { id: data.id, booking_number: data.booking_number };
}

export async function updateBookingStatus(id: string, status: BookingInput["status"]) {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);

  if (error) return { error: "تعذر تحديث حالة الحجز" };

  revalidatePath("/bookings");
  revalidatePath(`/bookings/${id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

/** إنشاء فاتورة مرتبطة بالحجز إن لم توجد فاتورة له مسبقاً */
export async function createInvoiceFromBooking(bookingId: string) {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (existing) return { id: existing.id };

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, customer_id, total_amount")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) return { error: "لم يتم العثور على الحجز" };

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      booking_id: booking.id,
      customer_id: booking.customer_id,
      total_amount: booking.total_amount,
      paid_amount: 0
    })
    .select("id")
    .single();

  if (error) return { error: "تعذر إنشاء الفاتورة" };

  revalidatePath("/invoices");
  return { id: invoice.id };
}
