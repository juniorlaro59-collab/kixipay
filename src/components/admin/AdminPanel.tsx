import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  getPlatformMetrics,
  updateAgenteStatus,
  getAllMembrosAdmin,
  getUsersByRole,
  removeMembroAdmin,
  getMyRiskAnalysis,
  getRiskAnalysisByPhone,
  RiskAnalysisResult,
} from "@/services";
import type { PlatformStats, Membro } from "@/types";
import { createUserByAdmin } from "@/services/admin";
import { getApiErrorMessage } from "@/services/client";

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
          {view === "agentes" && (
            <RoleUsersView
              role="agent"
              title="Agentes"
              emptyMessage="Nenhum agente encontrado"
              toast={toast}
            />
          )}
          {view === "coordenadores" && (
            <RoleUsersView
              role="coordinator"
              title="Coordenadores"
              emptyMessage="Nenhum coordenador encontrado"
              toast={toast}
            />
          )}
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

function DashboardView({ toast }: { toast: AdminPanelProps["toast"] }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalRole, setCreateModalRole] = useState<"coordinator" | "agent" | null>(null);

  const alreadyLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  const load = useCallback(async (force = false) => {
    if (!force && alreadyLoadedRef.current) return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const s = await getPlatformMetrics();
      setStats(s);
      alreadyLoadedRef.current = true;
    } catch {
      setError("Erro ao carregar dados do dashboard");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreated = () => {
    alreadyLoadedRef.current = false;
    load(true);
  };

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

  if (error) return <ErrorState message={error} onRetry={() => load(true)} />;
  if (!stats) return <ErrorState message="Nenhum dado disponível" onRetry={() => load(true)} />;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="kx-display" style={{ fontSize: 28 }}>
              Painel de Administração
            </h1>

            <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 4 }}>
              Visão geral da plataforma KixiPay
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setCreateModalRole("coordinator")}
              className="kx-btn kx-btn-primary"
            >
              <Shield size={16} /> Cadastrar Coordenador
            </button>

            <button
              onClick={() => setCreateModalRole("agent")}
              className="kx-btn kx-btn-blue"
            >
              <UserCheck size={16} /> Cadastrar Agente
            </button>

            <button onClick={() => load(true)} className="kx-btn kx-btn-outline">
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
        </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
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
    sub="Agentes cadastrados"
    subColor="var(--ink-3)"
    color="var(--blue)"
    bg="var(--blue-light)"
  />

  <KpiCard
    icon={Shield}
    label="Total Coordenadores"
    value={String(stats.totalCoordenadores)}
    sub="Coordenadores cadastrados"
    subColor="var(--ink-3)"
    color="var(--orange-mid)"
    bg="var(--gold-light)"
  />

  <KpiCard
    icon={BarChart3}
    label="Volume Total"
    value={fmtKz(stats.volumeTotal)}
    sub={(stats.fundosCirculacao ?? 0).toLocaleString("pt-PT") + " Kz em circulação"}
    subColor="var(--ink-3)"
    color="var(--green)"
    bg="var(--green-light)"
  />

  <KpiCard
    icon={Star}
    label="Score Médio"
    value={String(stats.scoreMedio)}
    sub={
      (stats.crescimentoMensal >= 0 ? "+" : "") +
      stats.crescimentoMensal +
      "% crescimento"
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
      </div>

      {createModalRole && (
        <CreateAdminUserModal
          role={createModalRole}
          toast={toast}
          onClose={() => setCreateModalRole(null)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}


function CreateAdminUserModal({
  role,
  toast,
  onClose,
  onCreated,
}: {
  role: "coordinator" | "agent";
  toast: AdminPanelProps["toast"];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    biNumber: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const loadingRef = useRef(false);

  const title = role === "coordinator" ? "Cadastrar Coordenador" : "Cadastrar Agente";
  const Icon = role === "coordinator" ? Shield : UserCheck;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (loadingRef.current) return;

    if (!form.fullName.trim()) {
      toast("erro", "Informe o nome completo");
      return;
    }

    if (!form.phoneNumber.trim()) {
      toast("erro", "Informe o número de telefone");
      return;
    }

    if (!form.biNumber.trim()) {
      toast("erro", "Informe o número do BI");
      return;
    }

    if (!form.password.trim()) {
      toast("erro", "Informe a palavra-passe");
      return;
    }

    loadingRef.current = true;
    setSaving(true);

    try {
      await createUserByAdmin({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        biNumber: form.biNumber.trim(),
        password: form.password,
        role,
      });

      toast(
        "sucesso",
        role === "coordinator"
          ? "Coordenador cadastrado com sucesso"
          : "Agente cadastrado com sucesso",
      );

      onCreated();
      onClose();
    } catch (error) {
      toast("erro", getApiErrorMessage(error, "Erro ao cadastrar agente"));
    } finally {
      loadingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
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
          width: "100%",
          maxWidth: 520,
          background: "var(--card)",
          borderRadius: 22,
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
          border: "1px solid var(--border-soft)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: role === "coordinator" ? "var(--brand-light)" : "var(--blue-light)",
                color: role === "coordinator" ? "var(--brand)" : "var(--blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={20} />
            </div>

            <div>
              <h2 className="kx-display" style={{ fontSize: 20 }}>
                {title}
              </h2>

              <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                Criar utilizador com role administrativa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: saving ? 0.5 : 1,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Nome completo
            </label>

            <input
              className="kx-input"
              placeholder={role === "coordinator" ? "Coordenador Teste" : "Agente Teste"}
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Telefone
            </label>

            <input
              className="kx-input"
              placeholder="+244923000010"
              value={form.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Número do BI
            </label>

            <input
              className="kx-input"
              placeholder="000000010LA0010"
              value={form.biNumber}
              onChange={(e) => handleChange("biNumber", e.target.value.toUpperCase())}
              disabled={saving}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Palavra-passe
            </label>

            <input
              className="kx-input"
              type="password"
              placeholder="123456"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-soft)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            background: "var(--surface)",
          }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className="kx-btn kx-btn-outline"
            style={{ opacity: saving ? 0.5 : 1 }}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className={role === "coordinator" ? "kx-btn kx-btn-primary" : "kx-btn kx-btn-blue"}
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <>
                <RefreshCw size={14} /> A guardar...
              </>
            ) : (
              <>
                <Icon size={14} /> Guardar
              </>
            )}
          </button>
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
  const [removing, setRemoving] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Membro | null>(null);

  const pageSize = 20;

  const loadedPagesRef = useRef<Set<number>>(new Set());
  const loadingRef = useRef(false);

  const load = useCallback(
    async (force = false) => {
      if (!force && loadedPagesRef.current.has(page)) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const res = await getAllMembrosAdmin(page, pageSize, "member");
        setMembros(res.membros);
        setTotal(res.total);
        loadedPagesRef.current.add(page);
      } catch {
        setError("Erro ao carregar membros");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [page],
  );

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

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleConfirmRemove = async () => {
  if (!deleteTarget) return;

  setRemoving(deleteTarget.id);

  try {
    await removeMembroAdmin(deleteTarget.id);

    setMembros((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setTotal((prev) => Math.max(0, prev - 1));

    loadedPagesRef.current.clear();

    toast("sucesso", "Membro removido com sucesso");
    setDeleteTarget(null);
  } catch (error) {
    toast("erro", getApiErrorMessage(error, "Erro ao remover membro"));
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
          {total} Membros · Plataforma
        </h1>

        <button onClick={() => load(true)} className="kx-btn kx-btn-outline">
          <RefreshCw size={14} /> Actualizar
        </button>
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
        <ErrorState message={error} onRetry={() => load(true)} />
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
  onClick={() => setDeleteTarget(m)}
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
   {deleteTarget && (
  <ConfirmDeleteModal
    title="Eliminar membro"
    message={`Tem certeza que deseja eliminar o membro ${deleteTarget.nome}? Esta acção não poderá ser desfeita.`}
    confirmText="Eliminar"
    loading={removing === deleteTarget.id}
    onClose={() => {
      if (removing) return;
      setDeleteTarget(null);
    }}
    onConfirm={handleConfirmRemove}
  />
)}
</div>
  );
}
function ConfirmDeleteModal({
  title,
  message,
  confirmText = "Eliminar",
  loading,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmText?: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
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
          width: "100%",
          maxWidth: 420,
          background: "var(--card)",
          borderRadius: 20,
          border: "1px solid var(--border-soft)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 24,
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(220, 38, 38, 0.10)",
              color: "var(--red)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <h2 className="kx-display" style={{ fontSize: 20, marginBottom: 8 }}>
              {title}
            </h2>

            <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-soft)",
            background: "var(--surface)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="kx-btn kx-btn-outline"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="kx-btn"
            style={{
              background: "var(--red)",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={14} /> A eliminar...
              </>
            ) : (
              <>
                <Trash2 size={14} /> {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
function RoleUsersView({
  role,
  title,
  emptyMessage,
  toast,
}: {
  role: "agent" | "coordinator";
  title: string;
  emptyMessage: string;
  toast: AdminPanelProps["toast"];
}) {
  const [users, setUsers] = useState<Membro[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | number | null>(null);
const [deleteTarget, setDeleteTarget] = useState<Membro | null>(null);
  const pageSize = 20;

  const loadedKeysRef = useRef<Set<string>>(new Set());
  const loadingRef = useRef(false);

  const load = useCallback(
    async (force = false) => {
      const key = `${role}:${page}`;

      if (!force && loadedKeysRef.current.has(key)) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const res = await getUsersByRole(role, page, pageSize);
        setUsers(res.membros);
        setTotal(res.total);
        loadedKeysRef.current.add(key);
      } catch {
        setError(`Erro ao carregar ${title.toLowerCase()}`);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [page, role, title],
  );

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((u) => u.nome.toLowerCase().includes(q) || u.tel.includes(q));
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

 const handleConfirmRemove = async () => {
  if (!deleteTarget) return;

  setRemoving(deleteTarget.id);

  try {
    await removeMembroAdmin(deleteTarget.id);

    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setTotal((prev) => Math.max(0, prev - 1));

    loadedKeysRef.current.clear();

    toast("sucesso", `${title.slice(0, -1)} removido com sucesso`);
    setDeleteTarget(null);
  } catch (error) {
    toast("erro", getApiErrorMessage(error, `Erro ao remover ${title.toLowerCase()}`));
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
          {total} {title}
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
          placeholder={`Pesquisar ${title.toLowerCase()}...`}
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
        <EmptyState message={emptyMessage} icon={Info} />
      ) : (
        <div className="kx-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                  {["#", "Nome", "Telemovel", "KixiScore", "Status", "Meses", "Accoes"].map(
                    (h) => (
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
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.id}
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
                        <Avatar iniciais={u.iniciais} cor={u.cor} size={32} />
                        <span style={{ fontWeight: 600 }}>{u.nome}</span>
                      </div>
                    </td>

                    <td style={{ padding: 14, color: "var(--ink-2)" }}>{u.tel}</td>

                    <td style={{ padding: 14 }}>
                      <span className="kx-num" style={{ color: scoreColor(u.score) }}>
                        {u.score}
                      </span>

                      <span style={{ marginLeft: 8, color: "var(--ink-3)", fontSize: 12 }}>
                        {scoreLabel(u.score)}
                      </span>
                    </td>

                    <td style={{ padding: 14 }}>
                      <StatusBadge status={u.status} />
                    </td>

                    <td style={{ padding: 14 }} className="kx-num">
                      {u.meses}
                    </td>

                    <td style={{ padding: 14 }}>
                      <button
  onClick={() => setDeleteTarget(u)}
  disabled={removing === u.id}
  style={{
    color: "var(--red)",
    opacity: removing === u.id ? 0.5 : 1,
    padding: 6,
    borderRadius: 8,
  }}
  title={`Remover ${title.toLowerCase()}`}
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
              Pagina {page} de {totalPages} ({total} total)
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
                Proxima <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    {deleteTarget && (
        <ConfirmDeleteModal
          title={`Eliminar ${title.slice(0, -1).toLowerCase()}`}
          message={`Tem certeza que deseja eliminar ${deleteTarget.nome}? Esta acção não poderá ser desfeita.`}
          confirmText="Eliminar"
          loading={removing === deleteTarget.id}
          onClose={() => {
            if (removing) return;
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  );
}

function AgentesView({ toast }: { toast: AdminPanelProps["toast"] }) {
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>
        Agentes
      </h1>
      <EmptyState message="API de agentes não disponível" icon={Info} />
    </div>
  );
}

function CoordenadoresView() {
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>
        Coordenadores
      </h1>
      <EmptyState message="API de coordenadores não disponível" icon={Info} />
    </div>
  );
}

function AIScoreView({ toast }: { toast: AdminPanelProps["toast"] }) {
  const [loadingRisk, setLoadingRisk] = useState(true);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [consultingByPhone, setConsultingByPhone] = useState(false);

  const myAnalysisLoadedRef = useRef(false);
  const loadingRef = useRef(false);
  const lastPhoneConsultedRef = useRef<string | null>(null);

  const loadMyRiskAnalysis = useCallback(
    async (force = false) => {
      if (!force && myAnalysisLoadedRef.current) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoadingRisk(true);

      try {
        const data = await getMyRiskAnalysis();

        setRiskAnalysis(data);
        setConsultingByPhone(false);
        myAnalysisLoadedRef.current = true;
        lastPhoneConsultedRef.current = null;
      } catch {
        setRiskAnalysis(null);
        toast("erro", "Não foi possível carregar a análise da IA");
      } finally {
        loadingRef.current = false;
        setLoadingRisk(false);
      }
    },
    [toast],
  );

  const loadRiskAnalysisByPhone = useCallback(
    async (force = false) => {
      const phone = phoneNumber.trim();

      if (!phone) {
        toast("erro", "Informe o número de telefone");
        return;
      }

      if (!force && lastPhoneConsultedRef.current === phone) return;
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoadingRisk(true);

      try {
        const data = await getRiskAnalysisByPhone(phone);

        setRiskAnalysis(data);
        setConsultingByPhone(true);
        lastPhoneConsultedRef.current = phone;

        toast("sucesso", "Análise carregada com sucesso");
      } catch {
        setRiskAnalysis(null);
        toast("erro", "Não foi possível consultar a análise por telefone");
      } finally {
        loadingRef.current = false;
        setLoadingRisk(false);
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

    if (value.includes("baixo")) return CheckCircle2;
    if (value.includes("médio") || value.includes("medio")) return AlertTriangle;

    return AlertCircle;
  }

  if (loadingRisk) {
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
        <Skeleton height={160} />
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
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 className="kx-display" style={{ fontSize: 26 }}>
            AI Score · Inteligência de Crédito
          </h1>

          <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 4 }}>
            Avaliação automática do risco financeiro com base no histórico do utilizador.
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
              if (e.key === "Enter") {
                loadRiskAnalysisByPhone(true);
              }
            }}
            style={{ paddingLeft: 40 }}
          />
        </div>

        <button onClick={() => loadRiskAnalysisByPhone(true)} className="kx-btn kx-btn-primary">
          <Search size={14} /> Consultar
        </button>
      </div>

      {!riskAnalysis ? (
        <EmptyState message="API de AI Score não disponível" icon={Brain} />
      ) : (
        <>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              marginTop: -6,
            }}
          >
            {consultingByPhone
              ? "Resultado da consulta por número de telefone"
              : "Resultado da análise do utilizador autenticado"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <KpiCard
              icon={Brain}
              label="Motor de análise"
              value="IA"
              sub="Avaliação automática"
              color="var(--brand)"
              bg="var(--brand-light)"
            />

            <KpiCard
              icon={RiskIcon}
              label="Nível de risco"
              value={riskAnalysis.riskLevel}
              sub="Classificação actual"
              subColor={riskColor}
              color={riskColor}
              bg="var(--surface-2)"
            />

            <KpiCard
              icon={Target}
              label="Estado"
              value={riskStatus}
              sub="Decisão sugerida"
              subColor={riskColor}
              color={riskColor}
              bg="var(--surface-2)"
            />
          </div>

          <div className="kx-card" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: riskColor,
                }}
              >
                <RiskIcon size={20} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-3)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Recomendação da IA
                </div>

                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
                  Orientação para decisão de crédito
                </div>
              </div>
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

function ActivityView() {
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>
        Registo de Actividades
      </h1>
      <EmptyState message="API de actividades não disponível" icon={Activity} />
    </div>
  );
}
