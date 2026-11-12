import { cookies } from "next/headers";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
}

export function getAuthToken() {
  return cookies().get("token")?.value || null;
}

export function getAuthHeaders(extraHeaders: HeadersInit = {}) {
  const headers = new Headers(extraHeaders);
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  return headers;
}
