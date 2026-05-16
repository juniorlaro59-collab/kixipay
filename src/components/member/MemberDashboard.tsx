import { useState, useEffect } from "react";
import { Plus, Star, Wallet, Users, Clock, Check } from "lucide-react";
import { Avatar, ScoreRing } from "@/components/kixipay/shared";
import { fmtKz, scoreLabel } from "@/components/kixipay/data";
import { ROTACAO_MESES } from "@/lib/constants";
import type { Membro } from "@/components/kixipay/data";
import type { ToastFn } from "@/components/shared/AppLayout";
import { getMyScore, getGrupo, getCurrentCycle } from "@/services";
import type { ApiScore, CurrentCycle } from "@/services";
import type { Grupo } from "@/types";

type ModalOpener = (
  m: "contribuicao" | "addMembro" | "confirmarPagamento" | "recomendacao",
  data?: Membro,
) => void;

export function MemberDashboard({
  user,
  openModal,
  toast,
}: {
  user: Membro;
  openModal: ModalOpener;
  toast: ToastFn;
}) {
  const [apiScore, setApiScore] = useState<ApiScore | null>(null);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [cycle, setCycle] = useState<CurrentCycle | null>(null);

  useEffect(() => {
    getMyScore()
      .then(setApiScore)
      .catch(() => {});
    getGrupo()
      .then(setGrupo)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (grupo?.id) {
      getCurrentCycle(grupo.id)
        .then(setCycle)
        .catch(() => {});
    }
  }, [grupo?.id]);

  const scoreActual = apiScore?.score ?? user.score;
  const contribRecebidas = cycle?.totalContributions ?? 0;
  const totalPrevisto = (cycle?.totalContributions ?? 0) + (cycle?.pendingContributions ?? 0);
  const progresso = totalPrevisto > 0 ? Math.round((contribRecebidas / totalPrevisto) * 100) : 0;

  const pos = user.posicao;
  const mesRecebe = ROTACAO_MESES[Math.min(pos - 1, ROTACAO_MESES.length - 1)];
  const meusPagamentos: any[] = [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="kx-display" style={{ fontSize: 28 }}>
          Olá, {user.nome.split(" ")[0]} 👋
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <span style={{ color: "var(--ink-3)", fontSize: 14 }}>15 de Maio de 2026</span>
          <span
            className="kx-pill"
            style={{ background: "var(--blue-light)", color: "var(--blue)" }}
          >
            Membro · {user.posicao}º na rotação
          </span>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
        className="kx-kpi-grid"
      >
        <KpiCardSm
          cor="var(--gold)"
          bg="var(--gold-light)"
          Icon={Star}
          label="Meu KixiScore"
          valor={`${scoreActual} ★`}
          sub={scoreLabel(scoreActual)}
        />
        <KpiCardSm
          cor="var(--brand)"
          bg="var(--brand-light)"
          Icon={Users}
          label="Minha Posição"
          valor={`${pos}º`}
          sub={`Recebe em ${mesRecebe}`}
        />
        <KpiCardSm
          cor="var(--green)"
          bg="var(--green-light)"
          Icon={Clock}
          label="Total Poupado"
          valor={fmtKz(user.totalPoupado)}
          sub={`${user.meses} meses activo`}
        />
        <KpiCardSm
          cor="var(--blue)"
          bg="var(--blue-light)"
          Icon={Check}
          label="Status Maio"
          valor={user.status}
          sub={`${user.pontualidade}% pontualidade`}
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}
        className="kx-dash-grid"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="kx-card" style={{ padding: 24, textAlign: "center" }}>
            <ScoreRing score={scoreActual} size={180} />
            <div style={{ marginTop: 12, color: "var(--gold)" }}>★★★★★</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-2)" }}>
              {user.meses} meses de histórico · {user.pontualidade}% pontualidade
            </div>
          </div>

          <div className="kx-card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-3)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Minhas contribuições
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ink-3)",
                textAlign: "center",
                padding: 16,
              }}
            >
              Dados de contribuições indisponíveis
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="kx-card" style={{ padding: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-3)",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Próximo recebimento
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar iniciais={user.iniciais} cor={user.cor} size={52} />
              <div style={{ flex: 1 }}>
                <div className="kx-display" style={{ fontSize: 20, fontWeight: 700 }}>
                  {user.nome}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  {pos}º na rotação · {mesRecebe}
                </div>
              </div>
              <div className="kx-num" style={{ fontSize: 24, color: "var(--green)" }}>
                {fmtKz(cycle?.totalCollected ?? 0)}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "var(--ink-3)",
                  marginBottom: 4,
                }}
              >
                <span>Progresso do grupo</span>
                <span>
                  {contribRecebidas}/{totalPrevisto} pagaram
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "var(--border-soft)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{ width: `${progresso}%`, height: "100%", background: "var(--brand)" }}
                />
              </div>
            </div>
          </div>

          <div className="kx-card" style={{ padding: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-3)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Meus pagamentos recentes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {meusPagamentos.length > 0 ? (
                meusPagamentos.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 0",
                      borderBottom: "1px solid var(--border-soft)",
                    }}
                  >
                    <Avatar iniciais={user.iniciais} cor={user.cor} size={28} />
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{t.tipo}</span>
                      <span style={{ color: "var(--ink-3)", marginLeft: 6 }}>{t.data}</span>
                    </div>
                    {t.valor > 0 && (
                      <span className="kx-num" style={{ fontSize: 14 }}>
                        {fmtKz(t.valor)}
                      </span>
                    )}
                    <span
                      className="kx-pill"
                      style={{
                        background:
                          t.status === "Pago"
                            ? "var(--green-light)"
                            : t.status === "Em atraso"
                              ? "var(--red-light)"
                              : "var(--gold-light)",
                        color:
                          t.status === "Pago"
                            ? "var(--green)"
                            : t.status === "Em atraso"
                              ? "var(--red)"
                              : "var(--orange-mid)",
                        fontSize: 11,
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", padding: 12 }}
                >
                  Nenhum pagamento registado ainda
                </div>
              )}
            </div>
          </div>

          <div className="kx-card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-3)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Acções rápidas
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={() => openModal("contribuicao", user)}
                className="kx-btn kx-btn-primary"
              >
                <Plus size={14} /> Pagar contribuição
              </button>
              <button
                onClick={() =>
                  toast("info", `KixiScore ${scoreActual} · ${scoreLabel(scoreActual)}`)
                }
                className="kx-btn kx-btn-outline"
              >
                <Star size={14} /> Ver score
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1100px) { .kx-kpi-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .kx-kpi-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 1000px) { .kx-dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function KpiCardSm({
  Icon,
  label,
  valor,
  sub,
  cor,
  bg,
}: {
  Icon: typeof Star;
  label: string;
  valor: string;
  sub: string;
  cor: string;
  bg: string;
}) {
  return (
    <div className="kx-card" style={{ padding: 20, borderTop: `3px solid ${cor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color={cor} />
        </div>
      </div>
      <div className="kx-num" style={{ fontSize: 28, color: "var(--ink)", marginTop: 8 }}>
        {valor}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}
