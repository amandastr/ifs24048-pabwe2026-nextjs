"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, getAccessToken, removeAccessToken } from "@/helpers/apiHelper";
import { showErrorDialog } from "@/helpers/toolsHelper";
import type { ApiResult, User } from "@/types";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    async function fetchUsers() {
      try {
        const result = await apiFetch<ApiResult<{ users: User[] }>>("/users");
        if (result.status === "success" && result.data?.users) {
          setUsers(result.data.users);
        } else {
          showErrorDialog(result.message || "Gagal mengambil daftar pengguna");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Gagal mengambil daftar pengguna";
        showErrorDialog(message);
        if (message.toLowerCase().includes("unauthorized") || message.includes("401")) {
          removeAccessToken();
          router.replace("/auth/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(q)
    );
  }, [users, keyword]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Daftar Pengguna</h1>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Profil
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <label htmlFor="users-search" className="sr-only">
          Cari pengguna
        </label>
        <input
          id="users-search"
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
        />

        {isLoading ? (
          <p className="text-slate-500">Memuat pengguna...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500">Tidak ada pengguna ditemukan.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((user) => (
              <li
                key={user.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden">
                  {user.photo ? (
                    <img
                      src={
                        user.photo.startsWith("http")
                          ? user.photo
                          : `https://open-api.delcom.org/${user.photo}`
                      }
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}