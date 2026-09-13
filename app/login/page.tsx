"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    setLoading(true);

    const supabase = createClient();
    const domain = process.env.NEXT_PUBLIC_AUTH_EMAIL_DOMAIN || "alhitar.local";
    const email = `${values.username.trim()}@${domain}`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: values.password
    });

    setLoading(false);

    if (error) {
      setServerError("اسم المستخدم أو كلمة المرور غير صحيحة");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="relative h-20 w-40">
            <Image src="/logo.png" alt="الهتار كارز" fill className="object-contain" priority />
          </div>
          <p className="text-sm text-ink-900/60">نظام إدارة المكتب</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="label-field" htmlFor="username">اسم المستخدم</label>
            <div className="relative">
              <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-900/40" />
              <input
                id="username"
                className="input-field pr-9"
                placeholder="owner"
                autoComplete="username"
                {...register("username")}
              />
            </div>
            {errors.username && <p className="error-text">{errors.username.message}</p>}
          </div>

          <div>
            <label className="label-field" htmlFor="password">كلمة المرور</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-900/40" />
              <input
                id="password"
                type="password"
                className="input-field pr-9"
                autoComplete="current-password"
                {...register("password")}
              />
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            تسجيل الدخول
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-900/40">
          مكتب الهتار كارز — للسفريات وتأجير السيارات
        </p>
      </div>
    </main>
  );
}
