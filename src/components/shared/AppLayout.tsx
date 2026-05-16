import { useState } from "react";
import { Bell, Check, ChevronDown, LogOut, User as UserIcon, Settings, X } from "lucide-react";
import { Logo, Avatar } from "@/components/kixipay/shared";
import type { Membro } from "@/components/kixipay/data";

export type NavItem = { id: string; label: string; Icon: React.ComponentType<{ size?: number }> };
export type ToastFn = (tipo: "sucesso" | "aviso" | "erro" | "info", msg: string) => void;

export function AppLayout({
  user,
  isMember,
  navItems,
  currentView,
  onNavigate,
  onLogout,
  toast,
  children,
}: {
  user: Membro;
  isMember?: boolean;
  navItems: NavItem[];
  currentView: string;
  onNavigate: (v: string) => void;
  onLogout: () => void;
  toast: ToastFn;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", animation: "fadeIn 200ms" }}>
      <AppNavbar
        user={user}
        viewLabel={navItems.find((n) => n.id === currentView)?.label || ""}
        onLogout={onLogout}
        toast={toast}
      />
      <div style={{ display: "flex", paddingTop: 60 }}>
        <Sidebar navItems={navItems} currentView={currentView} onNavigate={onNavigate} />
        <main
          style={{ flex: 1, padding: 28, minHeight: "calc(100vh - 60px)", paddingBottom: 100 }}
          className="kx-main"
        >
          {children}
        </main>
      </div>
      <BottomNav
        navItems={navItems.slice(0, 5)}
        currentView={currentView}
        onNavigate={onNavigate}
      />
      <style>{`
        @media (max-width: 900px) {
          .kx-sidebar { display: none !important; }
          .kx-main { padding: 16px !important; padding-bottom: 100px !important; }
          .kx-bottom-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function AppNavbar({
  user,
  viewLabel,
  onLogout,
  toast,
}: {
  user: Membro;
  viewLabel: string;
  onLogout: () => void;
  toast: ToastFn;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [unread] = useState(0);
  const notifs: { c: string; t: string }[] = [];
  return (
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
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Logo />
        {(user as any).grupoNome && (
          <span
            className="kx-pill"
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            {(user as any).grupoNome}
          </span>
        )}
        <span style={{ color: "var(--ink-3)", fontSize: 13 }} className="kx-hide-sm">
          / {viewLabel}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notificações"
            style={{ position: "relative", padding: 8 }}
          >
            <Bell size={20} color="var(--ink-2)" />
            {unread > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "var(--brand)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  padding: "0 4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div
              className="kx-fade-in"
              style={{
                position: "absolute",
                top: 44,
                right: 0,
                width: 320,
                background: "var(--card)",
                borderRadius: 16,
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                border: "1px solid var(--border-soft)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 14,
                  borderBottom: "1px solid var(--border-soft)",
                  fontWeight: 600,
                }}
              >
                Notificações
              </div>
              {notifs.length === 0 ? (
                <div
                  style={{
                    padding: 20,
                    textAlign: "center",
                    color: "var(--ink-3)",
                    fontSize: 13,
                  }}
                >
                  Nenhuma notificação
                </div>
              ) : (
                notifs.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid var(--border-soft)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: n.c,
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{n.t}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setUserOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Avatar iniciais={user.iniciais} cor={user.cor} size={36} />
            <ChevronDown size={14} color="var(--ink-3)" />
          </button>
          {userOpen && (
            <div
              className="kx-fade-in"
              style={{
                position: "absolute",
                top: 44,
                right: 0,
                width: 200,
                background: "var(--card)",
                borderRadius: 12,
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                border: "1px solid var(--border-soft)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 12, borderBottom: "1px solid var(--border-soft)" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user.nome}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{user.tel}</div>
              </div>
              {[
                { Icon: UserIcon, l: "Perfil" },
                { Icon: Settings, l: "Configurações" },
                { Icon: LogOut, l: "Sair", danger: true, action: onLogout },
              ].map((it, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setUserOpen(false);
                    it.action?.();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: it.danger ? "var(--red)" : "var(--ink)",
                    fontSize: 14,
                  }}
                >
                  <it.Icon size={16} /> {it.l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 600px) { .kx-hide-sm { display: none !important; } }`}</style>
    </header>
  );
}

function Sidebar({
  navItems,
  currentView,
  onNavigate,
}: {
  navItems: NavItem[];
  currentView: string;
  onNavigate: (v: string) => void;
}) {
  return (
    <aside
      className="kx-sidebar"
      style={{
        width: 240,
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
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Grupo</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Dados do grupo disponíveis na API</div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((it) => {
          const active = currentView === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate(it.id)}
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
      <div style={{ marginTop: 32, padding: 16, background: "var(--surface)", borderRadius: 12 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            textAlign: "center",
          }}
        >
          Saldo do grupo indisponível
        </div>
      </div>
    </aside>
  );
}

function BottomNav({
  navItems,
  currentView,
  onNavigate,
}: {
  navItems: NavItem[];
  currentView: string;
  onNavigate: (v: string) => void;
}) {
  return (
    <nav
      className="kx-bottom-nav"
      style={{
        display: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "var(--card)",
        borderTop: "1px solid var(--border)",
        zIndex: 50,
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {navItems.map((it) => {
        const active = currentView === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onNavigate(it.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: active ? "var(--brand)" : "var(--ink-3)",
              fontSize: 10,
              fontWeight: 500,
              padding: 6,
            }}
          >
            <it.Icon size={20} /> {it.label}
          </button>
        );
      })}
    </nav>
  );
}
