import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  apiFetch,
  putAccessToken,
  removeAccessToken,
} from "@/helpers/apiHelper";
import { loginApi, registerApi, logoutApi } from "./authApi";

vi.mock("@/helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
  putAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginApi", () => {
    const payload = { email: "a@b.com", password: "123456" };

    it("menyimpan token jika login berhasil", async () => {
      const response = { status: "success", data: { token: "tok-1" } };
      apiFetchMock.mockResolvedValue(response);

      const result = await loginApi(payload);

      expect(apiFetchMock).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: payload,
      });
      expect(putAccessToken).toHaveBeenCalledWith("tok-1");
      expect(result).toBe(response);
    });

    it("tidak menyimpan token jika status bukan success", async () => {
      apiFetchMock.mockResolvedValue({
        status: "fail",
        data: { token: "tok-1" },
      });

      await loginApi(payload);

      expect(putAccessToken).not.toHaveBeenCalled();
    });

    it("tidak menyimpan token jika data tidak ada", async () => {
      apiFetchMock.mockResolvedValue({ status: "success" });

      await loginApi(payload);

      expect(putAccessToken).not.toHaveBeenCalled();
    });

    it("tidak menyimpan token jika token kosong", async () => {
      apiFetchMock.mockResolvedValue({ status: "success", data: { token: "" } });

      await loginApi(payload);

      expect(putAccessToken).not.toHaveBeenCalled();
    });
  });

  it("registerApi memanggil POST /auth/register", async () => {
    const response = { status: "success" };
    apiFetchMock.mockResolvedValue(response);
    const payload = { name: "Mimi", email: "a@b.com", password: "123456" };

    const result = await registerApi(payload);

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: payload,
    });
    expect(result).toBe(response);
  });

  describe("logoutApi", () => {
    it("memanggil POST /auth/logout lalu menghapus token", async () => {
      apiFetchMock.mockResolvedValue({ status: "success" });

      await logoutApi();

      expect(apiFetchMock).toHaveBeenCalledWith("/auth/logout", {
        method: "POST",
      });
      expect(removeAccessToken).toHaveBeenCalledTimes(1);
    });

    it("tetap menghapus token walaupun request gagal", async () => {
      apiFetchMock.mockRejectedValue(new Error("gagal"));

      await expect(logoutApi()).rejects.toThrow("gagal");
      expect(removeAccessToken).toHaveBeenCalledTimes(1);
    });
  });
});