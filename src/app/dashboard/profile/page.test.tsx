import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

const { router } = vi.hoisted(() => ({ router: { replace: vi.fn() } }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("@/helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
  getAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));
vi.mock("@/helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
}));

import {
  apiFetch,
  getAccessToken,
  removeAccessToken,
} from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import ProfilePage from "./page";

const fetchMock = vi.mocked(apiFetch);
const tokenMock = vi.mocked(getAccessToken);

const berhasil = (user: unknown) =>
  fetchMock.mockResolvedValue({ status: "success", data: { user } } as never);

const tungguSelesai = () =>
  screen.findByRole("heading", { name: "Profil" });

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenMock.mockReturnValue("tok");
  });

  it("menuju login dan tidak mengambil data jika token tidak ada", () => {
    tokenMock.mockReturnValue(null);

    render(<ProfilePage />);

    expect(router.replace).toHaveBeenCalledWith("/auth/login");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("Memuat profil...")).toBeInTheDocument();
  });

  it("menampilkan profil lengkap dengan foto dari alamat penuh", async () => {
    berhasil({
      id: 5,
      name: "Mimi",
      email: "mimi@x.com",
      photo: "http://p/mimi.jpg",
      created_at: "2024-10-05T10:00:00Z",
    });

    render(<ProfilePage />);
    await tungguSelesai();

    expect(fetchMock).toHaveBeenCalledWith("/users/me");
    expect(screen.getByAltText("Mimi")).toHaveAttribute(
      "src",
      "http://p/mimi.jpg"
    );
    expect(screen.getAllByText("Mimi")).toHaveLength(2);
    expect(screen.getAllByText("mimi@x.com")).toHaveLength(2);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("melengkapi alamat foto yang relatif", async () => {
    berhasil({ id: 5, name: "Mimi", photo: "uploads/mimi.jpg" });

    render(<ProfilePage />);
    await tungguSelesai();

    expect(screen.getByAltText("Mimi")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/uploads/mimi.jpg"
    );
  });

  it("memakai inisial dan tanda hubung jika data pengguna minim", async () => {
    berhasil({ id: 7 });

    render(<ProfilePage />);
    await tungguSelesai();

    expect(screen.getByText("U")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("memakai huruf pertama nama jika tidak ada foto", async () => {
    berhasil({ id: 8, name: "mimi" });

    render(<ProfilePage />);
    await tungguSelesai();

    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("menampilkan error bawaan jika data pengguna tidak ada", async () => {
    fetchMock.mockResolvedValue({ status: "success", data: {} } as never);

    render(<ProfilePage />);
    await tungguSelesai();

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengambil profil");
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("menampilkan pesan error dari server", async () => {
    fetchMock.mockResolvedValue({ status: "fail", message: "Ditolak" } as never);

    render(<ProfilePage />);
    await tungguSelesai();

    expect(showErrorDialog).toHaveBeenCalledWith("Ditolak");
  });

  it("error unauthorized menghapus token dan menuju login", async () => {
    fetchMock.mockRejectedValue(new Error("Unauthorized"));

    render(<ProfilePage />);
    await tungguSelesai();

    expect(showErrorDialog).toHaveBeenCalledWith("Unauthorized");
    expect(removeAccessToken).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/auth/login");
  });

  it("error berkode 401 juga menuju login", async () => {
    fetchMock.mockRejectedValue(new Error("HTTP 401"));

    render(<ProfilePage />);
    await tungguSelesai();

    expect(removeAccessToken).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/auth/login");
  });

  it("error lain hanya menampilkan dialog", async () => {
    fetchMock.mockRejectedValue(new Error("Jaringan putus"));

    render(<ProfilePage />);
    await tungguSelesai();

    expect(showErrorDialog).toHaveBeenCalledWith("Jaringan putus");
    expect(removeAccessToken).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("memakai pesan bawaan jika yang dilempar bukan Error", async () => {
    fetchMock.mockRejectedValue("teks");

    render(<ProfilePage />);
    await tungguSelesai();

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengambil profil");
  });

  it("logout menghapus token, menampilkan dialog, lalu menuju login", async () => {
    berhasil({ id: 1, name: "Mimi" });
    render(<ProfilePage />);
    await tungguSelesai();

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/auth/login")
    );
    expect(removeAccessToken).toHaveBeenCalledTimes(1);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil logout");
  });
});