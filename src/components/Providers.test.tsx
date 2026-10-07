import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Providers } from "./Providers";
import { useAppSelector } from "@/hooks/redux";

function Isi() {
  const user = useAppSelector((s) => s.auth.user);
  return <p>{user === null ? "belum login" : "sudah login"}</p>;
}

describe("Providers", () => {
  it("menyediakan store Redux untuk komponen anak", () => {
    render(
      <Providers>
        <Isi />
      </Providers>
    );

    expect(screen.getByText("belum login")).toBeInTheDocument();
  });
});