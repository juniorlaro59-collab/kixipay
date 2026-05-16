import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { Check, Copy, Download, Building2, Users } from "lucide-react";
import { Avatar, ScoreRing, MiniScoreBar, GeoQR, EmptyState } from "@/components/kixipay/shared";
import { fmtKz, scoreColor, eligivel } from "@/components/kixipay/data";
import type { Membro } from "@/components/kixipay/data";
import type { ToastFn } from "./AppLayout";

export function KixiScoreView({ user, toast }: { user: Membro; toast: ToastFn }) {
  const [mode, setMode] = useState<"membro" | "grupo">("membro");
  return (
    <div>
      <div
        style={{
          display: "inline-flex",
          background: "var(--surface-2)",
          padding: 4,
          borderRadius: 100,
          marginBottom: 24,
        }}
      >
        {(["membro", "grupo"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "8px 20px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              background: mode === m ? "var(--card)" : "transparent",
              color: mode === m ? "var(--ink)" : "var(--ink-3)",
              boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
            }}
          >
            {m === "membro" ? "O meu score" : "Score do grupo"}
          </button>
        ))}
      </div>
      {mode === "membro" ? (
        <ScoreModoMembro user={user} toast={toast} />
      ) : (
        <ScoreModoGrupo toast={toast} />
      )}
    </div>
  );
}

function ScoreModoMembro({ user, toast }: { user: Membro; toast: ToastFn }) {
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const code = `KXP-VRFC-${user.score}-2026-${user.iniciais}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="kx-card" style={{ padding: 32, textAlign: "center" }}>
        <ScoreRing score={user.score} size={200} />
        <div style={{ marginTop: 16, color: "var(--gold)" }}>★★★★★ Pagador Exemplar</div>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        className="kx-kpi-grid"
      >
        <ScoreMetric
          label="Pontualidade"
          v={`${user.pontualidade}%`}
          sub="92% no prazo"
          pct={user.pontualidade}
          cor="var(--green)"
        />
        <ScoreMetric
          label="Meses activos"
          v={`${user.meses} meses`}
          sub="Histórico sólido"
          pct={(user.meses / 12) * 100}
          cor="var(--blue)"
        />
        <ScoreMetric
          label="Total poupado"
          v={fmtKz(user.totalPoupado)}
          sub="Valor acumulado"
          pct={80}
          cor="var(--brand)"
        />
      </div>
      <div className="kx-card" style={{ padding: 24, background: "var(--surface-2)" }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Como o score é calculado
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
          className="kx-formula"
        >
          {[
            { l: "Pontualidade", p: 50, v: "92%" },
            { l: "Tempo activo", p: 30, v: "67%" },
            { l: "Volume médio", p: 20, v: "80%" },
          ].map((b) => (
            <div
              key={b.l}
              title={`${b.l}: ${b.v} ponderado a ${b.p}%`}
              className="kx-card"
              style={{ padding: 16, background: "var(--card)" }}
            >
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>{b.l}</div>
              <div className="kx-num" style={{ fontSize: 22, marginTop: 4 }}>
                {b.v}
              </div>
              <div style={{ fontSize: 11, color: "var(--brand)", marginTop: 2 }}>Peso {b.p}%</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink-2)" }}>
          (92% × 0.5) + (67% × 0.3) + (80% × 0.2) = <strong>{user.score}</strong>
        </div>
      </div>
      <div className="kx-card" style={{ padding: 24 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          O que o score desbloqueia
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              min: 800,
              lvl: "Excelente",
              cor: "var(--green)",
              d: "Elegível para micro-crédito até 500.000 Kz · BFA · Atlântico · BAI",
            },
            {
              min: 600,
              lvl: "Bom",
              cor: "var(--blue)",
              d: "Conta poupança premium sem taxa de manutenção",
            },
            {
              min: 400,
              lvl: "Regular",
              cor: "var(--orange-mid)",
              d: "Membro verificado KixiPay com selo oficial",
            },
            {
              min: 0,
              lvl: "A construir",
              cor: "var(--ink-4)",
              d: "Continue a pagar no prazo para subir de nível",
            },
          ].map((l) => {
            const active = user.score >= l.min;
            return (
              <div
                key={l.lvl}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: `2px solid ${active ? l.cor : "var(--border-soft)"}`,
                  opacity: active ? 1 : 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: l.cor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {active ? <Check size={14} /> : "·"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: l.cor }}>
                    {l.lvl}{" "}
                    <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 6 }}>
                      ≥ {l.min}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{l.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button
        onClick={() => setShare(true)}
        className="kx-btn kx-btn-blue kx-btn-lg"
        style={{ alignSelf: "flex-start" }}
      >
        <Building2 size={16} /> Partilhar Score com o banco
      </button>
      {share && (
        <div
          onClick={() => setShare(false)}
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
              padding: 32,
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            <h3 className="kx-display" style={{ fontSize: 22, marginBottom: 12 }}>
              Partilhar KixiScore
            </h3>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <GeoQR seed={code} />
            </div>
            <code
              className="kx-mono"
              style={{
                display: "block",
                padding: 10,
                background: "var(--surface)",
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(code);
                setCopied(true);
                toast("sucesso", "Código copiado");
              }}
              className="kx-btn kx-btn-primary"
              style={{ width: "100%" }}
            >
              {copied ? (
                <>
                  <Check size={14} /> Copiado
                </>
              ) : (
                <>
                  <Copy size={14} /> Copiar código
                </>
              )}
            </button>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>
              Válido até 31 de Maio 2026
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreMetric({
  label,
  v,
  sub,
  pct,
  cor,
}: {
  label: string;
  v: string;
  sub: string;
  pct: number;
  cor: string;
}) {
  return (
    <div className="kx-card" style={{ padding: 20 }}>
      <div
        style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase" }}
      >
        {label}
      </div>
      <div className="kx-num" style={{ fontSize: 22, color: cor, marginTop: 4 }}>
        {v}
      </div>
      <div
        style={{
          height: 5,
          background: "var(--border-soft)",
          borderRadius: 3,
          marginTop: 8,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: cor }} />
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function ScoreModoGrupo({ toast }: { toast: ToastFn }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <EmptyState message="Dados de grupo não disponíveis sem lista de membros" icon={Users} />
    </div>
  );
}
