"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const RECAPTCHA_SCRIPT_ID = "recaptcha-script";

function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    if (document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      if ((window as any).grecaptcha?.ready) {
        (window as any).grecaptcha.ready(resolve);
      } else {
        const check = setInterval(() => {
          if ((window as any).grecaptcha?.ready) {
            clearInterval(check);
            (window as any).grecaptcha.ready(resolve);
          }
        }, 100);
      }
      return;
    }
    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).grecaptcha?.ready) {
        (window as any).grecaptcha.ready(resolve);
      } else {
        resolve();
      }
    };
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

type Strength = 0 | 1 | 2 | 3 | 4;

function getStrength(password: string): Strength {
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[a-z]/.test(password)) s++;
  if (/\d/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  if (password.length >= 12) s++;
  if (s >= 4) return 4;
  if (s >= 3) return 3;
  if (s >= 2) return 2;
  if (s >= 1) return 1;
  return 0;
}

const strengthConfig: Record<Strength, { label: string; color: string; width: string }> = {
  0: { label: "", color: "bg-gray-200", width: "0%" },
  1: { label: "სუსტი", color: "bg-red-500", width: "25%" },
  2: { label: "საშუალო", color: "bg-orange-400", width: "50%" },
  3: { label: "კარგი", color: "bg-yellow-400", width: "75%" },
  4: { label: "ძლიერი", color: "bg-green-500", width: "100%" },
};

const requirementMet = (condition: boolean) =>
  condition ? "text-green-600" : "text-gray-400";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const t = useT();

  const strength = getStrength(password);
  const sc = strengthConfig[strength];

  const isValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);

  const handleCaptchaExpired = useCallback(() => {
    setCaptchaToken("");
  }, []);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    let mounted = true;
    loadRecaptchaScript().then(() => {
      if (!mounted || !recaptchaRef.current) return;
      const gr = (window as any).grecaptcha;
      if (!gr) return;
      const widgetId = gr.render(recaptchaRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        theme: "light",
        callback: (token: string) => {
          if (mounted) setCaptchaToken(token);
        },
        "expired-callback": () => {
          if (mounted) handleCaptchaExpired();
        },
      });
      widgetIdRef.current = widgetId;
      setCaptchaReady(true);
    });
    return () => { mounted = false; };
  }, [handleCaptchaExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს, ერთ დიდ ასოს და ერთ ციფრს");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("პაროლები არ ემთხვევა");
      return;
    }
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      toast.error("გთხოვთ დაადასტუროთ, რომ არ ხართ რობოტი");
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, fullName, phone: phone || undefined, captchaToken: captchaToken || undefined });
      toast.success(t.auth.success);
      router.push("/dashboard/settings");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.error;
      toast.error(msg);
      if (widgetIdRef.current !== null) {
        (window as any).grecaptcha?.reset(widgetIdRef.current);
      }
      setCaptchaToken("");
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

          <div>
            <input type="password" placeholder={t.auth.password} value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field w-full" />
            {password.length > 0 && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${sc.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: sc.width }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <AnimatePresence mode="wait">
                  {strength > 0 && (
                    <motion.p
                      key={strength}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                      className={`text-xs mt-1 font-medium ${sc.color.replace("bg-", "text-")}`}
                    >
                      {sc.label}
                    </motion.p>
                  )}
                </AnimatePresence>
                <ul className="text-xs mt-2 space-y-0.5">
                  <li className={requirementMet(password.length >= 8)}>
                    {password.length >= 8 ? "✓" : "○"} მინიმუმ 8 სიმბოლო
                  </li>
                  <li className={requirementMet(/[A-Z]/.test(password))}>
                    {/[A-Z]/.test(password) ? "✓" : "○"} ერთი დიდი ასო მაინც
                  </li>
                  <li className={requirementMet(/\d/.test(password))}>
                    {/\d/.test(password) ? "✓" : "○"} ერთი ციფრი მაინც
                  </li>
                </ul>
              </div>
            )}
          </div>

          <input type="password" placeholder={t.auth.confirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field w-full" />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="text-xs text-red-500 -mt-2">პაროლები არ ემთხვევა</p>
          )}

          {RECAPTCHA_SITE_KEY && (
            <div className="flex justify-center recaptcha-container">
              <div ref={recaptchaRef} />
            </div>
          )}

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
