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
  console.log("[AUTH] login() chamado");
  console.log("[AUTH] Telefone normalizado:", normalizePhone(telefone));

  const res = await post<ApiLoginResponse>("/api/Auth/login", {
    phoneNumber: normalizePhone(telefone),
    password: pin,
  });

  console.log("[AUTH] Resposta login:", res);
  console.log("[AUTH] Token recebido:", res.token ? `${res.token.slice(0, 20)}...` : "NULO");
  console.log("[AUTH] User recebido:", res.user);

  setToken(res.token);

  return {
    userId: res.user.id,
    nome: res.user.fullName,
    role: res.user.role as UserRole,
    token: res.token,
  };
}

export async function register(nome: string, telefone: string, pin: string): Promise<LoginResult> {
  console.log("[AUTH] register() chamado");
  console.log("[AUTH] Nome:", nome, "| Telefone normalizado:", normalizePhone(telefone));

  const res = await post<ApiLoginResponse>("/api/Auth/register", {
    fullName: nome,
    phoneNumber: normalizePhone(telefone),
    password: pin,
  });

  console.log("[AUTH] Resposta register:", res);
  console.log("[AUTH] Token recebido:", res.token ? `${res.token.slice(0, 20)}...` : "NULO");
  console.log("[AUTH] User recebido:", res.user);

  setToken(res.token);

  return {
    userId: res.user.id,
    nome: res.user.fullName,
    role: res.user.role as UserRole,
    token: res.token,
  };
}