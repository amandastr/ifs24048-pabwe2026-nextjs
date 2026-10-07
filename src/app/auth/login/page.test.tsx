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
import { loginApi } from "@/features/auth/api/authApi";
import LoginPage from "./page";

const loginMock = vi.mocked(loginApi);
const tokenMock = vi.mocked(getAccessToken);

const renderPage = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  render(
    <Provider store={store}>
      <LoginPage />
    </Provider>
  );
  return store;
};

const isiEmail = (v: string) =>
  userEvent.type(screen.getByPlaceholderText("email@contoh.com"), v);
const isiPassword = (v: string) =>
  userEvent.type(screen.getByPlaceholderText("••••••••"), v);
const klikLogin = () =>
  userEvent.click(screen.getByRole("button", { name: /Login|Memproses/ }));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenMock.mockReturnValue(null);
  });

  it("menampilkan form dan tidak berpindah jika belum ada token", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("langsung menuju dashboard jika token sudah ada", () => {
    tokenMock.mockReturnValue("tok");
    renderPage();

    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("menolak jika email kosong", async () => {
    renderPage();

    await isiPassword("123456");
    await klikLogin();

    expect(showErrorDialog).toHaveBeenCalledWith("Email dan password wajib diisi");
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("menolak jika password kosong", async () => {
    renderPage();

    await isiEmail("a@b.com");
    await klikLogin();

    expect(showErrorDialog).toHaveBeenCalledWith("Email dan password wajib diisi");
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("login berhasil menampilkan dialog lalu menuju dashboard", async () => {
    loginMock.mockResolvedValue({
      status: "success",
      data: { user: { id: 1 }, token: "tok" },
    } as never);
    renderPage();

    await isiEmail("a@b.com");
    await isiPassword("123456");
    await klikLogin();

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
    expect(loginMock).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "123456",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil login");
  });

  it("login gagal menampilkan error, menghapusnya dari store, dan tidak berpindah", async () => {
    loginMock.mockResolvedValue({ status: "fail", message: "Salah" } as never);
    const store = renderPage();

    await isiEmail("a@b.com");
    await isiPassword("123456");
    await klikLogin();

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Salah"));
    await waitFor(() => expect(store.getState().auth.error).toBeNull());
    expect(router.replace).not.toHaveBeenCalled();
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol selama proses login", async () => {
    let selesai!: (v: unknown) => void;
    loginMock.mockReturnValue(
      new Promise((r) => {
        selesai = r;
      }) as never
    );
    renderPage();

    await isiEmail("a@b.com");
    await isiPassword("123456");
    await klikLogin();

    const tombol = await screen.findByRole("button", { name: "Memproses..." });
    expect(tombol).toBeDisabled();

    selesai({ status: "fail", message: "x" });
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("x"));
  });
});