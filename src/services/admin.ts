import { delay, IS_MOCK, get, del as httpDel } from "./client";
import type { PlatformStats, ActivityLogEntry, Agente, Membro } from "@/types";
import { MEMBROS, AGENTES, ACTIVITY_LOG } from "./mock-data";

export async function getPlatformStats(): Promise<PlatformStats> {
  if (IS_MOCK) {
    await delay(500);
    const scores = MEMBROS.map((m) => m.score);
    const scoreMedio = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const activos = MEMBROS.filter((m) => m.status !== "Em atraso").length;
    return {
      totalMembros: 156,
      totalGrupos: 23,
      totalAgentes: AGENTES.length,
      totalCoordenadores: 18,
      volumeTotal: 28900000,
      scoreMedio,
      membrosActivos: activos,
      fundosCirculacao: 4850000,
      crescimentoMensal: 12.5,
    };
  }
  return get<PlatformStats>("/admin/stats");
}

export async function getActivityLog(
  page = 1,
  pageSize = 20,
): Promise<{ entries: ActivityLogEntry[]; total: number }> {
  if (IS_MOCK) {
    await delay(400);
    const start = (page - 1) * pageSize;
    return { entries: ACTIVITY_LOG.slice(start, start + pageSize), total: ACTIVITY_LOG.length };
  }
  return get("/admin/activity", { page: String(page), pageSize: String(pageSize) });
}

export async function getAgentes(): Promise<Agente[]> {
  if (IS_MOCK) {
    await delay(400);
    return AGENTES;
  }
  return get<Agente[]>("/admin/agentes");
}

export async function updateAgenteStatus(
  agenteId: number,
  status: Agente["status"],
): Promise<Agente> {
  if (IS_MOCK) {
    await delay(300);
    const a = AGENTES.find((x) => x.id === agenteId);
    if (!a) throw new Error("Agente não encontrado");
    return { ...a, status };
  }
  return get(`/admin/agentes/${agenteId}/status`, { status });
}

export async function getAllMembrosAdmin(
  page = 1,
  pageSize = 50,
): Promise<{ membros: Membro[]; total: number }> {
  if (IS_MOCK) {
    await delay(400);
    const start = (page - 1) * pageSize;
    return {
      membros: [...MEMBROS, ...generateExtraMembros()].slice(start, start + pageSize),
      total: 156,
    };
  }
  return get("/admin/membros", { page: String(page), pageSize: String(pageSize) });
}

function generateExtraMembros(): Membro[] {
  const extras: Membro[] = [];
  const nomes = [
    "João Chimuco",
    "Ana Burity",
    "Zeca Ngola",
    "Sofia Kussumua",
    "Mateus Paulo",
    "Lena Cacoma",
    "Toni Gama",
    "Rute Kabengele",
    "Dário Chivinda",
    "Nádia Lopes",
  ];
  const cores = [
    "#E11D48",
    "#0EA5E9",
    "#84CC16",
    "#D946EF",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#22C55E",
    "#EF4444",
    "#3B82F6",
  ];
  nomes.forEach((n, i) => {
    extras.push({
      id: 20 + i,
      nome: n,
      tel: `+244 9${String(40 + i).padStart(2, "0")} ${String(100 + i).padStart(3, "0")} ${String(200 + i).padStart(3, "0")}`,
      posicao: (i % 12) + 1,
      totalPoupado: Math.floor(Math.random() * 50000),
      score: 300 + Math.floor(Math.random() * 500),
      status: ["Pago", "Pendente", "Em atraso"][Math.floor(Math.random() * 3)] as Membro["status"],
      iniciais: n
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      cor: cores[i],
      meses: 1 + Math.floor(Math.random() * 8),
      pontualidade: 40 + Math.floor(Math.random() * 60),
    });
  });
  return extras;
}

export async function removeMembroAdmin(membroId: number): Promise<void> {
  if (IS_MOCK) {
    await delay(500);
    return;
  }
  return httpDel(`/admin/membros/${membroId}`);
}
