import { get, post, setToken, clearToken } from "./client";
import { normalizeAngolaPhone } from "./helpers";

export interface AuthApiUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  biNumber?: string;
  score: number;
  level: string;
  role: string;
  pendingDebt: number;
}

export interface AuthApiResponse {
  token: string;
  user: AuthApiUser;
}

export interface LoginResult {
  token: string;
  userId: string;
  nome: string;
  role: string;
}

export interface ApiUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  biNumber?: string;
  score: number;
  level: string;
  role: string;
  pendingDebt: number;
}

function mapRole(role: string): string {
  return role.toLowerCase();
}

function mapAuthResponse(response: AuthApiResponse): LoginResult {
  setToken(response.token);

  return {
    token: response.token,
    userId: response.user.id,
    nome: response.user.fullName,
    role: mapRole(response.user.role),
  };
}

export async function login(phoneNumber: string, password: string): Promise<LoginResult> {
  const response = await post<AuthApiResponse>("/api/Auth/login", {
    phoneNumber: normalizeAngolaPhone(phoneNumber),
    password,
  });

  return mapAuthResponse(response);
}

export async function register(
  fullName: string,
  phoneNumber: string,
  password: string,
  biNumber: string,
): Promise<LoginResult> {
  const response = await post<AuthApiResponse>("/api/Auth/register", {
    fullName: fullName.trim(),
    phoneNumber: normalizeAngolaPhone(phoneNumber),
    biNumber: biNumber.trim().toUpperCase(),
    password,
  });

  return mapAuthResponse(response);
}

export async function getCurrentUser(): Promise<ApiUser> {
  return get<ApiUser>("/api/Auth/me");
}

export function logout(): void {
  clearToken();
}