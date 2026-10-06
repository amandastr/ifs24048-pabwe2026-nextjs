"use client";

import { FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncRegister, clearAuthError } from "@/features/auth/states/authSlice";
import { useInput } from "@/hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { getAccessToken } from "@/helpers/apiHelper";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const name = useInput("");
  const email = useInput("");
  const password = useInput("");

  // Jika sudah login, langsung ke dashboard
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (error) {
      showErrorDialog(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.value.trim() || !email.value.trim() || !password.value.trim()) {
      showErrorDialog("Semua field wajib diisi");
      return;
    }

    if (password.value.length < 6) {
      showErrorDialog("Password minimal 6 karakter");
      return;
    }

    const result = await dispatch(
      asyncRegister({
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
      })
    );

    if (asyncRegister.fulfilled.match(result)) {
      await showSuccessDialog("Registrasi berhasil! Silakan login.");
      router.replace("/auth/login");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Daftar</h1>
      <p className="text-slate-500 mb-6 text-sm">Buat akun baru</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nama
          </label>
          <input
            type="text"
            value={name.value}
            onChange={name.onChange}
            placeholder="Nama lengkap"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email.value}
            onChange={email.onChange}
            placeholder="email@contoh.com"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password.value}
            onChange={password.onChange}
            placeholder="Minimal 6 karakter"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-medium py-2.5 rounded-lg transition"
        >
          {isLoading ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <a href="/auth/login" className="text-teal-700 underline">
          Login
        </a>
      </p>
    </div>
  );
}