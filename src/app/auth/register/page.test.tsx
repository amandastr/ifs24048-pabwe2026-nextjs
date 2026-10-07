import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/states/authSlice";

const { router } = vi.hoisted(() => ({ router: { replace: vi.fn() } }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/helpers/apiHelper", () => ({ getAccessToken: vi.fn() }));
vi.mock("@/helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/features/auth/api/authApi", () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  logoutApi: vi.fn(),
}));

import { getAccessToken } from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { registerApi } from "@/features/auth/api/authApi";
import RegisterPage from "./page";

const registerMock = vi.mocked(registerApi);
const tokenMock = vi.mocked(getAccessToken);

const renderPage = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  render(
    <Provider store={store}>
      <RegisterPage />
    </Provider>
  );
  return store;
};

const isiNama = (v: string) =>
  userEvent.type(screen.getByPlaceholderText("Nama lengkap"), v);
const isiEmail = (v: string) =>
  userEvent.type(screen.getByPlaceholderText("email@contoh.com"), v);
const isiPassword = (v: string) =>
  userEvent.type(screen.getByPlaceholderText("Minimal 6 karakter"), v);
const klikDaftar = () =>
  userEvent.click(screen.getByRole("button", { name: /Daftar|Memproses/ }));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenMock.mockReturnValue(null);
  });

  it("menampilkan form dan tidak berpindah jika belum ada token", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("langsung menuju dashboard jika token sudah ada", () => {
    tokenMock.mockReturnValue("tok");
    renderPage();

    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("menolak jika nama kosong", async () => {
    renderPage();

    await isiEmail("a@b.com");
    await isiPassword("123456");
    await klikDaftar();

    expect(showErrorDialog).toHaveBeenCalledWith("Semua field wajib diisi");
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("menolak jika email kosong", async () => {
    renderPage();

    await isiNama("Mimi");
    await isiPassword("123456");
    await klikDaftar();

    expect(showErrorDialog).toHaveBeenCalledWith("Semua field wajib diisi");
  });

  it("menolak jika password kosong", async () => {
    renderPage();

    await isiNama("Mimi");
    await isiEmail("a@b.com");
    await klikDaftar();

    expect(showErrorDialog).toHaveBeenCalledWith("Semua field wajib diisi");
  });

  it("menolak password kurang dari 6 karakter", async () => {
    renderPage();

    await isiNama("Mimi");
    await isiEmail("a@b.com");
    await isiPassword("123");
    await klikDaftar();

    expect(showErrorDialog).toHaveBeenCalledWith("Password minimal 6 karakter");
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("registrasi berhasil menampilkan dialog lalu menuju login", async () => {
    registerMock.mockResolvedValue({ status: "success" } as never);
    renderPage();

    await isiNama("Mimi");
    await isiEmail("a@b.com");
    await isiPassword("123456");
    await klikDaftar();

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/auth/login"));
    expect(registerMock).toHaveBeenCalledWith({
      name: "Mimi",
      email: "a@b.com",
      password: "123456",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith(
      "Registrasi berhasil! Silakan login."
    );
  });

  it("registrasi gagal menampilkan error dan tidak berpindah", async () => {
    registerMock.mockResolvedValue({
      status: "fail",
      message: "Email dipakai",
    } as never);
    const store = renderPage();

    await isiNama("Mimi");
    await isiEmail("a@b.com");
    await isiPassword("123456");
    await klikDaftar();

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai")
    );
    await waitFor(() => expect(store.getState().auth.error).toBeNull());
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol selama proses registrasi", async () => {
    let selesai!: (v: unknown) => void;
    registerMock.mockReturnValue(
      new Promise((r) => {
        selesai = r;
      }) as never
    );
    renderPage();

    await isiNama("Mimi");
    await isiEmail("a@b.com");
    await isiPassword("123456");
    await klikDaftar();

    const tombol = await screen.findByRole("button", { name: "Memproses..." });
    expect(tombol).toBeDisabled();

    selesai({ status: "fail", message: "x" });
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("x"));
  });
});