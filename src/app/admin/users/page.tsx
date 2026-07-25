"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/locale";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const t = useT();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { router.push("/"); return; }
    fetch("/api/admin/users").then(r => r.json()).then(data => setUsers(data.users || [])).catch(() => {});
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">{t.admin.users}</h1>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-500">სახელი</th>
                  <th className="text-left p-4 font-medium text-gray-500">ელ. ფოსტა</th>
                  <th className="text-left p-4 font-medium text-gray-500">როლი</th>
                  <th className="text-left p-4 font-medium text-gray-500">თარიღი</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{u.fullName}</td>
                    <td className="p-4 text-gray-500">{u.email}</td>
                    <td className="p-4"><span className={`badge ${u.role === "ADMIN" ? "badge-purple" : u.role === "VENDOR" ? "badge-blue" : "badge-green"}`}>{u.role}</span></td>
                    <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
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
