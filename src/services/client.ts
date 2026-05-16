import { API_BASE_URL } from "@/lib/constants";
import type { ApiResponse, ApiError } from "@/types";

const TOKEN_KEY = "kx_auth_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("kx_user");
}

function dispatchUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.log("Estou aquiiiiiiii");
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    dispatchUnauthorized();
    throw new ApiClientError(401, "UNAUTHORIZED", "Sessão expirada. Faça login novamente.");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: ApiError; message?: string };
    const msg = body.error?.message || body.message || `Erro ${res.status}`;
    console.error(`[API ERROR] ${res.status} ${endpoint}:`, msg);
    throw new ApiClientError(res.status, body.error?.code || "REQ_ERROR", msg, body.error?.details);
  }

  const json = (await res.json()) as ApiResponse<T>;

  if (json.success === false) {
    throw new ApiClientError(res.status, "API_ERROR", json.message || "Erro da API");
  }

  if (json.data !== undefined) return json.data;
  return json as unknown as T;
}

export async function get<T>(endpoint: string, params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params) : "";
  return request<T>(`${endpoint}${qs}`);
}

export async function post<T>(endpoint: string, body: unknown) {
  return request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
}

export async function put<T>(endpoint: string, body: unknown) {
  return request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
}

export async function del<T>(endpoint: string) {
  return request<T>(endpoint, { method: "DELETE" });
}
