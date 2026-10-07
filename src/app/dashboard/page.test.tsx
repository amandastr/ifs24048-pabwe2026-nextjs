import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import postsReducer from "@/features/posts/states/postsSlice";

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
vi.mock("@/helpers/apiHelper", () => ({ removeAccessToken: vi.fn() }));
vi.mock("@/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
  formatDate: (d: string) => `tgl ${d}`,
}));
vi.mock("@/features/posts/api/postApi", () => ({
  getPostsApi: vi.fn(),
  getPostDetailApi: vi.fn(),
  addPostApi: vi.fn(),
  likePostApi: vi.fn(),
  addCommentApi: vi.fn(),
}));

import { removeAccessToken } from "@/helpers/apiHelper";
import { showSuccessDialog } from "@/helpers/toolsHelper";
import { getPostsApi } from "@/features/posts/api/postApi";
import DashboardPage from "./page";

const getPostsMock = vi.mocked(getPostsApi);

const posts = [
  {
    id: 1,
    description: "Halo dunia",
    author: { name: "Budi" },
    created_at: "c1",
    cover: "http://c/img.jpg",
    likes: [1, 2],
    comments: [1],
  },
  {
    id: 2,
    description: undefined,
    author: { name: "Siti" },
    created_at: "c2",
    likes: undefined,
    comments: undefined,
  },
  { id: 3, description: "Kucing", author: undefined, created_at: "c3" },
  { id: 4, description: "Anjing", author: {}, created_at: "c4" },
];

const renderPage = (list: unknown[]) => {
  getPostsMock.mockResolvedValue({
    status: "success",
    data: { posts: list },
  } as never);
  const store = configureStore({ reducer: { posts: postsReducer } });
  render(
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
  return store;
};

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan daftar postingan lengkap dengan data cadangan", async () => {
    renderPage(posts);

    expect(await screen.findByText("Halo dunia")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Siti")).toBeInTheDocument();
    expect(screen.getAllByText("Pengguna")).toHaveLength(2);
    expect(screen.getAllByText("U")).toHaveLength(2);
    expect(screen.getByAltText("Cover")).toHaveAttribute(
      "src",
      "http://c/img.jpg"
    );
    expect(screen.getByText("2 suka")).toBeInTheDocument();
    expect(screen.getByText("1 komentar")).toBeInTheDocument();
    expect(screen.getAllByText("0 suka")).toHaveLength(3);
    expect(screen.getByText("tgl c1")).toBeInTheDocument();
  });

  it("menampilkan teks memuat selama data diambil", () => {
    getPostsMock.mockReturnValue(new Promise(() => {}) as never);
    const store = configureStore({ reducer: { posts: postsReducer } });
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByText("Memuat postingan...")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong jika tidak ada postingan", async () => {
    renderPage([]);

    expect(
      await screen.findByText("Tidak ada postingan ditemukan.")
    ).toBeInTheDocument();
  });

  it("menampilkan pesan error dari server", async () => {
    getPostsMock.mockResolvedValue({
      status: "fail",
      message: "Server error",
    } as never);
    const store = configureStore({ reducer: { posts: postsReducer } });
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("mencari berdasarkan nama penulis", async () => {
    renderPage(posts);
    await screen.findByText("Halo dunia");

    await userEvent.type(screen.getByPlaceholderText("Cari postingan..."), "siti");

    expect(screen.queryByText("Halo dunia")).not.toBeInTheDocument();
    expect(screen.getByText("Siti")).toBeInTheDocument();
  });

  it("mencari berdasarkan deskripsi", async () => {
    renderPage(posts);
    await screen.findByText("Halo dunia");

    await userEvent.type(screen.getByPlaceholderText("Cari postingan..."), "kucing");

    expect(screen.getByText("Kucing")).toBeInTheDocument();
    expect(screen.queryByText("Halo dunia")).not.toBeInTheDocument();
  });

  it("menampilkan pesan kosong jika pencarian tidak cocok", async () => {
    renderPage(posts);
    await screen.findByText("Halo dunia");

    await userEvent.type(screen.getByPlaceholderText("Cari postingan..."), "zzz");

    expect(
      screen.getByText("Tidak ada postingan ditemukan.")
    ).toBeInTheDocument();
  });

  it("tombol filter memuat ulang dengan isMe sesuai pilihan", async () => {
    renderPage([]);
    await waitFor(() => expect(getPostsMock).toHaveBeenCalledWith(false));

    await userEvent.click(screen.getByRole("button", { name: "Postingan Saya" }));
    await waitFor(() => expect(getPostsMock).toHaveBeenLastCalledWith(true));

    await userEvent.click(screen.getByRole("button", { name: "Semua" }));
    await waitFor(() => expect(getPostsMock).toHaveBeenLastCalledWith(false));
  });

  it("logout menghapus token, menampilkan dialog, lalu menuju login", async () => {
    renderPage([]);

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/auth/login")
    );
    expect(removeAccessToken).toHaveBeenCalledTimes(1);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil logout");
  });
});