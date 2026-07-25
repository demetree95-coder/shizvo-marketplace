"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ge } from "@/lib/ge";

export default function AdminShopsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { router.push("/"); return; }
    fetch("/api/shops?limit=100").then(r => r.json()).then(data => setShops(data.shops || [])).catch(() => {});
  }, [user, router]);

  const toggleBlock = async (shopId: string, currentBlocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/shops/${shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !currentBlocked }),
      });
      if (res.ok) {
        toast.success(currentBlocked ? "განბლოკილია" : "დაბლოკილია");
        setShops(shops.map(s => s.id === shopId ? { ...s, isBlocked: !currentBlocked } : s));
      }
    } catch { toast.error("შეცდომა"); }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{ge.admin.shops}</h1>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-500">სახელი</th>
                  <th className="text-left p-4 font-medium text-gray-500">პროდუქტები</th>
                  <th className="text-left p-4 font-medium text-gray-500">გაყიდვები</th>
                  <th className="text-left p-4 font-medium text-gray-500">სტატუსი</th>
                  <th className="text-left p-4 font-medium text-gray-500">მოქმედება</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.map((shop: any) => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{shop.name}</td>
                    <td className="p-4 text-gray-500">{shop._count?.products || 0}</td>
                    <td className="p-4 text-gray-500">{shop.totalSales}</td>
                    <td className="p-4"><span className={`badge ${shop.isBlocked ? "badge-red" : "badge-green"}`}>{shop.isBlocked ? "დაბლოკილი" : "აქტიური"}</span></td>
                    <td className="p-4">
                      <button onClick={() => toggleBlock(shop.id, shop.isBlocked)} className={`btn-${shop.isBlocked ? "primary" : "danger"} text-xs py-1.5 px-3`}>
                        {shop.isBlocked ? ge.admin.unblock : ge.admin.block}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
