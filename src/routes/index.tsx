import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { Landing } from "@/components/kixipay/Landing";
import { AppShell, MemberDrawer } from "@/components/kixipay/AppShell";
import { AdminPanel } from "@/components/admin/AdminPanel";
import AgentPanel from "@/components/agent/AgentPanel";
import {
  AuthModal,
  ContribuicaoModal,
  AddMembroModal,
  ConfirmarPagamentoModal,
  RecomendacaoModal,
} from "@/components/kixipay/Modals";
import { ToastContainer, type Toast } from "@/components/kixipay/shared";
import type { Membro, UserId, Role as UserRole } from "@/components/kixipay/data";
import { setAuthUser, persistAuth, restoreAuth, logout as authLogout } from "@/lib/auth-store";
import type { LoginResult } from "@/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KixiPay — A tua kixikila, organizada e digital" },
      {
        name: "description",
        content:
          "Plataforma angolana que digitaliza as kixikilas. Gere o teu grupo de poupança, regista contribuições e constrói o teu KixiScore para acesso a crédito.",
      },
      { property: "og:title", content: "KixiPay — A tua kixikila, organizada e digital" },
      {
        property: "og:description",
        content:
          "Digitaliza a tua kixikila e constrói histórico financeiro reconhecido pelos bancos angolanos.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: KixiPayApp,
});

type ModalKind =
  | "auth"
  | "contribuicao"
  | "addMembro"
  | "confirmarPagamento"
  | "recomendacao"
  | null;

type AppUser = { userId: UserId; nome: string; role: UserRole } | null;

function KixiPayApp() {
  const [user, setUser] = useState<AppUser>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [drawerMem, setDrawerMem] = useState<Membro | null>(null);
  const [modalMem, setModalMem] = useState<Membro | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const saved = restoreAuth();
    if (saved) setUser({ userId: saved.userId, nome: saved.nome, role: saved.role });
  }, []);

  const pushToast = useCallback((tipo: Toast["tipo"], mensagem: string) => {
    setToasts((t) => [...t.slice(-2), { id: Date.now() + Math.random(), tipo, mensagem }]);
  }, []);
  const closeToast = useCallback(
    (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );

  const openModal = useCallback((m: Exclude<ModalKind, "auth" | null>, data?: Membro) => {
    if (data) setModalMem(data);
    else setModalMem(null);
    setModal(m);
  }, []);

  const handleLogin = (who: UserId) => {
    const nome =
      who === "conceicao"
        ? "Conceição Mateus"
        : who === "manuel"
          ? "Manuel Jacinto"
          : who === "admin"
            ? "Administrador"
            : who === "agente1"
              ? "Maria Agostinho"
              : "Pedro Kussumua";
    const role: UserRole =
      who === "admin"
        ? "admin"
        : who === "agente1" || who === "agente2"
          ? "agent"
          : who === "conceicao"
            ? "coordinator"
            : "member";
    const authUser = { userId: who, nome, role, token: `kx_mock_${who}_${Date.now()}` };
    setUser({ userId: who, nome, role });
    setAuthUser(authUser);
    persistAuth();
    setModal(null);
    const msg =
      role === "admin"
        ? "Bem-vindo ao painel administrativo 👋"
        : role === "agent"
          ? `Bem-vindo, ${nome}! 👋`
          : who === "conceicao"
            ? "Bem-vinda, Conceição! 👋"
            : "Bem-vindo, Manuel! 👋";
    pushToast("sucesso", msg);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthUser(null);
    authLogout();
    pushToast("info", "Sessão terminada");
  };

  if (!user) {
    return (
      <>
        <Landing onAuth={() => setModal("auth")} />
        <AuthModal open={modal === "auth"} onClose={() => setModal(null)} onLogin={handleLogin} />
        <ToastContainer toasts={toasts} onClose={closeToast} />
      </>
    );
  }

  if (user.role === "admin") {
    return (
      <>
        <AdminPanel onLogout={handleLogout} toast={pushToast} />
        <ToastContainer toasts={toasts} onClose={closeToast} />
      </>
    );
  }

  if (user.role === "agent") {
    const agentId = user.userId === "agente1" ? 1 : user.userId === "agente2" ? 2 : 1;
    return (
      <>
        <AgentPanel
          agentId={agentId}
          agentNome={user.nome}
          onLogout={handleLogout}
          toast={(tipo, msg) => pushToast(tipo, msg)}
        />
        <ToastContainer toasts={toasts} onClose={closeToast} />
      </>
    );
  }

  return (
    <>
      <AppShell
        user={user.userId as "conceicao" | "manuel"}
        role={user.role as "coordinator" | "member"}
        onLogout={handleLogout}
        openModal={openModal}
        openDrawer={setDrawerMem}
        toast={pushToast}
      />

      <AuthModal open={modal === "auth"} onClose={() => setModal(null)} onLogin={handleLogin} />
      <ContribuicaoModal
        open={modal === "contribuicao"}
        onClose={() => setModal(null)}
        prefill={modalMem}
        onConfirm={(msg) => {
          setModal(null);
          pushToast("sucesso", msg);
        }}
      />
      <AddMembroModal
        open={modal === "addMembro"}
        onClose={() => setModal(null)}
        onConfirm={(msg) => {
          setModal(null);
          pushToast("sucesso", msg);
        }}
      />
      <ConfirmarPagamentoModal
        open={modal === "confirmarPagamento"}
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          pushToast("sucesso", "Manuel confirmado ✓ Rotação avança para Rosa Amélia em Julho");
        }}
      />
      <RecomendacaoModal
        open={modal === "recomendacao"}
        onClose={() => setModal(null)}
        membro={modalMem}
        onSend={() => {
          setModal(null);
          pushToast("info", "Relatório enviado ao banco com sucesso");
        }}
      />

      <MemberDrawer
        open={!!drawerMem}
        membro={drawerMem}
        onClose={() => setDrawerMem(null)}
        openModal={(m, d) => {
          setDrawerMem(null);
          openModal(m, d);
        }}
        toast={pushToast}
      />

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </>
  );
}
