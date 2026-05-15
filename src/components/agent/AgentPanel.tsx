import { useState, useEffect, useMemo } from "react";
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
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Download,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  MessageSquare,
  Menu,
} from "lucide-react";
import {
  Avatar,
  StatusBadge,
  Skeleton,
  SkeletonCard,
  EmptyState,
  ErrorState,
  Logo,
} from "@/components/kixipay/shared";
import { fmtKz, scoreColor, scoreLabel, MEMBROS } from "@/components/kixipay/data";
import { REGIOES_ANGOLA } from "@/lib/constants";
import {
  getAgentDashboard,
  cadastrarMembro,
  getActividadesAgente,
  getComunidadesByRegiao,
  getScoreRecomendacao,
  getPredicoes,
  getAlertas,
  analisarMembro,
  marcarAlertaLido,
  getMembrosRisco,
} from "@/services";
import type {
  AgentDashboardData,
  ActividadeAgente,
  CadastroPayload,
  ScorePredictao,
  ScoreAlert,
  Membro,
  Comunidade,
  Notificacao,
} from "@/types";

type AgentView = "dashboard" | "cadastrar" | "monitoria" | "score";

interface AgentPanelProps {
  agentId: number;
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
  const region = "Luanda";

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
          {view === "monitoria" && <MonitoriaView toast={toast} />}
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

// ─── DASHBOARD VIEW ──────────────────────────────────────────────────────

function DashboardView({
  agentId,
  agentNome,
  toast,
}: {
  agentId: number;
  agentNome: string;
  toast: AgentPanelProps["toast"];
}) {
  const [data, setData] = useState<AgentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getAgentDashboard(agentId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [agentId]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton width={240} height={32} />
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
          className="kx-kpi-grid"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kx-card" style={{ padding: 20 }}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="80%" height={28} rounded={8} />
              <Skeleton width="50%" height={12} />
            </div>
          ))}
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}
          className="kx-dash-grid"
        >
          <SkeletonCard />
          <SkeletonCard lines={4} />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <ErrorState message="Nenhum dado disponível" onRetry={load} />;

  const pct =
    data.metaMensal > 0
      ? Math.min(100, Math.round((data.membrosCadastradosMes / data.metaMensal) * 100))
      : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="kx-display" style={{ fontSize: 28 }}>
          Olá, {agentNome.split(" ")[0]} 👋
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <span style={{ color: "var(--ink-3)", fontSize: 14 }}>Painel do Agente · Luanda</span>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
        className="kx-kpi-grid"
      >
        <KpiCard
          cor="var(--brand)"
          bg="var(--brand-light)"
          Icon={Users}
          label="Cadastros no mês"
          valor={`${data.membrosCadastradosMes}`}
          sub={`Meta: ${data.metaMensal}`}
          progress={pct}
          progressLabel={`${pct}%`}
        />
        <KpiCard
          cor="var(--blue)"
          bg="var(--blue-light)"
          Icon={Target}
          label="Progresso da Meta"
          valor={`${pct}%`}
        />
        <KpiCard
          cor="var(--green)"
          bg="var(--green-light)"
          Icon={Percent}
          label="Taxa de Retenção"
          valor={`${data.taxaRetencao}%`}
        />
        <KpiCard
          cor="var(--gold)"
          bg="var(--gold-light)"
          Icon={Star}
          label="Score Médio"
          valor={`${data.scoreMedioCarteira}`}
          sub={scoreLabel(data.scoreMedioCarteira)}
          subCor={scoreColor(data.scoreMedioCarteira)}
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}
        className="kx-dash-grid"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <NotificacoesCard notificacoes={data.notificacoes} />
          <UltimosCadastros membros={data.ultimosCadastros} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ActividadesRecentes actividades={data.actividadesRecentes} />
          <AccoesRapidas toast={toast} />
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

