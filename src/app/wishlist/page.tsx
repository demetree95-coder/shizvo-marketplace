"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useT } from "@/lib/locale";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/wishlist", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json()).then(d => {
        setItems(d.wishlist?.items?.map((i: any) => i.product) || []);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{t.wishlist.title}</h1>
        {loading ? (
          <p className="text-gray-400 text-center py-20">{t.common.loading}</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-center py-20">{t.wishlist.empty}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product: any, i: number) => <ProductCard key={product.id} product={product} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
