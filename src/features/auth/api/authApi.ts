import { apiFetch, putAccessToken, removeAccessToken } from "@/helpers/apiHelper";
import type { ApiResult, User } from "@/types";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginResponse = {
  user: User;
  token: string;
};

export async function loginApi(payload: LoginPayload) {
  const result = await apiFetch<ApiResult<LoginResponse>>("/auth/login", {
    method: "POST",
    body: payload,
  });

  if (result.status === "success" && result.data?.token) {
    putAccessToken(result.data.token);
  }

  return result;
}

export async function registerApi(payload: RegisterPayload) {
  return apiFetch<ApiResult>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function logoutApi() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    removeAccessToken();
  }
}