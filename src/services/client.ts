import type { ApiResponse, ApiError } from "@/types";
import axios, { type Method } from "axios";

const TOKEN_KEY = "kx_auth_token";
const API_BASE_URL =
  "https://89e8-2c0f-f888-a180-40c3-4cd2-f2c7-57a4-3266.ngrok-free.app";
const IS_DEV = import.meta.env.DEV;

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  validateStatus: () => true,
});

type RequestOptions = {
  method?: Method;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("kx_user");
}

function dispatchUnauthorized(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
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

function getDebugUrl(endpoint: string): string {
  return `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...options.headers,
    "ngrok-skip-browser-warning": "true",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const method = options.method ?? "GET";
  const debugUrl = getDebugUrl(endpoint);

  if (IS_DEV) {
    console.log(`[API] -> ${method} ${debugUrl}`);
    if (options.data) console.log("[API] Payload:", options.data);
    if (options.params) console.log("[API] Params:", options.params);
    console.log("[API] Token presente:", !!token);
  }

  let res;
  try {
    res = await http.request<ApiResponse<T> | { error?: ApiError; message?: string } | T>({
      url: endpoint,
      method,
      data: options.data,
      params: options.params,
      headers,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[API] NETWORK_ERROR ${debugUrl}:`, error.message);
      throw new ApiClientError(
        error.response?.status ?? 0,
        "NETWORK_ERROR",
        "Nao foi possivel contactar o servidor. Verifique a ligacao e tente novamente.",
      );
    }
    throw error;
  }

  if (IS_DEV) {
    console.log(`[API] <- ${res.status} ${debugUrl}`);
    console.log("[API] Response body:", res.data);
  }

  if (res.status === 401) {
    console.warn("[API] 401 - sessao expirada, token limpo");
    clearToken();
    dispatchUnauthorized();
    throw new ApiClientError(401, "UNAUTHORIZED", "Sessao expirada. Faca login novamente.");
  }

  if (res.status < 200 || res.status >= 300) {
    const body = (res.data ?? {}) as { error?: ApiError; message?: string };
    const msg = body.error?.message ?? body.message ?? `Erro ${res.status}`;
    console.error(`[API] ${res.status} ${debugUrl}:`, msg, body);
    throw new ApiClientError(res.status, body.error?.code ?? "REQ_ERROR", msg, body.error?.details);
  }

  const json = res.data as ApiResponse<T> | undefined;

  if (json && typeof json === "object" && "success" in json && json.success === false) {
    console.error("[API] success=false:", json);
    throw new ApiClientError(res.status, "API_ERROR", json.message ?? "Erro da API");
  }

  if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
    if (IS_DEV) console.log("[API] data extraido do wrapper:", json.data);
    return json.data;
  }

  if (IS_DEV) console.log("[API] raw response devolvida:", res.data);
  return res.data as T;
}

export async function get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  return request<T>(endpoint, { params });
}

export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, { method: "POST", data: body });
}

export async function put<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, { method: "PUT", data: body });
}

export async function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" });
}
