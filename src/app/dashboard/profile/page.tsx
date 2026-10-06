"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getAccessToken, removeAccessToken } from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import type { ApiResult, User } from "@/types";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    async function fetchProfile() {
      try {
        const result = await apiFetch<ApiResult<{ user: User }>>("/users/me");
        if (result.status === "success" && result.data?.user) {
          setUser(result.data.user);
        } else {
          showErrorDialog(result.message || "Gagal mengambil profil");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Gagal mengambil profil";
        showErrorDialog(message);
        if (message.toLowerCase().includes("unauthorized") || message.includes("401")) {
          removeAccessToken();
          router.replace("/auth/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  async function handleLogout() {
    removeAccessToken();
    await showSuccessDialog("Berhasil logout");
    router.replace("/auth/login");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Profil</h1>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-bold overflow-hidden">
              {user?.photo ? (
                <img
                  src={user.photo.startsWith("http") ? user.photo : `https://open-api.delcom.org/${user.photo}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user?.name || "-"}</h2>
              <p className="text-slate-500 text-sm">{user?.email || "-"}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">ID</span>
              <span className="font-medium text-slate-800">{user?.id ?? "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Nama</span>
              <span className="font-medium text-slate-800">{user?.name || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{user?.email || "-"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Dibuat</span>
              <span className="font-medium text-slate-800">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("id-ID")
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}