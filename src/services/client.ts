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
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: ApiError };
    throw new ApiClientError(
      res.status,
      body.error?.code || "UNKNOWN",
      body.error?.message || `Erro ${res.status}`,
      body.error?.details,
    );
  }

  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

// GET with simulated delay for mock mode
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

// ─── Mock delay helper ──────────────────────────────────────────────────
export function delay(ms = 600): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Flag to switch between mock and real API
export const IS_MOCK = !import.meta.env.VITE_API_URL;
