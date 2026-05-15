import { delay, IS_MOCK, get, post } from "./client";
import type {
  Membro,
  AgentDashboardData,
  ActividadeAgente,
  CadastroPayload,
  Comunidade,
} from "@/types";
import { MEMBROS, COMUNIDADES } from "./mock-data";

const ACTIVIDADES_MOCK: ActividadeAgente[] = [
  {
    id: 1,
    tipo: "cadastro",
    descricao: "Cadastrou João Chimuco no grupo Kixikila Rangel",
    membroEnvolvido: "João Chimuco",
    data: "15/05/2026 09:30",
    resultado: "Concluído",
  },
  {
    id: 2,
    tipo: "visita",
    descricao: "Visita domiciliar a Lurdes Baptista — verificar atraso",
    membroEnvolvido: "Lurdes Baptista",
    data: "14/05/2026 14:15",
    resultado: "Compromisso de pagamento",
  },
  {
    id: 3,
    tipo: "lembrete",
    descricao: "Lembrete SMS enviado a 5 membros da região",
    data: "14/05/2026 10:00",
    resultado: "3 confirmaram",
  },
  {
    id: 4,
    tipo: "resolucao",
    descricao: "Problema de acesso resolvido — Maria Agostinho",
    membroEnvolvido: "Maria Agostinho",
    data: "13/05/2026 16:45",
    resultado: "Resolvido",
  },
  {
    id: 5,
    tipo: "cadastro",
    descricao: "Cadastrou Ana Burity como nova coordenadora",
    membroEnvolvido: "Ana Burity",
    data: "13/05/2026 11:20",
    resultado: "Concluído",
  },
  {
    id: 6,
    tipo: "visita",
    descricao: "Reunião comunitária no Huambo — 12 potenciais membros",
    data: "12/05/2026 09:00",
    resultado: "4 interessados",
  },
];

export async function getAgentDashboard(agentId: number): Promise<AgentDashboardData> {
  if (IS_MOCK) {
    await delay(500);
    const ultimos = MEMBROS.slice(0, 4);
    return {
      membrosCadastradosMes: 14,
      metaMensal: 20,
      progressoMeta: 70,
      taxaRetencao: 89,
      scoreMedioCarteira: 742,
      ultimosCadastros: ultimos,
      notificacoes: [
        {
          id: 1,
          tipo: "pagamento",
          mensagem: "João Chimuco fez primeiro pagamento",
          lida: false,
          data: "15/05/2026",
        },
        {
          id: 2,
          tipo: "lembrete",
          mensagem: "Lembrete: visitar Lurdes Baptista hoje",
          lida: false,
          data: "15/05/2026",
        },
      ],
      actividadesRecentes: ACTIVIDADES_MOCK.slice(0, 3),
      gruposNaRegiao: COMUNIDADES.filter((c) => c.regiao === "Luanda").length,
    };
  }
  return get<AgentDashboardData>(`/agentes/${agentId}/dashboard`);
}

export async function cadastrarMembro(data: CadastroPayload): Promise<Membro> {
  if (IS_MOCK) {
    await delay(800);
    const iniciais = data.nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const cores = [
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#EF4444",
      "#84CC16",
    ];
    return {
      id: MEMBROS.length + 1,
      nome: data.nome,
      tel: data.telefone,
      posicao: MEMBROS.length + 1,
      totalPoupado: 0,
      score: 300,
      status: "Pendente",
      iniciais,
      cor: cores[Math.floor(Math.random() * cores.length)],
      meses: 0,
      pontualidade: 0,
    };
  }
  return post<Membro>("/agentes/cadastrar", data);
}

export async function getActividadesAgente(agentId: number): Promise<ActividadeAgente[]> {
  if (IS_MOCK) {
    await delay(300);
    return ACTIVIDADES_MOCK;
  }
  return get<ActividadeAgente[]>(`/agentes/${agentId}/actividades`);
}

export async function getComunidadesByRegiao(regiao: string): Promise<Comunidade[]> {
  if (IS_MOCK) {
    await delay(300);
    return COMUNIDADES.filter((c) => c.regiao === regiao || regiao === "todas");
  }
  return get("/comunidades", { regiao });
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
