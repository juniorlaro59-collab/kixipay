import { useEffect, useRef, useState } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";
import { scoreColor, scoreLabel } from "./data";

// ─── Skeleton Loading ──────────────────────────────────────────────────
export function Skeleton({
  width = "100%",
  height = 20,
  rounded = 8,
}: {
  width?: string | number;
  height?: number;
  rounded?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: rounded,
        background: "var(--surface-2)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function SkeletonCard({ lines = 3, height = 120 }: { lines?: number; height?: number }) {
  return (
    <div
      className="kx-card"
      style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <Skeleton width="60%" height={22} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={`${70 + Math.random() * 30}%`} height={14} />
      ))}
    </div>
  );
}

// ─── Error State ────────────────────────────────────────────────────────
export function ErrorState({
  message = "Ocorreu um erro",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div style={{ textAlign: "center", padding: 40, color: "var(--ink-3)" }}>
      <AlertCircle size={40} color="var(--red)" style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 14, marginBottom: 16 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="kx-btn kx-btn-outline">
          Tentar novamente
        </button>
      )}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────
export function EmptyState({
  message = "Nenhum dado encontrado",
  icon: Icon,
}: {
  message?: string;
  icon?: React.ElementType;
}) {
  const I = Icon || Info;
  return (
    <div style={{ textAlign: "center", padding: 40, color: "var(--ink-3)" }}>
      <I size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  );
}

export function Logo({ dark = false, size = 28 }: { dark?: boolean; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="11" cy="16" r="8" stroke="#FF5C1A" strokeWidth="2.5" />
        <circle cx="21" cy="16" r="8" stroke="#FF5C1A" strokeWidth="2.5" />
        <path
          d="M16 10 L19 13 L16 16"
          stroke="#F5A623"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: 22,
          color: dark ? "#fff" : "var(--ink)",
        }}
      >
        Kixi
        <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, color: "var(--brand)" }}>
          Pay
        </span>
      </span>
    </div>
  );
}

export function Avatar({
  iniciais,
  cor,
  size = 40,
}: {
  iniciais: string;
  cor: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: cor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {iniciais}
    </div>
  );
}

export function ScoreRing({
  score,
  size = 180,
  animate = true,
}: {
  score: number;
  size?: number;
  animate?: boolean;
}) {
  const [val, setVal] = useState(animate ? 0 : score);
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const max = 1000;
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setVal(score), 100);
    return () => clearTimeout(t);
  }, [score, animate]);
  const offset = c - (val / max) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={scoreColor(score)}
          strokeWidth="10"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-num)",
            fontWeight: 700,
            fontSize: size * 0.32,
            color: scoreColor(score),
            lineHeight: 1,
          }}
        >
          {Math.round(val)}
        </div>
        <div
          style={{ fontSize: size * 0.08, color: "var(--ink-3)", marginTop: 4, fontWeight: 500 }}
        >
          {scoreLabel(score)}
        </div>
      </div>
    </div>
  );
}

export function MiniScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, (score / 1000) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-num)",
          fontWeight: 700,
          color: scoreColor(score),
          minWidth: 36,
        }}
      >
        {score}
      </span>
      <div
        style={{
          width: 60,
          height: 6,
          background: "var(--surface-2)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: scoreColor(score) }} />
      </div>
    </div>
  );
}

export type Toast = { id: number; tipo: "sucesso" | "aviso" | "erro" | "info"; mensagem: string };

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: number) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 380,
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.max(0, 100 - (elapsed / 3000) * 100);
      setProgress(p);
      if (p > 0) raf = requestAnimationFrame(tick);
      else onClose();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onClose]);
  const cfg = {
    sucesso: { bg: "var(--green)", Icon: CheckCircle },
    aviso: { bg: "var(--orange-mid)", Icon: AlertCircle },
    erro: { bg: "var(--red)", Icon: XCircle },
    info: { bg: "var(--blue)", Icon: Info },
  }[toast.tipo];
  const Icon = cfg.Icon;
  return (
    <div
      style={{
        background: cfg.bg,
        color: "#fff",
        padding: "12px 14px",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        animation: "slideInToast 200ms ease-out",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Icon size={20} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{toast.mensagem}</span>
      <button onClick={onClose} aria-label="Fechar" style={{ color: "#fff", opacity: 0.8 }}>
        <X size={16} />
      </button>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 2,
          background: "rgba(255,255,255,0.5)",
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="kx-fade-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
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
          background: "var(--card)",
          borderRadius: 24,
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{ position: "absolute", top: 16, right: 16, color: "var(--ink-3)", zIndex: 1 }}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    Pago: { bg: "var(--green-light)", fg: "var(--green)" },
    Pendente: { bg: "var(--gold-light)", fg: "var(--orange-mid)" },
    "Em atraso": { bg: "var(--red-light)", fg: "var(--red)" },
    Recebido: { bg: "var(--green-light)", fg: "var(--green)" },
    Enviado: { bg: "var(--blue-light)", fg: "var(--blue)" },
    Recuperado: { bg: "var(--green-light)", fg: "var(--green)" },
  };
  const c = map[status] || { bg: "var(--surface-2)", fg: "var(--ink-2)" };
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
      {status}
    </span>
  );
}

export function GeoQR({ seed }: { seed: string }) {
  // deterministic pattern from seed
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < 144; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 1) === 1);
  }
  return (
    <svg width="140" height="140" viewBox="0 0 12 12">
      <rect width="12" height="12" fill="#fff" />
      {cells.map(
        (on, i) =>
          on && (
            <rect key={i} x={i % 12} y={Math.floor(i / 12)} width="1" height="1" fill="#0F0F0F" />
          ),
      )}
      {[
        [0, 0],
        [9, 0],
        [0, 9],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="3" height="3" fill="#0F0F0F" />
          <rect x={x + 0.6} y={y + 0.6} width="1.8" height="1.8" fill="#fff" />
          <rect x={x + 1} y={y + 1} width="1" height="1" fill="#0F0F0F" />
        </g>
      ))}
    </svg>
  );
}
