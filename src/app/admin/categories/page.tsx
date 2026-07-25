"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useT } from "@/lib/locale";
import { HiOutlinePlus } from "react-icons/hi2";

export default function AdminCategoriesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const t = useT();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { router.push("/"); return; }
    fetch("/api/categories").then(r => r.json()).then(data => setCategories(data.categories || [])).catch(() => {});
  }, [user, router]);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), icon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("დაემატა");
      setName(""); setIcon("");
      setCategories([...categories, data.category]);
    } catch (err: any) { toast.error(err.message); }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{t.admin.categories}</h1>
        <div className="max-w-md mb-8">
          <form onSubmit={addCategory} className="flex gap-3">
            <input className="input-field" placeholder="კატეგორიის სახელი" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="input-field w-20" placeholder="📦" value={icon} onChange={(e) => setIcon(e.target.value)} />
            <button type="submit" className="btn-primary px-4"><HiOutlinePlus className="w-5 h-5" /></button>
          </form>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-card p-4 text-center">
              <div className="text-3xl mb-2">{cat.icon || "📦"}</div>
              <h3 className="font-semibold text-sm">{cat.name}</h3>
              <p className="text-xs text-gray-500">{cat._count?.products || 0} პროდუქტი</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
