import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  getPostsApi,
  getPostDetailApi,
  addPostApi,
  likePostApi,
} from "../api/postApi";
import reducer, {
  asyncGetPosts,
  asyncGetPostDetail,
  asyncAddPost,
  asyncLikePost,
  clearPostsError,
} from "./postsSlice";

vi.mock("../api/postApi", () => ({
  getPostsApi: vi.fn(),
  getPostDetailApi: vi.fn(),
  addPostApi: vi.fn(),
  likePostApi: vi.fn(),
  addCommentApi: vi.fn(),
}));

const getPostsMock = vi.mocked(getPostsApi);
const getDetailMock = vi.mocked(getPostDetailApi);
const addPostMock = vi.mocked(addPostApi);
const likeMock = vi.mocked(likePostApi);

const makeStore = () => configureStore({ reducer: { posts: reducer } });
const initial = reducer(undefined, { type: "tidak-dikenal" });
const post = { id: 1, description: "halo" };

describe("postsSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memiliki state awal dan clearPostsError menghapus error", () => {
    expect(initial).toEqual({
      posts: [],
      post: null,
      isLoading: false,
      error: null,
    });
    expect(reducer({ ...initial, error: "x" }, clearPostsError()).error).toBeNull();
  });

  describe("asyncGetPosts", () => {
    it("pending mengaktifkan loading", () => {
      const state = reducer(
        { ...initial, error: "lama" },
        asyncGetPosts.pending("id", false)
      );
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("berhasil menyimpan daftar dan memakai isMe false secara bawaan", async () => {
      getPostsMock.mockResolvedValue({
        status: "success",
        data: { posts: [post] },
      } as never);
      const store = makeStore();

      const result = await store.dispatch(asyncGetPosts());

      expect(asyncGetPosts.fulfilled.match(result)).toBe(true);
      expect(getPostsMock).toHaveBeenCalledWith(false);
      expect(store.getState().posts.posts).toEqual([post]);
      expect(store.getState().posts.isLoading).toBe(false);
    });

    it("meneruskan isMe true", async () => {
      getPostsMock.mockResolvedValue({
        status: "success",
        data: { posts: [] },
      } as never);

      await makeStore().dispatch(asyncGetPosts(true));

      expect(getPostsMock).toHaveBeenCalledWith(true);
    });

    it.each([
      [{ status: "success" }],
      [{ status: "success", data: {} }],
    ])("daftar kosong jika data tidak lengkap: %j", async (response) => {
      getPostsMock.mockResolvedValue(response as never);
      const store = makeStore();

      await store.dispatch(asyncGetPosts());

      expect(store.getState().posts.posts).toEqual([]);
    });

    it.each([
      [{ status: "fail", message: "Ditolak" }, "Ditolak"],
      [{ status: "fail" }, "Gagal mengambil postingan"],
    ])("ditolak untuk respons %j", async (response, expected) => {
      getPostsMock.mockResolvedValue(response as never);
      const store = makeStore();

      const result = await store.dispatch(asyncGetPosts());

      expect(asyncGetPosts.rejected.match(result)).toBe(true);
      expect(result.payload).toBe(expected);
      expect(store.getState().posts.error).toBe(expected);
    });

    it("ditolak dengan pesan dari Error dan pesan bawaan jika bukan Error", async () => {
      getPostsMock.mockRejectedValueOnce(new Error("Putus"));
      let result = await makeStore().dispatch(asyncGetPosts());
      expect(result.payload).toBe("Putus");

      getPostsMock.mockRejectedValueOnce("teks");
      result = await makeStore().dispatch(asyncGetPosts());
      expect(result.payload).toBe("Gagal mengambil postingan");
    });

    it("rejected memakai pesan bawaan jika payload kosong", () => {
      const state = reducer(
        { ...initial, isLoading: true },
        asyncGetPosts.rejected(null, "id", false)
      );
      expect(state.error).toBe("Gagal mengambil data");
      expect(state.isLoading).toBe(false);
    });
  });

  describe("asyncGetPostDetail", () => {
    it("pending mengaktifkan loading", () => {
      const state = reducer(
        { ...initial, error: "lama" },
        asyncGetPostDetail.pending("id", 1)
      );
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("berhasil menyimpan detail", async () => {
      getDetailMock.mockResolvedValue({
        status: "success",
        data: { post },
      } as never);
      const store = makeStore();

      const result = await store.dispatch(asyncGetPostDetail(1));

      expect(asyncGetPostDetail.fulfilled.match(result)).toBe(true);
      expect(store.getState().posts.post).toEqual(post);
      expect(store.getState().posts.isLoading).toBe(false);
    });

    it.each([
      [{ status: "fail", message: "Tidak ada" }, "Tidak ada"],
      [{ status: "fail" }, "Gagal mengambil detail"],
      [{ status: "success" }, "Gagal mengambil detail"],
    ])("ditolak untuk respons %j", async (response, expected) => {
      getDetailMock.mockResolvedValue(response as never);
      const store = makeStore();

      const result = await store.dispatch(asyncGetPostDetail(1));

      expect(asyncGetPostDetail.rejected.match(result)).toBe(true);
      expect(result.payload).toBe(expected);
      expect(store.getState().posts.error).toBe(expected);
    });

    it("ditolak dengan pesan dari Error dan pesan bawaan jika bukan Error", async () => {
      getDetailMock.mockRejectedValueOnce(new Error("Putus"));
      let result = await makeStore().dispatch(asyncGetPostDetail(1));
      expect(result.payload).toBe("Putus");

      getDetailMock.mockRejectedValueOnce("teks");
      result = await makeStore().dispatch(asyncGetPostDetail(1));
      expect(result.payload).toBe("Gagal mengambil detail");
    });

    it("rejected memakai pesan bawaan jika payload kosong", () => {
      const state = reducer(
        { ...initial, isLoading: true },
        asyncGetPostDetail.rejected(null, "id", 1)
      );
      expect(state.error).toBe("Gagal mengambil detail");
    });
  });

  describe("asyncAddPost", () => {
    it("berhasil mengembalikan respons", async () => {
      const response = { status: "success", data: { post_id: 3 } };
      addPostMock.mockResolvedValue(response as never);

      const result = await makeStore().dispatch(asyncAddPost("isi"));

      expect(asyncAddPost.fulfilled.match(result)).toBe(true);
      expect(result.payload).toEqual(response);
      expect(addPostMock).toHaveBeenCalledWith("isi");
    });

    it.each([
      [{ status: "fail", message: "Kosong" }, "Kosong"],
      [{ status: "fail" }, "Gagal menambah postingan"],
    ])("ditolak untuk respons %j", async (response, expected) => {
      addPostMock.mockResolvedValue(response as never);

      const result = await makeStore().dispatch(asyncAddPost("isi"));

      expect(asyncAddPost.rejected.match(result)).toBe(true);
      expect(result.payload).toBe(expected);
    });

    it("ditolak dengan pesan dari Error dan pesan bawaan jika bukan Error", async () => {
      addPostMock.mockRejectedValueOnce(new Error("Putus"));
      let result = await makeStore().dispatch(asyncAddPost("isi"));
      expect(result.payload).toBe("Putus");

      addPostMock.mockRejectedValueOnce("teks");
      result = await makeStore().dispatch(asyncAddPost("isi"));
      expect(result.payload).toBe("Gagal menambah postingan");
    });
  });

  describe("asyncLikePost", () => {
    it("berhasil mengembalikan id dan like", async () => {
      likeMock.mockResolvedValue({ status: "success" } as never);

      const result = await makeStore().dispatch(
        asyncLikePost({ id: 2, like: 1 })
      );

      expect(asyncLikePost.fulfilled.match(result)).toBe(true);
      expect(result.payload).toEqual({ id: 2, like: 1 });
      expect(likeMock).toHaveBeenCalledWith(2, 1);
    });

    it.each([
      [{ status: "fail", message: "Ditolak" }, "Ditolak"],
      [{ status: "fail" }, "Gagal like"],
    ])("ditolak untuk respons %j", async (response, expected) => {
      likeMock.mockResolvedValue(response as never);

      const result = await makeStore().dispatch(
        asyncLikePost({ id: 2, like: 0 })
      );

      expect(asyncLikePost.rejected.match(result)).toBe(true);
      expect(result.payload).toBe(expected);
    });

    it("ditolak dengan pesan dari Error dan pesan bawaan jika bukan Error", async () => {
      likeMock.mockRejectedValueOnce(new Error("Putus"));
      let result = await makeStore().dispatch(
        asyncLikePost({ id: 2, like: 1 })
      );
      expect(result.payload).toBe("Putus");

      likeMock.mockRejectedValueOnce("teks");
      result = await makeStore().dispatch(asyncLikePost({ id: 2, like: 1 }));
      expect(result.payload).toBe("Gagal like");
    });
  });
});