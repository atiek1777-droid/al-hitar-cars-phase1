"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";
import type { Customer } from "@/lib/types";

export function CustomerForm({
  customer,
  onCreated
}: {
  customer?: Customer;
  /** يُستخدم عند إنشاء عميل داخل نموذج حجز جديد بدلاً من التنقل */
  onCreated?: (id: string) => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          full_name: customer.full_name,
          phone: customer.phone,
          phone2: customer.phone2 ?? undefined,
          national_id: customer.national_id ?? undefined,
          address: customer.address ?? undefined,
          customer_type: customer.customer_type,
          company_name: customer.company_name ?? undefined,
          notes: customer.notes ?? undefined
        }
      : { customer_type: "فرد" }
  });

  const customerType = watch("customer_type");

  async function onSubmit(values: CustomerInput) {
    setServerError(null);
    setLoading(true);
    const result = customer
      ? await updateCustomer(customer.id, values)
      : await createCustomer(values);
    setLoading(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    if (onCreated) {
      onCreated(result.id!);
      return;
    }

    router.push(`/customers/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
      {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">الاسم الكامل</label>
          <input className="input-field" {...register("full_name")} />
          {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="label-field">نوع العميل</label>
          <select className="input-field" {...register("customer_type")}>
            <option value="فرد">فرد</option>
            <option value="شركة">شركة</option>
          </select>
        </div>
        <div>
          <label className="label-field">الهاتف</label>
          <input className="input-field" dir="ltr" {...register("phone")} />
          {errors.phone && <p className="error-text">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label-field">هاتف إضافي</label>
          <input className="input-field" dir="ltr" {...register("phone2")} />
        </div>
        <div>
          <label className="label-field">رقم الهوية</label>
          <input className="input-field" {...register("national_id")} />
        </div>
        {customerType === "شركة" && (
          <div>
            <label className="label-field">اسم الشركة</label>
            <input className="input-field" {...register("company_name")} />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="label-field">العنوان</label>
          <input className="input-field" {...register("address")} />
        </div>
      </div>

      <div>
        <label className="label-field">ملاحظات</label>
        <textarea rows={3} className="input-field" {...register("notes")} />
      </div>

      <div className="flex justify-end gap-3">
        {!onCreated && (
          <button type="button" className="btn-secondary" onClick={() => router.back()}>إلغاء</button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {customer ? "حفظ التعديلات" : "إضافة العميل"}
        </button>
      </div>
    </form>
  );
}
