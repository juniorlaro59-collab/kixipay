// ─── Domain Types ───────────────────────────────────────────────────────

export type UserRole = "admin" | "agent" | "coordinator" | "member";
export type UserId = string;

export type MemberStatus = "Pago" | "Pendente" | "Em atraso";
export type TxStatus = "Pago" | "Pendente" | "Em atraso" | "Recebido" | "Enviado" | "Recuperado";
export type TxTipo = "Contribuição" | "Recebimento" | "Lembrete SMS";

export interface Membro {
  id: string | number;
  nome: string;
  tel: string;
  posicao: number;
  totalPoupado: number;
  score: number;
  status: MemberStatus;
  iniciais: string;
  cor: string;
  meses: number;
  pontualidade: number;
}

export interface Transacao {
  id: number;
  data: string;
  membro: string;
  tipo: TxTipo | string;
  valor: number;
  ref: string;
  status: TxStatus;
}

export interface Comunidade {
  id: number;
  nome: string;
  regiao: string;
  membros: number;
  maxMembros: number;
  valorMensal: number;
  codigo: string;
  descricao: string;
}

export interface Grupo {
  id: string;
  nome: string;
  codigo: string;
  valorMensal: number;
  diaCorte: number;
  membros: Membro[];
  createdAt: string;
}

export interface Notificacao {
  id: number;
  tipo: "pagamento" | "lembrete" | "recebimento" | "convite";
  mensagem: string;
  lida: boolean;
  data: string;
}

// ─── API Types ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ─── Auth Types ─────────────────────────────────────────────────────────

export interface LoginRequest {
  telefone: string;
  pin: string;
}

export interface RegisterRequest {
  nome: string;
  telefone: string;
  pin: string;
  pinConfirm: string;
  termos: boolean;
}

export interface ApiLoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    score: number;
    level: string;
    role: string;
    pendingDebt: number;
  };
}

// ─── Score Types ────────────────────────────────────────────────────────

export interface ScoreInfo {
  score: number;
  nivel: "Excelente" | "Bom" | "Regular" | "A construir";
  cor: string;
  pontualidade: number;
  mesesAtivo: number;
  totalPoupado: number;
}

export interface Elegibilidade {
  ok: boolean;
  limite: number;
  banco: string;
}

// ─── Admin Types ─────────────────────────────────────────────────────────

export interface PlatformStats {
  totalMembros: number;
  totalGrupos: number;
  totalAgentes: number;
  totalCoordenadores: number;
  volumeTotal: number;
  scoreMedio: number;
  membrosActivos: number;
  fundosCirculacao: number;
  crescimentoMensal: number;
}

export interface ActivityLogEntry {
  id: number;
  tipo: "criacao" | "actualizacao" | "remocao" | "alerta" | "login" | "registo";
  entidade: "membro" | "agente" | "coordenador" | "grupo" | "sistema";
  entidadeId: string | number;
  descricao: string;
  responsavel: string;
  data: string;
  metadata?: Record<string, unknown>;
}

export interface Agente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  regiao: string;
  status: "activo" | "inactivo" | "suspenso";
  membrosCadastrados: number;
  scoreMedioAgente: number;
  taxaRetencao: number;
  metaMensal: number;
  atingidoEsteMes: number;
  dataContratacao: string;
  iniciais: string;
  cor: string;
  gruposAssociados: string[];
}

// ─── AI Score Types ──────────────────────────────────────────────────────

export interface ScorePredictao {
  membroId: number;
  membroNome: string;
  scoreActual: number;
  scoreProjectado: number;
  tendencia: "subindo" | "estavel" | "descendo";
  confianca: number;
  factores: ScoreFactor[];
  recomendacao: string;
  dataAnalise: string;
}

export interface ScoreFactor {
  factor: string;
  impacto: "positivo" | "negativo" | "neutro";
  peso: number;
  descricao: string;
}

export interface ScoreAlert {
  id: number;
  membroId: number;
  membroNome: string;
  score: number;
  tipo: "critico" | "atencao" | "melhoria";
  mensagem: string;
  data: string;
  lido: boolean;
  accaoRecomendada: string;
}

export interface AScoreDashboard {
  scoreMedioGeral: number;
  totalAnalises: number;
  alertasActivos: number;
  membrosEmRisco: number;
  distribuicao: { nivel: string; count: number }[];
  tendencias: { mes: string; scoreMedio: number }[];
}

// ─── Agent Types ─────────────────────────────────────────────────────────

export interface AgentDashboardData {
  membrosCadastradosMes: number;
  metaMensal: number;
  progressoMeta: number;
  taxaRetencao: number;
  scoreMedioCarteira: number;
  ultimosCadastros: Membro[];
  notificacoes: Notificacao[];
  actividadesRecentes: ActividadeAgente[];
  gruposNaRegiao: number;
}

export interface ActividadeAgente {
  id: number;
  tipo: "cadastro" | "visita" | "lembrete" | "resolucao";
  descricao: string;
  membroEnvolvido?: string;
  data: string;
  resultado?: string;
}

export interface CadastroPayload {
  nome: string;
  telefone: string;
  biNumber: string;
  regiao: string;
  grupoCodigo?: string;
  coordenadorNome?: string;
  observacoes?: string;
}

// ─── Filter Types ────────────────────────────────────────────────────────

export interface MembroFilter {
  search?: string;
  status?: MemberStatus | "todos";
}
