import type { ScoreInfo, Elegibilidade } from "@/types";

export function scoreColor(score: number): string {
  if (score >= 750) return "#16A34A";
  if (score >= 600) return "#1D4ED8";
  if (score >= 400) return "#F97316";

  return "#DC2626";
}

export function scoreLabel(score: number): ScoreInfo["nivel"] {
  if (score >= 800) return "Excelente";
  if (score >= 600) return "Bom";
  if (score >= 400) return "Regular";

  return "A construir";
}

export function elegibilidade(score: number): Elegibilidade {
  if (score >= 800) {
    return {
      ok: true,
      limite: 500000,
      banco: "BFA",
    };
  }

  if (score >= 700) {
    return {
      ok: true,
      limite: 300000,
      banco: "Atlântico",
    };
  }

  if (score >= 600) {
    return {
      ok: true,
      limite: 150000,
      banco: "BAI",
    };
  }

  return {
    ok: false,
    limite: 0,
    banco: "—",
  };
}

export function fmtKz(n: number): string {
  return `${new Intl.NumberFormat("pt-PT").format(n)} Kz`;
}