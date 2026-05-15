export { login, register, getUserDisplayName, getUserRole, getAllMockUsers } from "./auth";
export type { LoginResult } from "./auth";

export {
  getGrupo,
  getDashboard,
  getMembros,
  getHistorico,
  updateGrupo,
  addMembro,
  registrarContribuicao,
} from "./groups";
export type { DashboardData, ContribuicaoInput } from "./groups";

export {
  getComunidades,
  getComunidadeByCode,
  solicitarEntrada,
  getRegioes,
  gerarConvite,
} from "./community";

export {
  getScoreInfo,
  getScoreDistribuicao,
  scoreColor,
  scoreLabel,
  elegibilidade,
  fmtKz,
} from "./score";

export {
  getPlatformStats,
  getActivityLog,
  getAgentes,
  updateAgenteStatus,
  getAllMembrosAdmin,
  removeMembroAdmin,
} from "./admin";
export {
  getAgentDashboard,
  cadastrarMembro,
  getActividadesAgente,
  getComunidadesByRegiao,
  getScoreRecomendacao,
} from "./agents";

export {
  getADashboard,
  getPredicoes,
  getPredicaoByMembro,
  getAlertas,
  marcarAlertaLido,
  analisarMembro,
  getMembrosRisco,
} from "./ai-score";

export { setToken, clearToken, IS_MOCK } from "./client";

// Re-export mock data for direct use in components (legacy)
export {
  MEMBROS,
  HISTORICO,
  COMUNIDADES,
  REGIOES,
  NOTIFICACOES,
  GRUPO_MOCK,
  AGENTES,
  ACTIVITY_LOG,
  SCORE_PREDICOES,
  SCORE_ALERTAS,
} from "./mock-data";
export type {
  Membro,
  Transacao,
  Comunidade,
  Grupo,
  Notificacao,
  UserRole,
  UserId,
  ScoreInfo,
  Elegibilidade,
  LoginRequest,
  RegisterRequest,
  Agente,
  ActivityLogEntry,
  PlatformStats,
  ScorePredictao,
  ScoreAlert,
  AScoreDashboard,
  ScoreFactor,
  AgentDashboardData,
  ActividadeAgente,
  CadastroPayload,
} from "@/types";
