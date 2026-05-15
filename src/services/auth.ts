import { post, delay, IS_MOCK } from "./client";
import type { LoginRequest, RegisterRequest, UserRole, UserId } from "@/types";
import { MOCK_USERS_ADMIN } from "@/lib/constants";

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
  admin: { nome: "Administrador KixiPay", role: "admin", telefone: "900000001" },
  agente1: { nome: "Maria Agostinho", role: "agent", telefone: "900000002" },
  agente2: { nome: "Pedro Kussumua", role: "agent", telefone: "900000003" },
};

const ADMIN_PIN = "0000";

function findUserByPhone(
  phone: string,
): { id: UserId; user: { nome: string; role: UserRole } } | null {
  const p = phone.replace(/\s/g, "");
  for (const [id, u] of Object.entries(MOCK_USERS)) {
    if (p.includes(u.telefone)) return { id: id as UserId, user: u };
  }
  // fallback: check admin users
  for (const au of MOCK_USERS_ADMIN) {
    if (p.includes(au.telefone)) return { id: au.id, user: { nome: au.nome, role: au.role } };
  }
  return null;
}

export async function login(req: LoginRequest): Promise<LoginResult> {
  if (IS_MOCK) {
    await delay(800);
    const found = findUserByPhone(req.telefone);
    if (!found) throw new Error("Utilizador não encontrado");
    if (req.pin !== "1234" && req.pin !== ADMIN_PIN) throw new Error("PIN inválido");
    return {
      userId: found.id,
      nome: found.user.nome,
      role: found.user.role,
      token: `kx_mock_${found.id}_${Date.now()}`,
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

export function getAllMockUsers() {
  return Object.entries(MOCK_USERS).map(([id, u]) => ({ id: id as UserId, ...u }));
}
