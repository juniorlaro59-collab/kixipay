import { useEffect, useState } from "react";
import { Check, Copy, Building2, Users, Brain } from "lucide-react";

import { ScoreRing, GeoQR, EmptyState } from "@/components/kixipay/shared";
import { fmtKz, scoreColor, scoreLabel, elegibilidade } from "@/components/kixipay/data";

import type { Membro } from "@/components/kixipay/data";
import type { ToastFn } from "./AppLayout";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type UserScoreResponse = {
  score?: number;
  level?: string;
  pendingDebt?: number;
  pontualidade?: number;
  mesesActivos?: number;
  mesesAtivos?: number;
  meses?: number;
  totalPoupado?: number;
  totalSaved?: number;
};

type ScoreViewData = {
  score: number;
  level: string;
  pendingDebt: number;
  pontualidade: number;
  meses: number;
  totalPoupado: number;
};

type LlmRiskAnalysisResponse = {
  riskLevel?: string;
  recommendation?: string;
  reason?: string;
};

type RiskViewData = {
  riskLevel: string;
  recommendation: string;
  reason: string;
};

function getToken() {
  return localStorage.getItem("token") ?? localStorage.getItem("accessToken");
}

function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return typeof response === "object" && response !== null && "data" in response;
}

function normalizeScoreResponse(
  response: ApiResponse<UserScoreResponse> | UserScoreResponse,
  fallback: Membro
): ScoreViewData {
  const data: UserScoreResponse =
    isApiResponse<UserScoreResponse>(response) && response.data
      ? response.data
      : (response as UserScoreResponse);

  const score = data.score ?? fallback.score ?? 0;

  return {
    score,
    level: data.level ?? scoreLabel(score),
    pendingDebt: data.pendingDebt ?? 0,
    pontualidade: data.pontualidade ?? fallback.pontualidade ?? 0,
    meses: data.mesesActivos ?? data.mesesAtivos ?? data.meses ?? fallback.meses ?? 0,
    totalPoupado: data.totalPoupado ?? data.totalSaved ?? fallback.totalPoupado ?? 0,
  };
}

function normalizeRiskResponse(
  response: ApiResponse<LlmRiskAnalysisResponse> | LlmRiskAnalysisResponse
): RiskViewData {
  const data: LlmRiskAnalysisResponse =
    isApiResponse<LlmRiskAnalysisResponse>(response) && response.data
      ? response.data
      : (response as LlmRiskAnalysisResponse);

  return {
    riskLevel: data.riskLevel ?? "Indisponível",
    recommendation: data.recommendation ?? "Sem recomendação disponível.",
    reason: data.reason ?? "Sem motivo disponível.",
  };
}

function getRiskColor(riskLevel: string) {
  const value = riskLevel.toLowerCase();

  if (value.includes("baixo")) return "var(--green)";
  if (value.includes("médio") || value.includes("medio")) return "var(--orange-mid)";

  return "var(--red)";
}

export function KixiScoreView({ user, toast }: { user: Membro; toast: ToastFn }) {
  const [mode, setMode] = useState<"membro" | "grupo">("membro");

  return (
    <div>
      <div
        style={{
          display: "inline-flex",
          background: "var(--surface-2)",
          padding: 4,
          borderRadius: 100,
          marginBottom: 24,
        }}
      >
        {(["membro", "grupo"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "8px 20px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              background: mode === m ? "var(--card)" : "transparent",
              color: mode === m ? "var(--ink)" : "var(--ink-3)",
              boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
            }}
          >
            {m === "membro" ? "O meu score" : "Score do grupo"}
          </button>
        ))}
      </div>

      {mode === "membro" ? (
        <ScoreModoMembro user={user} toast={toast} />
      ) : (
        <ScoreModoGrupo />
      )}
    </div>
  );
}

