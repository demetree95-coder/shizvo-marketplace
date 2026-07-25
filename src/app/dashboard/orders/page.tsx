"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate, getStatusColor, getStatusIcon } from "@/lib/utils";

export default function DashboardOrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    if (!user || user.role === "USER") { router.push("/"); return; }
    fetch("/api/shop/orders").then(r => r.json()).then(data => setOrders(data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("სტატუსი განახლდა");
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch { toast.error("შეცდომა"); }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{t.dashboard.orders}</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="input-field text-sm py-1.5 w-auto">
                    {Object.entries(t.orders.statuses).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {order.fullName} - {order.phone} - {order.city}, {order.street}
              </div>
              <div className="mt-3 space-y-1">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="text-sm flex justify-between"><span>{item.product?.name} x{item.quantity}</span><span>{formatPrice(item.price)}</span></div>
                ))}
              </div>
            </div>
          ))}
          {!loading && orders.length === 0 && (
            <div className="text-center py-20"><p className="text-gray-500">{t.orders.noOrders}</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
