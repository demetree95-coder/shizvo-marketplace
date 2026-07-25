"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { ge } from "@/lib/ge";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "";
    const params = new URLSearchParams({ limit: "20", sort: "rating" });
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false); }).catch(() => setLoading(false));
  }, [searchParams]);

  if (loading) return <p className="text-gray-400 text-center py-20">{ge.common.loading}</p>;
  if (products.length === 0) return <p className="text-gray-400 text-center py-20">{ge.products.noProducts}</p>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{ge.products.title}</h1>
        <Suspense fallback={<p className="text-gray-400 text-center py-20">{ge.common.loading}</p>}>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  );
}
