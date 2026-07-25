"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ge } from "@/lib/ge";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(ge.auth.success);
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ge.auth.error;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="glass-card max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{ge.auth.login}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder={ge.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field w-full" />
          <input type="password" placeholder={ge.auth.password} value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field w-full" />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? ge.common.loading : ge.auth.login}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-6">
          {ge.auth.noAccount}{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">{ge.auth.registerLink}</Link>
        </p>
      </div>
    </div>
  );
}
