import { Users } from "lucide-react";
import { requireProfile, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";

const roleLabels: Record<string, string> = {
  owner: "المالك",
  accountant: "المحاسب",
  receptionist: "موظف الاستقبال"
};

export default async function SettingsPage() {
  const profile = await requireProfile();
  await requireRole(profile, ["owner"]);

  const supabase = createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("created_at");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="الإعدادات" description="معلومات المكتب والمستخدمين" />

      <div className="card mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900/70">
          معلومات المكتب
        </h2>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div><p className="text-xs text-ink-900/50">الاسم</p><p className="mt-0.5 font-medium">مكتب الهتار كارز — AL-HITAR CARS</p></div>
          <div><p className="text-xs text-ink-900/50">العنوان</p><p className="mt-0.5 font-medium">صنعاء - الحصبة، أمام بوابة حديقة الثورة الغربية</p></div>
          <div><p className="text-xs text-ink-900/50">أوقات العمل</p><p className="mt-0.5 font-medium">9:00 ص - 11:00 م يومياً</p></div>
          <div><p className="text-xs text-ink-900/50">الهواتف</p><p dir="ltr" className="mt-0.5 font-medium">777917111 | 775555405</p></div>
        </div>
        <p className="mt-4 text-xs text-ink-900/40">
          لتغيير هذه المعلومات، عدّل الملف settings/page.tsx مباشرة أو انتظر إضافة جدول إعدادات في مرحلة قادمة.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900/70">
          <Users className="h-4 w-4" /> المستخدمون
        </h2>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الدور</th></tr></thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td dir="ltr">{u.username}</td>
                  <td>{roleLabels[u.role]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-ink-900/40">
          لإضافة مستخدم جديد، أنشئه من لوحة Supabase Auth ثم أضف صفاً مطابقاً في جدول profiles (راجع README).
        </p>
      </div>
    </div>
  );
}
