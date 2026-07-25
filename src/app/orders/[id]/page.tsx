"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { ge } from "@/lib/ge";
import { formatPrice, formatDate, parseJsonArray } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  NEW: "text-blue-700 bg-blue-50", PROCESSING: "text-yellow-700 bg-yellow-50",
  PACKED: "text-orange-700 bg-orange-50", SHIPPED: "text-indigo-700 bg-indigo-50",
  IN_TRANSIT: "text-purple-700 bg-purple-50", DELIVERED: "text-green-700 bg-green-50",
  CANCELLED: "text-red-700 bg-red-50",
};

export default function OrderDetailPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!params.id) return;
    fetch(`/api/orders/${params.id}`).then(r => r.json()).then(d => setOrder(d.order || null)).catch(() => {}).finally(() => setLoading(false));
  }, [user, router, params.id]);

  if (loading) return <div className="min-h-screen pt-20 md:pt-24 bg-gray-50"><div className="container-custom py-8"><p className="text-gray-400 text-center py-20">{ge.common.loading}</p></div></div>;

  if (!order) return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-16 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold mb-2">შეკვეთა ვერ მოიძებნა</h1>
        <button onClick={() => router.push("/orders")} className="btn-primary mt-6">{ge.common.back}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <Link href="/orders" className="text-sm text-primary hover:underline mb-6 inline-block">&larr; {ge.common.back}</Link>

        <div className="glass-card p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">{ge.orders.orderNumber}</p>
              <p className="font-mono text-xl font-bold">{order.orderNumber}</p>
            </div>
            <span className={`text-sm font-medium px-4 py-1.5 rounded-full ${statusStyles[order.status] || "text-gray-700 bg-gray-50"}`}>
              {ge.orders.statuses[order.status as keyof typeof ge.orders.statuses] || order.status}
            </span>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>{formatDate(order.createdAt)}</p>
            {order.shop && <p className="font-medium text-gray-700">{order.shop.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">{ge.orders.items}</h3>
              <div className="space-y-3">
                {order.items?.map((item: any) => {
                  const images = parseJsonArray<string>(item.product?.images as any);
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {images?.length > 0 ? <img src={images[0]} alt={item.product?.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                      </div>
                      <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">{ge.cart.orderSummary}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">{ge.cart.subtotal}</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{ge.cart.shipping}</span><span>{order.shipping === 0 ? "უფასო" : formatPrice(order.shipping)}</span></div>
                {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">{ge.cart.discount}</span><span className="text-green-600">- {formatPrice(order.discount)}</span></div>}
                <div className="border-t pt-3 flex justify-between font-bold"><span>{ge.cart.total}</span><span className="text-primary">{formatPrice(order.total)}</span></div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">{ge.orders.shippingAddress}</h3>
              <div className="text-sm space-y-1 text-gray-600">
                <p className="font-medium text-gray-800">{order.fullName}</p>
                <p>{order.phone}</p>
                <p>{order.street}, {order.city}</p>
                {order.region && <p>{order.region}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
