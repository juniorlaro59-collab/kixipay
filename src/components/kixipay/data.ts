// ─── Re-export centralizado da camada de serviços ──────────────────────
// Este ficheiro mantém compatibilidade com imports legados.
// Novos componentes devem importar directamente de "@/services" ou "@/types".

export {
  MEMBROS,
  HISTORICO,
  COMUNIDADES,
  REGIOES,
  NOTIFICACOES,
  GRUPO_MOCK,
  fmtKz,
  scoreColor,
  scoreLabel,
  elegibilidade,
  elegibilidade as eligivel,
} from "@/services";

export type {
  Membro,
  Transacao as Tx,
  Comunidade,
  UserRole as Role,
  UserId,
  ScoreInfo,
  Elegibilidade,
} from "@/types";

export { ROTACAO_MESES } from "@/lib/constants";
