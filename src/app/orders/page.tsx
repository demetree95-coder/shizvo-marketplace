"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ge } from "@/lib/ge";
import { formatPrice, formatDate } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  NEW: "text-blue-700 bg-blue-50", PROCESSING: "text-yellow-700 bg-yellow-50",
  PACKED: "text-orange-700 bg-orange-50", SHIPPED: "text-indigo-700 bg-indigo-50",
  IN_TRANSIT: "text-purple-700 bg-purple-50", DELIVERED: "text-green-700 bg-green-50",
  CANCELLED: "text-red-700 bg-red-50",
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(d.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{ge.orders.title}</h1>
        {loading ? (
          <p className="text-gray-400 text-center py-20">{ge.common.loading}</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-500 mb-6">{ge.orders.noOrders}</p>
            <button onClick={() => router.push("/products")} className="btn-primary">{ge.cart.continueShopping}</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="glass-card p-5 block hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[order.status] || "text-gray-700 bg-gray-50"}`}>{ge.orders.statuses[order.status as keyof typeof ge.orders.statuses] || order.status}</span>
                    <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.items?.slice(0, 3).map((item: any) => (
                    <span key={item.id} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.product?.name}</span>
                  ))}
                  {(order.items?.length || 0) > 3 && <span className="text-xs text-gray-400">+{order.items.length - 3}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
