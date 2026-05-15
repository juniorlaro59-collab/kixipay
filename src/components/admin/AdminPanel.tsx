import { useEffect, useMemo, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  Brain,
  Activity,
  LogOut,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  RefreshCw,
  BarChart3,
  Target,
  MapPin,
  Clock,
  Star,
  AlertCircle,
  Info,
  UserCog,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Avatar,
  StatusBadge,
  Skeleton,
  EmptyState,
  ErrorState,
  Logo,
} from "@/components/kixipay/shared";
import type { Toast } from "@/components/kixipay/shared";
import { fmtKz, scoreColor, scoreLabel } from "@/components/kixipay/data";
import {
  getPlatformStats,
  getActivityLog,
  getAgentes,
  updateAgenteStatus,
  getAllMembrosAdmin,
  removeMembroAdmin,
  getADashboard,
  getPredicoes,
  getAlertas,
  marcarAlertaLido,
  analisarMembro,
} from "@/services";
import type {
  PlatformStats,
  ActivityLogEntry,
  Agente,
  Membro,
  AScoreDashboard,
  ScorePredictao,
  ScoreAlert,
  ScoreFactor,
} from "@/types";

type ViewName = "dashboard" | "membros" | "agentes" | "coordenadores" | "ai-score" | "activity";

interface AdminPanelProps {
  onLogout: () => void;
  toast: (tipo: Toast["tipo"], mensagem: string) => void;
}

interface Coordenador {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  regiao: string;
  status: "activo" | "inactivo";
  agentesSupervisionados: number;
  membrosTotal: number;
  scoreMedio: number;
  dataContratacao: string;
  iniciais: string;
  cor: string;
}

const NAV_ITEMS: { id: ViewName; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "membros", label: "Membros", Icon: Users },
  { id: "agentes", label: "Agentes", Icon: UserCheck },
  { id: "coordenadores", label: "Coordenadores", Icon: Shield },
  { id: "ai-score", label: "AI Score", Icon: Brain },
  { id: "activity", label: "Actividades", Icon: Activity },
];

const COORDENADORES_MOCK: Coordenador[] = [
  {
    id: 1,
    nome: "Conceição Mateus",
    telefone: "+244 923 456 789",
    email: "conceicao@kixipay.ao",
    regiao: "Luanda",
    status: "activo",
    agentesSupervisionados: 4,
    membrosTotal: 62,
    scoreMedio: 812,
    dataContratacao: "Set 2024",
    iniciais: "CM",
    cor: "#FF5C1A",
  },
  {
    id: 2,
    nome: "Manuel Jacinto",
    telefone: "+244 912 345 678",
    email: "manuel@kixipay.ao",
    regiao: "Luanda",
    status: "activo",
    agentesSupervisionados: 3,
    membrosTotal: 47,
    scoreMedio: 789,
    dataContratacao: "Out 2024",
    iniciais: "MJ",
    cor: "#1D4ED8",
  },
  {
    id: 3,
    nome: "Ana Paula Ferreira",
    telefone: "+244 934 567 890",
    email: "ana@kixipay.ao",
    regiao: "Benguela",
    status: "activo",
    agentesSupervisionados: 2,
    membrosTotal: 35,
    scoreMedio: 765,
    dataContratacao: "Nov 2024",
    iniciais: "AP",
    cor: "#16A34A",
  },
  {
    id: 4,
    nome: "Domingos Neto",
    telefone: "+244 978 901 234",
    email: "domingos@kixipay.ao",
    regiao: "Huambo",
    status: "activo",
    agentesSupervisionados: 2,
    membrosTotal: 28,
    scoreMedio: 734,
    dataContratacao: "Jan 2025",
    iniciais: "DN",
    cor: "#0891B2",
  },
  {
    id: 5,
    nome: "Fernanda Agostinho",
    telefone: "+244 923 901 234",
    email: "fernanda@kixipay.ao",
    regiao: "Malanje",
    status: "inactivo",
    agentesSupervisionados: 1,
    membrosTotal: 12,
    scoreMedio: 688,
    dataContratacao: "Mar 2025",
    iniciais: "FA",
    cor: "#0F766E",
  },
];

