import { DELCOM_BASEURL } from "@/lib/config";

const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  isFormData?: boolean;
};

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    params,
    isFormData = false,
  } = options;

  let url = `${DELCOM_BASEURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        search.append(key, String(value));
      }
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const token = getAccessToken();
  const finalHeaders: Record<string, string> = { ...headers };

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData && body && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body:
      body instanceof FormData
        ? body
        : body
          ? JSON.stringify(body)
          : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (data as { message?: string })?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}