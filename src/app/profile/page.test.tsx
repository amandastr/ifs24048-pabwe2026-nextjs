import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/dashboard/profile/page", () => ({
  default: () => <p>halaman profil</p>,
}));

import ProfileRedirectPage from "./page";

describe("app/profile/page", () => {
  it("menampilkan halaman profil dashboard", () => {
    render(<ProfileRedirectPage />);

    expect(screen.getByText("halaman profil")).toBeInTheDocument();
  });
});