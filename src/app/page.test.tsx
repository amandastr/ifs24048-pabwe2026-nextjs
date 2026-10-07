import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { router } = vi.hoisted(() => ({ router: { replace: vi.fn() } }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/helpers/apiHelper", () => ({ removeAccessToken: vi.fn() }));
vi.mock("@/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
}));

import { removeAccessToken } from "@/helpers/apiHelper";
import { showSuccessDialog } from "@/helpers/toolsHelper";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan sambutan dan status terautentikasi", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Selamat datang!")).toBeInTheDocument();
    expect(screen.getByText(/Status: Terautentikasi/)).toBeInTheDocument();
  });

  it("logout menghapus token, menampilkan dialog, lalu menuju login", async () => {
    render(<DashboardPage />);

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/auth/login"));
    expect(removeAccessToken).toHaveBeenCalledTimes(1);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil logout");
  });
});