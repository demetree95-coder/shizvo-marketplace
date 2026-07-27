"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { HiStar, HiOutlineChatBubbleLeftRight, HiOutlineGlobeAlt, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin } from "react-icons/hi2";
import { useT } from "@/lib/locale";
import ProductCard from "@/components/ProductCard";
import { useAuthStore } from "@/store/authStore";

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    Promise.all([
      fetch(`/api/shops/${id}`).then(r => r.json()),
      fetch(`/api/products?shopId=${id}&limit=50`).then(r => r.json()),
    ]).then(([shopData, prodData]) => {
      setShop(shopData);
      setProducts(prodData.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const startChat = async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ shopId: id, content: "გამარჯობა! მაინტერესებს თქვენი პროდუქცია." }),
      });
      if (res.ok) window.location.href = "/chat";
    } catch {}
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!shop) return <div className="min-h-screen pt-24 flex items-center justify-center"><p className="text-gray-500">{t.common.noData}</p></div>;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
              {shop.logo ? <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover rounded-2xl" /> : <span className="text-3xl font-bold text-primary">{shop.name.charAt(0)}</span>}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold mb-1">{shop.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <HiStar className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{shop._count?.products || 0} {t.shop.products}</span>
              </div>
              {shop.description && <p className="text-sm text-gray-500">{shop.description}</p>}
            </div>
            {user && (
              <button onClick={startChat} className="btn-secondary shrink-0"><HiOutlineChatBubbleLeftRight className="w-4 h-4" /> {t.chat.title}</button>
            )}
          </div>
          {(shop.contactEmail || shop.contactPhone || shop.website) && (
            <div className="border-t border-gray-100 mt-6 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {shop.contactEmail && <div className="flex items-center gap-2 text-sm text-gray-500"><HiOutlineEnvelope className="w-4 h-4" />{shop.contactEmail}</div>}
              {shop.contactPhone && <div className="flex items-center gap-2 text-sm text-gray-500"><HiOutlinePhone className="w-4 h-4" />{shop.contactPhone}</div>}
              {shop.website && <div className="flex items-center gap-2 text-sm text-primary"><HiOutlineGlobeAlt className="w-4 h-4" /><a href={shop.website} target="_blank" rel="noopener noreferrer">{shop.website}</a></div>}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-bold mb-4">{t.shop.products}</h2>
          {products.length === 0 ? (
            <p className="text-gray-400 text-center py-12">{t.shop.noProducts}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