function NotificacoesCard({ notificacoes }: { notificacoes: Notificacao[] }) {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Bell size={16} color="var(--brand)" />
        <span
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Notificações
        </span>
      </div>
      {notificacoes.length === 0 ? (
        <EmptyState message="Nenhuma notificação" icon={Bell} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notificacoes.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: n.lida ? "transparent" : "var(--brand-light)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: n.lida ? "var(--ink-4)" : "var(--brand)",
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: n.lida ? 400 : 600,
                    color: "var(--ink)",
                    lineHeight: 1.4,
                  }}
                >
                  {n.mensagem}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{n.data}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UltimosCadastros({ membros }: { membros: Membro[] }) {
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
        Últimos Cadastros
      </div>
      {membros.length === 0 ? (
        <EmptyState message="Nenhum cadastro recente" icon={Users} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {membros.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <Avatar iniciais={m.iniciais} cor={m.cor} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.nome}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.tel}</div>
              </div>
              <MiniScoreBar score={m.score} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, (score / 1000) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-num)",
          fontWeight: 700,
          color: scoreColor(score),
          minWidth: 36,
          fontSize: 13,
        }}
      >
        {score}
      </span>
      <div
        style={{
          width: 50,
          height: 5,
          background: "var(--surface-2)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: scoreColor(score) }} />
      </div>
    </div>
  );
}

