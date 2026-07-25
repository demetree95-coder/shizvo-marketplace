"use client";

import { useState, useEffect } from "react";
import ShopCard from "@/components/ShopCard";
import { useT } from "@/lib/locale";

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const t = useT();

  useEffect(() => {
    fetch("/api/shops?limit=50").then(r => r.json()).then(d => setShops(d.shops || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{t.shop.title}</h1>
        {shops.length === 0 ? (
          <p className="text-gray-400 text-center py-20">{t.common.noData}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {shops.map((shop, i) => <ShopCard key={shop.id} shop={shop} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
