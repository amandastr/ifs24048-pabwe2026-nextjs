import { apiFetch } from "@/helpers/apiHelper";
import type { ApiResult, Post } from "@/types";

export async function getPostsApi(isMe = false) {
  return apiFetch<ApiResult<{ posts: Post[] }>>("/posts", {
    params: isMe ? { is_me: 1 } : undefined,
  });
}

export async function getPostDetailApi(id: number | string) {
  return apiFetch<ApiResult<{ post: Post }>>(`/posts/${id}`);
}

export async function addPostApi(description: string) {
  return apiFetch<ApiResult<{ post_id: number }>>("/posts", {
    method: "POST",
    body: { description },
  });
}

export async function updatePostApi(id: number | string, description: string) {
  return apiFetch<ApiResult>(`/posts/${id}`, {
    method: "PUT",
    body: { description },
  });
}

export async function deletePostApi(id: number | string) {
  return apiFetch<ApiResult>(`/posts/${id}`, {
    method: "DELETE",
  });
}

export async function changeCoverApi(id: number | string, file: File) {
  const formData = new FormData();
  formData.append("cover", file);

  return apiFetch<ApiResult>(`/posts/${id}/cover`, {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export async function likePostApi(id: number | string, like: 0 | 1) {
  return apiFetch<ApiResult>(`/posts/${id}/likes`, {
    method: "POST",
    body: { like },
  });
}

export async function addCommentApi(id: number | string, comment: string) {
  return apiFetch<ApiResult>(`/posts/${id}/comments`, {
    method: "POST",
    body: { comment },
  });
}

export async function deleteCommentApi(id: number | string) {
  return apiFetch<ApiResult>(`/posts/${id}/comments`, {
    method: "DELETE",
  });
}