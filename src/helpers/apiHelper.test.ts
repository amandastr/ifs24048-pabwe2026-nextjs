import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  apiFetch,
} from "./apiHelper";

vi.mock("@/lib/config", () => ({
  DELCOM_BASEURL: "https://api.test",
}));

const mockResponse = (data: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(data),
});

describe("token helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();

    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");

    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("tidak melakukan apa-apa saat window tidak tersedia (server)", () => {
    putAccessToken("abc");
    vi.stubGlobal("window", undefined);

    expect(getAccessToken()).toBeNull();
    putAccessToken("xyz");
    removeAccessToken();

    vi.unstubAllGlobals();
    expect(getAccessToken()).toBe("abc");
  });
});

describe("apiFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("memanggil GET dengan endpoint berawalan slash tanpa header tambahan", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: 1 }));

    const result = await apiFetch("/users");

    expect(result).toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/users", {
      method: "GET",
      headers: {},
      body: undefined,
    });
  });

  it("menambahkan slash jika endpoint tidak berawalan slash", async () => {
    fetchMock.mockResolvedValue(mockResponse({}));

    await apiFetch("users");

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/users");
  });

  it("menyusun query string dan melewati nilai undefined atau null", async () => {
    fetchMock.mockResolvedValue(mockResponse({}));

    await apiFetch("/posts", {
      params: {
        a: 1,
        b: "x",
        c: undefined,
        d: null as unknown as undefined,
        e: false,
      },
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.test/posts?a=1&b=x&e=false"
    );
  });

  it("tidak menambah tanda tanya jika semua params kosong", async () => {
    fetchMock.mockResolvedValue(mockResponse({}));

    await apiFetch("/posts", { params: { a: undefined } });

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/posts");
  });

  it("menambahkan header Authorization jika token ada", async () => {
    putAccessToken("token-1");
    fetchMock.mockResolvedValue(mockResponse({}));

    await apiFetch("/me", { headers: { "X-Test": "1" } });

    expect(fetchMock.mock.calls[0][1].headers).toEqual({
      "X-Test": "1",
      Authorization: "Bearer token-1",
    });
  });

  it("mengirim body JSON dengan Content-Type application/json", async () => {
    fetchMock.mockResolvedValue(mockResponse({}));

    await apiFetch("/posts", { method: "POST", body: { title: "Dompet" } });

    const options = fetchMock.mock.calls[0][1];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ title: "Dompet" }));
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    fetchMock.mockResolvedValue(mockResponse({}));
    const form = new FormData();
    form.append("cover", "x");

    await apiFetch("/cover", { method: "POST", body: form });

    const options = fetchMock.mock.calls[0][1];
    expect(options.body).toBe(form);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("tidak menambah Content-Type jika isFormData true", async () => {
    fetchMock.mockResolvedValue(mockResponse({}));

    await apiFetch("/upload", {
      method: "POST",
      body: { a: 1 },
      isFormData: true,
    });

    expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBeUndefined();
  });

  it("memakai objek kosong jika respons bukan JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new Error("bukan json")),
    });

    await expect(apiFetch("/kosong")).resolves.toEqual({});
  });

  it("melempar error dengan pesan dari server", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ message: "Data tidak valid" }, false, 400)
    );

    await expect(apiFetch("/x")).rejects.toThrow("Data tidak valid");
  });

  it("melempar error dengan pesan bawaan jika server tidak memberi pesan", async () => {
    fetchMock.mockResolvedValue(mockResponse({}, false, 500));

    await expect(apiFetch("/x")).rejects.toThrow(
      "Request failed with status 500"
    );
  });

  it("melempar pesan bawaan jika data respons null", async () => {
    fetchMock.mockResolvedValue(mockResponse(null, false, 404));

    await expect(apiFetch("/x")).rejects.toThrow(
      "Request failed with status 404"
    );
  });
});