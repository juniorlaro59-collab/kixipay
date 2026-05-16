import { post, setToken } from "./client";
import type { UserRole, UserId, ApiLoginResponse } from "@/types";

export interface LoginResult {
  userId: UserId;
  nome: string;
  role: UserRole;
  token: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("244")) return `+${digits}`;
  return `+244${digits}`;
}

export async function login(telefone: string, pin: string): Promise<LoginResult> {
  const res = await post<ApiLoginResponse>("/api/Auth/login", {
    phoneNumber: normalizePhone(telefone),
    password: pin,
  });
  setToken(res.token);
  return {
    userId: res.user.id,
    nome: res.user.fullName,
    role: res.user.role as UserRole,
    token: res.token,
  };
}

export async function register(nome: string, telefone: string, pin: string): Promise<LoginResult> {
  const res = await post<ApiLoginResponse>("/api/Auth/register", {
    fullName: nome,
    phoneNumber: normalizePhone(telefone),
    password: pin,
  });
  setToken(res.token);
  return {
    userId: res.user.id,
    nome: res.user.fullName,
    role: res.user.role as UserRole,
    token: res.token,
  };
}
