"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiOutlineUser, HiOutlinePencilSquare, HiOutlineCamera, HiOutlineCheck, HiOutlineMapPin, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: "", phone: "", street: "", city: "", region: "", zipCode: "" });
  const t = useT();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    setFullName(user.fullName);
    setPhone(user.phone || "");
    setAvatar(user.avatar);
    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api("/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {}
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api("/api/auth/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone: phone || null, avatar }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUser(updated);
      toast.success(t.profile.saved);
    } catch {
      toast.error(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await api("/api/addresses", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      if (!res.ok) throw new Error();
      toast.success("მისამართი დამატებულია");
      setShowAddressForm(false);
      setAddressForm({ fullName: "", phone: "", street: "", city: "", region: "", zipCode: "" });
      loadProfile();
    } catch {
      toast.error("შეცდომა მისამართის დამატებისას");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api(`/api/addresses?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      toast.success("მისამართი წაიშალა");
      loadProfile();
    } catch {
      toast.error("შეცდომა წაშლის დროს");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <HiOutlineUser className="w-10 h-10 text-white" />
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                <HiOutlineCamera className="w-4 h-4 text-gray-600" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">{user.role === "ADMIN" ? "ადმინ" : user.role === "VENDOR" ? "გამყიდველი" : "მომხმარებელი"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.profile.fullName}</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.profile.email}</label>
              <input type="email" value={user.email} disabled className="input-field w-full bg-gray-50 text-gray-400" />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t.profile.phone}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field w-full" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary mt-6">
            {saving ? t.common.loading : `${t.profile.save}`}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2"><HiOutlineMapPin className="w-5 h-5" /> {t.profile.addresses}</h2>
            <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-secondary text-sm">
              <HiOutlinePlus className="w-4 h-4" /> {t.profile.addAddress}
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              <input type="text" placeholder={t.profile.fullName} value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} required className="input-field" />
              <input type="tel" placeholder={t.profile.phone} value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} required className="input-field" />
              <input type="text" placeholder={t.profile.street} value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} required className="input-field md:col-span-2" />
              <input type="text" placeholder={t.profile.city} value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required className="input-field" />
              <input type="text" placeholder={t.profile.region} value={addressForm.region} onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })} className="input-field" />
              <input type="text" placeholder={t.profile.zipCode} value={addressForm.zipCode} onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })} className="input-field" />
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn-primary text-sm"><HiOutlineCheck className="w-4 h-4" /> შენახვა</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary text-sm">გაუქმება</button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">მისამართები არ არის</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr: any) => (
                <div key={addr.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{addr.fullName} • {addr.phone}</p>
                    <p className="text-sm text-gray-500">{addr.street}, {addr.city}{addr.region ? `, ${addr.region}` : ""}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
