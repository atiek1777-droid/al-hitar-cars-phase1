"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { carSchema, type CarInput } from "@/lib/validations";
import { createCar, updateCar } from "@/lib/actions/cars";
import type { Car } from "@/lib/types";

export function CarForm({ car }: { car?: Car }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CarInput>({
    resolver: zodResolver(carSchema),
    defaultValues: car
      ? {
          plate_number: car.plate_number,
          make: car.make,
          model: car.model,
          year: car.year,
          color: car.color,
          car_type: car.car_type,
          ownership_type: car.ownership_type,
          daily_price: car.daily_price,
          trip_price: car.trip_price ?? undefined,
          km_price: car.km_price ?? undefined,
          insurance_expiry: car.insurance_expiry ?? undefined,
          license_expiry: car.license_expiry ?? undefined,
          status: car.status,
          current_odometer: car.current_odometer,
          notes: car.notes ?? undefined
        }
      : { status: "متاحة", ownership_type: "ملك المكتب", current_odometer: 0 }
  });

  async function onSubmit(values: CarInput) {
    setServerError(null);
    setLoading(true);
    const result = car ? await updateCar(car.id, values) : await createCar(values);
    setLoading(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    router.push(`/cars/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
      {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">رقم اللوحة</label>
          <input className="input-field" {...register("plate_number")} />
          {errors.plate_number && <p className="error-text">{errors.plate_number.message}</p>}
        </div>
        <div>
          <label className="label-field">اللون</label>
          <input className="input-field" {...register("color")} />
          {errors.color && <p className="error-text">{errors.color.message}</p>}
        </div>
        <div>
          <label className="label-field">الماركة</label>
          <input className="input-field" {...register("make")} />
          {errors.make && <p className="error-text">{errors.make.message}</p>}
        </div>
        <div>
          <label className="label-field">الموديل</label>
          <input className="input-field" {...register("model")} />
          {errors.model && <p className="error-text">{errors.model.message}</p>}
        </div>
        <div>
          <label className="label-field">سنة الصنع</label>
          <input type="number" className="input-field" {...register("year")} />
          {errors.year && <p className="error-text">{errors.year.message}</p>}
        </div>
        <div>
          <label className="label-field">نوع السيارة</label>
          <select className="input-field" {...register("car_type")}>
            <option value="صالون">صالون</option>
            <option value="دفع رباعي">دفع رباعي</option>
            <option value="حافلة">حافلة</option>
            <option value="فخم">فخم</option>
          </select>
        </div>
        <div>
          <label className="label-field">نوع الملكية</label>
          <select className="input-field" {...register("ownership_type")}>
            <option value="ملك المكتب">ملك المكتب</option>
            <option value="خارجي">خارجي</option>
          </select>
        </div>
        <div>
          <label className="label-field">الحالة الحالية</label>
          <select className="input-field" {...register("status")}>
            <option value="متاحة">متاحة</option>
            <option value="محجوزة">محجوزة</option>
            <option value="صيانة">صيانة</option>
            <option value="غير نشطة">غير نشطة</option>
          </select>
        </div>
        <div>
          <label className="label-field">سعر اليوم (ريال)</label>
          <input type="number" className="input-field" {...register("daily_price")} />
          {errors.daily_price && <p className="error-text">{errors.daily_price.message}</p>}
        </div>
        <div>
          <label className="label-field">سعر الرحلة (اختياري)</label>
          <input type="number" className="input-field" {...register("trip_price")} />
        </div>
        <div>
          <label className="label-field">سعر الكيلومتر (اختياري)</label>
          <input type="number" className="input-field" {...register("km_price")} />
        </div>
        <div>
          <label className="label-field">العداد الحالي (كم)</label>
          <input type="number" className="input-field" {...register("current_odometer")} />
        </div>
        <div>
          <label className="label-field">تاريخ انتهاء التأمين</label>
          <input type="date" className="input-field" {...register("insurance_expiry")} />
        </div>
        <div>
          <label className="label-field">تاريخ انتهاء الرخصة</label>
          <input type="date" className="input-field" {...register("license_expiry")} />
        </div>
      </div>

      <div>
        <label className="label-field">ملاحظات</label>
        <textarea rows={3} className="input-field" {...register("notes")} />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>إلغاء</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {car ? "حفظ التعديلات" : "إضافة السيارة"}
        </button>
      </div>
    </form>
  );
}
