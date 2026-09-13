"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { bookingSchema, type BookingInput } from "@/lib/validations";
import { createBooking, getAvailableCars } from "@/lib/actions/bookings";
import { CustomerForm } from "@/components/forms/customer-form";
import { formatCurrency } from "@/lib/utils";
import type { Car, Customer } from "@/lib/types";

const SERVICE_TYPES = [
  "تأجير يومي", "رحلة", "مطار", "زفاف", "تخرج", "حج", "عمرة", "جواز", "طيران"
] as const;

export function BookingForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service_type: "تأجير يومي",
      pricing_model: "يومي",
      status: "مؤكد",
      deposit_amount: 0,
      total_amount: 0
    }
  });

  const start = watch("start_datetime");
  const end = watch("end_datetime");
  const carId = watch("car_id");
  const pricingModel = watch("pricing_model");

  useEffect(() => {
    if (start && end) {
      getAvailableCars(start, end).then(setAvailableCars);
    }
  }, [start, end]);

  const selectedCar = useMemo(() => availableCars.find((c) => c.id === carId), [availableCars, carId]);

  const durationDays = useMemo(() => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [start, end]);

  function applySuggestedPrice() {
    if (!selectedCar) return;
    let suggested = 0;
    if (pricingModel === "يومي") suggested = selectedCar.daily_price * durationDays;
    else if (pricingModel === "رحلة") suggested = selectedCar.trip_price ?? 0;
    setValue("total_amount", suggested);
  }

  async function onSubmit(values: BookingInput) {
    setServerError(null);
    setLoading(true);
    const result = await createBooking(values);
    setLoading(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    router.push(`/bookings/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
      {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

      {/* العميل */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label-field !mb-0">العميل</label>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-brand-700"
            onClick={() => setShowNewCustomer((v) => !v)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            {showNewCustomer ? "اختيار عميل موجود" : "عميل جديد"}
          </button>
        </div>

        {showNewCustomer ? (
          <div className="rounded-lg border border-black/10 p-4">
            <CustomerForm
              onCreated={(id) => {
                setValue("customer_id", id);
                setSelectedCustomerId(id);
                setShowNewCustomer(false);
              }}
            />
          </div>
        ) : (
          <select
            className="input-field"
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setValue("customer_id", e.target.value);
            }}
          >
            <option value="">اختر العميل...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>
            ))}
          </select>
        )}
        {errors.customer_id && <p className="error-text">{errors.customer_id.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">تاريخ ووقت الانطلاق</label>
          <input type="datetime-local" className="input-field" {...register("start_datetime")} />
          {errors.start_datetime && <p className="error-text">{errors.start_datetime.message}</p>}
        </div>
        <div>
          <label className="label-field">تاريخ ووقت العودة</label>
          <input type="datetime-local" className="input-field" {...register("end_datetime")} />
          {errors.end_datetime && <p className="error-text">{errors.end_datetime.message}</p>}
        </div>
      </div>

      <div>
        <label className="label-field">السيارة (تظهر المتاحة فقط ضمن الفترة المحددة)</label>
        <select className="input-field" {...register("car_id")} disabled={!start || !end}>
          <option value="">{!start || !end ? "حدد التواريخ أولاً..." : "اختر السيارة..."}</option>
          {availableCars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.plate_number} — {car.make} {car.model} ({formatCurrency(car.daily_price)}/يوم)
            </option>
          ))}
        </select>
        {errors.car_id && <p className="error-text">{errors.car_id.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">نوع الخدمة</label>
          <select className="input-field" {...register("service_type")}>
            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">السائق (اختياري)</label>
          <input className="input-field" {...register("driver_name")} />
        </div>
        <div>
          <label className="label-field">موقع الانطلاق</label>
          <input className="input-field" {...register("pickup_location")} />
        </div>
        <div>
          <label className="label-field">موقع الوصول</label>
          <input className="input-field" {...register("dropoff_location")} />
        </div>
        <div>
          <label className="label-field">نموذج التسعير</label>
          <select className="input-field" {...register("pricing_model")}>
            <option value="يومي">يومي</option>
            <option value="رحلة">رحلة</option>
            <option value="كيلومتر">كيلومتر</option>
          </select>
        </div>
        <div>
          <label className="label-field">حالة الحجز</label>
          <select className="input-field" {...register("status")}>
            <option value="مسودة">مسودة</option>
            <option value="مؤكد">مؤكد</option>
            <option value="جاري">جاري</option>
            <option value="مكتمل">مكتمل</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label-field !mb-0">المبلغ الإجمالي (ريال)</label>
            {selectedCar && (
              <button type="button" className="text-xs font-medium text-brand-700" onClick={applySuggestedPrice}>
                اقتراح تلقائي
              </button>
            )}
          </div>
          <input type="number" className="input-field" {...register("total_amount")} />
          {errors.total_amount && <p className="error-text">{errors.total_amount.message}</p>}
        </div>
        <div>
          <label className="label-field">العربون (اختياري)</label>
          <input type="number" className="input-field" {...register("deposit_amount")} />
          {errors.deposit_amount && <p className="error-text">{errors.deposit_amount.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>إلغاء</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          إنشاء الحجز
        </button>
      </div>
    </form>
  );
}
