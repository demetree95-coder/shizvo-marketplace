"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ge } from "@/lib/ge";
import { HiOutlineUsers, HiOutlineShoppingBag, HiOutlineTag, HiOutlineCreditCard, HiOutlineCurrencyDollar, HiOutlineChartBar, HiOutlineFlag } from "react-icons/hi2";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user || user.role !== "ADMIN") { router.push("/"); return null; }

  const sections = [
    { icon: HiOutlineUsers, label: ge.admin.users, href: "/admin/users", color: "from-blue-500 to-indigo-600" },
    { icon: HiOutlineShoppingBag, label: ge.admin.shops, href: "/admin/shops", color: "from-purple-500 to-pink-600" },
    { icon: HiOutlineTag, label: ge.admin.categories, href: "/admin/categories", color: "from-green-500 to-emerald-600" },
    { icon: HiOutlineCreditCard, label: ge.admin.subscriptions, href: "/admin/subscriptions", color: "from-orange-500 to-red-600" },
    { icon: HiOutlineCurrencyDollar, label: ge.admin.finance, href: "/admin/finance", color: "from-teal-500 to-cyan-600" },
    { icon: HiOutlineChartBar, label: ge.admin.stats, href: "/admin/stats", color: "from-rose-500 to-purple-600" },
    { icon: HiOutlineFlag, label: ge.admin.complaints, href: "/admin/complaints", color: "from-yellow-500 to-orange-600" },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{ge.admin.title}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sections.map((section) => (
            <Link key={section.href} href={section.href} className="glass-card p-6 hover:shadow-lg transition-all group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold">{section.label}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
