import { delay, IS_MOCK, get, post, put } from "./client";
import type { Grupo, Membro, Transacao } from "@/types";
import { MEMBROS, HISTORICO, GRUPO_MOCK } from "./mock-data";

export interface DashboardData {
  saldoTotal: number;
  membrosActivos: number;
  totalMembros: number;
  contribuicoesMes: number;
  metaContribuicoes: number;
  kixiScoreMedio: number;
  proximoRecebimento: { nome: string; posicao: number; mes: string; valor: number } | null;
  rotacao: { nome: string; posicao: number; mes: string }[];
}

export async function getGrupo(): Promise<Grupo> {
  if (IS_MOCK) {
    await delay(400);
    return GRUPO_MOCK;
  }
  return get<Grupo>("/grupo");
}

export async function getDashboard(): Promise<DashboardData> {
  if (IS_MOCK) {
    await delay(500);
    const pagas = MEMBROS.filter((m) => m.status === "Pago").length;
    const scores = MEMBROS.map((m) => m.score);
    const scoreMedio = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return {
      saldoTotal: 185000,
      membrosActivos: 12,
      totalMembros: 12,
      contribuicoesMes: pagas,
      metaContribuicoes: 12,
      kixiScoreMedio: scoreMedio,
      proximoRecebimento: { nome: "Manuel Jacinto", posicao: 7, mes: "Junho 2026", valor: 60000 },
      rotacao: MEMBROS.map((m) => ({
        nome: m.nome,
        posicao: m.posicao,
        mes: [
          "Dez 2025",
          "Jan 2026",
          "Fev 2026",
          "Mar 2026",
          "Abr 2026",
          "Mai 2026",
          "Jun 2026",
          "Jul 2026",
          "Ago 2026",
          "Set 2026",
          "Out 2026",
          "Nov 2026",
        ][m.posicao - 1],
      })),
    };
  }
  return get<DashboardData>("/grupo/dashboard");
}

export async function getMembros(filtro?: { search?: string; status?: string }): Promise<Membro[]> {
  if (IS_MOCK) {
    await delay(300);
    return MEMBROS.filter((m) => {
      if (filtro?.search && !m.nome.toLowerCase().includes(filtro.search.toLowerCase()))
        return false;
      if (filtro?.status && filtro.status !== "todos" && m.status !== filtro.status) return false;
      return true;
    });
  }
  return get<Membro[]>("/membros", filtro as Record<string, string>);
}

export async function getHistorico(filtro?: {
  periodo?: string;
  tipo?: string;
  membro?: string;
}): Promise<Transacao[]> {
  if (IS_MOCK) {
    await delay(400);
    let items = [...HISTORICO];
    if (filtro?.membro) items = items.filter((t) => t.membro === filtro.membro);
    if (filtro?.tipo && filtro.tipo !== "todos")
      items = items.filter((t) => t.tipo === filtro.tipo);
    return items;
  }
  return get<Transacao[]>("/historico", filtro as Record<string, string>);
}

export async function updateGrupo(data: Partial<Grupo>): Promise<Grupo> {
  if (IS_MOCK) {
    await delay(600);
    return { ...GRUPO_MOCK, ...data };
  }
  return put<Grupo>("/grupo", data);
}

export interface ContribuicaoInput {
  membroId: number;
  valor: number;
  data: string;
  metodo: "App" | "USSD" | "Dinheiro presencial";
  notas?: string;
}

export async function registrarContribuicao(data: ContribuicaoInput): Promise<Transacao> {
  if (IS_MOCK) {
    await delay(600);
    const membro = MEMBROS.find((m) => m.id === data.membroId);
    return {
      id: HISTORICO.length + 1,
      data: data.data,
      membro: membro?.nome || "Desconhecido",
      tipo: "Contribuição",
      valor: data.valor,
      ref: `KXP-${data.data.replace(/\//g, "").slice(0, 4)}-${String(HISTORICO.length + 1).padStart(3, "0")}`,
      status: "Pago",
    };
  }
  return post<Transacao>("/contribuicoes", data);
}

export async function addMembro(data: {
  nome: string;
  telefone: string;
  email?: string;
  posicao: number;
}): Promise<Membro> {
  if (IS_MOCK) {
    await delay(800);
    return {
      id: MEMBROS.length + 1,
      nome: data.nome,
      tel: data.telefone,
      posicao: data.posicao,
      totalPoupado: 0,
      score: 300,
      status: "Pendente",
      iniciais: data.nome
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      cor: "#FF5C1A",
      meses: 0,
      pontualidade: 0,
    };
  }
  return post<Membro>("/membros", data);
}
