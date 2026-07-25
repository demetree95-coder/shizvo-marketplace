"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ge } from "@/lib/ge";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{ge.categories.title}</h1>
        {categories.length === 0 ? (
          <p className="text-gray-400 text-center py-20">{ge.common.noData}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`} className="glass-card p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-5xl mb-3">{cat.icon || "📦"}</div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                {cat._count?.products && (
                  <p className="text-sm text-gray-400 mt-1">{cat._count.products} {ge.products.title.toLowerCase()}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
