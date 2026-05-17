import { useState, useMemo, useEffect } from "react";
import {
  Home,
  Users,
  Star,
  Smartphone,
  Clock,
  Settings,
  Search,
  Eye,
  MessageSquare,
  Trash2,
  Plus,
} from "lucide-react";
import { Avatar, MiniScoreBar, StatusBadge } from "@/components/kixipay/shared";
import { fmtKz } from "@/components/kixipay/data";
import type { Membro } from "@/components/kixipay/data";
import { AppLayout, type NavItem, type ToastFn } from "@/components/shared/AppLayout";
import { CoordinatorDashboard } from "./CoordinatorDashboard";
import { KixiScoreView } from "@/components/shared/ScoreView";
import { HistoricoView } from "@/components/shared/HistoricoView";
import { ConfigView } from "@/components/shared/ConfigView";

type ViewName = "dashboard" | "membros" | "score" | "ussd" | "historico" | "config";
type ModalOpener = (
  m: "contribuicao" | "addMembro" | "confirmarPagamento" | "recomendacao",
  data?: Membro,
) => void;

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Início", Icon: Home },
  { id: "membros", label: "Membros", Icon: Users },
  { id: "score", label: "KixiScore", Icon: Star },
  { id: "ussd", label: "Pagar USSD", Icon: Smartphone },
  { id: "historico", label: "Histórico", Icon: Clock },
  { id: "config", label: "Configurações", Icon: Settings },
];

export function CoordinatorShell({
  user,
  onLogout,
  openModal,
  openDrawer,
  toast,
}: {
  user: Membro;
  onLogout: () => void;
  openModal: ModalOpener;
  openDrawer: (m: Membro) => void;
  toast: ToastFn;
}) {
  const [view, setView] = useState<ViewName>("dashboard");

  return (
    <AppLayout
      user={user}
      navItems={NAV_ITEMS}
      currentView={view}
      onNavigate={(v) => setView(v as ViewName)}
      onLogout={onLogout}
      toast={toast}
    >
      {view === "dashboard" && (
        <CoordinatorDashboard user={user} openModal={openModal} toast={toast} />
      )}
      {view === "membros" && <MembrosView openDrawer={openDrawer} openModal={openModal} />}
      {view === "score" && <KixiScoreView user={user} toast={toast} />}
      {view === "ussd" && <UssdView />}
      {view === "historico" && <HistoricoView />}
      {view === "config" && <ConfigView toast={toast} />}
    </AppLayout>
  );
}

