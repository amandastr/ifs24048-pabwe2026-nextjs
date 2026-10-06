"use client";

import { useRouter } from "next/navigation";
import { removeAccessToken } from "@/helpers/apiHelper";
import { showSuccessDialog } from "@/helpers/toolsHelper";

export default function DashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    removeAccessToken();
    await showSuccessDialog("Berhasil logout");
    router.replace("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Delcom Posts</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
        >
          Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Selamat datang!
          </h2>
          <p className="text-slate-500 mb-6">
            Login berhasil. Anda sudah masuk ke Dashboard.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            Status: Terautentikasi
          </div>
        </div>
      </main>
    </div>
  );
}