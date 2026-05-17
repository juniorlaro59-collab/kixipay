import { get, post } from "./client";
import { normalizeAngolaPhone } from "./helpers";
import type { Membro, CadastroPayload, PaginatedResponse } from "@/types";
import { ApiUser } from "./users";
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
export async function cadastrarMembro(data: CadastroPayload): Promise<Membro> {
  return post<Membro>("/api/agents/members", {
    fullName: data.nome,
    phoneNumber: normalizeAngolaPhone(data.telefone),
    biNumber: data.biNumber.trim().toUpperCase(),
    password: "123456",
  });
}

export async function addMemberToGroupByAgent(
  groupId: string,
  phoneNumber: string,
  vouchedByUserId?: string | null,
): Promise<{ success: boolean; message: string }> {
  return post("/api/agents/members/add-to-group", {
    groupId,
    phoneNumber: normalizeAngolaPhone(phoneNumber),
    vouchedByUserId: vouchedByUserId ?? null,
  });
}

export async function getAgentMembers(
  page = 1,
  pageSize = 50,
): Promise<{ membros: Membro[]; total: number }> {
  const response = await get<PaginatedResponse<ApiUser> | ApiUser[]>("/api/agents/members", {
    page,
    pageSize,
  });

  const users = Array.isArray(response) ? response : response.items;

  return {
    membros: users.map(apiUserToMembro),
    total: Array.isArray(response) ? users.length : response.totalItems,
  };
}

export function getScoreRecomendacao(score: number): { nivel: string; cor: string; accao: string } {
  if (score >= 800)
    return { nivel: "Excelente", cor: "#16A34A", accao: "Manter — sem intervenção necessária" };
  if (score >= 600)
    return { nivel: "Bom", cor: "#1D4ED8", accao: "Monitorar — enviar incentivos mensais" };
  if (score >= 400)
    return { nivel: "Regular", cor: "#F97316", accao: "Intervir — agendar visita do agente" };
  return { nivel: "A construir", cor: "#DC2626", accao: "CRÍTICO — contacto imediato necessário" };
}
