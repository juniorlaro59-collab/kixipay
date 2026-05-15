import { post, delay, IS_MOCK } from "./client";
import type { LoginRequest, RegisterRequest, UserRole, UserId } from "@/types";

export interface LoginResult {
  userId: UserId;
  nome: string;
  role: UserRole;
  token: string;
}

// Mock users
const MOCK_USERS: Record<string, { nome: string; role: UserRole; telefone: string }> = {
  conceicao: { nome: "Conceição Mateus", role: "coordinator", telefone: "923456789" },
  manuel: { nome: "Manuel Jacinto", role: "member", telefone: "912345678" },
};

export async function login(req: LoginRequest): Promise<LoginResult> {
  if (IS_MOCK) {
    await delay(1200);
    const p = req.telefone.replace(/\s/g, "");
    const isManuel = p.includes("912345678");
    const user = isManuel ? MOCK_USERS.manuel : MOCK_USERS.conceicao;
    const userId = isManuel ? ("manuel" as const) : ("conceicao" as const);
    return {
      userId,
      nome: user.nome,
      role: user.role,
      token: `kx_mock_${userId}_${Date.now()}`,
    };
  }
  return post<LoginResult>("/auth/login", req);
}

export async function register(req: RegisterRequest): Promise<LoginResult> {
  if (IS_MOCK) {
    await delay(1500);
    return {
      userId: "conceicao" as const,
      nome: req.nome,
      role: "coordinator",
      token: `kx_mock_new_${Date.now()}`,
    };
  }
  return post<LoginResult>("/auth/register", req);
}

export function getUserDisplayName(userId: UserId): string {
  return MOCK_USERS[userId]?.nome || "Utilizador";
}

export function getUserRole(userId: UserId): UserRole {
  return MOCK_USERS[userId]?.role || "member";
}
