import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({ variable: "font-test" }),
}));

vi.mock("./globals.css", () => ({}));

import RootLayout, { metadata } from "./layout";

describe("RootLayout (features/auth/layouts)", () => {
  it("membungkus anak dengan html lang id, font, dan Providers", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <p>isi halaman</p>
      </RootLayout>
    );

    expect(html).toContain('lang="id"');
    expect(html).toContain("font-test");
    expect(html).toContain("isi halaman");
  });

  it("memiliki metadata judul dan deskripsi", () => {
    expect(metadata.title).toBe("Delcom Posts | ifs24048");
    expect(metadata.description).toBe("Aplikasi Postingan - PABWE 2026");
  });
});