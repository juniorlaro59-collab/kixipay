import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Download,
  Send,
  Wallet,
  Users,
  Clock,
  Star,
  Check,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserPlus,
  ListChecks,
  PlayCircle,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Avatar, EmptyState, ErrorState, Skeleton, StatusBadge } from "@/components/kixipay/shared";
import { fmtKz } from "@/components/kixipay/data";
import { ROTACAO_MESES } from "@/lib/constants";

import type { Membro } from "@/components/kixipay/data";
import type { ToastFn } from "@/components/shared/AppLayout";

import {
  approveJoinRequest,
  rejectJoinRequest,
  getCurrentCycle
} from "@/services";


import { getApiErrorMessage } from "@/services/client";
import { GroupJoinRequest, GroupResponse, getMyGroup, getPendingJoinRequests } from "@/services/groups";
import { CycleContribution, CycleResponse, getCycleContributions, startNextCycle } from "@/services/cycles";

type ModalOpener = (
  m: "contribuicao" | "addMembro" | "confirmarPagamento" | "recomendacao",
  data?: Membro,
) => void;

function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((x: string) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeContributionStatus(status: string): "Pago" | "Pendente" | "Em atraso" {
  const value = status.toLowerCase();

  if (value.includes("paid") || value.includes("pago")) return "Pago";
  if (value.includes("late") || value.includes("default") || value.includes("atras")) {
    return "Em atraso";
  }

  return "Pendente";
}

export function CoordinatorDashboard({
  user,
  openModal,
  toast,
}: {
  user: Membro;
  openModal: ModalOpener;
  toast: ToastFn;
}) {
  const [grupo, setGrupo] = useState<GroupResponse | null>(null);
  const [cycle, setCycle] = useState<CycleResponse | null>(null);
  const [joinRequests, setJoinRequests] = useState<GroupJoinRequest[]>([]);
  const [contributions, setContributions] = useState<CycleContribution[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingCycle, setLoadingCycle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [startingCycle, setStartingCycle] = useState(false);

  const alreadyLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  const loadDashboard = useCallback(
    async (force = false) => {
      if (!force && alreadyLoadedRef.current) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const group = await getMyGroup();

        setGrupo(group);

        if (group?.id) {
          setLoadingCycle(true);

          const [currentCycle, pendingRequests] = await Promise.all([
            getCurrentCycle(group.id),
            getPendingJoinRequests(group.id, 1, 10),
          ]);

          setCycle(currentCycle);
          setJoinRequests(pendingRequests.items ?? []);

          if (currentCycle?.id) {
            const cycleContributions = await getCycleContributions(currentCycle.id, 1, 20);
            setContributions(cycleContributions.items ?? []);
          } else {
            setContributions([]);
          }
        } else {
          setCycle(null);
          setJoinRequests([]);
          setContributions([]);
        }

        alreadyLoadedRef.current = true;
      } catch (error) {
        setError(getApiErrorMessage(error, "Erro ao carregar painel do coordenador"));
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingCycle(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refresh = () => {
    alreadyLoadedRef.current = false;
    loadDashboard(true);
  };

  const handleApproveJoinRequest = async (requestId: string) => {
    if (reviewingRequestId) return;

    setReviewingRequestId(requestId);

    try {
      await approveJoinRequest(requestId);

      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast("sucesso", "Pedido aprovado com sucesso");

      refresh();
    } catch (error) {
      toast("erro", getApiErrorMessage(error, "Erro ao aprovar pedido"));
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleRejectJoinRequest = async (requestId: string) => {
    if (reviewingRequestId) return;

    const reason = window.prompt("Motivo da rejeição:");

    if (!reason?.trim()) {
      toast("aviso", "Informe o motivo da rejeição");
      return;
    }

    setReviewingRequestId(requestId);

    try {
      await rejectJoinRequest(requestId, reason.trim());

      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast("sucesso", "Pedido rejeitado com sucesso");

      refresh();
    } catch (error) {
      toast("erro", getApiErrorMessage(error, "Erro ao rejeitar pedido"));
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleStartNextCycle = async () => {
    if (!grupo?.id || startingCycle) return;

    setStartingCycle(true);

    try {
      const nextCycle = await startNextCycle(grupo.id);

      setCycle(nextCycle);
      toast("sucesso", "Próximo ciclo iniciado com sucesso");

      refresh();
    } catch (error) {
      toast("erro", getApiErrorMessage(error, "Erro ao iniciar próximo ciclo"));
    } finally {
      setStartingCycle(false);
    }
  };

  const grupoNome = grupo?.name || "Grupo não carregado";
  const totalMembros = grupo?.currentMembers ?? 0;
  const maxMembros = grupo?.maxMembers ?? totalMembros;

  const contribRecebidas = cycle?.totalContributions ?? 0;
  const contribPendentes = cycle?.pendingContributions ?? 0;
  const totalPrevisto = contribRecebidas + contribPendentes;
  const progresso = totalPrevisto > 0 ? Math.round((contribRecebidas / totalPrevisto) * 100) : 0;

  const saldoTotal = cycle?.totalCollected ?? grupo?.guaranteeFund ?? 0;
  const beneficiario = cycle?.beneficiaryName || "Sem beneficiário definido";

  const scoreMedio = "—";

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton width={320} height={36} />

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
          className="kx-kpi-grid"
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kx-card" style={{ padding: 20, height: 120 }}>
              <Skeleton width="80%" height={16} />
              <div style={{ marginTop: 8 }}>
                <Skeleton width="60%" height={32} />
              </div>
              <div style={{ marginTop: 8 }}>
                <Skeleton width="40%" height={12} />
              </div>
            </div>
          ))}
        </div>

        <Skeleton height={260} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!grupo) {
    return <ErrorState message="Nenhum grupo encontrado para este coordenador" onRetry={refresh} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="kx-display" style={{ fontSize: 28 }}>
            Olá, {user.nome.split(" ")[0]} 👋
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <span style={{ color: "var(--ink-3)", fontSize: 14 }}>Painel do Coordenador</span>

            <span
              className="kx-pill"
              style={{ background: "var(--brand-light)", color: "var(--brand)" }}
            >
              {grupoNome}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleStartNextCycle}
            disabled={startingCycle || loadingCycle}
            className="kx-btn kx-btn-primary"
            style={{ opacity: startingCycle ? 0.7 : 1 }}
          >
            {startingCycle ? (
              <>
                <RefreshCw size={14} /> A iniciar...
              </>
            ) : (
              <>
                <PlayCircle size={14} /> Iniciar ciclo
              </>
            )}
          </button>

          <button onClick={refresh} className="kx-btn kx-btn-outline">
            <RefreshCw size={14} /> Actualizar
          </button>
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
          sub="Total arrecadado no ciclo"
          subCor="var(--green)"
        />

        <KpiCard
          cor="var(--green)"
          bg="var(--green-light)"
          Icon={Users}
          label="Membros Activos"
          valor={`${totalMembros} / ${maxMembros}`}
          sub={`${maxMembros > 0 ? Math.round((totalMembros / maxMembros) * 100) : 0}% da capacidade`}
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
          sub="Não disponível na resposta do grupo"
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

          <PedidosEntrada
            requests={joinRequests}
            reviewingRequestId={reviewingRequestId}
            onApprove={handleApproveJoinRequest}
            onReject={handleRejectJoinRequest}
          />

          <RotacaoCompleta currentPosition={cycle?.cycleNumber ?? 1} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ContribuicoesResumo contributions={contributions} />

          <ActividadeRecente contributions={contributions} joinRequests={joinRequests} />

          <AccoesRapidas openModal={openModal} toast={toast} onRefresh={refresh} />
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
  Icon: LucideIcon;
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
          <div style={{ width: `${Math.min(100, progress)}%`, height: "100%", background: cor }} />
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
  const initials = getInitials(beneficiario);

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
        <Avatar iniciais={initials || "??"} cor="#1D4ED8" size={60} />

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
          ✓ Confirmar pagamento
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

function PedidosEntrada({
  requests,
  reviewingRequestId,
  onApprove,
  onReject,
}: {
  requests: GroupJoinRequest[];
  reviewingRequestId: string | null;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}) {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <UserPlus size={16} color="var(--brand)" />

        <span
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Pedidos de entrada no grupo
        </span>
      </div>

      {requests.length === 0 ? (
        <EmptyState message="Nenhum pedido pendente" icon={UserPlus} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.map((r) => (
            <div
              key={r.id}
              style={{
                padding: 14,
                borderRadius: 12,
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Avatar iniciais={getInitials(r.userName)} cor="#FF5C1A" size={36} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.userName}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{r.phoneNumber}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onApprove(r.id)}
                  disabled={reviewingRequestId === r.id}
                  className="kx-btn kx-btn-sm kx-btn-primary"
                  style={{ opacity: reviewingRequestId === r.id ? 0.7 : 1 }}
                >
                  <CheckCircle size={14} /> Aprovar
                </button>

                <button
                  onClick={() => onReject(r.id)}
                  disabled={reviewingRequestId === r.id}
                  className="kx-btn kx-btn-sm"
                  style={{
                    background: "var(--red)",
                    color: "#fff",
                    opacity: reviewingRequestId === r.id ? 0.7 : 1,
                  }}
                >
                  <XCircle size={14} /> Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RotacaoCompleta({ currentPosition }: { currentPosition: number }) {
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
        Rotação do grupo
      </div>

      <div
        style={{
          padding: 20,
          borderRadius: 14,
          background: "var(--surface-2)",
          border: "1px solid var(--border-soft)",
          color: "var(--ink-3)",
          fontSize: 13,
        }}
      >
        Ciclo actual:{" "}
        <strong style={{ color: "var(--ink)" }}>
          {currentPosition}
        </strong>
        . A lista completa da rotação depende de uma rota que devolva os membros do grupo.
      </div>

      <div
        className="kx-scroll"
        style={{
          maxHeight: 220,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginTop: 12,
        }}
      >
        {ROTACAO_MESES.map((mes, index) => {
          const posicao = index + 1;
          const isCurrent = posicao === currentPosition;
          const isPast = posicao < currentPosition;

          return (
            <div
              key={mes}
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
                {posicao}
              </span>

              <span style={{ flex: 1, fontSize: 13 }}>{mes}</span>

              {isCurrent && <span className="kx-pill">Actual</span>}
              {isPast && <Check size={14} color="var(--green)" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContribuicoesResumo({ contributions }: { contributions: CycleContribution[] }) {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <ListChecks size={16} color="var(--blue)" />

        <span
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Contribuições do ciclo
        </span>
      </div>

      {contributions.length === 0 ? (
        <EmptyState message="Nenhuma contribuição registada" icon={ListChecks} />
      ) : (
        <div
          className="kx-scroll"
          style={{
            maxHeight: 320,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {contributions.map((c) => (
            <div
              key={c.id}
              style={{
                padding: 12,
                borderRadius: 12,
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Avatar iniciais={getInitials(c.userName)} cor="#1D4ED8" size={34} />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.userName}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {c.paidAt ? new Date(c.paidAt).toLocaleDateString("pt-PT") : "Sem data"}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="kx-num" style={{ fontSize: 14 }}>
                  {fmtKz(c.amount)}
                </div>

                <StatusBadge status={normalizeContributionStatus(c.status)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActividadeRecente({
  contributions,
  joinRequests,
}: {
  contributions: CycleContribution[];
  joinRequests: GroupJoinRequest[];
}) {
  const entries = useMemo(() => {
    const contribEntries = contributions.slice(0, 4).map((c) => ({
      id: `c-${c.id}`,
      label: c.userName,
      desc: `Contribuição · ${fmtKz(c.amount)}`,
      status: c.status,
    }));

    const requestEntries = joinRequests.slice(0, 4).map((r) => ({
      id: `r-${r.id}`,
      label: r.userName,
      desc: "Pedido de entrada pendente",
      status: r.status,
    }));

    return [...contribEntries, ...requestEntries].slice(0, 6);
  }, [contributions, joinRequests]);

  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Activity size={16} color="var(--blue)" />

        <span
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Actividade recente
        </span>
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: 20, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
          Nenhuma actividade recente
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((e) => (
            <div
              key={e.id}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{e.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{e.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccoesRapidas({
  openModal,
  toast,
  onRefresh,
}: {
  openModal: ModalOpener;
  toast: ToastFn;
  onRefresh: () => void;
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
          onClick={() => toast("info", "SMS enviado para membros pendentes")}
          className="kx-btn kx-btn-outline"
        >
          <Send size={14} /> Lembrar
        </button>

        <button
          onClick={onRefresh}
          className="kx-btn kx-btn-outline"
          style={{ gridColumn: "1 / -1" }}
        >
          <RefreshCw size={14} /> Actualizar dados
        </button>
      </div>
    </div>
  );
}