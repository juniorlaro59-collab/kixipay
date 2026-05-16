export const APP_NAME = "KixiPay";
export const APP_TAGLINE = "A tua kixikila, organizada e digital";
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const SCORE_TIERS = [
  { min: 800, label: "Excelente", cor: "#16A34A" },
  { min: 600, label: "Bom", cor: "#1D4ED8" },
  { min: 400, label: "Regular", cor: "#F97316" },
  { min: 0, label: "A construir", cor: "#DC2626" },
] as const;

export const BANCOS_PARCEIROS = ["BFA", "Atlântico", "BAI", "SOL"] as const;

export const ROTACAO_MESES = [
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
] as const;

export const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const REGIOES_ANGOLA = [
  "Luanda",
  "Benguela",
  "Huambo",
  "Malanje",
  "Huíla",
  "Cabinda",
  "Kwanza Sul",
  "Kwanza Norte",
  "Bié",
  "Moxico",
  "Zaire",
  "Uíge",
  "Lunda Norte",
  "Lunda Sul",
  "Cuando Cubango",
  "Namibe",
  "Cunene",
] as const;

export const ADMIN_EMAIL = "admin@kixipay.ao";
export const USSD_CODE = "*404#";
export const GRUPO_VALOR_MENSAL = 5000;
export const CONTRIBUICAO_MIN = 1000;
export const NOME_MIN_LENGTH = 3;
export const NOME_MAX_LENGTH = 80;
export const PIN_LENGTH = 4;
export const PHONE_REGEX = /^9\d{2}\s?\d{3}\s?\d{3}$/;
