import { useState, useMemo } from "react";
import { Home, Globe, Star, Clock, Settings, Search, Check } from "lucide-react";
import { fmtKz } from "@/components/kixipay/data";
import type { Membro } from "@/components/kixipay/data";
import { AppLayout, type NavItem, type ToastFn } from "@/components/shared/AppLayout";
import { MemberDashboard } from "./MemberDashboard";
import { KixiScoreView } from "@/components/shared/ScoreView";
import { HistoricoView } from "@/components/shared/HistoricoView";
import { ConfigView } from "@/components/shared/ConfigView";

type ViewName = "dashboard" | "comunidades" | "score" | "historico" | "config";
type ModalOpener = (
  m: "contribuicao" | "addMembro" | "confirmarPagamento" | "recomendacao",
  data?: Membro,
) => void;

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Início", Icon: Home },
  { id: "comunidades", label: "Comunidades", Icon: Globe },
  { id: "score", label: "KixiScore", Icon: Star },
  { id: "historico", label: "Histórico", Icon: Clock },
  { id: "config", label: "Configurações", Icon: Settings },
];

export function MemberShell({
  user,
  onLogout,
  openModal,
  toast,
}: {
  user: Membro;
  onLogout: () => void;
  openModal: ModalOpener;
  toast: ToastFn;
}) {
  const [view, setView] = useState<ViewName>("dashboard");

  return (
    <AppLayout
      user={user}
      isMember
      navItems={NAV_ITEMS}
      currentView={view}
      onNavigate={(v) => setView(v as ViewName)}
      onLogout={onLogout}
      toast={toast}
    >
      {view === "dashboard" && <MemberDashboard user={user} openModal={openModal} toast={toast} />}
      {view === "comunidades" && <ComunidadesView user={user} toast={toast} />}
      {view === "score" && <KixiScoreView user={user} toast={toast} />}
      {view === "historico" && <HistoricoView membroNome={user.nome} />}
      {view === "config" && <ConfigView toast={toast} isMember />}
    </AppLayout>
  );
}

function ComunidadesView({ toast }: { user: Membro; toast: ToastFn }) {
  const [codigo, setCodigo] = useState("");
  const [entrouCodigo, setEntrouCodigo] = useState(false);
  const [sending, setSending] = useState(false);

  const handleJoin = async () => {
    if (!codigo.trim()) return;
    setSending(true);
    try {
      const { solicitarEntrada } = await import("@/services");
      await solicitarEntrada(codigo.trim());
      setEntrouCodigo(true);
      toast("sucesso", "Pedido de entrada enviado ✓");
    } catch {
      toast("aviso", "Código não encontrado. Verifique e tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 className="kx-display" style={{ fontSize: 26 }}>
        Comunidades Kixikila
      </h1>

      <div className="kx-card" style={{ padding: 24, maxWidth: 480 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Entrar com código
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="kx-input kx-mono"
            placeholder="Ex: KXRNG-2024"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            style={{ flex: 1, textTransform: "uppercase" }}
          />
          <button className="kx-btn kx-btn-primary" disabled={sending} onClick={handleJoin}>
            <Check size={14} /> Entrar
          </button>
        </div>
        {entrouCodigo && (
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "var(--green)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Check size={14} /> Pedido de entrada enviado. O coordenador será notificado.
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          padding: 40,
          color: "var(--ink-3)",
        }}
      >
        Use o código da comunidade para solicitar entrada.
      </div>
    </div>
  );
}
