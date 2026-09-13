import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم مطلوب (٣ أحرف على الأقل)"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن ٦ أحرف")
});
export type LoginInput = z.infer<typeof loginSchema>;

export const carSchema = z.object({
  plate_number: z.string().min(1, "رقم اللوحة مطلوب"),
  make: z.string().min(1, "الماركة مطلوبة"),
  model: z.string().min(1, "الموديل مطلوب"),
  year: z.coerce.number().int().min(1990).max(2100),
  color: z.string().min(1, "اللون مطلوب"),
  car_type: z.enum(["صالون", "دفع رباعي", "حافلة", "فخم"]),
  ownership_type: z.enum(["ملك المكتب", "خارجي"]),
  external_owner_id: z.string().uuid().nullable().optional(),
  daily_price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالباً"),
  trip_price: z.coerce.number().min(0).nullable().optional(),
  km_price: z.coerce.number().min(0).nullable().optional(),
  insurance_expiry: z.string().nullable().optional(),
  license_expiry: z.string().nullable().optional(),
  status: z.enum(["متاحة", "محجوزة", "صيانة", "غير نشطة"]),
  current_odometer: z.coerce.number().min(0).default(0),
  notes: z.string().nullable().optional()
});
export type CarInput = z.infer<typeof carSchema>;

export const customerSchema = z.object({
  full_name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(6, "رقم الهاتف مطلوب"),
  phone2: z.string().nullable().optional(),
  national_id: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  customer_type: z.enum(["فرد", "شركة"]),
  company_name: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const bookingSchema = z
  .object({
    customer_id: z.string().uuid("اختر العميل"),
    car_id: z.string().uuid("اختر السيارة"),
    service_type: z.enum([
      "تأجير يومي",
      "رحلة",
      "مطار",
      "زفاف",
      "تخرج",
      "حج",
      "عمرة",
      "جواز",
      "طيران"
    ]),
    driver_name: z.string().nullable().optional(),
    pickup_location: z.string().nullable().optional(),
    dropoff_location: z.string().nullable().optional(),
    start_datetime: z.string().min(1, "تاريخ الانطلاق مطلوب"),
    end_datetime: z.string().min(1, "تاريخ العودة مطلوب"),
    pricing_model: z.enum(["يومي", "رحلة", "كيلومتر"]),
    total_amount: z.coerce.number().min(0),
    deposit_amount: z.coerce.number().min(0).default(0),
    status: z.enum(["مسودة", "مؤكد", "جاري", "مكتمل", "ملغي"])
  })
  .refine((data) => new Date(data.end_datetime) >= new Date(data.start_datetime), {
    message: "تاريخ العودة يجب أن يكون بعد تاريخ الانطلاق",
    path: ["end_datetime"]
  })
  .refine((data) => data.deposit_amount <= data.total_amount, {
    message: "العربون لا يمكن أن يتجاوز المبلغ الإجمالي",
    path: ["deposit_amount"]
  });
export type BookingInput = z.infer<typeof bookingSchema>;

export const paymentSchema = z.object({
  invoice_id: z.string().uuid("اختر الفاتورة"),
  amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  payment_method: z.string().min(1, "طريقة الدفع مطلوبة"),
  notes: z.string().nullable().optional()
});
export type PaymentInput = z.infer<typeof paymentSchema>;
