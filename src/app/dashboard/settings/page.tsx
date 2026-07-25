"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ge } from "@/lib/ge";
import { useAuthStore } from "@/store/authStore";
import { HiOutlinePlus } from "react-icons/hi2";

export default function DashboardSettingsPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [hasShop, setHasShop] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", logo: "", banner: "", contactEmail: "", contactPhone: "", facebook: "", instagram: "", tiktok: "", youtube: "", website: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.shop) { setHasShop(true); setShop(data.shop); setForm({ name: data.shop.name, description: data.shop.description || "", logo: data.shop.logo || "", banner: data.shop.banner || "", contactEmail: data.shop.contactEmail || "", contactPhone: data.shop.contactPhone || "", facebook: data.shop.facebook || "", instagram: data.shop.instagram || "", tiktok: data.shop.tiktok || "", youtube: data.shop.youtube || "", website: data.shop.website || "" }); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const createShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/shop/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("მაღაზია შეიქმნა!");
      setHasShop(true);
      setShop(data.shop);
      setUser({ ...user, role: "VENDOR" } as any);
    } catch (err: any) { toast.error(err.message); }
  };

  const updateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/shop/update", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("შენახულია!");
      setShop(data.shop);
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{hasShop ? ge.shop.edit : ge.shop.create}</h1>
        <div className="max-w-2xl">
          <div className="glass-card p-6">
            <form onSubmit={hasShop ? updateShop : createShop} className="space-y-4">
              <input className="input-field" placeholder={ge.shop.name + " *"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required={!hasShop} />
              <textarea className="input-field" rows={3} placeholder={ge.shop.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input className="input-field" placeholder={ge.shop.logo + " (URL)"} value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
              <input className="input-field" placeholder={ge.shop.banner + " (URL)"} value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} />
              <input className="input-field" placeholder="ელ. ფოსტა" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              <input className="input-field" placeholder="ტელეფონი" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input className="input-field" placeholder="Facebook" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
                <input className="input-field" placeholder="Instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
                <input className="input-field" placeholder="TikTok" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} />
                <input className="input-field" placeholder="YouTube" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
              </div>
              <input className="input-field" placeholder="ვებ-გვერდი" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              <button type="submit" className="btn-primary">{hasShop ? ge.common.save : ge.shop.create}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
