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
import { fmtKz, scoreColor, scoreLabel } from "@/components/kixipay/data";
import { REGIOES_ANGOLA } from "@/lib/constants";
import { cadastrarMembro, getScoreRecomendacao } from "@/services";
import type { CadastroPayload, Membro } from "@/types";

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
  agentId: string;
  agentNome: string;
  toast: AgentPanelProps["toast"];
}) {
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
      <EmptyState message="API de dashboard do agente não disponível" icon={LayoutDashboard} />
      <AccoesRapidas toast={toast} />
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

function ActividadesRecentes({ actividades }: { actividades: any[] }) {
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
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>
        Monitoria de Membros
      </h1>
      <EmptyState message="API de monitoria não disponível" icon={Monitor} />
    </div>
  );
}

// ─── SCORE VIEW ──────────────────────────────────────────────────────────

function ScoreView({ toast }: { toast: AgentPanelProps["toast"] }) {
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>
        Score IA — Análise Inteligente
      </h1>
      <EmptyState message="API de Score IA não disponível" icon={Brain} />
    </div>
  );
}
