export type Membro = {
  id: number;
  nome: string;
  tel: string;
  posicao: number;
  totalPoupado: number;
  score: number;
  status: "Pago" | "Pendente" | "Em atraso";
  iniciais: string;
  cor: string;
  meses: number;
  pontualidade: number;
};

export const MEMBROS: Membro[] = [
  {
    id: 1,
    nome: "Conceição Mateus",
    tel: "+244 923 456 789",
    posicao: 1,
    totalPoupado: 40000,
    score: 891,
    status: "Pago",
    iniciais: "CM",
    cor: "#FF5C1A",
    meses: 8,
    pontualidade: 94,
  },
  {
    id: 2,
    nome: "Manuel Jacinto",
    tel: "+244 912 345 678",
    posicao: 7,
    totalPoupado: 35000,
    score: 847,
    status: "Pago",
    iniciais: "MJ",
    cor: "#1D4ED8",
    meses: 8,
    pontualidade: 92,
  },
  {
    id: 3,
    nome: "Ana Paula Ferreira",
    tel: "+244 934 567 890",
    posicao: 3,
    totalPoupado: 40000,
    score: 823,
    status: "Pago",
    iniciais: "AP",
    cor: "#16A34A",
    meses: 7,
    pontualidade: 90,
  },
  {
    id: 4,
    nome: "Rosa Amélia Santos",
    tel: "+244 945 678 901",
    posicao: 9,
    totalPoupado: 30000,
    score: 756,
    status: "Pendente",
    iniciais: "RS",
    cor: "#F5A623",
    meses: 6,
    pontualidade: 85,
  },
  {
    id: 5,
    nome: "Filipe Mendes",
    tel: "+244 956 789 012",
    posicao: 5,
    totalPoupado: 40000,
    score: 801,
    status: "Pago",
    iniciais: "FM",
    cor: "#7C3AED",
    meses: 8,
    pontualidade: 91,
  },
  {
    id: 6,
    nome: "Lurdes Baptista",
    tel: "+244 967 890 123",
    posicao: 11,
    totalPoupado: 20000,
    score: 612,
    status: "Em atraso",
    iniciais: "LB",
    cor: "#DC2626",
    meses: 4,
    pontualidade: 67,
  },
  {
    id: 7,
    nome: "Domingos Neto",
    tel: "+244 978 901 234",
    posicao: 2,
    totalPoupado: 35000,
    score: 778,
    status: "Pago",
    iniciais: "DN",
    cor: "#0891B2",
    meses: 7,
    pontualidade: 88,
  },
  {
    id: 8,
    nome: "Esperança Lima",
    tel: "+244 989 012 345",
    posicao: 6,
    totalPoupado: 40000,
    score: 834,
    status: "Pago",
    iniciais: "EL",
    cor: "#059669",
    meses: 8,
    pontualidade: 93,
  },
  {
    id: 9,
    nome: "Carlos Futila",
    tel: "+244 990 123 456",
    posicao: 12,
    totalPoupado: 15000,
    score: 445,
    status: "Em atraso",
    iniciais: "CF",
    cor: "#B45309",
    meses: 3,
    pontualidade: 50,
  },
  {
    id: 10,
    nome: "Beatriz Capita",
    tel: "+244 901 234 567",
    posicao: 8,
    totalPoupado: 30000,
    score: 790,
    status: "Pendente",
    iniciais: "BC",
    cor: "#BE185D",
    meses: 6,
    pontualidade: 83,
  },
  {
    id: 11,
    nome: "João Kussumua",
    tel: "+244 912 890 123",
    posicao: 4,
    totalPoupado: 40000,
    score: 867,
    status: "Pago",
    iniciais: "JK",
    cor: "#6D28D9",
    meses: 8,
    pontualidade: 93,
  },
  {
    id: 12,
    nome: "Fernanda Agostinho",
    tel: "+244 923 901 234",
    posicao: 10,
    totalPoupado: 25000,
    score: 723,
    status: "Pago",
    iniciais: "FA",
    cor: "#0F766E",
    meses: 5,
    pontualidade: 80,
  },
];

