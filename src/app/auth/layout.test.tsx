import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLayout from "./layout";

describe("AuthLayout (app/auth)", () => {
  it("menampilkan konten anak di dalam kartu tengah", () => {
    render(
      <AuthLayout>
        <p>isi auth</p>
      </AuthLayout>
    );

    const isi = screen.getByText("isi auth");
    expect(isi).toBeInTheDocument();
    expect(isi.parentElement).toHaveClass("max-w-md");
  });
});