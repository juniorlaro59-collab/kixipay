import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Monitor,
  Brain,
  LogOut,
  Users,
  Target,
  Percent,
  Star,
  Bell,
  Activity,
  AlertTriangle,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Send,
  Plus,
  FileText,
  MessageSquare,
  Menu,
  Shield,
} from "lucide-react";

import {
  Avatar,
  StatusBadge,
  Skeleton,
  EmptyState,
  ErrorState,
  Logo,
} from "@/components/kixipay/shared";

import { fmtKz, scoreColor, scoreLabel } from "@/components/kixipay/data";
import { REGIOES_ANGOLA } from "@/lib/constants";
import {
  cadastrarMembro,
  getMyRiskAnalysis,
  getRiskAnalysisByPhone,
} from "@/services";
import { getApiErrorMessage } from "@/services/client";


import type { CadastroPayload, Membro } from "@/types";
import type { RiskAnalysisResult } from "@/services";
import { getAgentMembers } from "@/services/agents";

type AgentView = "dashboard" | "cadastrar" | "monitoria" | "score";

interface AgentPanelProps {
  agentId: string;
  agentNome: string;
  onLogout: () => void;
  toast: (tipo: "sucesso" | "aviso" | "erro" | "info", mensagem: string) => void;
}

const NAV: { id: AgentView; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Painel", Icon: LayoutDashboard },
  { id: "cadastrar", label: "Cadastrar", Icon: UserPlus },
  { id: "monitoria", label: "Monitoria", Icon: Monitor },
  { id: "score", label: "Score IA", Icon: Brain },
];

export default function AgentPanel({ agentId, agentNome, onLogout, toast }: AgentPanelProps) {
  const [view, setView] = useState<AgentView>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            className="kx-nav-burger"
            style={{ display: "none", color: "var(--ink-2)" }}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          <Logo />

          <span
            className="kx-pill"
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            Agente
          </span>

          <span
            style={{
              color: "var(--ink-3)",
              fontSize: 13,
              fontFamily: "var(--font-ui)",
              fontWeight: 500,
            }}
            className="kx-hide-sm"
          >
            {NAV.find((n) => n.id === view)?.label}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontSize: 13,
              color: "var(--ink-3)",
              fontFamily: "var(--font-ui)",
              fontWeight: 500,
            }}
            className="kx-hide-sm"
          >
            {agentNome}
          </span>

          <button
            onClick={onLogout}
            style={{ color: "var(--ink-3)", padding: 8 }}
            aria-label="Sair"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>

        <style>{`
          @media (max-width: 700px) {
            .kx-nav-burger { display: block !important; }
            .kx-hide-sm { display: none !important; }
          }
        `}</style>
      </header>

      {mobileNavOpen && (
        <MobileNav
          view={view}
          onView={(v) => {
            setView(v);
            setMobileNavOpen(false);
          }}
        />
      )}

      <div style={{ display: "flex", paddingTop: 60 }}>
        <Sidebar view={view} onView={setView} />

        <main
          style={{
            flex: 1,
            padding: 28,
            minHeight: "calc(100vh - 60px)",
            paddingBottom: 100,
          }}
        >
          {view === "dashboard" && (
            <DashboardView agentId={agentId} agentNome={agentNome} toast={toast} />
          )}

          {view === "cadastrar" && <CadastrarView toast={toast} />}

          {view === "monitoria" && <MonitoriaUsersView toast={toast} />}

          {view === "score" && <ScoreView toast={toast} />}
        </main>
      </div>
    </div>
  );
}

