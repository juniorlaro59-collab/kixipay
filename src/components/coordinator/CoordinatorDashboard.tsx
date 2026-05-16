import { useEffect, useState } from "react";
import { Plus, Download, Send, Wallet, Users, Clock, Star, Check } from "lucide-react";
import { Avatar } from "@/components/kixipay/shared";
import { fmtKz } from "@/components/kixipay/data";
import { ROTACAO_MESES } from "@/lib/constants";
import type { Membro } from "@/components/kixipay/data";
import type { ToastFn } from "@/components/shared/AppLayout";
import { getGrupo, getCurrentCycle } from "@/services";
import type { CurrentCycle } from "@/services";
import type { Grupo } from "@/types";

type ModalOpener = (
  m: "contribuicao" | "addMembro" | "confirmarPagamento" | "recomendacao",
  data?: Membro,
) => void;

export function CoordinatorDashboard({
  user,
  openModal,
  toast,
}: {
  user: Membro;
  openModal: ModalOpener;
  toast: ToastFn;
}) {
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [cycle, setCycle] = useState<CurrentCycle | null>(null);

  useEffect(() => {
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

  const grupoNome = grupo?.nome || "Kixikila Rangel";
  const totalMembros = grupo?.membros?.length || 12;
  const contribRecebidas = cycle?.totalContributions ?? 0;
  const contribPendentes = cycle?.pendingContributions ?? 0;
  const totalPrevisto = contribRecebidas + contribPendentes;
  const progresso = totalPrevisto > 0 ? Math.round((contribRecebidas / totalPrevisto) * 100) : 0;
  const saldoTotal = cycle?.totalCollected ?? 0;
  const beneficiario = cycle?.beneficiaryName || "Manuel Jacinto";
  const membros = grupo?.membros ?? [];
  const scoreMedio =
    membros.length > 0 ? Math.round(membros.reduce((s, m) => s + m.score, 0) / membros.length) : 0;

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
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            Coordenadora · {grupoNome}
          </span>
        </div>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
        className="kx-kpi-grid"
      >
        <KpiCard
          cor="var(--brand)"
          bg="var(--brand-light)"
          Icon={Wallet}
          label="Saldo Total"
          valor={fmtKz(saldoTotal)}
          sub={`↑ +${fmtKz(5000)} este mês`}
          subCor="var(--green)"
        />
        <KpiCard
          cor="var(--green)"
          bg="var(--green-light)"
          Icon={Users}
          label="Membros Activos"
          valor={`${totalMembros} / ${totalMembros}`}
          sub="100% presentes"
          subCor="var(--green)"
        />
        <KpiCard
          cor="var(--orange-mid)"
          bg="var(--gold-light)"
          Icon={Clock}
          label="Contribuições do Mês"
          valor={`${contribRecebidas} / ${totalPrevisto}`}
          sub={`${progresso}% recebidas · ${contribPendentes} pendentes`}
          progress={progresso}
        />
        <KpiCard
          cor="var(--gold)"
          bg="var(--gold-light)"
          Icon={Star}
          label="KixiScore Médio"
          valor={`${scoreMedio} ★`}
          sub="Grupo excelente"
        />
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}
        className="kx-dash-grid"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ProximoRecebimento
            openModal={openModal}
            toast={toast}
            beneficiario={beneficiario}
            contribRecebidas={contribRecebidas}
            totalPrevisto={totalPrevisto}
            progresso={progresso}
            valorPago={saldoTotal}
          />
          <RotacaoCompleta />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ContribuicoesChart />
          <ActividadeRecente />
          <AccoesRapidas openModal={openModal} toast={toast} />
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

function KpiCard({
  Icon,
  label,
  valor,
  sub,
  subCor,
  cor,
  bg,
  progress,
}: {
  Icon: typeof Wallet;
  label: string;
  valor: string;
  sub: string;
  subCor?: string;
  cor: string;
  bg: string;
  progress?: number;
}) {
  return (
    <div
      className="kx-card kx-card-hover"
      style={{ padding: 20, borderTop: `3px solid ${cor}`, position: "relative" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.3,
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
      <div style={{ fontSize: 12, color: subCor || "var(--ink-3)", marginTop: 4 }}>{sub}</div>
      {progress !== undefined && (
        <div
          style={{
            height: 4,
            background: "var(--border-soft)",
            borderRadius: 2,
            marginTop: 8,
            overflow: "hidden",
          }}
        >
          <div style={{ width: `${progress}%`, height: "100%", background: cor }} />
        </div>
      )}
    </div>
  );
}

function ProximoRecebimento({
  openModal,
  toast,
  beneficiario,
  contribRecebidas,
  totalPrevisto,
  progresso,
  valorPago,
}: {
  openModal: ModalOpener;
  toast: ToastFn;
  beneficiario: string;
  contribRecebidas: number;
  totalPrevisto: number;
  progresso: number;
  valorPago: number;
}) {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-3)",
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Quem recebe este mês
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <Avatar iniciais="MJ" cor="#1D4ED8" size={60} />
        <div style={{ flex: 1 }}>
          <div className="kx-display" style={{ fontSize: 22, fontWeight: 700 }}>
            {beneficiario}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Próximo recebimento</div>
        </div>
        <div className="kx-num" style={{ fontSize: 26, color: "var(--green)" }}>
          {fmtKz(valorPago)}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--ink-3)",
            marginBottom: 4,
          }}
        >
          <span>
            {contribRecebidas} de {totalPrevisto} contribuições recebidas
          </span>
          <span>{progresso}%</span>
        </div>
        <div
          style={{
            height: 6,
            background: "var(--border-soft)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div style={{ width: `${progresso}%`, height: "100%", background: "var(--brand)" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => openModal("confirmarPagamento")}
          className="kx-btn kx-btn-primary"
          style={{ flex: 1, minWidth: 200 }}
        >
          ✓ Confirmar pagamento ao {beneficiario.split(" ")[0]}
        </button>
        <button
          onClick={() => toast("info", "SMS de aviso enviado")}
          className="kx-btn kx-btn-outline"
        >
          <Send size={14} /> Enviar SMS
        </button>
      </div>
    </div>
  );
}

function RotacaoCompleta() {
  const [membrosLista, setMembrosLista] = useState<Membro[]>([]);
  useEffect(() => {
    import("@/services").then(({ getGrupo }) =>
      getGrupo()
        .then((g) => setMembrosLista(g?.membros ?? []))
        .catch(() => {}),
    );
  }, []);
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-3)",
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Rotação completa do grupo
      </div>
      <div
        className="kx-scroll"
        style={{
          maxHeight: 320,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {membrosLista.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            Nenhum membro disponível
          </div>
        ) : (
          [...membrosLista]
            .sort((a, b) => a.posicao - b.posicao)
            .map((m) => {
              const isCurrent = m.posicao === 7;
              const isPast = m.posicao < 7;
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: isCurrent ? "var(--brand-light)" : "transparent",
                    color: isCurrent ? "var(--brand)" : "var(--ink)",
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  <span
                    className="kx-num"
                    style={{
                      width: 24,
                      fontSize: 13,
                      color: isCurrent ? "var(--brand)" : "var(--ink-3)",
                    }}
                  >
                    {m.posicao}
                  </span>
                  <Avatar iniciais={m.iniciais} cor={m.cor} size={28} />
                  <span style={{ flex: 1, fontSize: 13 }}>{m.nome}</span>
                  <span
                    style={{ fontSize: 12, color: isCurrent ? "var(--brand)" : "var(--ink-3)" }}
                  >
                    {ROTACAO_MESES[m.posicao - 1]}
                  </span>
                  {isPast && <Check size={14} color="var(--green)" />}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

function ContribuicoesChart() {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-3)",
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Contribuições — Últimos 6 meses
      </div>
      <div
        style={{
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-3)",
          fontSize: 13,
        }}
      >
        Dados históricos indisponíveis
      </div>
    </div>
  );
}

function ActividadeRecente() {
  const [entries, setEntries] = useState<any[]>([]);
  useEffect(() => {
    Promise.resolve().then(() => setEntries([]));
  }, []);
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-3)",
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Actividade recente
      </div>
      <div
        className="kx-scroll"
        style={{
          maxHeight: 280,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {entries.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            Nenhuma actividade recente
          </div>
        ) : (
          entries.map((t: any) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--surface-2)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.membro}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {t.tipo} · {t.data}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {t.valor > 0 && (
                  <div className="kx-num" style={{ fontSize: 14 }}>
                    {fmtKz(t.valor)}
                  </div>
                )}
                <span
                  className="kx-pill"
                  style={{
                    background: "var(--ink-4)",
                    color: "var(--ink-2)",
                    fontSize: 11,
                  }}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AccoesRapidas({ openModal, toast }: { openModal: ModalOpener; toast: ToastFn }) {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-3)",
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Acções rápidas
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => openModal("contribuicao")} className="kx-btn kx-btn-primary">
          <Plus size={14} /> Contribuição
        </button>
        <button onClick={() => openModal("addMembro")} className="kx-btn kx-btn-outline">
          <Plus size={14} /> Membro
        </button>
        <button
          onClick={() => toast("info", "Relatório PDF gerado · A descarregar...")}
          className="kx-btn kx-btn-outline"
        >
          <Download size={14} /> Exportar
        </button>
        <button
          onClick={() => toast("info", "SMS enviado para 4 membros pendentes")}
          className="kx-btn kx-btn-outline"
        >
          <Send size={14} /> Lembrar
        </button>
      </div>
    </div>
  );
}