export function AdminPanel({ onLogout, toast }: AdminPanelProps) {
  const [view, setView] = useState<ViewName>("dashboard");
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", animation: "fadeIn 200ms" }}>
      <AdminHeader
        viewLabel={NAV_ITEMS.find((n) => n.id === view)?.label || ""}
        onLogout={onLogout}
        toast={toast}
      />
      <div style={{ display: "flex", paddingTop: 64 }}>
        <AdminSidebar view={view} onView={setView} />
        <main style={{ flex: 1, padding: 28, minHeight: "calc(100vh - 64px)", paddingBottom: 100 }}>
          {view === "dashboard" && <DashboardView toast={toast} />}
          {view === "membros" && <MembrosView toast={toast} />}
          {view === "agentes" && <AgentesView toast={toast} />}
          {view === "coordenadores" && <CoordenadoresView />}
          {view === "ai-score" && <AIScoreView toast={toast} />}
          {view === "activity" && <ActivityView />}
        </main>
      </div>
    </div>
  );
}

function AdminHeader({
  viewLabel,
  onLogout,
}: {
  viewLabel: string;
  onLogout: () => void;
  toast: AdminPanelProps["toast"];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
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
        <Logo size={26} />
        <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>Admin</span>
        <span style={{ color: "var(--ink-4)", fontSize: 13 }}>/</span>
        <span style={{ color: "var(--ink)", fontSize: 14, fontWeight: 600 }}>{viewLabel}</span>
      </div>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 10,
            background: menuOpen ? "var(--surface-2)" : "transparent",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--brand)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            AD
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Administrador</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>admin@kixipay.ao</div>
          </div>
          <ChevronDown size={14} color="var(--ink-3)" />
        </button>
        {menuOpen && (
          <div
            className="kx-fade-in"
            style={{
              position: "absolute",
              top: 48,
              right: 0,
              width: 200,
              background: "var(--card)",
              borderRadius: 12,
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              border: "1px solid var(--border-soft)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--red)",
                fontSize: 14,
              }}
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function AdminSidebar({ view, onView }: { view: ViewName; onView: (v: ViewName) => void }) {
  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: "var(--card)",
        borderRight: "1px solid var(--border-soft)",
        padding: 20,
        position: "sticky",
        top: 64,
        height: "calc(100vh - 64px)",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--ink-3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 12,
        }}
      >
        Navegação
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((it) => {
          const Icon = it.Icon;
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
                width: "100%",
                borderLeft: active ? "3px solid var(--brand)" : "3px solid transparent",
                transition: "all 200ms",
              }}
            >
              <Icon size={18} /> {it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: 32, padding: 16, background: "var(--surface)", borderRadius: 12 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Plataforma
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>KixiPay v2.3.1</div>
        <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4 }}>
          ● Todos os sistemas operacionais
        </div>
      </div>
    </aside>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  subColor,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="kx-card kx-card-hover" style={{ padding: 20, borderTop: "3px solid " + color }}>
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
          <Icon size={18} color={color} />
        </div>
      </div>
      <div className="kx-num" style={{ fontSize: 28, color: "var(--ink)", marginTop: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: subColor || "var(--ink-3)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ActivityRow({ entry }: { entry: ActivityLogEntry }) {
  const iconMap: Record<string, React.ElementType> = {
    criacao: UserCheck,
    actualizacao: RefreshCw,
    remocao: Trash2,
    alerta: AlertTriangle,
    login: LogOut,
    registo: UserCog,
  };
  const colorMap: Record<string, string> = {
    criacao: "var(--green)",
    actualizacao: "var(--blue)",
    remocao: "var(--red)",
    alerta: "var(--orange-mid)",
    login: "var(--ink-2)",
    registo: "var(--brand)",
  };
  const Icon = iconMap[entry.tipo] || Info;
  const cor = colorMap[entry.tipo] || "var(--ink-3)";
  return (
    <div
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
          background: cor + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={14} color={cor} />
      </div>
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
          {entry.descricao}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
          {entry.responsavel} · {entry.data}
        </div>
      </div>
      <StatusBadge status={entry.tipo} />
    </div>
  );
}

function ActivityTypeBadge({ tipo }: { tipo: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    criacao: { bg: "var(--green-light)", fg: "var(--green)", label: "Criação" },
    actualizacao: { bg: "var(--blue-light)", fg: "var(--blue)", label: "Actualização" },
    remocao: { bg: "var(--red-light)", fg: "var(--red)", label: "Remoção" },
    alerta: { bg: "var(--gold-light)", fg: "var(--orange-mid)", label: "Alerta" },
    login: { bg: "var(--surface-2)", fg: "var(--ink-2)", label: "Login" },
    registo: { bg: "var(--brand-light)", fg: "var(--brand)", label: "Registo" },
  };
  const c = map[tipo] || { bg: "var(--surface-2)", fg: "var(--ink-2)", label: tipo };
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: "4px 10px",
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {c.label}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-num)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{label}</div>
    </div>
  );
}