export type Tx = {
  id: number;
  data: string;
  membro: string;
  tipo: string;
  valor: number;
  ref: string;
  status: string;
};
export const HISTORICO: Tx[] = [
  {
    id: 1,
    data: "15/05/2026",
    membro: "Conceição Mateus",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0515-001",
    status: "Pago",
  },
  {
    id: 2,
    data: "14/05/2026",
    membro: "Manuel Jacinto",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0514-002",
    status: "Pago",
  },
  {
    id: 3,
    data: "13/05/2026",
    membro: "Ana Paula Ferreira",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0513-003",
    status: "Pago",
  },
  {
    id: 4,
    data: "12/05/2026",
    membro: "Filipe Mendes",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0512-005",
    status: "Pago",
  },
  {
    id: 5,
    data: "10/05/2026",
    membro: "Domingos Neto",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0510-007",
    status: "Pago",
  },
  {
    id: 6,
    data: "09/05/2026",
    membro: "Esperança Lima",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0509-008",
    status: "Pago",
  },
  {
    id: 7,
    data: "08/05/2026",
    membro: "João Kussumua",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0508-011",
    status: "Pago",
  },
  {
    id: 8,
    data: "07/05/2026",
    membro: "Fernanda Agostinho",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0507-012",
    status: "Pago",
  },
  {
    id: 9,
    data: "01/05/2026",
    membro: "Lurdes Baptista",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0501-006",
    status: "Em atraso",
  },
  {
    id: 10,
    data: "01/05/2026",
    membro: "Carlos Futila",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0501-009",
    status: "Em atraso",
  },
  {
    id: 11,
    data: "01/04/2026",
    membro: "Conceição Mateus",
    tipo: "Recebimento",
    valor: 60000,
    ref: "KXP-REC-0401",
    status: "Recebido",
  },
  {
    id: 12,
    data: "28/03/2026",
    membro: "Sistema",
    tipo: "Lembrete SMS",
    valor: 0,
    ref: "KXP-SMS-0328",
    status: "Enviado",
  },
  {
    id: 13,
    data: "01/03/2026",
    membro: "Lurdes Baptista",
    tipo: "Contribuição",
    valor: 5000,
    ref: "KXP-0301-006",
    status: "Recuperado",
  },
  {
    id: 14,
    data: "01/02/2026",
    membro: "Domingos Neto",
    tipo: "Recebimento",
    valor: 60000,
    ref: "KXP-REC-0201",
    status: "Recebido",
  },
  {
    id: 15,
    data: "01/01/2026",
    membro: "Ana Paula Ferreira",
    tipo: "Recebimento",
    valor: 60000,
    ref: "KXP-REC-0101",
    status: "Recebido",
  },
];

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
];

export type Comunidade = {
  id: number;
  nome: string;
  regiao: string;
  membros: number;
  maxMembros: number;
  valorMensal: number;
  codigo: string;
  descricao: string;
};

export const COMUNIDADES: Comunidade[] = [
  {
    id: 1,
    nome: "Kixikila Rangel",
    regiao: "Luanda",
    membros: 12,
    maxMembros: 12,
    valorMensal: 5000,
    codigo: "KXRNG-2024",
    descricao: "Grupo do bairro Rangel · Rotação mensal",
  },
  {
    id: 2,
    nome: "Poupança Benguela",
    regiao: "Benguela",
    membros: 8,
    maxMembros: 15,
    valorMensal: 3000,
    codigo: "PBNGL-2025",
    descricao: "Grupo de comerciantes · Rotação quinzenal",
  },
  {
    id: 3,
    nome: "Kixikila Huambo",
    regiao: "Huambo",
    membros: 10,
    maxMembros: 12,
    valorMensal: 4000,
    codigo: "KXHBO-2025",
    descricao: "Grupo da centralidade · 2 vagas disponíveis",
  },
  {
    id: 4,
    nome: "Solidariedade Luanda Sul",
    regiao: "Luanda",
    membros: 6,
    maxMembros: 10,
    valorMensal: 7500,
    codigo: "SLS-2026",
    descricao: "Grupo empresarial · Vagas abertas",
  },
  {
    id: 5,
    nome: "Kixikila Kilamba",
    regiao: "Luanda",
    membros: 9,
    maxMembros: 12,
    valorMensal: 5000,
    codigo: "KKLB-2025",
    descricao: "Residenciais Kilamba · 3 vagas",
  },
  {
    id: 6,
    nome: "Poupança Lobito",
    regiao: "Benguela",
    membros: 5,
    maxMembros: 10,
    valorMensal: 2500,
    codigo: "PLBT-2026",
    descricao: "Grupo do Lobito · 5 vagas disponíveis",
  },
  {
    id: 7,
    nome: "Kixikila Malanje",
    regiao: "Malanje",
    membros: 7,
    maxMembros: 12,
    valorMensal: 3500,
    codigo: "KXMAL-2025",
    descricao: "Grupo aberto · 5 vagas disponíveis",
  },
  {
    id: 8,
    nome: "União Lubango",
    regiao: "Huíla",
    membros: 4,
    maxMembros: 10,
    valorMensal: 5000,
    codigo: "ULBN-2026",
    descricao: "Novo grupo · 6 vagas",
  },
];

export const REGIOES = [...new Set(COMUNIDADES.map((c) => c.regiao))].sort();

export function fmtKz(n: number) {
  return new Intl.NumberFormat("pt-PT").format(n) + " Kz";
}
export function scoreColor(s: number) {
  if (s >= 750) return "#16A34A";
  if (s >= 600) return "#1D4ED8";
  if (s >= 400) return "#F97316";
  return "#DC2626";
}
export function scoreLabel(s: number) {
  if (s >= 800) return "Excelente";
  if (s >= 600) return "Bom";
  if (s >= 400) return "Regular";
  return "A construir";
}
export function eligivel(s: number): { ok: boolean; limite: number; banco: string } {
  if (s >= 800) return { ok: true, limite: 500000, banco: "BFA" };
  if (s >= 700) return { ok: true, limite: 300000, banco: "Atlântico" };
  if (s >= 600) return { ok: true, limite: 150000, banco: "BAI" };
  return { ok: false, limite: 0, banco: "—" };
}
