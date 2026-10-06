"use client";

import { FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncLogin, clearAuthError } from "@/features/auth/states/authSlice";
import { useInput } from "@/hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { getAccessToken } from "@/helpers/apiHelper";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const email = useInput("");
  const password = useInput("");

  // Jika sudah ada token, langsung ke dashboard
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

    if (!email.value.trim() || !password.value.trim()) {
      showErrorDialog("Email dan password wajib diisi");
      return;
    }

    const result = await dispatch(
      asyncLogin({ email: email.value.trim(), password: password.value })
    );

    if (asyncLogin.fulfilled.match(result)) {
      await showSuccessDialog("Berhasil login");
      router.replace("/dashboard");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Masuk</h1>
      <p className="text-slate-500 mb-6 text-sm">
        ifs24048-pabwe2026-nextjs
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="login-email-input"
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
            id="login-password-input"
            type="password"
            value={password.value}
            onChange={password.onChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
          />
        </div>

        <button
          id="login-submit-button"
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-medium py-2.5 rounded-lg transition"
        >
          {isLoading ? "Memproses..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <a href="/auth/register" className="text-teal-700 underline">
          Daftar
        </a>
      </p>
    </div>
  );
}