function MobileNav({ view, onView }: { view: AgentView; onView: (v: AgentView) => void }) {
  return (
    <div
      onClick={() => onView(view)}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.4)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: 240,
          background: "var(--card)",
          padding: 16,
          animation: "slideInRight 200ms ease-out",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        }}
      >
        {NAV.map((it) => {
          const active = view === it.id;

          return (
            <button
              key={it.id}
              onClick={() => onView(it.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                background: active ? "var(--brand-light)" : "transparent",
                color: active ? "var(--brand)" : "var(--ink-2)",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                textAlign: "left",
                marginBottom: 2,
              }}
            >
              <it.Icon size={18} /> {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Sidebar({ view, onView }: { view: AgentView; onView: (v: AgentView) => void }) {
  return (
    <aside
      className="kx-sidebar"
      style={{
        width: 220,
        flexShrink: 0,
        background: "var(--card)",
        borderRight: "1px solid var(--border-soft)",
        padding: 20,
        position: "sticky",
        top: 60,
        height: "calc(100vh - 60px)",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: 0.4,
            marginBottom: 4,
          }}
        >
          Menu do Agente
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((it) => {
          const active = view === it.id;

          return (
            <button
              key={it.id}
              onClick={() => onView(it.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 10,
                background: active ? "var(--brand-light)" : "transparent",
                color: active ? "var(--brand)" : "var(--ink-2)",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                textAlign: "left",
                borderLeft: active ? "3px solid var(--brand)" : "3px solid transparent",
                transition: "all 200ms",
              }}
            >
              <it.Icon size={18} /> {it.label}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: 32,
          padding: 16,
          background: "var(--surface)",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Região
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>Luanda</div>
      </div>

      <style>{`@media (max-width: 700px) { .kx-sidebar { display: none !important; } }`}</style>
    </aside>
  );
}

function DashboardView({
  agentNome,
  toast,
}: {
  agentId: string;
  agentNome: string;
  toast: AgentPanelProps["toast"];
}) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const alreadyLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  const load = useCallback(
    async (force = false) => {
      if (!force && alreadyLoadedRef.current) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError("");

      try {
        const res = await getAgentMembers(1, 50);
        setMembros(res.membros);
        alreadyLoadedRef.current = true;
      } catch (error) {
        setError(getApiErrorMessage(error, "Erro ao carregar painel do agente"));
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = membros.length;
    const pagos = membros.filter((m) => m.status === "Pago").length;
    const atrasados = membros.filter((m) => m.status === "Em atraso").length;
    const pendentes = membros.filter((m) => m.status === "Pendente").length;
    const scoreMedio = total > 0 ? Math.round(membros.reduce((acc, m) => acc + m.score, 0) / total) : 0;
    const pontualidadeMedia =
      total > 0 ? Math.round(membros.reduce((acc, m) => acc + m.pontualidade, 0) / total) : 0;

    return {
      total,
      pagos,
      atrasados,
      pendentes,
      scoreMedio,
      pontualidadeMedia,
    };
  }, [membros]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton width={300} height={36} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
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

        <Skeleton height={200} />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={() => load(true)} />;

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
            Olá, {agentNome.split(" ")[0]} 👋
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <span style={{ color: "var(--ink-3)", fontSize: 14 }}>
              Painel do Agente · Luanda
            </span>
          </div>
        </div>

        <button onClick={() => load(true)} className="kx-btn kx-btn-outline">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <KpiCard
          Icon={Users}
          label="Membros"
          valor={String(stats.total)}
          sub="Total acompanhados"
          cor="var(--brand)"
          bg="var(--brand-light)"
        />

        <KpiCard
          Icon={CheckCircle}
          label="Pagos"
          valor={String(stats.pagos)}
          sub="Sem dívida pendente"
          subCor="var(--green)"
          cor="var(--green)"
          bg="var(--green-light)"
        />

        <KpiCard
          Icon={AlertTriangle}
          label="Em atraso"
          valor={String(stats.atrasados)}
          sub="Requer acompanhamento"
          subCor="var(--red)"
          cor="var(--red)"
          bg="rgba(220, 38, 38, 0.10)"
        />

        <KpiCard
          Icon={Star}
          label="Score médio"
          valor={String(stats.scoreMedio)}
          sub="Média dos membros"
          cor="var(--gold)"
          bg="var(--gold-light)"
          progress={Math.min(100, Math.round((stats.scoreMedio / 1000) * 100))}
          progressLabel={`${stats.scoreMedio}/1000`}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
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
            Resumo da carteira
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <MiniMetric label="Pendentes" value={String(stats.pendentes)} color="var(--orange-mid)" />
            <MiniMetric
              label="Pontualidade média"
              value={`${stats.pontualidadeMedia}%`}
              color="var(--green)"
            />
            <MiniMetric
              label="Taxa de atraso"
              value={`${stats.total > 0 ? Math.round((stats.atrasados / stats.total) * 100) : 0}%`}
              color="var(--red)"
            />
          </div>
        </div>

        <AccoesRapidas toast={toast} onRefresh={() => load(true)} />
      </div>
    </div>
  );
}

function MiniMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        background: "var(--surface-2)",
        border: "1px solid var(--border-soft)",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase" }}>
        {label}
      </div>
      <div className="kx-num" style={{ fontSize: 24, marginTop: 6, color }}>
        {value}
      </div>
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
  progressLabel,
}: {
  Icon: typeof Users;
  label: string;
  valor: string;
  sub?: string;
  subCor?: string;
  cor: string;
  bg: string;
  progress?: number;
  progressLabel?: string;
}) {
  return (
    <div
      className="kx-card kx-card-hover"
      style={{ padding: 20, borderTop: `3px solid ${cor}`, position: "relative" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            fontSize: 11,
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

      {sub && (
        <div style={{ fontSize: 12, color: subCor || "var(--ink-3)", marginTop: 4 }}>{sub}</div>
      )}

      {progress !== undefined && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--ink-3)",
              marginBottom: 4,
            }}
          >
            <span>Progresso</span>
            <span>{progressLabel || `${progress}%`}</span>
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
              style={{
                width: `${Math.min(100, progress)}%`,
                height: "100%",
                background: cor,
                borderRadius: 3,
                transition: "width 600ms ease",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AccoesRapidas({
  toast,
  onRefresh,
}: {
  toast: AgentPanelProps["toast"];
  onRefresh?: () => void;
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
        Acções Rápidas
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          onClick={() => toast("info", "Relatório de desempenho gerado com sucesso")}
          className="kx-btn kx-btn-primary"
        >
          <FileText size={14} /> Relatório
        </button>

        <button
          onClick={() => toast("info", "SMS enviado para membros pendentes")}
          className="kx-btn kx-btn-outline"
        >
          <Send size={14} /> Lembrar
        </button>

        <button
          onClick={() => toast("info", "A descarregar dados...")}
          className="kx-btn kx-btn-outline"
        >
          <Download size={14} /> Exportar
        </button>

        <button
          onClick={() => {
            onRefresh?.();
            toast("info", "Dashboard actualizado");
          }}
          className="kx-btn kx-btn-outline"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>
    </div>
  );
}

function CadastrarView({ toast }: { toast: AgentPanelProps["toast"] }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [biNumber, setBiNumber] = useState("");
  const [regiao, setRegiao] = useState("Luanda");
  const [grupoCodigo, setGrupoCodigo] = useState("");
  const [coordenadorNome, setCoordenadorNome] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);

  const reset = () => {
    setNome("");
    setTelefone("");
    setBiNumber("");
    setRegiao("Luanda");
    setGrupoCodigo("");
    setCoordenadorNome("");
    setObservacoes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submittingRef.current) return;

    if (!nome.trim() || !telefone.trim() || !biNumber.trim()) {
      toast("aviso", "Preencha nome, telefone e BI do membro");
      return;
    }

    if (telefone.replace(/\s/g, "").length < 9) {
      toast("aviso", "Telefone inválido — mínimo 9 dígitos");
      return;
    }

    if (!/^\d{9}[A-Za-z]{2}\d{3}$/.test(biNumber.trim())) {
      toast("aviso", "BI inválido. Use 000000000LA000");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const payload: CadastroPayload = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        biNumber: biNumber.trim().toUpperCase(),
        regiao,
        grupoCodigo: grupoCodigo.trim() || undefined,
        coordenadorNome: coordenadorNome.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      };

      await cadastrarMembro(payload);

      toast("sucesso", `${nome.trim()} cadastrado(a) com sucesso!`);
      reset();
    } catch (error) {
      toast("erro", getApiErrorMessage(error, "Erro ao cadastrar membro"));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 4 }}>
        Cadastrar Novo Membro
      </h1>

      <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
        Registe um novo participante na plataforma KixiPay
      </p>

      <form onSubmit={handleSubmit} className="kx-card" style={{ padding: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="Nome completo *">
            <input
              className="kx-input"
              placeholder="Ex: João Chimuco"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={submitting}
              required
            />
          </Field>

          <Field label="Telefone *">
            <input
              className="kx-input"
              placeholder="Ex: 923 456 789"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              disabled={submitting}
              required
            />
          </Field>

          <Field label="Número do BI *">
            <input
              className="kx-input"
              placeholder="Ex: 000000000LA000"
              value={biNumber}
              onChange={(e) => setBiNumber(e.target.value.toUpperCase())}
              disabled={submitting}
              required
            />
          </Field>

          <Field label="Região *">
            <select
              className="kx-input"
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
              disabled={submitting}
              style={{ appearance: "auto" }}
            >
              {REGIOES_ANGOLA.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Código do Grupo (opcional)">
            <input
              className="kx-input"
              placeholder="Ex: KXRNG-2024"
              value={grupoCodigo}
              onChange={(e) => setGrupoCodigo(e.target.value)}
              disabled={submitting}
            />
          </Field>

          <Field label="Nome do Coordenador (opcional)">
            <input
              className="kx-input"
              placeholder="Ex: Conceição Mateus"
              value={coordenadorNome}
              onChange={(e) => setCoordenadorNome(e.target.value)}
              disabled={submitting}
            />
          </Field>

          <Field label="Observações (opcional)">
            <textarea
              className="kx-input"
              placeholder="Informações adicionais sobre o membro..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={submitting}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </Field>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
          <button
            type="submit"
            className="kx-btn kx-btn-primary"
            disabled={submitting}
            style={{ minWidth: 160, opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} /> A cadastrar...
              </>
            ) : (
              <>
                <Plus size={16} /> Cadastrar Membro
              </>
            )}
          </button>

          <button
            type="button"
            className="kx-btn kx-btn-outline"
            disabled={submitting}
            onClick={reset}
          >
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink-2)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

function MonitoriaUsersView({ toast }: { toast: AgentPanelProps["toast"] }) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const alreadyLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  const load = useCallback(
    async (force = false) => {
      if (!force && alreadyLoadedRef.current) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError("");

      try {
        const res = await getAgentMembers(1, 50);
        setMembros(res.membros);
        alreadyLoadedRef.current = true;
      } catch (error) {
        setError(getApiErrorMessage(error, "Erro ao carregar membros"));
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return membros;

    return membros.filter((m) => m.nome.toLowerCase().includes(q) || m.tel.includes(q));
  }, [membros, search]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <h1 className="kx-display" style={{ fontSize: 26 }}>
          Monitoria de Membros
        </h1>

        <button onClick={() => load(true)} className="kx-btn kx-btn-outline">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search
          size={16}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--ink-3)",
          }}
        />

        <input
          className="kx-input"
          placeholder="Pesquisar membro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {loading ? (
        <div
          className="kx-card"
          style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={52} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(true)} />
      ) : filtered.length === 0 ? (
        <EmptyState message="Nenhum membro encontrado" icon={Monitor} />
      ) : (
        <div className="kx-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                  {["#", "Membro", "Telemóvel", "KixiScore", "Status", "Pontualidade"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 14px",
                        fontWeight: 600,
                        color: "var(--ink-3)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((m, i) => (
                  <tr
                    key={m.id}
                    style={{
                      borderTop: "1px solid var(--border-soft)",
                      background: i % 2 === 0 ? "transparent" : "var(--surface)",
                    }}
                  >
                    <td style={{ padding: 14, color: "var(--ink-3)" }}>{i + 1}</td>

                    <td style={{ padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar iniciais={m.iniciais} cor={m.cor} size={32} />
                        <span style={{ fontWeight: 600 }}>{m.nome}</span>
                      </div>
                    </td>

                    <td style={{ padding: 14, color: "var(--ink-2)" }}>{m.tel}</td>

                    <td style={{ padding: 14 }} className="kx-num">
                      <span style={{ color: scoreColor(m.score) }}>{m.score}</span>
                      <span style={{ marginLeft: 8, color: "var(--ink-3)", fontSize: 12 }}>
                        {scoreLabel(m.score)}
                      </span>
                    </td>

                    <td style={{ padding: 14 }}>
                      <StatusBadge status={m.status} />
                    </td>

                    <td style={{ padding: 14 }} className="kx-num">
                      {m.pontualidade}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreView({ toast }: { toast: AgentPanelProps["toast"] }) {
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [consultingByPhone, setConsultingByPhone] = useState(false);
  const [loading, setLoading] = useState(true);

  const myAnalysisLoadedRef = useRef(false);
  const loadingRef = useRef(false);
  const lastPhoneConsultedRef = useRef<string | null>(null);

  const loadMyRiskAnalysis = useCallback(
    async (force = false) => {
      if (!force && myAnalysisLoadedRef.current) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const data = await getMyRiskAnalysis();
        setRiskAnalysis(data);
        setConsultingByPhone(false);
        myAnalysisLoadedRef.current = true;
        lastPhoneConsultedRef.current = null;
      } catch (error) {
        setRiskAnalysis(null);
        toast("erro", getApiErrorMessage(error, "Não foi possível carregar a análise da IA"));
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [toast],
  );

  const loadRiskAnalysisByPhone = useCallback(
    async (force = false) => {
      const phone = phoneNumber.trim();

      if (!phone) {
        toast("aviso", "Informe o número de telefone");
        return;
      }

      if (!force && lastPhoneConsultedRef.current === phone) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const data = await getRiskAnalysisByPhone(phone);
        setRiskAnalysis(data);
        setConsultingByPhone(true);
        lastPhoneConsultedRef.current = phone;
        toast("sucesso", "Análise carregada com sucesso");
      } catch (error) {
        setRiskAnalysis(null);
        toast("erro", getApiErrorMessage(error, "Não foi possível consultar a análise por telefone"));
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [phoneNumber, toast],
  );

  useEffect(() => {
    loadMyRiskAnalysis();
  }, [loadMyRiskAnalysis]);

  function getRiskColor(riskLevel: string) {
    const value = riskLevel.toLowerCase();

    if (value.includes("baixo")) return "var(--green)";
    if (value.includes("médio") || value.includes("medio")) return "var(--orange-mid)";

    return "var(--red)";
  }

  function getRiskStatus(riskLevel: string) {
    const value = riskLevel.toLowerCase();

    if (value.includes("baixo")) return "Aprovável";
    if (value.includes("médio") || value.includes("medio")) return "Requer revisão";

    return "Alto risco";
  }

  function getRiskIcon(riskLevel: string) {
    const value = riskLevel.toLowerCase();

    if (value.includes("baixo")) return CheckCircle;
    if (value.includes("médio") || value.includes("medio")) return AlertTriangle;

    return AlertCircle;
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton width={360} height={36} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[1, 2, 3].map((i) => (
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

        <Skeleton height={180} />
      </div>
    );
  }

  const riskColor = riskAnalysis ? getRiskColor(riskAnalysis.riskLevel) : "var(--ink-3)";
  const RiskIcon = riskAnalysis ? getRiskIcon(riskAnalysis.riskLevel) : Brain;
  const riskStatus = riskAnalysis ? getRiskStatus(riskAnalysis.riskLevel) : "Indisponível";

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
          <h1 className="kx-display" style={{ fontSize: 26 }}>
            Score IA — Análise Inteligente
          </h1>

          <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 4 }}>
            Consulte a análise de risco do utilizador autenticado ou pesquise por telefone.
          </p>
        </div>

        <button onClick={() => loadMyRiskAnalysis(true)} className="kx-btn kx-btn-outline">
          <RefreshCw size={14} /> Minha análise
        </button>
      </div>

      <div
        className="kx-card"
        style={{
          padding: 20,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--ink-3)",
            }}
          />

          <input
            className="kx-input"
            placeholder="Consultar por telefone. Ex: 923456789"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadRiskAnalysisByPhone(true);
            }}
            style={{ paddingLeft: 40 }}
          />
        </div>

        <button onClick={() => loadRiskAnalysisByPhone(true)} className="kx-btn kx-btn-primary">
          <Search size={14} /> Consultar
        </button>
      </div>

      {!riskAnalysis ? (
        <EmptyState message="API de Score IA não disponível" icon={Brain} />
      ) : (
        <>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: -6 }}>
            {consultingByPhone
              ? "Resultado da consulta por número de telefone"
              : "Resultado da análise do utilizador autenticado"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <KpiCard
              Icon={Brain}
              label="Motor de análise"
              valor="IA"
              sub="Avaliação automática"
              cor="var(--brand)"
              bg="var(--brand-light)"
            />

            <KpiCard
              Icon={RiskIcon}
              label="Nível de risco"
              valor={riskAnalysis.riskLevel}
              sub="Classificação actual"
              subCor={riskColor}
              cor={riskColor}
              bg="var(--surface-2)"
            />

            <KpiCard
              Icon={Target}
              label="Estado"
              valor={riskStatus}
              sub="Decisão sugerida"
              subCor={riskColor}
              cor={riskColor}
              bg="var(--surface-2)"
            />
          </div>

          <div className="kx-card" style={{ padding: 24 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Recomendação da IA
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
                fontSize: 14,
                color: "var(--ink-2)",
                lineHeight: 1.6,
              }}
            >
              {riskAnalysis.recommendation}
            </div>
          </div>

          <div className="kx-card" style={{ padding: 24 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Motivo da análise
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
                fontSize: 14,
                color: "var(--ink-2)",
                lineHeight: 1.6,
              }}
            >
              {riskAnalysis.reason}
            </div>
          </div>
        </>
      )}
    </div>
  );
}