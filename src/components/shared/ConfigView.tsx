import { useState } from "react";

import { Avatar } from "@/components/kixipay/shared";
import type { ToastFn } from "./AppLayout";

export function ConfigView({ toast, isMember }: { toast: ToastFn; isMember?: boolean }) {
  const tabs = isMember
    ? [
        { id: "perfil" as const, l: "Perfil" },
        { id: "notif" as const, l: "Notificações" },
      ]
    : [
        { id: "perfil" as const, l: "Perfil" },
        { id: "grupo" as const, l: "Grupo" },
        { id: "notif" as const, l: "Notificações" },
        { id: "plano" as const, l: "Plano" },
      ];
  const [tab, setTab] = useState<"perfil" | "grupo" | "notif" | "plano">(tabs[0].id);
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>
        Configurações
      </h1>
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            style={{
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: tab === t.id ? "var(--brand)" : "var(--ink-3)",
              borderBottom: `2px solid ${tab === t.id ? "var(--brand)" : "transparent"}`,
              marginBottom: -1,
              whiteSpace: "nowrap",
            }}
          >
            {t.l}
          </button>
        ))}
      </div>
      <div className="kx-card" style={{ padding: 28, maxWidth: 640 }}>
        {tab === "perfil" && <ConfigPerfil toast={toast} />}
        {tab === "grupo" && <ConfigGrupo toast={toast} />}
        {tab === "notif" && <ConfigNotif />}
        {tab === "plano" && <ConfigPlano />}
      </div>
    </div>
  );
}

function ConfigPerfil({ toast }: { toast: ToastFn }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <Avatar iniciais="--" cor="#FF5C1A" size={64} />
      </div>
      <Field l="Nome completo">
        <input className="kx-input" placeholder="O seu nome" />
      </Field>
      <Field l="Telemóvel">
        <input className="kx-input" placeholder="+244 9XX XXX XXX" />
      </Field>
      <Field l="Email (opcional)">
        <input className="kx-input" placeholder="exemplo@kixipay.ao" />
      </Field>
      <button
        onClick={() => toast("aviso", "API de perfil não disponível")}
        className="kx-btn kx-btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        Guardar alterações
      </button>
    </div>
  );
}

function ConfigGrupo({ toast }: { toast: ToastFn }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field l="Nome do grupo">
        <input className="kx-input" placeholder="Nome do grupo" />
      </Field>
      <Field l="Valor mensal (Kz)">
        <input className="kx-input" placeholder="5000" />
      </Field>
      <Field l="Dia de corte">
        <select className="kx-input">
          {[15, 20, 25, 30].map((d) => (
            <option key={d}>Dia {d} de cada mês</option>
          ))}
        </select>
      </Field>
      <button
        onClick={() => toast("aviso", "API de configurações não disponível")}
        className="kx-btn kx-btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        Guardar alterações
      </button>
    </div>
  );
}

function ConfigNotif() {
  const [opts, setOpts] = useState<Record<string, boolean>>({
    sms_conf: true,
    lembrete_5: true,
    aviso_atraso: true,
    conf_receb: true,
    relatorio: false,
  });
  const items = [
    { k: "sms_conf", l: "SMS de confirmação" },
    { k: "lembrete_5", l: "Lembrete 5 dias antes" },
    { k: "aviso_atraso", l: "Aviso de atraso" },
    { k: "conf_receb", l: "Confirmação de recebimento" },
    { k: "relatorio", l: "Relatório mensal" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((it) => (
        <div
          key={it.k}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px solid var(--border-soft)",
          }}
        >
          <span style={{ fontWeight: 500 }}>{it.l}</span>
          <div
            className={`kx-switch ${opts[it.k] ? "on" : ""}`}
            onClick={() => setOpts((o) => ({ ...o, [it.k]: !o[it.k] }))}
          />
        </div>
      ))}
    </div>
  );
}

function ConfigPlano() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "var(--surface)",
          padding: 20,
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <h3 className="kx-display" style={{ fontSize: 22, marginTop: 8 }}>
          Dados de plano indisponíveis
        </h3>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 8 }}>
          Consulte a API para informações do plano
        </div>
      </div>
    </div>
  );
}

function Field({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--ink-2)",
          display: "block",
          marginBottom: 6,
        }}
      >
        {l}
      </label>
      {children}
    </div>
  );
}