function TrendIcon({ tendencia }: { tendencia: "subindo" | "estavel" | "descendo" }) {
  if (tendencia === "subindo") return <TrendingUp size={16} color="var(--green)" />;
  if (tendencia === "descendo") return <TrendingDown size={16} color="var(--red)" />;
  return <Minus size={16} color="var(--ink-3)" />;
}

function DashboardView({ toast }: { toast: AdminPanelProps["toast"] }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recent, setRecent] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([getPlatformStats(), getActivityLog(1, 8)]);
      setStats(s);
      setRecent(a.entries);
    } catch {
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
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

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return <ErrorState message="Nenhum dado disponível" onRetry={load} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="kx-display" style={{ fontSize: 28 }}>
          Painel de Administração
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 4 }}>
          Visão geral da plataforma KixiPay
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <KpiCard
          icon={Users}
          label="Total Membros"
          value={String(stats.totalMembros)}
          sub={stats.membrosActivos + " activos"}
          subColor="var(--green)"
          color="var(--brand)"
          bg="var(--brand-light)"
        />
        <KpiCard
          icon={UserCheck}
          label="Total Agentes"
          value={String(stats.totalAgentes)}
          sub={stats.totalCoordenadores + " coordenadores"}
          subColor="var(--ink-3)"
          color="var(--blue)"
          bg="var(--blue-light)"
        />
        <KpiCard
          icon={BarChart3}
          label="Volume Total"
          value={fmtKz(stats.volumeTotal)}
          sub={stats.fundosCirculacao.toLocaleString("pt-PT") + " Kz em circulação"}
          subColor="var(--ink-3)"
          color="var(--green)"
          bg="var(--green-light)"
        />
        <KpiCard
          icon={Star}
          label="Score Médio"
          value={String(stats.scoreMedio)}
          sub={
            (stats.crescimentoMensal >= 0 ? "+" : "") + stats.crescimentoMensal + "% crescimento"
          }
          subColor={stats.crescimentoMensal >= 0 ? "var(--green)" : "var(--red)"}
          color="var(--gold)"
          bg="var(--gold-light)"
        />
      </div>
      <div style={{ display: "flex" }}>
        <KpiCard
          icon={Target}
          label="Grupos Activos"
          value={String(stats.totalGrupos)}
          sub="Em todo o país"
          subColor="var(--ink-3)"
          color="var(--orange-mid)"
          bg="var(--gold-light)"
        />
      </div>
      <div className="kx-card" style={{ padding: 24 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.3,
            marginBottom: 14,
          }}
        >
          Actividade Recente
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {recent.slice(0, 6).map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MembrosView({ toast }: { toast: AdminPanelProps["toast"] }) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllMembrosAdmin(page, pageSize);
      setMembros(res.membros);
      setTotal(res.total);
    } catch {
      setError("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return membros.filter((m) => {
      if (statusFilter !== "todos" && m.status !== statusFilter) return false;
      if (search && !m.nome.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [membros, search, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  const handleRemove = async (id: number) => {
    setRemoving(id);
    try {
      await removeMembroAdmin(id);
      setMembros((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => prev - 1);
      toast("sucesso", "Membro removido com sucesso");
    } catch {
      toast("erro", "Erro ao remover membro");
    } finally {
      setRemoving(null);
    }
  };

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
          {total} membros · Plataforma
        </h1>
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
        <div style={{ display: "flex", gap: 6 }}>
          {(["todos", "Pago", "Pendente", "Em atraso"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="kx-pill"
              style={{
                background: statusFilter === f ? "var(--brand)" : "var(--surface-2)",
                color: statusFilter === f ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f === "todos" ? "Todos" : f}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="kx-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width="100%" height={48} />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState message="Nenhum membro encontrado" icon={Info} />
      ) : (
        <div className="kx-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                  {[
                    "#",
                    "Membro",
                    "Telemóvel",
                    "Total Poupado",
                    "KixiScore",
                    "Status",
                    "Meses",
                    "Acções",
                  ].map((h) => (
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
                    <td style={{ padding: 14, color: "var(--ink-3)" }}>
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar iniciais={m.iniciais} cor={m.cor} size={32} />
                        <span style={{ fontWeight: 600 }}>{m.nome}</span>
                      </div>
                    </td>
                    <td style={{ padding: 14, color: "var(--ink-2)" }}>{m.tel}</td>
                    <td style={{ padding: 14 }} className="kx-num">
                      {fmtKz(m.totalPoupado)}
                    </td>
                    <td style={{ padding: 14 }}>
                      <span className="kx-num" style={{ color: scoreColor(m.score) }}>
                        {m.score}
                      </span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <StatusBadge status={m.status} />
                    </td>
                    <td style={{ padding: 14 }} className="kx-num">
                      {m.meses}
                    </td>
                    <td style={{ padding: 14 }}>
                      <button
                        onClick={() => handleRemove(m.id)}
                        disabled={removing === m.id}
                        style={{
                          color: "var(--red)",
                          opacity: removing === m.id ? 0.5 : 1,
                          padding: 6,
                          borderRadius: 8,
                        }}
                        title="Remover membro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderTop: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
              Página {page} de {totalPages} ({total} total)
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="kx-btn kx-btn-sm kx-btn-outline"
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="kx-btn kx-btn-sm kx-btn-outline"
                style={{ opacity: page >= totalPages ? 0.4 : 1 }}
              >
                Próxima <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentesView({ toast }: { toast: AdminPanelProps["toast"] }) {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [regionFilter, setRegionFilter] = useState<string>("todas");
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAgentes();
      setAgentes(data);
    } catch {
      setError("Erro ao carregar agentes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const regioes = useMemo(() => [...new Set(agentes.map((a) => a.regiao))].sort(), [agentes]);

  const filtered = useMemo(() => {
    return agentes.filter((a) => {
      if (statusFilter !== "todos" && a.status !== statusFilter) return false;
      if (regionFilter !== "todas" && a.regiao !== regionFilter) return false;
      return true;
    });
  }, [agentes, statusFilter, regionFilter]);

  const toggleStatus = async (agente: Agente) => {
    const novoStatus: Agente["status"] = agente.status === "activo" ? "inactivo" : "activo";
    setToggling(agente.id);
    try {
      await updateAgenteStatus(agente.id, novoStatus);
      setAgentes((prev) =>
        prev.map((a) => (a.id === agente.id ? { ...a, status: novoStatus } : a)),
      );
      toast(
        "sucesso",
        agente.nome + " agora está " + (novoStatus === "activo" ? "activo" : "inactivo"),
      );
    } catch {
      toast("erro", "Erro ao alterar estado do agente");
    } finally {
      setToggling(null);
    }
  };

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
          {agentes.length} agentes
        </h1>
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
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Filter size={14} color="var(--ink-3)" />
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Status:</span>
          {(["todos", "activo", "inactivo", "suspenso"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="kx-pill"
              style={{
                background: statusFilter === f ? "var(--brand)" : "var(--surface-2)",
                color: statusFilter === f ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f === "todos" ? "Todos" : f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <MapPin size={14} color="var(--ink-3)" />
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Região:</span>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 100,
              border: "1.5px solid var(--border)",
              fontSize: 12,
              fontWeight: 500,
              background: "var(--card)",
              color: "var(--ink)",
              outline: "none",
            }}
          >
            <option value="todas">Todas</option>
            {regioes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kx-card" style={{ padding: 20 }}>
              <Skeleton width="70%" height={20} />
              <div style={{ marginTop: 8 }}>
                <Skeleton width="100%" height={14} />
              </div>
              <div style={{ marginTop: 6 }}>
                <Skeleton width="60%" height={14} />
              </div>
              <div style={{ marginTop: 12 }}>
                <Skeleton width="40%" height={36} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState message="Nenhum agente encontrado" icon={Info} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((a) => (
            <div key={a.id} className="kx-card kx-card-hover" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <Avatar iniciais={a.iniciais} cor={a.cor} size={48} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{a.nome}</span>
                    <StatusBadge
                      status={
                        a.status === "activo"
                          ? "Pago"
                          : a.status === "inactivo"
                            ? "Em atraso"
                            : "Pendente"
                      }
                    />
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
                    {a.telefone} · {a.email}
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                    <MiniStat label="Região" value={a.regiao} />
                    <MiniStat label="Membros" value={String(a.membrosCadastrados)} />
                    <MiniStat label="Score Médio" value={String(a.scoreMedioAgente)} />
                    <MiniStat label="Retenção" value={a.taxaRetencao + "%"} />
                    <MiniStat label="Meta/Mês" value={a.atingidoEsteMes + "/" + a.metaMensal} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => toggleStatus(a)}
                    disabled={toggling === a.id}
                    className={
                      "kx-btn kx-btn-sm " +
                      (a.status === "activo" ? "kx-btn-outline" : "kx-btn-green")
                    }
                  >
                    {a.status === "activo" ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoordenadoresView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filtered = useMemo(() => {
    return COORDENADORES_MOCK.filter((c) => {
      if (statusFilter !== "todos" && c.status !== statusFilter) return false;
      if (search && !c.nome.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, statusFilter]);

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
          {COORDENADORES_MOCK.length} coordenadores
        </h1>
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
            placeholder="Pesquisar coordenador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["todos", "activo", "inactivo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="kx-pill"
              style={{
                background: statusFilter === f ? "var(--brand)" : "var(--surface-2)",
                color: statusFilter === f ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f === "todos" ? "Todos" : f}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState message="Nenhum coordenador encontrado" icon={Info} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {filtered.map((c) => (
            <div key={c.id} className="kx-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar iniciais={c.iniciais} cor={c.cor} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{c.nome}</span>
                    <span
                      className="kx-pill"
                      style={{
                        background:
                          c.status === "activo" ? "var(--green-light)" : "var(--red-light)",
                        color: c.status === "activo" ? "var(--green)" : "var(--red)",
                        fontSize: 11,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                    {c.telefone}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{c.email}</div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: "1px solid var(--border-soft)",
                }}
              >
                <MiniStat label="Região" value={c.regiao} />
                <MiniStat label="Agentes" value={String(c.agentesSupervisionados)} />
                <MiniStat label="Membros" value={String(c.membrosTotal)} />
                <MiniStat label="Score" value={String(c.scoreMedio)} />
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 12 }}>
                Desde {c.dataContratacao}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AIScoreView({ toast }: { toast: AdminPanelProps["toast"] }) {
  const [dashboard, setDashboard] = useState<AScoreDashboard | null>(null);
  const [predicoes, setPredicoes] = useState<ScorePredictao[]>([]);
  const [alertas, setAlertas] = useState<ScoreAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "predicoes" | "alertas">("dashboard");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, p, a] = await Promise.all([getADashboard(), getPredicoes(), getAlertas()]);
      setDashboard(d);
      setPredicoes(p);
      setAlertas(a);
    } catch {
      setError("Erro ao carregar dados de AI Score");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarcarLido = async (alertaId: number) => {
    try {
      await marcarAlertaLido(alertaId);
      setAlertas((prev) => prev.map((al) => (al.id === alertaId ? { ...al, lido: true } : al)));
      toast("sucesso", "Alerta marcado como lido");
    } catch {
      toast("erro", "Erro ao marcar alerta");
    }
  };

  const handleAnalisar = async (membroId: number, membroNome: string) => {
    try {
      const pred = await analisarMembro(membroId);
      setPredicoes((prev) => {
        const idx = prev.findIndex((p) => p.membroId === membroId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = pred;
          return next;
        }
        return [...prev, pred];
      });
      toast("sucesso", "Análise concluída para " + membroNome);
    } catch {
      toast("erro", "Erro ao analisar membro");
    }
  };

  if (loading)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton width={200} height={36} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kx-card" style={{ padding: 20, height: 100 }}>
              <Skeleton width="60%" height={14} />
              <div style={{ marginTop: 8 }}>
                <Skeleton width="40%" height={28} />
              </div>
            </div>
          ))}
        </div>
        <Skeleton height={250} />
      </div>
    );

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!dashboard) return <ErrorState message="Nenhum dado disponível" onRetry={load} />;

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", Icon: BarChart3 },
    { id: "predicoes" as const, label: "Previsões", Icon: TrendingUp },
    { id: "alertas" as const, label: "Alertas", Icon: AlertCircle },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="kx-display" style={{ fontSize: 26 }}>
          AI Score · Inteligência de Crédito
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 4 }}>
          Análise preditiva e monitorização de scores
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <KpiCard
          icon={Star}
          label="Score Médio"
          value={String(dashboard.scoreMedioGeral)}
          sub="Geral da plataforma"
          subColor="var(--ink-3)"
          color="var(--gold)"
          bg="var(--gold-light)"
        />
        <KpiCard
          icon={BarChart3}
          label="Total Análises"
          value={String(dashboard.totalAnalises)}
          sub="Membros analisados"
          subColor="var(--ink-3)"
          color="var(--blue)"
          bg="var(--blue-light)"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertas Activos"
          value={String(dashboard.alertasActivos)}
          sub="Por rever"
          subColor="var(--orange-mid)"
          color="var(--orange-mid)"
          bg="var(--gold-light)"
        />
        <KpiCard
          icon={Users}
          label="Membros em Risco"
          value={String(dashboard.membrosEmRisco)}
          sub="Score < 500"
          subColor="var(--red)"
          color="var(--red)"
          bg="var(--red-light)"
        />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {tabs.map((tab) => {
          const Icon = tab.Icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="kx-pill"
              style={{
                background: active ? "var(--brand)" : "var(--surface-2)",
                color: active ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
                padding: "8px 16px",
                fontSize: 13,
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="kx-card" style={{ padding: 24 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  marginBottom: 16,
                }}
              >
                Distribuição de Scores
              </div>
              {dashboard.distribuicao.map((d: { nivel: string; count: number }) => {
                const totalCount = dashboard.distribuicao.reduce((s, x) => s + x.count, 0);
                const pct = totalCount > 0 ? (d.count / totalCount) * 100 : 0;
                const barColors: Record<string, string> = {
                  Excelente: "var(--green)",
                  Bom: "var(--blue)",
                  Regular: "var(--orange-mid)",
                  "A construir": "var(--red)",
                };
                return (
                  <div key={d.nivel} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{d.nivel}</span>
                      <span
                        className="kx-num"
                        style={{ color: barColors[d.nivel] || "var(--ink)" }}
                      >
                        {d.count} membros ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 10,
                        background: "var(--surface-2)",
                        borderRadius: 5,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: pct + "%",
                          height: "100%",
                          background: barColors[d.nivel] || "var(--brand)",
                          borderRadius: 5,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="kx-card" style={{ padding: 24 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  marginBottom: 16,
                }}
              >
                Tendência do Score Médio
              </div>
              {dashboard.tendencias.map((t: { mes: string; scoreMedio: number }, i: number) => {
                const maxScore = Math.max(...dashboard.tendencias.map((x) => x.scoreMedio));
                const pct = maxScore > 0 ? (t.scoreMedio / maxScore) * 100 : 0;
                return (
                  <div
                    key={t.mes}
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
                  >
                    <span
                      style={{ minWidth: 36, fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}
                    >
                      {t.mes}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 24,
                        background: "var(--surface-2)",
                        borderRadius: 6,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: pct + "%",
                          height: "100%",
                          background: "var(--brand)",
                          borderRadius: 6,
                          transition: "width 0.6s ease",
                          minWidth: 30,
                        }}
                      />
                    </div>
                    <span
                      className="kx-num"
                      style={{
                        minWidth: 48,
                        fontSize: 13,
                        textAlign: "right",
                        color: scoreColor(t.scoreMedio),
                      }}
                    >
                      {t.scoreMedio}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "predicoes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {predicoes.map((p: ScorePredictao) => {
            const iniciais = p.membroNome
              .split(" ")
              .map((s) => s[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={p.membroId} className="kx-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <Avatar iniciais={iniciais} cor={scoreColor(p.scoreActual)} size={40} />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.membroNome}</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginTop: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="kx-num" style={{ fontSize: 13, color: "var(--ink-2)" }}>
                        Actual:{" "}
                        <span style={{ color: scoreColor(p.scoreActual) }}>{p.scoreActual}</span>
                      </span>
                      <TrendIcon tendencia={p.tendencia} />
                      <span className="kx-num" style={{ fontSize: 13, color: "var(--ink-2)" }}>
                        Projectado:{" "}
                        <span style={{ color: scoreColor(p.scoreProjectado) }}>
                          {p.scoreProjectado}
                        </span>
                      </span>
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        Confiança: {(p.confianca * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
                      {p.recomendacao}
                    </div>
                    {p.factores && p.factores.length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {p.factores.map((f: ScoreFactor, i: number) => {
                          const fc =
                            f.impacto === "positivo"
                              ? "var(--green)"
                              : f.impacto === "negativo"
                                ? "var(--red)"
                                : "var(--ink-3)";
                          return (
                            <span
                              key={i}
                              className="kx-pill"
                              style={{ background: fc + "18", color: fc, fontSize: 11 }}
                            >
                              {f.factor}: {f.peso}%
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAnalisar(p.membroId, p.membroNome)}
                    className="kx-btn kx-btn-sm kx-btn-outline"
                  >
                    <RefreshCw size={14} /> Reanalisar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "alertas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {alertas.length === 0 ? (
            <EmptyState message="Nenhum alerta registado" icon={Info} />
          ) : (
            alertas.map((al: ScoreAlert) => {
              const tipoCfg = {
                critico: { bg: "var(--red-light)", fg: "var(--red)", label: "Crítico" },
                atencao: { bg: "var(--gold-light)", fg: "var(--orange-mid)", label: "Atenção" },
                melhoria: { bg: "var(--green-light)", fg: "var(--green)", label: "Melhoria" },
              };
              const cfg = tipoCfg[al.tipo];
              return (
                <div
                  key={al.id}
                  className="kx-card"
                  style={{ padding: 20, opacity: al.lido ? 0.6 : 1 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: cfg.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <AlertCircle size={20} color={cfg.fg} />
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{al.membroNome}</span>
                        <span
                          className="kx-pill"
                          style={{ background: cfg.bg, color: cfg.fg, fontSize: 11 }}
                        >
                          {cfg.label}
                        </span>
                        {!al.lido && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "var(--red)",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
                        {al.mensagem}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                        Acção: {al.accaoRecomendada} · {al.data}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {!al.lido && (
                        <button
                          onClick={() => handleMarcarLido(al.id)}
                          className="kx-btn kx-btn-sm kx-btn-outline"
                        >
                          <CheckCircle2 size={14} /> Marcar lido
                        </button>
                      )}
                      <button
                        onClick={() => handleAnalisar(al.membroId, al.membroNome)}
                        className="kx-btn kx-btn-sm kx-btn-outline"
                      >
                        <RefreshCw size={14} /> Analisar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function ActivityView() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [entidadeFilter, setEntidadeFilter] = useState<string>("todos");
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getActivityLog(page, pageSize);
      setEntries(res.entries);
      setTotal(res.total);
    } catch {
      setError("Erro ao carregar actividade");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (tipoFilter !== "todos" && e.tipo !== tipoFilter) return false;
      if (entidadeFilter !== "todos" && e.entidade !== entidadeFilter) return false;
      return true;
    });
  }, [entries, tipoFilter, entidadeFilter]);

  const totalPages = Math.ceil(total / pageSize);
  const tipos = ["todos", "criacao", "actualizacao", "remocao", "alerta", "login", "registo"];
  const entidades = ["todos", "membro", "agente", "coordenador", "grupo", "sistema"];

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
          Registo de Actividades
        </h1>
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
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <Filter size={14} color="var(--ink-3)" />
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Tipo:</span>
          {tipos.map((t) => (
            <button
              key={t}
              onClick={() => setTipoFilter(t)}
              className="kx-pill"
              style={{
                background: tipoFilter === t ? "var(--brand)" : "var(--surface-2)",
                color: tipoFilter === t ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t === "todos" ? "Todos" : t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Entidade:</span>
          <select
            value={entidadeFilter}
            onChange={(e) => setEntidadeFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 100,
              border: "1.5px solid var(--border)",
              fontSize: 12,
              fontWeight: 500,
              background: "var(--card)",
              color: "var(--ink)",
              outline: "none",
            }}
          >
            {entidades.map((e) => (
              <option key={e} value={e}>
                {e === "todos" ? "Todas" : e}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="kx-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width="100%" height={48} />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState message="Nenhuma actividade encontrada" icon={Info} />
      ) : (
        <div className="kx-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                  {["#", "Descrição", "Entidade", "Responsável", "Data", "Tipo"].map((h) => (
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
                {filtered.map((e, i) => (
                  <tr
                    key={e.id}
                    style={{
                      borderTop: "1px solid var(--border-soft)",
                      background: i % 2 === 0 ? "transparent" : "var(--surface)",
                    }}
                  >
                    <td style={{ padding: 14, color: "var(--ink-3)" }}>
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td style={{ padding: 14, fontWeight: 600 }}>{e.descricao}</td>
                    <td style={{ padding: 14 }}>
                      <span className="kx-pill" style={{ fontSize: 11 }}>
                        {e.entidade}
                      </span>
                    </td>
                    <td style={{ padding: 14, color: "var(--ink-2)" }}>{e.responsavel}</td>
                    <td style={{ padding: 14, color: "var(--ink-2)" }}>{e.data}</td>
                    <td style={{ padding: 14 }}>
                      <ActivityTypeBadge tipo={e.tipo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderTop: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
              Página {page} de {totalPages} ({total} total)
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="kx-btn kx-btn-sm kx-btn-outline"
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="kx-btn kx-btn-sm kx-btn-outline"
                style={{ opacity: page >= totalPages ? 0.4 : 1 }}
              >
                Próxima <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
