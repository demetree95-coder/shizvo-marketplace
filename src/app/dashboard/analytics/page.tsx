"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ge } from "@/lib/ge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "იან", revenue: 4500, orders: 42 }, { month: "თებ", revenue: 3800, orders: 35 },
  { month: "მარ", revenue: 5200, orders: 48 }, { month: "აპრ", revenue: 4900, orders: 45 },
  { month: "მაი", revenue: 6100, orders: 55 }, { month: "ივნ", revenue: 5800, orders: 52 },
];

const categoryData = [
  { name: "ელექტრონიკა", value: 45 }, { name: "ტანსაცმელი", value: 25 },
  { name: "აქსესუარები", value: 18 }, { name: "სხვა", value: 12 },
];

const COLORS = ["#2563eb", "#06b6d4", "#8b5cf6", "#f59e0b"];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user || user.role === "USER") { router.push("/"); return null; }

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{ge.dashboard.analytics}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">შემოსავალი</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">შეკვეთები</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="orders" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">კატეგორიების განაწილება</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">მთავარი მაჩვენებლები</h3>
            <div className="space-y-4">
              {[
                { label: "საშუალო შეკვეთის ღირებულება", value: "125 ₾" },
                { label: "კონვერსიის მაჩვენებელი", value: "3.2%" },
                { label: "დაბრუნების მაჩვენებელი", value: "1.8%" },
                { label: "აქტიური მომხმარებლები", value: "1,247" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
