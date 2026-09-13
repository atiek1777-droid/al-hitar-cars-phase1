import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 0 }).format(amount) + " ريال";
}

export function formatDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
}

export function formatDateTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}

const ones = [
  "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
  "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر",
  "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"
];
const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const hundreds = [
  "", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"
];

function threeDigits(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rem = n % 100;
  if (h) parts.push(hundreds[h]);
  if (rem) {
    if (rem < 20) parts.push(ones[rem]);
    else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      if (o) parts.push(ones[o] + " و" + tens[t]);
      else parts.push(tens[t]);
    }
  }
  return parts.join(" و");
}

/** تحويل رقم إلى كتابة عربية لاستخدامه في الفواتير */
export function numberToArabicWords(input: number): string {
  const n = Math.round(input);
  if (n === 0) return "صفر ريال يمني فقط لا غير";

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];
  if (millions) parts.push(threeDigits(millions) + (millions === 1 ? " مليون" : millions === 2 ? " مليونان" : millions <= 10 ? " ملايين" : " مليون"));
  if (thousands) parts.push(thousands === 1 ? "ألف" : thousands === 2 ? "ألفان" : threeDigits(thousands) + (thousands <= 10 ? " آلاف" : " ألف"));
  if (rest) parts.push(threeDigits(rest));

  return `${parts.join(" و")} ريال يمني فقط لا غير`;
}

export function generateWhatsAppInvoiceLink(phone: string, invoiceNumber: number, amount: number) {
  const text = encodeURIComponent(
    `مكتب الهتار كارز\nفاتورة رقم: ${invoiceNumber}\nالمبلغ الإجمالي: ${formatCurrency(amount)}\nشكراً لتعاملكم معنا.`
  );
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${text}`;
}
