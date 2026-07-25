"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("პაროლები არ ემთხვევა");
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, fullName, phone: phone || undefined });
      toast.success(t.auth.success);
      router.push("/dashboard/settings");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.error;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="glass-card max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{t.auth.register}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder={t.auth.fullName} value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input-field w-full" />
          <input type="email" placeholder={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field w-full" />
          <input type="tel" placeholder={t.auth.phone} value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field w-full" />
          <input type="password" placeholder={t.auth.password} value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field w-full" />
          <input type="password" placeholder={t.auth.confirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field w-full" />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? t.common.loading : t.auth.register}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-6">
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">{t.auth.loginLink}</Link>
        </p>
      </div>
    </div>
  );
}