function ActividadesRecentes({ actividades }: { actividades: ActividadeAgente[] }) {
  const iconMap: Record<string, typeof Activity> = {
    cadastro: UserPlus,
    visita: MessageSquare,
    lembrete: Bell,
    resolucao: CheckCircle,
  };
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Activity size={16} color="var(--blue)" />
        <span
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Actividades Recentes
        </span>
      </div>
      {actividades.length === 0 ? (
        <EmptyState message="Nenhuma actividade" icon={Activity} />
      ) : (
        <div
          style={{
            maxHeight: 320,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {actividades.map((a) => {
            const Icon = iconMap[a.tipo] || Activity;
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--surface)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                <Icon size={16} color="var(--ink-3)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.4 }}>
                    {a.descricao}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 4,
                      fontSize: 11,
                      color: "var(--ink-3)",
                    }}
                  >
                    <span>{a.data}</span>
                    {a.resultado && (
                      <>
                        <span>·</span>
                        <span>{a.resultado}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AccoesRapidas({ toast }: { toast: AgentPanelProps["toast"] }) {
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
          onClick={() => toast("info", "Dashboard actualizado")}
          className="kx-btn kx-btn-outline"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>
    </div>
  );
}

// ─── CADASTRAR VIEW ──────────────────────────────────────────────────────

function CadastrarView({ toast }: { toast: AgentPanelProps["toast"] }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [regiao, setRegiao] = useState("Luanda");
  const [grupoCodigo, setGrupoCodigo] = useState("");
  const [coordenadorNome, setCoordenadorNome] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      toast("aviso", "Preencha nome e telefone do membro");
      return;
    }
    if (telefone.replace(/\s/g, "").length < 9) {
      toast("aviso", "Telefone inválido — mínimo 9 dígitos");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CadastroPayload = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        regiao,
        grupoCodigo: grupoCodigo.trim() || undefined,
        coordenadorNome: coordenadorNome.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      };
      await cadastrarMembro(payload);
      toast("sucesso", `${nome.trim()} cadastrado(a) com sucesso!`);
      setNome("");
      setTelefone("");
      setRegiao("Luanda");
      setGrupoCodigo("");
      setCoordenadorNome("");
      setObservacoes("");
    } catch (err: any) {
      toast("erro", err?.message || "Erro ao cadastrar membro");
    } finally {
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
              required
            />
          </Field>
          <Field label="Telefone *">
            <input
              className="kx-input"
              placeholder="Ex: 923 456 789"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </Field>
          <Field label="Região *">
            <select
              className="kx-input"
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
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
            />
          </Field>
          <Field label="Nome do Coordenador (opcional)">
            <input
              className="kx-input"
              placeholder="Ex: Conceição Mateus"
              value={coordenadorNome}
              onChange={(e) => setCoordenadorNome(e.target.value)}
            />
          </Field>
          <Field label="Observações (opcional)">
            <textarea
              className="kx-input"
              placeholder="Informações adicionais sobre o membro..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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
              "A cadastrar..."
            ) : (
              <>
                <Plus size={16} /> Cadastrar Membro
              </>
            )}
          </button>
          <button
            type="reset"
            className="kx-btn kx-btn-outline"
            onClick={() => {
              setNome("");
              setTelefone("");
              setRegiao("Luanda");
              setGrupoCodigo("");
              setCoordenadorNome("");
              setObservacoes("");
            }}
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

// ─── MONITORIA VIEW ──────────────────────────────────────────────────────

interface MembroComScore extends Membro {
  recomendacao?: string;
}

function MonitoriaView({ toast }: { toast: AgentPanelProps["toast"] }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membros, setMembros] = useState<MembroComScore[]>([]);
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [search, setSearch] = useState("");
  const [analysing, setAnalysing] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      getComunidadesByRegiao("Luanda"),
      new Promise<Membro[]>((resolve) => {
        setTimeout(() => resolve(MEMBROS), 200);
      }),
    ])
      .then(([coms, mems]) => {
        setComunidades(coms);
        setMembros(mems.map((m) => ({ ...m, recomendacao: getScoreRecomendacao(m.score).accao })));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      membros.filter((m) => search === "" || m.nome.toLowerCase().includes(search.toLowerCase())),
    [search, membros],
  );

  const handleAnalyse = async (membroId: number) => {
    setAnalysing(membroId);
    try {
      const result = await analisarMembro(membroId);
      toast(
        "info",
        `Análise de ${result.membroNome}: Score ${result.scoreActual} → ${result.scoreProjectado} (${result.tendencia})`,
      );
    } catch (err: any) {
      toast("erro", err?.message || "Erro ao analisar membro");
    } finally {
      setAnalysing(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton width={200} height={32} />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

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
        <div>
          <h1 className="kx-display" style={{ fontSize: 26 }}>
            Monitoria de Membros
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>
            {membros.length} membros na região · {comunidades.length} comunidades
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
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
        <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>
          Comunidades: {comunidades.map((c) => c.nome).join(", ")}
        </span>
      </div>

      <div className="kx-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                {["Membro", "Telefone", "Score", "Status", "Recomendação", "Acções"].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40 }}>
                    <EmptyState message="Nenhum membro encontrado" icon={Users} />
                  </td>
                </tr>
              ) : (
                filtered.map((m, i) => (
                  <tr
                    key={m.id}
                    style={{
                      borderTop: "1px solid var(--border-soft)",
                      background: i % 2 === 0 ? "transparent" : "var(--surface)",
                    }}
                  >
                    <td style={{ padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar iniciais={m.iniciais} cor={m.cor} size={32} />
                        <span style={{ fontWeight: 600 }}>{m.nome}</span>
                      </div>
                    </td>
                    <td style={{ padding: 14, color: "var(--ink-2)" }}>{m.tel}</td>
                    <td style={{ padding: 14 }}>
                      <MiniScoreBar score={m.score} />
                    </td>
                    <td style={{ padding: 14 }}>
                      <StatusBadge status={m.status} />
                    </td>
                    <td style={{ padding: 14, fontSize: 12, color: "var(--ink-2)", maxWidth: 200 }}>
                      {m.recomendacao || "-"}
                    </td>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleAnalyse(m.id)}
                          disabled={analysing === m.id}
                          className="kx-btn kx-btn-sm"
                          style={{
                            background: "var(--brand-light)",
                            color: "var(--brand)",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {analysing === m.id ? "..." : <Brain size={14} />}
                          Análise IA
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── SCORE VIEW ──────────────────────────────────────────────────────────

function ScoreView({ toast }: { toast: AgentPanelProps["toast"] }) {
  const [predicoes, setPredicoes] = useState<ScorePredictao[]>([]);
  const [alertas, setAlertas] = useState<ScoreAlert[]>([]);
  const [membrosRisco, setMembrosRisco] = useState<
    { membroId: number; nome: string; score: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysingMember, setAnalysingMember] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([getPredicoes(), getAlertas(), getMembrosRisco()])
      .then(([preds, alts, risco]) => {
        setPredicoes(preds);
        setAlertas(alts);
        setMembrosRisco(risco);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAnalyse = async (membroId: number) => {
    setAnalysingMember(membroId);
    try {
      const result = await analisarMembro(membroId);
      // update predicoes list
      setPredicoes((prev) => {
        const idx = prev.findIndex((p) => p.membroId === membroId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = result;
          return next;
        }
        return [result, ...prev];
      });
      toast("sucesso", `Análise de ${result.membroNome} concluída`);
    } catch (err: any) {
      toast("erro", err?.message || "Erro na análise");
    } finally {
      setAnalysingMember(null);
    }
  };

  const handleMarcarLido = async (alertaId: number) => {
    try {
      await marcarAlertaLido(alertaId);
      setAlertas((prev) => prev.map((a) => (a.id === alertaId ? { ...a, lido: true } : a)));
      toast("info", "Alerta marcado como lido");
    } catch (err: any) {
      toast("erro", err?.message || "Erro ao marcar alerta");
    }
  };

  const unreadCount = alertas.filter((a) => !a.lido).length;

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton width={200} height={32} />
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
          className="kx-score-grid"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="kx-display" style={{ fontSize: 26 }}>
          Score IA — Análise Inteligente
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>
          {predicoes.length} análises disponíveis · {unreadCount} alertas não lidos ·{" "}
          {membrosRisco.length} membros em risco
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        className="kx-score-grid"
      >
        <ScoreSummaryCard
          cor="var(--brand)"
          bg="var(--brand-light)"
          Icon={Brain}
          label="Predições Disponíveis"
          valor={`${predicoes.length}`}
        />
        <ScoreSummaryCard
          cor={unreadCount > 0 ? "var(--red)" : "var(--green)"}
          bg={unreadCount > 0 ? "var(--red-light)" : "var(--green-light)"}
          Icon={AlertTriangle}
          label="Alertas Activos"
          valor={`${unreadCount}`}
          sub={unreadCount > 0 ? "Requerem atenção" : "Nenhum alerta pendente"}
        />
        <ScoreSummaryCard
          cor={membrosRisco.length > 0 ? "var(--red)" : "var(--green)"}
          bg={membrosRisco.length > 0 ? "var(--red-light)" : "var(--green-light)"}
          Icon={TrendingDown}
          label="Membros em Risco"
          valor={`${membrosRisco.length}`}
        />
      </div>

      {/* Predições */}
      <div className="kx-card" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Brain size={16} color="var(--blue)" />
            <span
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Análises e Predições
            </span>
          </div>
          <button onClick={load} className="kx-btn kx-btn-outline kx-btn-sm">
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>
        {predicoes.length === 0 ? (
          <EmptyState message="Nenhuma predição disponível" icon={Brain} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {predicoes.map((p) => {
              const TendenciaIcon =
                p.tendencia === "subindo"
                  ? TrendingUp
                  : p.tendencia === "descendo"
                    ? TrendingDown
                    : Minus;
              const tendenciaCor =
                p.tendencia === "subindo"
                  ? "var(--green)"
                  : p.tendencia === "descendo"
                    ? "var(--red)"
                    : "var(--ink-3)";
              return (
                <div
                  key={p.membroId}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "var(--surface)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.membroNome}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                          Análise: {p.dataAnalise}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Actual</div>
                        <div
                          style={{
                            fontFamily: "var(--font-num)",
                            fontWeight: 700,
                            fontSize: 20,
                            color: scoreColor(p.scoreActual),
                          }}
                        >
                          {p.scoreActual}
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--ink-3)" />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Projectado</div>
                        <div
                          style={{
                            fontFamily: "var(--font-num)",
                            fontWeight: 700,
                            fontSize: 20,
                            color: scoreColor(p.scoreProjectado),
                          }}
                        >
                          {p.scoreProjectado}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: tendenciaCor,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <TendenciaIcon size={16} />
                        {p.tendencia}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="kx-pill"
                      style={{
                        background: "var(--blue-light)",
                        color: "var(--blue)",
                        fontSize: 11,
                      }}
                    >
                      Confiança: {Math.round(p.confianca * 100)}%
                    </span>
                    <span style={{ fontSize: 12, color: "var(--ink-2)", flex: 1 }}>
                      {p.recomendacao}
                    </span>
                    <button
                      onClick={() => handleAnalyse(p.membroId)}
                      disabled={analysingMember === p.membroId}
                      className="kx-btn kx-btn-sm kx-btn-outline"
                    >
                      {analysingMember === p.membroId ? "..." : <RefreshCw size={12} />}
                      Re-analisar
                    </button>
                  </div>
                  {p.factores.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      {p.factores.map((f, i) => (
                        <span
                          key={i}
                          className="kx-pill"
                          style={{
                            background:
                              f.impacto === "positivo"
                                ? "var(--green-light)"
                                : f.impacto === "negativo"
                                  ? "var(--red-light)"
                                  : "var(--surface-2)",
                            color:
                              f.impacto === "positivo"
                                ? "var(--green)"
                                : f.impacto === "negativo"
                                  ? "var(--red)"
                                  : "var(--ink-2)",
                            fontSize: 11,
                          }}
                          title={f.descricao}
                        >
                          {f.factor} ({f.peso}%) — {f.descricao}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alertas */}
      <div className="kx-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <AlertTriangle size={16} color={unreadCount > 0 ? "var(--red)" : "var(--green)"} />
          <span
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Alertas de Score
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                background: "var(--red)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 100,
              }}
            >
              {unreadCount} novo(s)
            </span>
          )}
        </div>
        {alertas.length === 0 ? (
          <EmptyState message="Nenhum alerta registado" icon={AlertTriangle} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alertas.map((a) => {
              const tipoCor =
                a.tipo === "critico"
                  ? "var(--red)"
                  : a.tipo === "atencao"
                    ? "var(--orange-mid)"
                    : "var(--gold)";
              const tipoBg =
                a.tipo === "critico"
                  ? "var(--red-light)"
                  : a.tipo === "atencao"
                    ? "var(--gold-light)"
                    : "var(--gold-light)";
              return (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: a.lido ? "transparent" : tipoBg,
                    border: `1px solid ${a.lido ? "var(--border-soft)" : tipoCor}`,
                    opacity: a.lido ? 0.6 : 1,
                  }}
                >
                  <AlertTriangle
                    size={18}
                    color={tipoCor}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{a.membroNome}</span>
                      <span
                        className="kx-pill"
                        style={{
                          background: tipoBg,
                          color: tipoCor,
                          fontSize: 10,
                          textTransform: "capitalize",
                        }}
                      >
                        {a.tipo}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-num)",
                          fontWeight: 700,
                          fontSize: 13,
                          color: scoreColor(a.score),
                        }}
                      >
                        Score: {a.score}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 4 }}>
                      {a.mensagem}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>
                      {a.accaoRecomendada}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 8,
                        fontSize: 11,
                        color: "var(--ink-3)",
                      }}
                    >
                      <span>{a.data}</span>
                      {!a.lido && (
                        <button
                          onClick={() => handleMarcarLido(a.id)}
                          className="kx-btn kx-btn-sm"
                          style={{
                            background: "var(--brand-light)",
                            color: "var(--brand)",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircle size={12} /> Marcar lido
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Membros em Risco */}
      {membrosRisco.length > 0 && (
        <div className="kx-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Users size={16} color="var(--red)" />
            <span
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Membros em Risco (score ≤ 500)
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {membrosRisco.map((m) => (
              <div
                key={m.membroId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--red-light)",
                  border: "1px solid var(--red)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertCircle size={16} color="var(--red)" />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.nome}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-num)",
                      fontWeight: 700,
                      fontSize: 16,
                      color: scoreColor(m.score),
                    }}
                  >
                    {m.score}
                  </span>
                  <button
                    onClick={() => handleAnalyse(m.membroId)}
                    disabled={analysingMember === m.membroId}
                    className="kx-btn kx-btn-sm"
                    style={{
                      background: "var(--brand-light)",
                      color: "var(--brand)",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {analysingMember === m.membroId ? "..." : <Brain size={14} />}
                    Analisar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .kx-score-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .kx-score-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function ScoreSummaryCard({
  cor,
  bg,
  Icon,
  label,
  valor,
  sub,
}: {
  cor: string;
  bg: string;
  Icon: typeof Brain;
  label: string;
  valor: string;
  sub?: string;
}) {
  return (
    <div className="kx-card" style={{ padding: 20, borderTop: `3px solid ${cor}` }}>
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
      {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
