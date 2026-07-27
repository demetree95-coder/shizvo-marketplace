"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";

export default function DashboardSettingsPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [hasShop, setHasShop] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", logo: "", banner: "", contactEmail: "", contactPhone: "", facebook: "", instagram: "", tiktok: "", youtube: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.shop) { setHasShop(true); setShop(data.shop); setForm({ name: data.shop.name, description: data.shop.description || "", logo: data.shop.logo || "", banner: data.shop.banner || "", contactEmail: data.shop.contactEmail || "", contactPhone: data.shop.contactPhone || "", facebook: data.shop.facebook || "", instagram: data.shop.instagram || "", tiktok: data.shop.tiktok || "", youtube: data.shop.youtube || "", website: data.shop.website || "" }); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const uploadFile = async (file: File, field: "logo" | "banner") => {
    setUploading(field);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm((prev) => ({ ...prev, [field]: data.url }));
      toast.success(`${field === "logo" ? "ლოგო" : "ბანერი"} აიტვირთა`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, field);
  };

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
        <h1 className="text-2xl font-bold mb-8">{hasShop ? t.shop.edit : t.shop.create}</h1>
        <div className="max-w-2xl">
          <div className="glass-card p-6">
            <form onSubmit={hasShop ? updateShop : createShop} className="space-y-4">
              <input className="input-field" placeholder={t.shop.name + " *"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required={!hasShop} />
              <textarea className="input-field" rows={3} placeholder={t.shop.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.shop.logo}</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "logo")}
                  />
                  <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploading === "logo"} className="btn-secondary text-sm py-2">
                    {uploading === "logo" ? "იტვირთება..." : "აირჩიე ფაილი"}
                  </button>
                  <input className="input-field flex-1" placeholder={t.shop.logo + " (URL)"} value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
                </div>
                {form.logo && (
                  <img src={form.logo} alt="logo preview" className="mt-2 h-16 w-16 object-cover rounded-lg border" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.shop.banner}</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "banner")}
                  />
                  <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={uploading === "banner"} className="btn-secondary text-sm py-2">
                    {uploading === "banner" ? "იტვირთება..." : "აირჩიე ფაილი"}
                  </button>
                  <input className="input-field flex-1" placeholder={t.shop.banner + " (URL)"} value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} />
                </div>
                {form.banner && (
                  <img src={form.banner} alt="banner preview" className="mt-2 h-24 w-full object-cover rounded-lg border" />
                )}
              </div>

              <input className="input-field" placeholder="ელ. ფოსტა" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              <input className="input-field" placeholder="ტელეფონი" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input className="input-field" placeholder="Facebook" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
                <input className="input-field" placeholder="Instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
                <input className="input-field" placeholder="TikTok" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} />
                <input className="input-field" placeholder="YouTube" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
              </div>
              <input className="input-field" placeholder="ვებ-გვერდი" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              <button type="submit" className="btn-primary">{hasShop ? t.common.save : t.shop.create}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
