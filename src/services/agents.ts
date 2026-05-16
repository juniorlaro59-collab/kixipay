import { post } from "./client";
import type { Membro, CadastroPayload } from "@/types";

export async function cadastrarMembro(data: CadastroPayload): Promise<Membro> {
  return post<Membro>("/api/agents/members", {
    fullName: data.nome,
    phoneNumber: data.telefone,
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
    phoneNumber,
    vouchedByUserId: vouchedByUserId ?? null,
  });
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
