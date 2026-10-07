import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  apiFetch,
} from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ========== TOKEN ==========
  it("putAccessToken & getAccessToken bekerja", () => {
    putAccessToken("token-abc");
    expect(getAccessToken()).toBe("token-abc");
  });

  it("removeAccessToken menghapus token", () => {
    putAccessToken("token-abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("getAccessToken return null jika tidak ada token", () => {
    expect(getAccessToken()).toBeNull();
  });

  // ========== apiFetch SUCCESS ==========
  it("apiFetch success tanpa options", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { id: 1 } }),
    });

    const res = await apiFetch("/posts");
    expect(res).toEqual({ status: "success", data: { id: 1 } });
    expect(global.fetch).toHaveBeenCalled();
  });

  it("apiFetch menambahkan slash jika endpoint tanpa slash", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await apiFetch("posts");
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain("/posts");
  });

  // ========== QUERY PARAMS ==========
  it("apiFetch menambahkan query params", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success" }),
    });

    await apiFetch("/posts", {
      params: { is_me: 1, page: 2, empty: undefined },
    });

    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain("is_me=1");
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).not.toContain("empty");
  });

  it("apiFetch tidak menambah ? jika params kosong / semua undefined", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await apiFetch("/posts", {
      params: { a: undefined, b: undefined },
    });

    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).not.toContain("?");
  });

  // ========== AUTHORIZATION ==========
  it("apiFetch menambahkan Authorization header jika ada token", async () => {
    putAccessToken("token-xyz");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await apiFetch("/users/me");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-xyz",
        }),
      })
    );
  });

  it("apiFetch tidak menambahkan Authorization jika tidak ada token", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await apiFetch("/posts");

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(options.headers.Authorization).toBeUndefined();
  });

  // ========== BODY JSON ==========
  it("apiFetch set Content-Type json dan stringify body object", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await apiFetch("/posts", {
      method: "POST",
      body: { description: "halo" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ description: "halo" }),
      })
    );
  });

  // ========== FORM DATA ==========
  it("apiFetch tidak set Content-Type jika isFormData true", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const form = new FormData();
    form.append("cover", new Blob(["x"]), "cover.jpg");

    await apiFetch("/posts/1/cover", {
      method: "POST",
      body: form,
      isFormData: true,
    });

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(options.headers["Content-Type"]).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
  });

  it("apiFetch mengirim FormData langsung jika body instanceof FormData", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const form = new FormData();
    form.append("photo", new Blob(["img"]), "photo.png");

    await apiFetch("/users/me/photo", {
      method: "POST",
      body: form,
    });

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(options.body).toBeInstanceOf(FormData);
    // karena body instanceof FormData, Content-Type tidak di-set
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  // ========== ERROR HANDLING ==========
  it("apiFetch throw message dari response jika tidak ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    });

    await expect(apiFetch("/posts")).rejects.toThrow("Unauthorized");
  });

  it("apiFetch throw message default jika response tidak ok dan tanpa message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(apiFetch("/posts")).rejects.toThrow(
      "Request failed with status 500"
    );
  });

  it("apiFetch handle json parse error (catch return {})", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error("invalid json");
      },
    });

    const res = await apiFetch("/posts");
    expect(res).toEqual({});
  });

  // ========== BODY UNDEFINED / GET ==========
  it("apiFetch body undefined jika tidak ada body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await apiFetch("/posts", { method: "GET" });

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(options.body).toBeUndefined();
  });
});

  // ========== SSR / window undefined (baris 6, 11, 16) ==========
  it("getAccessToken return null saat window undefined (SSR)", () => {
    const originalWindow = global.window;
    // @ts-expect-error simulate SSR
    delete global.window;

    expect(getAccessToken()).toBeNull();

    global.window = originalWindow;
  });

  it("putAccessToken tidak error saat window undefined (SSR)", () => {
    const originalWindow = global.window;
    // @ts-expect-error simulate SSR
    delete global.window;

    expect(() => putAccessToken("token-ssr")).not.toThrow();
    expect(getAccessToken()).toBeNull();

    global.window = originalWindow;
  });

  it("removeAccessToken tidak error saat window undefined (SSR)", () => {
    const originalWindow = global.window;
    // @ts-expect-error simulate SSR
    delete global.window;

    expect(() => removeAccessToken()).not.toThrow();

    global.window = originalWindow;
  });