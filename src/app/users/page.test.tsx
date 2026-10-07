import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
}));

import {
  apiFetch,
  getAccessToken,
  removeAccessToken,
} from "@/helpers/apiHelper";
import { showErrorDialog } from "@/helpers/toolsHelper";
import UsersPage from "./page";

const fetchMock = vi.mocked(apiFetch);
const tokenMock = vi.mocked(getAccessToken);

const users = [
  { id: 1, name: "Budi", email: "budi@x.com", photo: "http://p/b.jpg" },
  { id: 2, name: "Siti", email: "siti@x.com", photo: "uploads/s.jpg" },
  { id: 3 },
];

const berhasil = (list: unknown[]) =>
  fetchMock.mockResolvedValue({
    status: "success",
    data: { users: list },
  } as never);

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenMock.mockReturnValue("tok");
  });

  it("menuju login dan tidak mengambil data jika token tidak ada", () => {
    tokenMock.mockReturnValue(null);

    render(<UsersPage />);

    expect(router.replace).toHaveBeenCalledWith("/auth/login");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("menampilkan teks memuat selama data diambil", () => {
    fetchMock.mockReturnValue(new Promise(() => {}) as never);

    render(<UsersPage />);

    expect(screen.getByText("Memuat pengguna...")).toBeInTheDocument();
  });

  it("menampilkan daftar pengguna dengan berbagai jenis foto", async () => {
    berhasil(users);

    render(<UsersPage />);

    expect(await screen.findByText("Budi")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/users");
    expect(screen.getByAltText("Budi")).toHaveAttribute(
      "src",
      "http://p/b.jpg"
    );
    expect(screen.getByAltText("Siti")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/uploads/s.jpg"
    );
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("memakai huruf pertama nama jika tidak ada foto", async () => {
    berhasil([{ id: 9, name: "mimi", email: "m@x.com" }]);

    render(<UsersPage />);

    expect(await screen.findByText("M")).toBeInTheDocument();
  });

  it("menyaring berdasarkan kata kunci", async () => {
    berhasil(users);
    render(<UsersPage />);
    await screen.findByText("Budi");

    await userEvent.type(screen.getByLabelText("Cari pengguna"), "budi");

    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.queryByText("Siti")).not.toBeInTheDocument();
  });

  it("menampilkan semua jika kata kunci hanya spasi", async () => {
    berhasil(users);
    render(<UsersPage />);
    await screen.findByText("Budi");

    await userEvent.type(screen.getByLabelText("Cari pengguna"), "   ");

    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Siti")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong jika tidak ada yang cocok", async () => {
    berhasil(users);
    render(<UsersPage />);
    await screen.findByText("Budi");

    await userEvent.type(screen.getByLabelText("Cari pengguna"), "zzz");

    expect(
      screen.getByText("Tidak ada pengguna ditemukan.")
    ).toBeInTheDocument();
  });

  it("menampilkan error bawaan jika data pengguna tidak ada", async () => {
    fetchMock.mockResolvedValue({ status: "success", data: {} } as never);

    render(<UsersPage />);

    expect(
      await screen.findByText("Tidak ada pengguna ditemukan.")
    ).toBeInTheDocument();
    expect(showErrorDialog).toHaveBeenCalledWith(
      "Gagal mengambil daftar pengguna"
    );
  });

  it("menampilkan pesan error dari server", async () => {
    fetchMock.mockResolvedValue({ status: "fail", message: "Ditolak" } as never);

    render(<UsersPage />);
    await screen.findByText("Tidak ada pengguna ditemukan.");

    expect(showErrorDialog).toHaveBeenCalledWith("Ditolak");
  });

  it("error unauthorized menghapus token dan menuju login", async () => {
    fetchMock.mockRejectedValue(new Error("Unauthorized"));

    render(<UsersPage />);
    await screen.findByText("Tidak ada pengguna ditemukan.");

    expect(showErrorDialog).toHaveBeenCalledWith("Unauthorized");
    expect(removeAccessToken).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/auth/login");
  });

  it("error berkode 401 juga menuju login", async () => {
    fetchMock.mockRejectedValue(new Error("HTTP 401"));

    render(<UsersPage />);
    await screen.findByText("Tidak ada pengguna ditemukan.");

    expect(removeAccessToken).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/auth/login");
  });

  it("error lain hanya menampilkan dialog", async () => {
    fetchMock.mockRejectedValue(new Error("Jaringan putus"));

    render(<UsersPage />);
    await screen.findByText("Tidak ada pengguna ditemukan.");

    expect(showErrorDialog).toHaveBeenCalledWith("Jaringan putus");
    expect(removeAccessToken).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("memakai pesan bawaan jika yang dilempar bukan Error", async () => {
    fetchMock.mockRejectedValue("teks");

    render(<UsersPage />);
    await screen.findByText("Tidak ada pengguna ditemukan.");

    expect(showErrorDialog).toHaveBeenCalledWith(
      "Gagal mengambil daftar pengguna"
    );
  });
});