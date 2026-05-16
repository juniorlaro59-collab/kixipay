import { useState } from "react";
import { StatusBadge } from "@/components/kixipay/shared";
import { fmtKz } from "@/components/kixipay/data";

export function HistoricoView({ membroNome }: { membroNome?: string }) {
  const [periodo, setPeriodo] = useState("mes");
  const [tipo, setTipo] = useState<"todos" | "Contribuição" | "Recebimento" | "Lembrete SMS">(
    "todos",
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 className="kx-display" style={{ fontSize: 26 }}>
        Histórico de transacções
      </h1>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="kx-input"
          style={{ width: "auto" }}
        >
          <option value="mes">Este mês</option>
          <option value="trimestre">Último trimestre</option>
          <option value="2025">2025</option>
          <option value="tudo">Tudo</option>
        </select>
        <div style={{ display: "flex", gap: 6 }}>
          {(["todos", "Contribuição", "Recebimento", "Lembrete SMS"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className="kx-pill"
              style={{
                background: tipo === t ? "var(--brand)" : "var(--surface-2)",
                color: tipo === t ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
              }}
            >
              {t === "todos" ? "Todos" : t}
            </button>
          ))}
        </div>
      </div>
      <div className="kx-card" style={{ padding: 24 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Movimentos no período
        </div>
        <div
          style={{
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink-3)",
            fontSize: 13,
          }}
        >
          Dados históricos indisponíveis
        </div>
      </div>
      <div className="kx-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                {["Data", "Membro", "Tipo", "Valor", "Referência", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 14px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--ink-3)",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--ink-3)",
                    fontSize: 13,
                  }}
                >
                  Nenhuma transacção encontrada
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