function MembrosView({
  openDrawer,
  openModal,
}: {
  openDrawer: (m: Membro) => void;
  openModal: ModalOpener;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "Pago" | "Pendente" | "Em atraso">("todos");
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    import("@/services").then(({ getUsersByRole }) =>
      getUsersByRole("member", 1, 50)
        .then((r) => setMembros(r.membros))
        .catch(() => setError("Erro ao carregar membros"))
        .finally(() => setLoading(false)),
    );
  }, []);
  const filtered = useMemo(
    () =>
      membros.filter(
        (m) =>
          (filter === "todos" || m.status === filter) &&
          (search === "" || m.nome.toLowerCase().includes(search.toLowerCase())),
      ),
    [search, filter, membros],
  );
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
          {membros.length} membros
        </h1>
        <button onClick={() => openModal("addMembro")} className="kx-btn kx-btn-primary">
          <Plus size={14} /> Adicionar membro
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
              onClick={() => setFilter(f)}
              className="kx-pill"
              style={{
                background: filter === f ? "var(--brand)" : "var(--surface-2)",
                color: filter === f ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="kx-card" style={{ padding: 20, color: "var(--ink-3)", fontSize: 13 }}>
          A carregar membros...
        </div>
      ) : error ? (
        <div className="kx-card" style={{ padding: 20, color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
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
                  "Pos.",
                  "Total Poupado",
                  "KixiScore",
                  "Status Maio",
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
                  onClick={() => openDrawer(m)}
                  style={{
                    borderTop: "1px solid var(--border-soft)",
                    cursor: "pointer",
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
                    {m.posicao}
                  </td>
                  <td style={{ padding: 14 }} className="kx-num">
                    {fmtKz(m.totalPoupado)}
                  </td>
                  <td style={{ padding: 14 }}>
                    <MiniScoreBar score={m.score} />
                  </td>
                  <td style={{ padding: 14 }}>
                    <StatusBadge status={m.status} />
                  </td>
                  <td style={{ padding: 14 }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6, color: "var(--ink-3)" }}>
                      <button onClick={() => openDrawer(m)} aria-label="Ver">
                        <Eye size={16} />
                      </button>
                      <button aria-label="Mensagem">
                        <MessageSquare size={16} />
                      </button>
                      <button aria-label="Remover">
                        <Trash2 size={16} />
                      </button>
                    </div>
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

function UssdView() {
  const [screen, setScreen] = useState(0);
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>
        USSD · Para todos os telemóveis
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 32,
          alignItems: "flex-start",
        }}
        className="kx-ussd-app"
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <FeaturePhoneSim screen={screen} onScreen={setScreen} />
          <span className="kx-pill">Ecrã {screen + 1} de 4</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="kx-card" style={{ padding: 24 }}>
            <h3 className="kx-display" style={{ fontSize: 20, marginBottom: 8 }}>
              Para quem não tem smartphone
            </h3>
            <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>
              Cada membro pode contribuir, consultar saldo e ver o seu KixiScore directamente do
              feature phone — sem internet.
            </p>
          </div>
          <div className="kx-card" style={{ padding: 24, background: "var(--brand-light)" }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--brand-dark)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Como activar
            </div>
            <div className="kx-mono" style={{ fontSize: 24, marginTop: 6, color: "var(--brand)" }}>
              *920*55#
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <span className="kx-pill" style={{ background: "var(--card)" }}>
                Unitel
              </span>
              <span className="kx-pill" style={{ background: "var(--card)" }}>
                Angola Telecom
              </span>
            </div>
          </div>
          <div className="kx-card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Fluxo USSD
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {["Menu", "Pagar", "Confirmar", "Score"].map((s, i, arr) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    className="kx-pill"
                    style={{
                      background: i === screen ? "var(--brand)" : "var(--surface-2)",
                      color: i === screen ? "#fff" : "var(--ink-2)",
                      cursor: "pointer",
                    }}
                    onClick={() => setScreen(i)}
                  >
                    {i + 1}. {s}
                  </span>
                  {i < arr.length - 1 && <span style={{ color: "var(--ink-4)" }}>→</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="kx-card" style={{ padding: 20, background: "var(--surface)" }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              SMS automático
            </div>
            <div
              className="kx-mono"
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                padding: 12,
                background: "var(--card)",
                borderRadius: 10,
                color: "var(--ink-2)",
              }}
            >
              KixiPay: Conceição, lembre-se de pagar 5.000 Kz até dia 30. Marque *920*55# para
              confirmar. Saldo grupo: 185.000 Kz.
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-ussd-app { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function FeaturePhoneSim({ screen, onScreen }: { screen: number; onScreen: (s: number) => void }) {
  const screens = [
    { lines: ["KixiPay", "", "1. Pagar", "2. Saldo", "3. Score", "4. Sair"], sel: 0 },
    { lines: ["Valor:", "", "5.000 Kz", "", "→ Confirmar"], sel: 2 },
    { lines: ["PIN:", "", "* * * *", "", "→ OK"], sel: 2 },
    { lines: ["Pagamento OK!", "", "KixiScore +5", "", "Saldo: 185.000"], sel: -1 },
  ];
  const s = screens[screen];
  return (
    <div
      style={{
        width: 220,
        height: 400,
        background: "#1a1a2e",
        borderRadius: 30,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontSize: 10, textAlign: "center", color: "#666", marginBottom: 20 }}>
        {["Unitel", "Angola Telecom"][screen % 2]}
      </div>
      <div
        style={{
          flex: 1,
          background: "#0f3460",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          fontFamily: "monospace",
          fontSize: 14,
          color: "#e0e0e0",
        }}
      >
        {s.lines.map((l, i) => (
          <div
            key={i}
            style={{
              padding: "2px 4px",
              background: i === s.sel ? "#e94560" : "transparent",
              color: i === s.sel ? "#fff" : i === 0 ? "#fff" : "#a0a0a0",
              fontWeight: i === 0 ? 700 : i === s.sel ? 700 : 400,
              borderRadius: 2,
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button
          onClick={() => onScreen(Math.max(0, screen - 1))}
          style={{
            color: "#fff",
            fontSize: 12,
            padding: "8px 12px",
            background: "#333",
            borderRadius: 6,
          }}
        >
          ▲ Voltar
        </button>
        <button
          onClick={() => onScreen(Math.min(3, screen + 1))}
          style={{
            color: "#fff",
            fontSize: 12,
            padding: "8px 12px",
            background: "#e94560",
            borderRadius: 6,
          }}
        >
          OK ▼
        </button>
      </div>
    </div>
  );
}
