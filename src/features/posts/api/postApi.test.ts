import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "@/helpers/apiHelper";
import {
  getPostsApi,
  getPostDetailApi,
  addPostApi,
  updatePostApi,
  deletePostApi,
  changeCoverApi,
  likePostApi,
  addCommentApi,
  deleteCommentApi,
} from "./postApi";

vi.mock("@/helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe("postApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetchMock.mockResolvedValue({ status: "success" });
  });

  it("getPostsApi tanpa argumen tidak memakai filter", async () => {
    await getPostsApi();

    expect(apiFetchMock).toHaveBeenCalledWith("/posts", { params: undefined });
  });

  it("getPostsApi(true) mengirim is_me", async () => {
    await getPostsApi(true);

    expect(apiFetchMock).toHaveBeenCalledWith("/posts", {
      params: { is_me: 1 },
    });
  });

  it("getPostDetailApi memanggil GET /posts/:id", async () => {
    await getPostDetailApi(5);

    expect(apiFetchMock).toHaveBeenCalledWith("/posts/5");
  });

  it("addPostApi memanggil POST /posts", async () => {
    await addPostApi("isi");

    expect(apiFetchMock).toHaveBeenCalledWith("/posts", {
      method: "POST",
      body: { description: "isi" },
    });
  });

  it("updatePostApi memanggil PUT /posts/:id", async () => {
    await updatePostApi("7", "baru");

    expect(apiFetchMock).toHaveBeenCalledWith("/posts/7", {
      method: "PUT",
      body: { description: "baru" },
    });
  });

  it("deletePostApi memanggil DELETE /posts/:id", async () => {
    await deletePostApi(3);

    expect(apiFetchMock).toHaveBeenCalledWith("/posts/3", {
      method: "DELETE",
    });
  });

  it("changeCoverApi mengirim FormData berisi field cover", async () => {
    const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });

    await changeCoverApi(4, file);

    const [path, options] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/posts/4/cover");
    expect(options?.method).toBe("POST");
    expect(options?.isFormData).toBe(true);
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get("cover")).toBeInstanceOf(File);
  });

  it("likePostApi memanggil POST /posts/:id/likes", async () => {
    await likePostApi(2, 1);

    expect(apiFetchMock).toHaveBeenCalledWith("/posts/2/likes", {
      method: "POST",
      body: { like: 1 },
    });
  });

  it("addCommentApi memanggil POST /posts/:id/comments", async () => {
    await addCommentApi(2, "bagus");

    expect(apiFetchMock).toHaveBeenCalledWith("/posts/2/comments", {
      method: "POST",
      body: { comment: "bagus" },
    });
  });

  it("deleteCommentApi memanggil DELETE /posts/:id/comments", async () => {
    await deleteCommentApi(9);

    expect(apiFetchMock).toHaveBeenCalledWith("/posts/9/comments", {
      method: "DELETE",
    });
  });
});