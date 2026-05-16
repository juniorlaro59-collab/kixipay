import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { Landing } from "@/components/kixipay/Landing";
import { CoordinatorShell } from "@/components/coordinator/CoordinatorShell";
import { MemberShell } from "@/components/member/MemberShell";
import { MemberDrawer } from "@/components/shared/MemberDrawer";
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
import type { Membro } from "@/components/kixipay/data";
import { setAuthUser, persistAuth, restoreAuth, logout as authLogout } from "@/lib/auth-store";
import type { LoginResult } from "@/services";
import { getCurrentUser } from "@/services";
import type { ApiUser } from "@/services";

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

type AppUser = { userId: string; nome: string; role: string } | null;

function KixiPayApp() {
  const [user, setUser] = useState<AppUser>(null);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [drawerMem, setDrawerMem] = useState<Membro | null>(null);
  const [modalMem, setModalMem] = useState<Membro | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const saved = restoreAuth();
    if (saved) {
      setUser({ userId: saved.userId, nome: saved.nome, role: saved.role });
      getCurrentUser()
        .then(setApiUser)
        .catch(() => {
          setUser(null);
          setAuthUser(null);
          authLogout();
        });
    }
  }, []);

  const pushToast = useCallback((tipo: Toast["tipo"], mensagem: string) => {
    setToasts((t) => [...t.slice(-2), { id: Date.now() + Math.random(), tipo, mensagem }]);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setApiUser(null);
      setAuthUser(null);
      authLogout();
      pushToast("info", "Sessão expirada. Faça login novamente.");
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [pushToast]);
  const closeToast = useCallback(
    (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );

  const openModal = useCallback((m: Exclude<ModalKind, "auth" | null>, data?: Membro) => {
    if (data) setModalMem(data);
    else setModalMem(null);
    setModal(m);
  }, []);

  const handleLogin = (result: LoginResult) => {
    const { userId, nome, role } = result;
    setUser({ userId, nome, role });
    setAuthUser({ userId, nome, role, token: result.token });
    persistAuth();
    setModal(null);
    getCurrentUser()
      .then(setApiUser)
      .catch(() => {});
    const msg =
      role === "admin"
        ? "Bem-vindo ao painel administrativo 👋"
        : role === "agent"
          ? `Bem-vindo, ${nome}! 👋`
          : role === "coordinator"
            ? `Bem-vinda, ${nome}! 👋`
            : `Bem-vindo, ${nome}! 👋`;
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
    const agentId = user.userId;
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
      {(() => {
        const fallbackMembro: Membro = {
          id: 1,
          nome: user.nome,
          tel: "+244 900 000 000",
          posicao: 1,
          totalPoupado: 0,
          score: 0,
          status: "Pendente",
          iniciais: user.nome
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          cor: "#FF5C1A",
          meses: 1,
          pontualidade: 100,
        };
        const membro = apiUser
          ? {
              ...fallbackMembro,
              id: 1,
              nome: apiUser.fullName,
              tel: apiUser.phoneNumber,
              score: apiUser.score,
              status: apiUser.pendingDebt > 0 ? ("Em atraso" as const) : ("Pago" as const),
            }
          : fallbackMembro;
        if (user.role === "coordinator") {
          return (
            <CoordinatorShell
              user={membro}
              onLogout={handleLogout}
              openModal={openModal}
              openDrawer={setDrawerMem}
              toast={pushToast}
            />
          );
        }
        return (
          <MemberShell
            user={membro}
            onLogout={handleLogout}
            openModal={openModal}
            toast={pushToast}
          />
        );
      })()}

      <AuthModal open={modal === "auth"} onClose={() => setModal(null)} onLogin={handleLogin} />
      <ContribuicaoModal
        open={modal === "contribuicao"}
        onClose={() => setModal(null)}
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
