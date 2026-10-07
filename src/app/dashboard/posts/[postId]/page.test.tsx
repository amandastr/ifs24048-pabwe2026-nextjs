import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import postsReducer from "@/features/posts/states/postsSlice";

const { router, params } = vi.hoisted(() => ({
  router: { back: vi.fn() },
  params: {} as Record<string, string | undefined>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  useParams: () => params,
}));
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
vi.mock("@/helpers/toolsHelper", () => ({
  formatDate: (d: string) => `tgl ${d}`,
}));
vi.mock("@/features/posts/api/postApi", () => ({
  getPostsApi: vi.fn(),
  getPostDetailApi: vi.fn(),
  addPostApi: vi.fn(),
  likePostApi: vi.fn(),
  addCommentApi: vi.fn(),
}));

import { getPostDetailApi } from "@/features/posts/api/postApi";
import PostDetailPage from "./page";

const detailMock = vi.mocked(getPostDetailApi);

const renderPage = () => {
  const store = configureStore({ reducer: { posts: postsReducer } });
  render(
    <Provider store={store}>
      <PostDetailPage />
    </Provider>
  );
};

const berhasil = (post: unknown) =>
  detailMock.mockResolvedValue({ status: "success", data: { post } } as never);

describe("PostDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    params.postId = "1";
  });

  it("menampilkan teks memuat selama data diambil", () => {
    detailMock.mockReturnValue(new Promise(() => {}) as never);

    renderPage();

    expect(screen.getByText("Memuat detail...")).toBeInTheDocument();
  });

  it("memuat detail berdasarkan postId pada alamat", async () => {
    berhasil({ id: 1, description: "Isi" });

    renderPage();
    await screen.findByText("Isi");

    expect(detailMock).toHaveBeenCalledWith("1");
  });

  it("menampilkan pesan bawaan dan tidak memuat jika postId tidak ada", () => {
    params.postId = undefined;

    renderPage();

    expect(detailMock).not.toHaveBeenCalled();
    expect(screen.getByText("Postingan tidak ditemukan")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Kembali ke Dashboard" })
    ).toHaveAttribute("href", "/dashboard");
  });

  it("menampilkan pesan error dari server", async () => {
    detailMock.mockResolvedValue({ status: "fail", message: "Hilang" } as never);

    renderPage();

    expect(await screen.findByText("Hilang")).toBeInTheDocument();
  });

  it("menampilkan detail lengkap beserta komentar", async () => {
    berhasil({
      id: 1,
      description: "Isi lengkap",
      author: { name: "budi" },
      created_at: "c1",
      cover: "http://c/img.jpg",
      likes: [1, 2, 3],
      comments: [
        { id: 10, comment: "Bagus", created_at: "k1" },
        { id: 11, comment: "Mantap", created_at: "k2" },
      ],
    });

    renderPage();

    expect(await screen.findByText("Isi lengkap")).toBeInTheDocument();
    expect(screen.getByText("budi")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("tgl c1")).toBeInTheDocument();
    expect(screen.getByAltText("Cover")).toHaveAttribute(
      "src",
      "http://c/img.jpg"
    );
    expect(screen.getByText("3 suka")).toBeInTheDocument();
    expect(screen.getByText("2 komentar")).toBeInTheDocument();
    expect(screen.getByText("Komentar")).toBeInTheDocument();
    expect(screen.getByText("Bagus")).toBeInTheDocument();
    expect(screen.getByText("tgl k2")).toBeInTheDocument();
  });

  it("memakai data cadangan jika penulis, cover, suka, dan komentar tidak ada", async () => {
    berhasil({ id: 1, description: "Polos", created_at: "c1" });

    renderPage();

    expect(await screen.findByText("Polos")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument();
    expect(screen.queryByAltText("Cover")).not.toBeInTheDocument();
    expect(screen.getByText("0 suka")).toBeInTheDocument();
    expect(screen.getByText("0 komentar")).toBeInTheDocument();
    expect(screen.queryByText("Komentar")).not.toBeInTheDocument();
  });

  it("tidak menampilkan daftar komentar jika kosong dan nama penulis tidak ada", async () => {
    berhasil({
      id: 1,
      description: "Tanpa komentar",
      author: {},
      likes: [],
      comments: [],
    });

    renderPage();

    expect(await screen.findByText("Tanpa komentar")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.queryByText("Komentar")).not.toBeInTheDocument();
  });

  it("tombol kembali memanggil router.back", async () => {
    berhasil({ id: 1, description: "Isi" });
    renderPage();
    await screen.findByText("Isi");

    await userEvent.click(screen.getByRole("button", { name: /Kembali/ }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});