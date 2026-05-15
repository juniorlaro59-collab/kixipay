import { delay, IS_MOCK, get } from "./client";
import type { ScoreInfo, Elegibilidade, Membro } from "@/types";
import { MEMBROS } from "./mock-data";

export const SCORE_COLORS = {
  excelente: "#16A34A",
  bom: "#1D4ED8",
  regular: "#F97316",
  construir: "#DC2626",
} as const;

export function scoreColor(score: number): string {
  if (score >= 750) return SCORE_COLORS.excelente;
  if (score >= 600) return SCORE_COLORS.bom;
  if (score >= 400) return SCORE_COLORS.regular;
  return SCORE_COLORS.construir;
}

export function scoreLabel(score: number): ScoreInfo["nivel"] {
  if (score >= 800) return "Excelente";
  if (score >= 600) return "Bom";
  if (score >= 400) return "Regular";
  return "A construir";
}

export function elegibilidade(score: number): Elegibilidade {
  if (score >= 800) return { ok: true, limite: 500000, banco: "BFA" };
  if (score >= 700) return { ok: true, limite: 300000, banco: "Atlântico" };
  if (score >= 600) return { ok: true, limite: 150000, banco: "BAI" };
  return { ok: false, limite: 0, banco: "—" };
}

export async function getScoreInfo(membroId: number): Promise<ScoreInfo> {
  if (IS_MOCK) {
    await delay(500);
    const m = MEMBROS.find((x) => x.id === membroId);
    if (!m) throw new Error("Membro não encontrado");
    return {
      score: m.score,
      nivel: scoreLabel(m.score),
      cor: scoreColor(m.score),
      pontualidade: m.pontualidade,
      mesesAtivo: m.meses,
      totalPoupado: m.totalPoupado,
    };
  }
  return get<ScoreInfo>(`/score/${membroId}`);
}

export async function getScoreDistribuicao(): Promise<{ nivel: string; count: number }[]> {
  if (IS_MOCK) {
    await delay(400);
    const dist: Record<string, number> = { Excelente: 0, Bom: 0, Regular: 0, "A construir": 0 };
    MEMBROS.forEach((m) => {
      const label = scoreLabel(m.score);
      dist[label] = (dist[label] || 0) + 1;
    });
    return Object.entries(dist).map(([nivel, count]) => ({ nivel, count }));
  }
  return get("/score/distribuicao");
}

export function fmtKz(n: number): string {
  return new Intl.NumberFormat("pt-PT").format(n) + " Kz";
}
