// ─── Domain Types ───────────────────────────────────────────────────────

export type UserRole = "coordinator" | "member";
export type UserId = "conceicao" | "manuel";

export type MemberStatus = "Pago" | "Pendente" | "Em atraso";
export type TxStatus = "Pago" | "Pendente" | "Em atraso" | "Recebido" | "Enviado" | "Recuperado";
export type TxTipo = "Contribuição" | "Recebimento" | "Lembrete SMS";

export interface Membro {
  id: number;
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

export interface Convite {
  id: number;
  codigo: string;
  grupoNome: string;
  enviadoPor: string;
  link: string;
  usado: boolean;
}

// ─── API Types ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
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

export interface AuthResponse {
  user: {
    id: UserId;
    nome: string;
    role: UserRole;
    token: string;
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

// ─── Filter Types ────────────────────────────────────────────────────────
export interface PeriodoFilter {
  label: string;
  value: string;
}

export interface MembroFilter {
  search?: string;
  status?: MemberStatus | "todos";
}
