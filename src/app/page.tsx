"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import ShopCard from "@/components/ShopCard";
import { useT } from "@/lib/locale";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const t = useT();

  useEffect(() => {
    fetch("/api/products?limit=8&sort=rating").then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
    fetch("/api/shops?limit=6&featured=true").then(r => r.json()).then(d => setShops(d.shops || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t.products.popular}</h2>
            <Link href="/products" className="text-sm text-primary font-medium hover:underline">{t.categories.viewAll}</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t.shop.popularShops}</h2>
            <Link href="/shops" className="text-sm text-primary font-medium hover:underline">{t.categories.viewAll}</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {shops.map((shop, i) => <ShopCard key={shop.id} shop={shop} index={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
