import { describe, it, expect, vi, afterEach } from "vitest";

describe("config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("memakai nilai bawaan jika env tidak diisi", async () => {
    vi.stubEnv("NEXT_PUBLIC_DELCOM_BASEURL", "");
    vi.stubEnv("APP_PORT", "");

    const config = await import("./config");

    expect(config.DELCOM_BASEURL).toBe("https://open-api.delcom.org/api/v1");
    expect(config.APP_PORT).toBe(3000);
  });

  it("memakai nilai dari env jika diisi", async () => {
    vi.stubEnv("NEXT_PUBLIC_DELCOM_BASEURL", "https://api.test/v1");
    vi.stubEnv("APP_PORT", "4000");

    const config = await import("./config");

    expect(config.DELCOM_BASEURL).toBe("https://api.test/v1");
    expect(config.APP_PORT).toBe(4000);
  });
});