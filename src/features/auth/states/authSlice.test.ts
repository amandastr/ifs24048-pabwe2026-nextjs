import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { loginApi, registerApi, logoutApi } from "../api/authApi";
import reducer, {
  asyncLogin,
  asyncRegister,
  asyncLogout,
  clearAuthError,
  setUser,
} from "./authSlice";

vi.mock("../api/authApi", () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  logoutApi: vi.fn(),
}));

const loginMock = vi.mocked(loginApi);
const registerMock = vi.mocked(registerApi);
const logoutMock = vi.mocked(logoutApi);

const makeStore = () => configureStore({ reducer: { auth: reducer } });
const initial = reducer(undefined, { type: "tidak-dikenal" });

const loginPayload = { email: "a@b.com", password: "123456" };
const registerPayload = { name: "Mimi", email: "a@b.com", password: "123456" };
const user = { id: 1, name: "Mimi" };

describe("authSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memiliki state awal", () => {
    expect(initial).toEqual({
      user: null,
      token: null,
      isLoading: false,
      isAuthLogin: false,
      isAuthRegister: false,
      isAuthLogout: false,
      error: null,
    });
  });

  it("clearAuthError menghapus error dan setUser mengisi user", () => {
    let state = reducer({ ...initial, error: "x" }, clearAuthError());
    expect(state.error).toBeNull();

    state = reducer(state, setUser(user as never));
    expect(state.user).toEqual(user);

    state = reducer(state, setUser(null));
    expect(state.user).toBeNull();
  });

  describe("asyncLogin", () => {
    it("pending mengaktifkan loading dan menghapus error", () => {
      const state = reducer(
        { ...initial, error: "lama" },
        asyncLogin.pending("id", loginPayload)
      );
      expect(state.isLoading).toBe(true);
      expect(state.isAuthLogin).toBe(true);
      expect(state.error).toBeNull();
    });

    it("berhasil menyimpan user dan token", async () => {
      loginMock.mockResolvedValue({
        status: "success",
        data: { user, token: "tok" },
      } as never);
      const store = makeStore();

      const result = await store.dispatch(asyncLogin(loginPayload));

      expect(asyncLogin.fulfilled.match(result)).toBe(true);
      expect(store.getState().auth.user).toEqual(user);
      expect(store.getState().auth.token).toBe("tok");
      expect(store.getState().auth.isLoading).toBe(false);
      expect(store.getState().auth.isAuthLogin).toBe(false);
    });

    it.each([
      [{ status: "fail", message: "Salah" }, "Salah"],
      [{ status: "fail" }, "Login gagal"],
      [{ status: "success" }, "Login gagal"],
    ])("ditolak untuk respons %j", async (response, expected) => {
      loginMock.mockResolvedValue(response as never);
      const store = makeStore();

      const result = await store.dispatch(asyncLogin(loginPayload));

      expect(asyncLogin.rejected.match(result)).toBe(true);
      expect(result.payload).toBe(expected);
      expect(store.getState().auth.error).toBe(expected);
      expect(store.getState().auth.isLoading).toBe(false);
    });

    it("ditolak dengan pesan dari Error", async () => {
      loginMock.mockRejectedValue(new Error("Jaringan putus"));
      const store = makeStore();

      const result = await store.dispatch(asyncLogin(loginPayload));

      expect(result.payload).toBe("Jaringan putus");
    });

    it("ditolak dengan pesan bawaan jika bukan Error", async () => {
      loginMock.mockRejectedValue("teks");
      const store = makeStore();

      const result = await store.dispatch(asyncLogin(loginPayload));

      expect(result.payload).toBe("Login gagal");
    });

    it("rejected memakai pesan bawaan jika payload kosong", () => {
      const state = reducer(
        { ...initial, isLoading: true, isAuthLogin: true },
        asyncLogin.rejected(null, "id", loginPayload)
      );
      expect(state.error).toBe("Login gagal");
      expect(state.isLoading).toBe(false);
      expect(state.isAuthLogin).toBe(false);
    });
  });

  describe("asyncRegister", () => {
    it("pending mengaktifkan loading dan menghapus error", () => {
      const state = reducer(
        { ...initial, error: "lama" },
        asyncRegister.pending("id", registerPayload)
      );
      expect(state.isLoading).toBe(true);
      expect(state.isAuthRegister).toBe(true);
      expect(state.error).toBeNull();
    });

    it("berhasil mematikan loading", async () => {
      registerMock.mockResolvedValue({ status: "success" } as never);
      const store = makeStore();

      const result = await store.dispatch(asyncRegister(registerPayload));

      expect(asyncRegister.fulfilled.match(result)).toBe(true);
      expect(store.getState().auth.isLoading).toBe(false);
      expect(store.getState().auth.isAuthRegister).toBe(false);
    });

    it.each([
      [{ status: "fail", message: "Email dipakai" }, "Email dipakai"],
      [{ status: "fail" }, "Registrasi gagal"],
    ])("ditolak untuk respons %j", async (response, expected) => {
      registerMock.mockResolvedValue(response as never);
      const store = makeStore();

      const result = await store.dispatch(asyncRegister(registerPayload));

      expect(asyncRegister.rejected.match(result)).toBe(true);
      expect(result.payload).toBe(expected);
      expect(store.getState().auth.error).toBe(expected);
    });

    it("ditolak dengan pesan dari Error", async () => {
      registerMock.mockRejectedValue(new Error("Server mati"));
      const store = makeStore();

      const result = await store.dispatch(asyncRegister(registerPayload));

      expect(result.payload).toBe("Server mati");
    });

    it("ditolak dengan pesan bawaan jika bukan Error", async () => {
      registerMock.mockRejectedValue(123);
      const store = makeStore();

      const result = await store.dispatch(asyncRegister(registerPayload));

      expect(result.payload).toBe("Registrasi gagal");
    });

    it("rejected memakai pesan bawaan jika payload kosong", () => {
      const state = reducer(
        { ...initial, isLoading: true, isAuthRegister: true },
        asyncRegister.rejected(null, "id", registerPayload)
      );
      expect(state.error).toBe("Registrasi gagal");
      expect(state.isAuthRegister).toBe(false);
    });
  });

  describe("asyncLogout", () => {
    it("pending menandai proses logout", () => {
      const state = reducer(initial, asyncLogout.pending("id"));
      expect(state.isAuthLogout).toBe(true);
    });

    it("berhasil mengosongkan user dan token", async () => {
      logoutMock.mockResolvedValue(undefined);
      const store = makeStore();
      store.dispatch(setUser(user as never));

      const result = await store.dispatch(asyncLogout());

      expect(asyncLogout.fulfilled.match(result)).toBe(true);
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.token).toBeNull();
      expect(store.getState().auth.isAuthLogout).toBe(false);
    });

    it("tetap mengosongkan user dan token saat gagal", async () => {
      logoutMock.mockRejectedValue(new Error("gagal"));
      const store = makeStore();
      store.dispatch(setUser(user as never));

      const result = await store.dispatch(asyncLogout());

      expect(asyncLogout.rejected.match(result)).toBe(true);
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.token).toBeNull();
      expect(store.getState().auth.isAuthLogout).toBe(false);
    });
  });
});