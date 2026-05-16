import { Copy, Send, Link2, Building2, X } from "lucide-react";
import { Avatar, ScoreRing, EmptyState } from "@/components/kixipay/shared";
import { ROTACAO_MESES, fmtKz, scoreColor, scoreLabel } from "@/components/kixipay/data";
import type { Membro } from "@/components/kixipay/data";
import type { ToastFn } from "@/components/shared/AppLayout";

type ModalOpener = (
  m: "contribuicao" | "addMembro" | "confirmarPagamento" | "recomendacao",
  data?: Membro,
) => void;

export function MemberDrawer({
  open,
  membro,
  onClose,
  openModal,
  toast,
}: {
  open: boolean;
  membro: Membro | null;
  onClose: () => void;
  openModal: ModalOpener;
  toast: ToastFn;
}) {
  if (!open || !membro) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.4)" }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="kx-scroll"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 100vw)",
          background: "var(--card)",
          overflowY: "auto",
          animation: "slideInRight 250ms ease-out",
          padding: 28,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{ position: "absolute", top: 16, right: 16, color: "var(--ink-3)" }}
        >
          <X size={20} />
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <Avatar iniciais={membro.iniciais} cor={membro.cor} size={80} />
          <h2 className="kx-display" style={{ fontSize: 22, marginTop: 12 }}>
            {membro.nome}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--ink-3)",
            }}
          >
            {membro.tel}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(membro.tel);
                toast("sucesso", "Telemóvel copiado");
              }}
              aria-label="Copiar"
            >
              <Copy size={12} />
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
            {membro.meses} meses de actividade
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>
            Posição {membro.posicao}º · Recebe em {ROTACAO_MESES[membro.posicao - 1]}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <ScoreRing score={membro.score} size={140} />
        </div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="kx-num" style={{ fontSize: 14, color: scoreColor(membro.score) }}>
            {membro.score} · {scoreLabel(membro.score)}
          </div>
          <div style={{ color: "var(--gold)", marginTop: 2 }}>★★★★★</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <EmptyState message="Dados de contribuições indisponíveis" />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <Mini label="Total" v={fmtKz(membro.totalPoupado)} />
          <Mini label="Pontualidade" v={`${membro.pontualidade}%`} />
          <Mini label="Sequência" v={`${Math.min(membro.meses, 8)} meses`} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => openModal("contribuicao", membro)}
            className="kx-btn kx-btn-primary"
          >
            ✓ Registar pagamento
          </button>
          <button
            onClick={() => toast("aviso", "API de SMS não disponível")}
            className="kx-btn kx-btn-outline"
          >
            <Send size={14} /> Enviar lembrete SMS
          </button>
          <button
            onClick={() => toast("aviso", "API de convite não disponível")}
            className="kx-btn kx-btn-outline"
          >
            <Link2 size={14} /> Convidar por link
          </button>
          <button onClick={() => openModal("recomendacao", membro)} className="kx-btn kx-btn-blue">
            <Building2 size={14} /> Recomendar ao banco
          </button>
          <button
            onClick={() => toast("aviso", "API de remoção não disponível")}
            className="kx-btn"
            style={{ color: "var(--red)", border: "1.5px solid var(--red)" }}
          >
            <X size={14} /> Remover do grupo
          </button>
        </div>
      </aside>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div
      style={{ background: "var(--surface)", padding: 10, borderRadius: 10, textAlign: "center" }}
    >
      <div
        style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", fontWeight: 600 }}
      >
        {label}
      </div>
      <div className="kx-num" style={{ fontSize: 14, marginTop: 2 }}>
        {v}
      </div>
    </div>
  );
}