function ScoreModoMembro({ user, toast }: { user: Membro; toast: ToastFn }) {
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingRisk, setLoadingRisk] = useState(true);

  const [scoreData, setScoreData] = useState<ScoreViewData>({
    score: user.score,
    level: scoreLabel(user.score),
    pendingDebt: 0,
    pontualidade: user.pontualidade,
    meses: user.meses,
    totalPoupado: user.totalPoupado,
  });

  const [riskAnalysis, setRiskAnalysis] = useState<RiskViewData | null>(null);

  useEffect(() => {
    let active = true;

    async function loadScore() {
      try {
        setLoadingScore(true);

        const token = getToken();

        const response = await fetch("/api/Users/me/score", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.message ?? "Erro ao buscar score");
        }

        if (!active) return;

        setScoreData(normalizeScoreResponse(json, user));
      } catch {
        if (!active) return;

        toast("erro", "Não foi possível carregar o score real");
      } finally {
        if (active) setLoadingScore(false);
      }
    }

    async function loadRiskAnalysis() {
      try {
        setLoadingRisk(true);

        const token = getToken();

        const response = await fetch("/api/RiskAnalysis/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.message ?? "Erro ao buscar análise de risco");
        }

        if (!active) return;

        setRiskAnalysis(normalizeRiskResponse(json));
      } catch {
        if (!active) return;

        setRiskAnalysis(null);
        toast("erro", "Não foi possível carregar a análise da IA");
      } finally {
        if (active) setLoadingRisk(false);
      }
    }

    loadScore();
    loadRiskAnalysis();

    return () => {
      active = false;
    };
  }, [toast, user]);

  const score = scoreData.score;
  const nivel = scoreData.level || scoreLabel(score);
  const elegivelBanco = elegibilidade(score);
  const code = `KXP-VRFC-${score}-2026-${user.iniciais}`;

  const tempoActivoPercentual = Math.min(Math.round((scoreData.meses / 12) * 100), 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="kx-card" style={{ padding: 32, textAlign: "center" }}>
        {loadingScore ? (
          <div style={{ padding: 40, color: "var(--ink-3)", fontWeight: 600 }}>
            A carregar score...
          </div>
        ) : (
          <>
            <ScoreRing score={score} size={200} />

            <div
              style={{
                marginTop: 16,
                color: scoreColor(score),
                fontWeight: 700,
              }}
            >
              {nivel === "Excelente"
                ? "★★★★★"
                : nivel === "Bom"
                  ? "★★★★☆"
                  : nivel === "Regular"
                    ? "★★★☆☆"
                    : "★★☆☆☆"}{" "}
              {nivel}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
        className="kx-kpi-grid"
      >
        <ScoreMetric
          label="Pontualidade"
          v={`${scoreData.pontualidade}%`}
          sub={`${scoreData.pontualidade}% no prazo`}
          pct={scoreData.pontualidade}
          cor="var(--green)"
        />

        <ScoreMetric
          label="Meses activos"
          v={`${scoreData.meses} meses`}
          sub="Histórico sólido"
          pct={Math.min((scoreData.meses / 12) * 100, 100)}
          cor="var(--blue)"
        />

        <ScoreMetric
          label="Dívida pendente"
          v={fmtKz(scoreData.pendingDebt)}
          sub="Valor em aberto"
          pct={scoreData.pendingDebt > 0 ? 40 : 0}
          cor={scoreData.pendingDebt > 0 ? "var(--orange-mid)" : "var(--green)"}
        />
      </div>

      <div className="kx-card" style={{ padding: 24, background: "var(--surface-2)" }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Como o score é calculado
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
          className="kx-formula"
        >
          {[
            {
              l: "Pontualidade",
              p: 50,
              v: `${scoreData.pontualidade}%`,
            },
            {
              l: "Tempo activo",
              p: 30,
              v: `${tempoActivoPercentual}%`,
            },
            {
              l: "Histórico financeiro",
              p: 20,
              v: scoreData.pendingDebt > 0 ? "Com dívida" : "Regular",
            },
          ].map((b) => (
            <div
              key={b.l}
              title={`${b.l}: ${b.v} ponderado a ${b.p}%`}
              className="kx-card"
              style={{
                padding: 16,
                background: "var(--card)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontWeight: 600,
                }}
              >
                {b.l}
              </div>

              <div className="kx-num" style={{ fontSize: 22, marginTop: 4 }}>
                {b.v}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "var(--brand)",
                  marginTop: 2,
                }}
              >
                Peso {b.p}%
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink-2)" }}>
          Score actual: <strong>{score}</strong>
        </div>
      </div>

      <div className="kx-card" style={{ padding: 24 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          O que o score desbloqueia
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              min: 800,
              lvl: "Excelente",
              cor: "var(--green)",
              d: "Elegível para micro-crédito até 500.000 Kz · BFA",
            },
            {
              min: 700,
              lvl: "Muito bom",
              cor: "var(--blue)",
              d: "Elegível para micro-crédito até 300.000 Kz · Atlântico",
            },
            {
              min: 600,
              lvl: "Bom",
              cor: "var(--blue)",
              d: "Elegível para micro-crédito até 150.000 Kz · BAI",
            },
            {
              min: 400,
              lvl: "Regular",
              cor: "var(--orange-mid)",
              d: "Membro verificado KixiPay com selo oficial",
            },
            {
              min: 0,
              lvl: "A construir",
              cor: "var(--ink-4)",
              d: "Continue a pagar no prazo para subir de nível",
            },
          ].map((l) => {
            const active = score >= l.min;

            return (
              <div
                key={l.lvl}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: `2px solid ${active ? l.cor : "var(--border-soft)"}`,
                  opacity: active ? 1 : 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: l.cor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {active ? <Check size={14} /> : "·"}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: l.cor }}>
                    {l.lvl}
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--ink-3)",
                        marginLeft: 6,
                      }}
                    >
                      ≥ {l.min}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{l.d}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink-2)" }}>
          {elegivelBanco.ok
            ? `Elegível: até ${fmtKz(elegivelBanco.limite)} no banco ${elegivelBanco.banco}.`
            : "Ainda não elegível para micro-crédito."}
        </div>
      </div>

      <div className="kx-card" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--brand)",
            }}
          >
            <Brain size={18} />
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Análise da IA
            </div>

            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
              Avaliação automática do risco financeiro
            </div>
          </div>
        </div>

        {loadingRisk ? (
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            A carregar análise da IA...
          </div>
        ) : riskAnalysis ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Nível de risco
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: getRiskColor(riskAnalysis.riskLevel),
                }}
              >
                {riskAnalysis.riskLevel}
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Recomendação
              </div>

              <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                {riskAnalysis.recommendation}
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Motivo
              </div>

              <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                {riskAnalysis.reason}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            Não foi possível obter a análise da IA.
          </div>
        )}
      </div>

      <button
        onClick={() => setShare(true)}
        className="kx-btn kx-btn-blue kx-btn-lg"
        style={{ alignSelf: "flex-start" }}
      >
        <Building2 size={16} /> Partilhar Score com o banco
      </button>

      {share && (
        <div
          onClick={() => setShare(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="kx-scale-in"
            style={{
              background: "var(--card)",
              borderRadius: 24,
              padding: 32,
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            <h3 className="kx-display" style={{ fontSize: 22, marginBottom: 12 }}>
              Partilhar KixiScore
            </h3>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <GeoQR seed={code} />
            </div>

            <code
              className="kx-mono"
              style={{
                display: "block",
                padding: 10,
                background: "var(--surface)",
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {code}
            </code>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(code);
                setCopied(true);
                toast("sucesso", "Código copiado");
              }}
              className="kx-btn kx-btn-primary"
              style={{ width: "100%" }}
            >
              {copied ? (
                <>
                  <Check size={14} /> Copiado
                </>
              ) : (
                <>
                  <Copy size={14} /> Copiar código
                </>
              )}
            </button>

            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>
              Válido até 31 de Maio 2026
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreMetric({
  label,
  v,
  sub,
  pct,
  cor,
}: {
  label: string;
  v: string;
  sub: string;
  pct: number;
  cor: string;
}) {
  return (
    <div className="kx-card" style={{ padding: 20 }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--ink-3)",
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div className="kx-num" style={{ fontSize: 22, color: cor, marginTop: 4 }}>
        {v}
      </div>

      <div
        style={{
          height: 5,
          background: "var(--border-soft)",
          borderRadius: 3,
          marginTop: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(Math.max(pct, 0), 100)}%`,
            height: "100%",
            background: cor,
          }}
        />
      </div>

      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
        {sub}
      </div>
    </div>
  );
}

function ScoreModoGrupo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <EmptyState message="Dados de grupo não disponíveis sem lista de membros" icon={Users} />
    </div>
  );
}