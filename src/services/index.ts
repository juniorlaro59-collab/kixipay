export { login, register } from "./auth";
export type { LoginResult } from "./auth";

export {
  createGroup,
  getGroups,
  joinGroup,
  getPendingJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getGroupById,
  getMyGroup,
  getGrupo,
  leaveGroup,
} from "./groups";

export type {
  GroupResponse,
  PaginatedApiResponse,
  CreateGroupRequest,
  JoinGroupRequest,
  RejectGroupJoinRequest,
} from "./groups";

export {
  getCurrentCycle,
  startNextCycle,
  registerContribution,
  getCycleContributions,
} from "./cycles";

export type {
  CycleResponse,
  RegisterContributionRequest,
} from "./cycles";


export { solicitarEntrada } from "./community";

export { scoreColor, scoreLabel, elegibilidade, fmtKz } from "./score";

export {
  getAllMembrosAdmin,
  getUsersByRole,
  createUser,
  updateAgenteStatus,
  updateUserByAdmin,
  removeMembroAdmin,
  getPlatformMetrics,
  getMyMetrics,
} from "./admin";

export { cadastrarMembro, addMemberToGroupByAgent, getScoreRecomendacao } from "./agents";

export { setToken, clearToken } from "./client";

export { getCurrentUser, getMyScore, applyScoreEvent } from "./users";
export type { ApiUser, ApiScore } from "./users";

export { initiatePayment, getPayment, confirmUssd404PaymentWebhook } from "./payments";
export type { InitiatePaymentResponse, PaymentDetails, PaymentWebhookPayload } from "./payments";

export { sendUssdSession } from "./ussd";
export type { UssdSessionPayload } from "./ussd";

export { getMyRiskAnalysis, getRiskAnalysisByPhone } from "./riskanalysis";
export type { RiskAnalysisResult } from "./riskanalysis";
