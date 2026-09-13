import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

/** يجلب الملف الشخصي للمستخدم الحالي، ويعيد التوجيه لصفحة الدخول إن لم يكن مسجلاً */
export async function requireProfile(): Promise<Profile> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return profile as Profile;
}

/** يتأكد أن دور المستخدم الحالي ضمن الأدوار المسموحة، وإلا يعيده للوحة التحكم */
export async function requireRole(profile: Profile, allowed: UserRole[]) {
  if (!allowed.includes(profile.role)) {
    redirect("/dashboard");
  }
}
