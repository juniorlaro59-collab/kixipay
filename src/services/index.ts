export { login, register } from "./auth";
export type { LoginResult } from "./auth";

export {
  getGrupo,
  getCurrentCycle,
  getContribuicoes,
  contributeToCycle,
  createGroup,
  getGroupById,
  leaveGroup,
  startCycle,
  getAllGroups,
  getGroupJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "./groups";
export type { CurrentCycle, CycleContribution, PaymentFrequency } from "./groups";

export { solicitarEntrada } from "./community";

export { scoreColor, scoreLabel, elegibilidade, fmtKz } from "./score";

export {
  getAllMembrosAdmin,
  createUser,
  updateAgenteStatus,
  removeMembroAdmin,
  getPlatformMetrics,
  getMyMetrics,
} from "./admin";

export { cadastrarMembro, addMemberToGroupByAgent, getScoreRecomendacao } from "./agents";

export { setToken, clearToken } from "./client";

export { getCurrentUser, getMyScore, applyScoreEvent } from "./users";
export type { ApiUser, ApiScore } from "./users";

export { initiatePayment, getPayment } from "./payments";
export type { InitiatePaymentResponse, PaymentDetails } from "./payments";

export { getMyRiskAnalysis, getRiskAnalysisByPhone } from "./riskanalysis";
export type { RiskAnalysisResult } from "./riskanalysis";
