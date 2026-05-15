import { delay, IS_MOCK, get, post } from "./client";
import type { ScorePredictao, ScoreAlert, AScoreDashboard, ScoreFactor } from "@/types";
import { MEMBROS } from "./mock-data";
import { SCORE_PREDICOES, SCORE_ALERTAS } from "./mock-data";
import { scoreLabel, scoreColor } from "./score";

export async function getADashboard(): Promise<AScoreDashboard> {
  if (IS_MOCK) {
    await delay(500);
    const scores = MEMBROS.map((m) => m.score);
    const scoreMedio = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const dist: Record<string, number> = { Excelente: 0, Bom: 0, Regular: 0, "A construir": 0 };
    MEMBROS.forEach((m) => {
      const l = scoreLabel(m.score);
      dist[l] = (dist[l] || 0) + 1;
    });
    const emRisco = MEMBROS.filter((m) => m.score < 500).length;
    return {
      scoreMedioGeral: scoreMedio,
      totalAnalises: 156,
      alertasActivos: SCORE_ALERTAS.filter((a) => !a.lido).length,
      membrosEmRisco: emRisco,
      distribuicao: Object.entries(dist).map(([nivel, count]) => ({ nivel, count })),
      tendencias: [
        { mes: "Jan", scoreMedio: 680 },
        { mes: "Fev", scoreMedio: 695 },
        { mes: "Mar", scoreMedio: 710 },
        { mes: "Abr", scoreMedio: 723 },
        { mes: "Mai", scoreMedio: 745 },
      ],
    };
  }
  return get<AScoreDashboard>("/ai/score/dashboard");
}

export async function getPredicoes(): Promise<ScorePredictao[]> {
  if (IS_MOCK) {
    await delay(500);
    return SCORE_PREDICOES;
  }
  return get<ScorePredictao[]>("/ai/score/predicoes");
}

export async function getPredicaoByMembro(membroId: number): Promise<ScorePredictao | null> {
  if (IS_MOCK) {
    await delay(300);
    return SCORE_PREDICOES.find((p) => p.membroId === membroId) || null;
  }
  return get<ScorePredictao | null>(`/ai/score/predicoes/${membroId}`);
}

export async function getAlertas(): Promise<ScoreAlert[]> {
  if (IS_MOCK) {
    await delay(400);
    return SCORE_ALERTAS;
  }
  return get<ScoreAlert[]>("/ai/score/alertas");
}

export async function marcarAlertaLido(alertaId: number): Promise<void> {
  if (IS_MOCK) {
    await delay(200);
    return;
  }
  return post(`/ai/score/alertas/${alertaId}/ler`, {});
}

export async function analisarMembro(membroId: number): Promise<ScorePredictao> {
  if (IS_MOCK) {
    await delay(1500);
    const m = MEMBROS.find((x) => x.id === membroId);
    if (!m) throw new Error("Membro não encontrado");
    const factores: ScoreFactor[] = [
      {
        factor: "Pontualidade",
        impacto: m.pontualidade >= 80 ? "positivo" : m.pontualidade >= 50 ? "neutro" : "negativo",
        peso: 35,
        descricao: `${m.pontualidade}% de pagamentos a tempo`,
      },
      {
        factor: "Tempo de conta",
        impacto: m.meses >= 6 ? "positivo" : "neutro",
        peso: 25,
        descricao: `${m.meses} meses activo`,
      },
      {
        factor: "Volume poupado",
        impacto: m.totalPoupado >= 30000 ? "positivo" : "neutro",
        peso: 20,
        descricao: `${m.totalPoupado.toLocaleString("pt-PT")} Kz total`,
      },
    ];
    const delta = Math.floor(Math.random() * 60) - 30;
    return {
      membroId: m.id,
      membroNome: m.nome,
      scoreActual: m.score,
      scoreProjectado: Math.max(0, Math.min(1000, m.score + delta)),
      tendencia: delta > 10 ? "subindo" : delta < -10 ? "descendo" : "estavel",
      confianca: 0.75 + Math.random() * 0.2,
      factores,
      recomendacao:
        m.score >= 700
          ? "Perfil saudável. Continuar monitorização normal."
          : m.score >= 500
            ? "Atenção recomendada. Agendar contacto periódico."
            : "CRÍTICO. Intervenção imediata necessária.",
      dataAnalise: new Date().toLocaleDateString("pt-PT"),
    };
  }
  return get<ScorePredictao>(`/ai/score/analisar/${membroId}`);
}

export async function getMembrosRisco(
  scoreMaximo = 500,
): Promise<{ membroId: number; nome: string; score: number }[]> {
  if (IS_MOCK) {
    await delay(300);
    return MEMBROS.filter((m) => m.score <= scoreMaximo).map((m) => ({
      membroId: m.id,
      nome: m.nome,
      score: m.score,
    }));
  }
  return get("/ai/score/risco", { scoreMaximo: String(scoreMaximo) });
}

export { scoreLabel, scoreColor } from "./score";
