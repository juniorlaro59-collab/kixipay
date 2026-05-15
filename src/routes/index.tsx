import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Landing } from "@/components/kixipay/Landing";
import { AppShell, MemberDrawer } from "@/components/kixipay/AppShell";
import { AuthModal, ContribuicaoModal, AddMembroModal, ConfirmarPagamentoModal, RecomendacaoModal } from "@/components/kixipay/Modals";
import { ToastContainer, type Toast } from "@/components/kixipay/shared";
import type { Membro } from "@/components/kixipay/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KixiPay — A tua kixikila, organizada e digital" },
      { name: "description", content: "Plataforma angolana que digitaliza as kixikilas. Gere o teu grupo de poupança, regista contribuições e constrói o teu KixiScore para acesso a crédito." },
      { property: "og:title", content: "KixiPay — A tua kixikila, organizada e digital" },
      { property: "og:description", content: "Digitaliza a tua kixikila e constrói histórico financeiro reconhecido pelos bancos angolanos." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: KixiPayApp,
});

type ModalKind = 'auth' | 'contribuicao' | 'addMembro' | 'confirmarPagamento' | 'recomendacao' | null;

function KixiPayApp() {
  const [user, setUser] = useState<'conceicao' | 'manuel' | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [drawerMem, setDrawerMem] = useState<Membro | null>(null);
  const [modalMem, setModalMem] = useState<Membro | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((tipo: Toast['tipo'], mensagem: string) => {
    setToasts(t => [...t.slice(-2), { id: Date.now() + Math.random(), tipo, mensagem }]);
  }, []);
  const closeToast = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);

  const openModal = useCallback((m: Exclude<ModalKind, 'auth' | null>, data?: Membro) => {
    if (data) setModalMem(data); else setModalMem(null);
    setModal(m);
  }, []);

  const handleLogin = (who: 'conceicao' | 'manuel') => {
    setUser(who);
    setModal(null);
    pushToast('sucesso', who === 'conceicao' ? 'Bem-vinda, Conceição! 👋' : 'Bem-vindo, Manuel! 👋');
  };

  return (
    <>
      {!user ? (
        <Landing onAuth={() => setModal('auth')} />
      ) : (
        <AppShell
          user={user}
          onLogout={() => { setUser(null); pushToast('info', 'Sessão terminada'); }}
          openModal={openModal}
          openDrawer={setDrawerMem}
          toast={pushToast}
        />
      )}

      <AuthModal open={modal === 'auth'} onClose={() => setModal(null)} onLogin={handleLogin} />
      <ContribuicaoModal open={modal === 'contribuicao'} onClose={() => setModal(null)} prefill={modalMem}
        onConfirm={msg => { setModal(null); pushToast('sucesso', msg); }} />
      <AddMembroModal open={modal === 'addMembro'} onClose={() => setModal(null)}
        onConfirm={msg => { setModal(null); pushToast('sucesso', msg); }} />
      <ConfirmarPagamentoModal open={modal === 'confirmarPagamento'} onClose={() => setModal(null)}
        onConfirm={() => { setModal(null); pushToast('sucesso', 'Manuel confirmado ✓ Rotação avança para Rosa Amélia em Julho'); }} />
      <RecomendacaoModal open={modal === 'recomendacao'} onClose={() => setModal(null)} membro={modalMem}
        onSend={() => { setModal(null); pushToast('info', 'Relatório enviado ao banco com sucesso'); }} />

      <MemberDrawer open={!!drawerMem} membro={drawerMem} onClose={() => setDrawerMem(null)}
        openModal={(m, d) => { setDrawerMem(null); openModal(m, d); }} toast={pushToast} />

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </>
  );
}
