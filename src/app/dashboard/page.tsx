"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineShoppingBag, HiOutlineCurrencyDollar, HiOutlineUsers, HiOutlineClipboardDocumentList, HiOutlinePlus, HiOutlineArrowUp } from "react-icons/hi2";
import { ge } from "@/lib/ge";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const chartData = [
  { name: "იან", sales: 4000 }, { name: "თებ", sales: 3000 }, { name: "მარ", sales: 5000 },
  { name: "აპრ", sales: 4500 }, { name: "მაი", sales: 6000 }, { name: "ივნ", sales: 5500 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [stats, setStats] = useState({ todaySales: 0, monthlySales: 0, revenue: 0, totalOrders: 0, totalCustomers: 0 });

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role === "USER") { router.push("/"); return; }
  }, [user, router]);

  if (!user || user.role === "USER") return null;

  const cards = [
    { icon: HiOutlineCurrencyDollar, label: ge.dashboard.todaySales, value: formatPrice(stats.todaySales), color: "from-green-500 to-emerald-600" },
    { icon: HiOutlineShoppingBag, label: ge.dashboard.monthlySales, value: formatPrice(stats.monthlySales), color: "from-blue-500 to-indigo-600" },
    { icon: HiOutlineClipboardDocumentList, label: ge.dashboard.totalOrders, value: stats.totalOrders.toString(), color: "from-purple-500 to-pink-600" },
    { icon: HiOutlineUsers, label: ge.dashboard.totalCustomers, value: stats.totalCustomers.toString(), color: "from-orange-500 to-red-600" },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{ge.dashboard.title}</h1>
          <Link href="/dashboard/products" className="btn-primary text-sm">
            <HiOutlinePlus className="w-4 h-4" /> {ge.dashboard.addProduct}
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
                <HiOutlineArrowUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">გაყიდვების სტატისტიკა</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">{ge.dashboard.bestSellers}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="sales" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{ge.dashboard.overview}</h3>
            <div className="flex gap-2">
              <Link href="/dashboard/products" className="text-sm text-primary hover:underline">{ge.dashboard.products}</Link>
              <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">{ge.dashboard.orders}</Link>
              <Link href="/dashboard/analytics" className="text-sm text-primary hover:underline">{ge.dashboard.analytics}</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["ელექტრონიკა", "ტანსაცმელი", "აქსესუარები", "საყოფაცხოვრებო"].map((cat, i) => (
              <div key={cat} className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="font-bold text-lg">{[42, 28, 15, 8][i]}</p>
                <p className="text-xs text-gray-500">{cat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
