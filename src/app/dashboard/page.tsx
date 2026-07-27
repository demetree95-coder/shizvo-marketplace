"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineShoppingBag, HiOutlineCurrencyDollar, HiOutlineUsers, HiOutlineClipboardDocumentList, HiOutlinePlus } from "react-icons/hi2";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { HiOutlineChartBar } from "react-icons/hi2";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [stats, setStats] = useState({ todaySales: 0, monthlySales: 0, revenue: 0, totalOrders: 0, totalCustomers: 0 });
  const t = useT();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
  }, [user, router]);

  if (!user) return null;

  const cards = [
    { icon: HiOutlineCurrencyDollar, label: t.dashboard.todaySales, value: formatPrice(stats.todaySales), color: "from-green-500 to-emerald-600" },
    { icon: HiOutlineShoppingBag, label: t.dashboard.monthlySales, value: formatPrice(stats.monthlySales), color: "from-blue-500 to-indigo-600" },
    { icon: HiOutlineClipboardDocumentList, label: t.dashboard.totalOrders, value: stats.totalOrders.toString(), color: "from-purple-500 to-pink-600" },
    { icon: HiOutlineUsers, label: t.dashboard.totalCustomers, value: stats.totalCustomers.toString(), color: "from-orange-500 to-red-600" },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
          <Link href="/dashboard/products" className="btn-primary text-sm">
            <HiOutlinePlus className="w-4 h-4" /> {t.dashboard.addProduct}
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t.dashboard.overview}</h3>
            <div className="flex gap-2">
              <Link href="/dashboard/products" className="text-sm text-primary hover:underline">{t.dashboard.products}</Link>
              <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">{t.dashboard.orders}</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/products" className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
              <HiOutlineShoppingBag className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-gray-500">{t.dashboard.products}</p>
            </Link>
            <Link href="/dashboard/orders" className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
              <HiOutlineClipboardDocumentList className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-gray-500">{t.dashboard.orders}</p>
            </Link>
            <Link href="/dashboard/settings" className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
              <HiOutlineChartBar className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-gray-500">{t.dashboard.settings}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
