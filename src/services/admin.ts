import { get, post, put, del } from "./client";
import { normalizeAngolaPhone } from "./helpers";
import type { PlatformStats, Membro, PaginatedResponse, UserRole } from "@/types";
import type { ApiUser } from "./users";

interface ApiMetrics {
  totalUsers: number;
  totalMembers: number;
  totalCoordinators: number;
  totalAgents: number;
  activeGroups: number;
  totalCollected: number;
  totalPendingAmount: number;
  pendingPayments: number;
  paidPayments: number;
  averageScore: number;
}

export type AdminUserRole = "admin" | "coordinator" | "agent" | "member";

export interface CreateUserByAdminRequest {
  fullName: string;
  phoneNumber: string;
  biNumber: string;
  password: string;
  role: AdminUserRole;
}

export interface UpdateUserByAdminRequest {
  fullName: string;
  phoneNumber: string;
  biNumber: string;
  role: UserRole | string;
}

const ROLE_TO_API: Record<UserRole, string> = {
  member: "Member",
  coordinator: "Coordinator",
  admin: "Admin",
  agent: "Agent",
};

function apiUserToMembro(u: ApiUser, idx: number): Membro {
  const iniciais = u.fullName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const cores = [
    "#FF5C1A",
    "#1D4ED8",
    "#16A34A",
    "#F5A623",
    "#7C3AED",
    "#DC2626",
    "#0891B2",
    "#059669",
    "#B45309",
    "#BE185D",
    "#6D28D9",
    "#0F766E",
  ];

  return {
    id: u.id,
    nome: u.fullName,
    tel: u.phoneNumber,
    posicao: (idx % 12) + 1,
    totalPoupado: 0,
    score: u.score,
    status: u.pendingDebt > 0 ? "Em atraso" : "Pago",
    iniciais,
    cor: cores[idx % cores.length],
    meses: 1,
    pontualidade: u.pendingDebt > 0 ? 50 : 90,
  };
}

export async function getAllMembrosAdmin(
  page = 1,
  pageSize = 50,
  role?: UserRole,
): Promise<{ membros: Membro[]; total: number }> {
  const response = await get<PaginatedResponse<ApiUser> | ApiUser[]>("/api/admin/users", {
    page,
    pageSize,
    role: role ? ROLE_TO_API[role] : undefined,
  });

  const users = Array.isArray(response) ? response : response.items;

  return {
    membros: users.map(apiUserToMembro),
    total: Array.isArray(response) ? users.length : response.totalItems,
  };
}

export async function getUsersByRole(
  role: UserRole,
  page = 1,
  pageSize = 50,
): Promise<{ membros: Membro[]; total: number }> {
  return getAllMembrosAdmin(page, pageSize, role);
}

export async function createUserByAdmin(
  body: CreateUserByAdminRequest,
): Promise<ApiUser> {
  return post<ApiUser>("/api/admin/users", {
    ...body,
    phoneNumber: normalizeAngolaPhone(body.phoneNumber),
    biNumber: body.biNumber.trim().toUpperCase(),
  });
}

export async function createUser(data: {
  fullName: string;
  phoneNumber: string;
  password: string;
  role: UserRole | string;
  biNumber: string;
}): Promise<ApiUser> {
  return createUserByAdmin({
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    password: data.password,
    biNumber: data.biNumber,
    role: data.role as AdminUserRole,
  });
}

export async function updateAgenteStatus(
  agenteId: string | number,
  role: UserRole | string,
): Promise<unknown> {
  return put(`/api/admin/users/${agenteId}/role`, { role });
}

export async function updateUserByAdmin(
  userId: string | number,
  data: UpdateUserByAdminRequest,
): Promise<ApiUser> {
  return put<ApiUser>(`/api/admin/users/${userId}`, {
    ...data,
    phoneNumber: normalizeAngolaPhone(data.phoneNumber),
    biNumber: data.biNumber.trim().toUpperCase(),
  });
}

export async function removeMembroAdmin(membroId: string | number): Promise<void> {
  await del(`/api/admin/users/${membroId}`);
}

export async function getPlatformMetrics(): Promise<PlatformStats> {
  const raw = await get<ApiMetrics>("/api/Metrics/platform");

  const stats: PlatformStats = {
    totalMembros: raw.totalMembers,
    totalGrupos: raw.activeGroups,
    totalAgentes: raw.totalAgents,
    totalCoordenadores: raw.totalCoordinators,
    volumeTotal: raw.totalCollected,
    scoreMedio: Math.round(raw.averageScore),
    membrosActivos: raw.totalMembers,
    fundosCirculacao: raw.totalPendingAmount,
    crescimentoMensal: 0,
  };

  return stats;
}

export async function getMyMetrics(): Promise<{
  score: number;
  level: string;
  activeGroups: number;
  totalContributions: number;
  pendingContributions: number;
}> {
  return get("/api/Metrics/me");
}