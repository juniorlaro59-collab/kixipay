import { useState } from "react";
import { Modal, Avatar, GeoQR, Logo } from "./shared";
import { MEMBROS, fmtKz, eligivel, scoreLabel } from "./data";
import type { Membro } from "./data";
import { Check, Copy, User, Smartphone, LogIn, UserPlus, Shield, ArrowRight } from "lucide-react";

export function AuthModal({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: (user: "conceicao" | "manuel") => void;
}) {
  const [tab, setTab] = useState<"entrar" | "criar">("entrar");
  const [phone, setPhone] = useState("");
  const [nome, setNome] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinReg, setPinReg] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [termos, setTermos] = useState(true);

  const pinId = (i: number) => `auth-pin-${i}`;
  const setPinAt = (arr: string[], set: (v: string[]) => void, i: number, v: string) => {
    const next = [...arr];
    next[i] = v.slice(-1);
    set(next);
    if (v && i < 3) document.getElementById(pinId(i + 1))?.focus();
  };
  const handlePinKey = (arr: string[], i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !arr[i] && i > 0) document.getElementById(pinId(i - 1))?.focus();
  };

  const determineUser = () => {
    const p = phone.replace(/\s/g, "");
    if (p.includes("912345678") || p.includes("912 345 678")) return "manuel";
    return "conceicao";
  };
  const fakeLogin = (who?: "conceicao" | "manuel") => {
    setLoading(true);
    const user = who || determineUser();
    setTimeout(() => {
      setLoading(false);
      onLogin(user);
    }, 1200);
  };

  const PinRow = ({
    values,
    setter,
    label,
  }: {
    values: string[];
    setter: (v: string[]) => void;
    label?: string;
  }) => (
    <div>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-2)",
            display: "block",
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {values.map((d, i) => (
          <input
            key={i}
            id={pinId(i)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setPinAt(values, setter, i, e.target.value)}
            onKeyDown={(e) => handlePinKey(values, i, e)}
            style={{
              width: 56,
              height: 58,
              textAlign: "center",
              fontSize: 22,
              fontFamily: "var(--font-num)",
              fontWeight: 700,
              border: "2px solid",
              borderRadius: 14,
              borderColor: d ? "var(--brand)" : "var(--border)",
              background: d ? "var(--brand-light)" : "var(--card)",
              color: "var(--ink)",
              outline: "none",
              transition: "all 200ms",
            }}
          />
        ))}
      </div>
    </div>
  );

  const TabBtn = ({
    id,
    label,
    icon: Icon,
  }: {
    id: typeof tab;
    label: string;
    icon: typeof User;
  }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 12,
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 14,
        position: "relative",
        background: tab === id ? "var(--card)" : "transparent",
        color: tab === id ? "var(--ink)" : "var(--ink-3)",
        boxShadow: tab === id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
        transition: "all 200ms",
      }}
    >
      <Icon size={18} color={tab === id ? "var(--brand)" : "var(--ink-3)"} />
      {label}
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} width={440}>
      <div style={{ padding: "36px 32px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Logo size={24} />
          </div>
          <h2 className="kx-display" style={{ fontSize: 24, marginBottom: 4 }}>
            {tab === "entrar" ? "Entrar no KixiPay" : "Criar conta"}
          </h2>
          <p style={{ color: "var(--ink-3)", fontSize: 14, margin: 0 }}>
            {tab === "entrar"
              ? "Acede à tua kixikila digital"
              : "Junta-te à maior rede de kixikilas de Angola"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            background: "var(--surface-2)",
            padding: 4,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <TabBtn id="entrar" label="Entrar" icon={LogIn} />
          <TabBtn id="criar" label="Criar conta" icon={UserPlus} />
        </div>

        {tab === "entrar" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                Telemóvel
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 200ms",
                }}
                onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "12px 14px",
                    color: "var(--ink-2)",
                    fontWeight: 600,
                    fontSize: 14,
                    background: "var(--surface)",
                    borderRight: "1px solid var(--border)",
                  }}
                >
                  <Smartphone size={16} color="var(--brand)" /> +244
                </span>
                <input
                  className="kx-input"
                  style={{ border: "none", background: "transparent", borderRadius: 0 }}
                  placeholder="9XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <PinRow values={pin} setter={setPin} label="PIN de acesso" />

            <button
              onClick={() => fakeLogin()}
              disabled={loading}
              className="kx-btn kx-btn-primary"
              style={{ width: "100%", height: 50, fontSize: 15, marginTop: 4 }}
            >
              {loading ? "A entrar..." : "Entrar no KixiPay"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "var(--ink-3)",
                fontSize: 12,
                margin: "4px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>ou entra como demo</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <button
              onClick={() => fakeLogin("conceicao")}
              className="kx-btn"
              style={{
                width: "100%",
                background: "var(--brand-light)",
                color: "var(--brand-dark)",
                fontWeight: 600,
                height: 48,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Avatar iniciais="CM" cor="#FF5C1A" size={32} />
              <span style={{ flex: 1, textAlign: "left" }}>
                Demo como <strong>Coordenadora</strong>
              </span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => fakeLogin("manuel")}
              className="kx-btn"
              style={{
                width: "100%",
                background: "var(--blue-light)",
                color: "var(--blue)",
                fontWeight: 600,
                height: 48,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Avatar iniciais="MJ" cor="#1D4ED8" size={32} />
              <span style={{ flex: 1, textAlign: "left" }}>
                Demo como <strong>Membro</strong>
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                Nome completo
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-3)" }}
                />
                <input
                  className="kx-input"
                  placeholder="Ex: Maria João"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>
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
                Telemóvel
              </label>
              <div style={{ position: "relative" }}>
                <Smartphone
                  size={16}
                  style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-3)" }}
                />
                <input
                  className="kx-input"
                  placeholder="+244 9XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>
            <PinRow values={pinReg} setter={setPinReg} label="Criar PIN (4 dígitos)" />
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--ink-2)",
                  cursor: "pointer",
                  padding: "6px 0",
                }}
              >
                <div
                  onClick={() => setTermos(!termos)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: "2px solid var(--border)",
                    background: termos ? "var(--brand)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 200ms",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {termos && <Check size={14} color="#fff" />}
                </div>
                Aceito os{" "}
                <a href="#" style={{ color: "var(--brand)", textDecoration: "none" }}>
                  termos e condições
                </a>
              </label>
            </div>
            <button
              onClick={() => fakeLogin()}
              disabled={loading}
              className="kx-btn kx-btn-primary"
              style={{ width: "100%", height: 50, fontSize: 15, marginTop: 4 }}
            >
              {loading ? "A criar conta..." : "Criar conta grátis"}
            </button>
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid var(--border-soft)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--ink-4)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Shield size={12} /> Dados seguros
          </span>
          <span>🔒 Criptografia ponta-a-ponta</span>
        </div>
      </div>
    </Modal>
  );
}

export function ContribuicaoModal({
  open,
  onClose,
  onConfirm,
  prefill,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (msg: string) => void;
  prefill?: Membro | null;
}) {
  const [memId, setMemId] = useState<number>(prefill?.id ?? MEMBROS[0].id);
  const mem = MEMBROS.find((m) => m.id === memId)!;
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 20 }}>
          Registar Contribuição
        </h2>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Membro</label>
        <select
          value={memId}
          onChange={(e) => setMemId(+e.target.value)}
          className="kx-input"
          style={{ marginTop: 6, marginBottom: 14 }}
        >
          {MEMBROS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Valor (Kz)</label>
        <input
          className="kx-input"
          defaultValue="5000"
          style={{ marginTop: 6, marginBottom: 14 }}
        />
        <label style={{ fontSize: 13, fontWeight: 600 }}>Data</label>
        <input
          className="kx-input"
          type="date"
          defaultValue="2026-05-15"
          style={{ marginTop: 6, marginBottom: 14 }}
        />
        <label style={{ fontSize: 13, fontWeight: 600 }}>Método</label>
        <select className="kx-input" style={{ marginTop: 6, marginBottom: 14 }}>
          <option>App</option>
          <option>USSD</option>
          <option>Dinheiro presencial</option>
        </select>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Notas (opcional)</label>
        <textarea
          className="kx-input"
          rows={2}
          style={{ marginTop: 6, marginBottom: 20, resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} className="kx-btn kx-btn-outline" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(`Pagamento de ${mem.nome} confirmado ✓ +5.000 Kz`)}
            className="kx-btn kx-btn-primary"
            style={{ flex: 1 }}
          >
            Confirmar pagamento
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function AddMembroModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (msg: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 20 }}>
          Adicionar membro ao grupo
        </h2>
        <input className="kx-input" placeholder="Nome completo" style={{ marginBottom: 12 }} />
        <input className="kx-input" placeholder="+244 9XX XXX XXX" style={{ marginBottom: 12 }} />
        <input className="kx-input" placeholder="Email (opcional)" style={{ marginBottom: 12 }} />
        <select className="kx-input" style={{ marginBottom: 20 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i}>Posição {i + 1}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} className="kx-btn kx-btn-outline" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button
            onClick={() => onConfirm("Novo membro adicionado ✓ SMS de boas-vindas enviado")}
            className="kx-btn kx-btn-primary"
            style={{ flex: 1 }}
          >
            Adicionar ao grupo
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmarPagamentoModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 16 }}>
          Confirmar Pagamento ao Manuel Jacinto
        </h2>
        <div
          style={{
            background: "var(--surface)",
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Avatar iniciais="MJ" cor="#1D4ED8" size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Manuel Jacinto</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
              7º na rotação · 1 de Junho 2026
            </div>
          </div>
          <div className="kx-num" style={{ fontSize: 22, color: "var(--green)" }}>
            {fmtKz(60000)}
          </div>
        </div>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          Referência de transferência (opcional)
        </label>
        <input
          className="kx-input"
          placeholder="Ex: TRF-202605-001"
          style={{ marginTop: 6, marginBottom: 20 }}
        />
        <button
          onClick={onConfirm}
          className="kx-btn kx-btn-green"
          style={{ width: "100%", height: 48 }}
        >
          ✓ Confirmar recebimento
        </button>
      </div>
    </Modal>
  );
}

export function RecomendacaoModal({
  open,
  onClose,
  membro,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  membro: Membro | null;
  onSend: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!membro) return null;
  const el = eligivel(membro.score);
  const code = `KXP-VRFC-${membro.score}-2026-${membro.iniciais}`;
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 4 }}>
          Relatório de Elegibilidade
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 20 }}>{membro.nome}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <Stat label="KixiScore" valor={String(membro.score)} cor="var(--gold)" />
          <Stat label="Nível" valor={scoreLabel(membro.score)} />
          <Stat label="Meses" valor={String(membro.meses)} />
          <Stat label="Pontualidade" valor={`${membro.pontualidade}%`} cor="var(--green)" />
        </div>
        <div
          style={{
            background: "var(--blue-light)",
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>
            Elegível para crédito até
          </div>
          <div className="kx-num" style={{ fontSize: 24, color: "var(--blue)" }}>
            {el.ok ? fmtKz(el.limite) : "Não elegível ainda"}
          </div>
          {el.ok && (
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>
              Banco recomendado: {el.banco}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <GeoQR seed={code} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <code
            className="kx-mono"
            style={{
              flex: 1,
              padding: 10,
              background: "var(--surface)",
              borderRadius: 8,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {code}
          </code>
          <button
            className="kx-btn kx-btn-outline kx-btn-sm"
            onClick={() => {
              navigator.clipboard?.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <select className="kx-input" style={{ marginBottom: 14 }}>
          <option>BFA</option>
          <option>Atlântico</option>
          <option>BAI</option>
          <option>SOL</option>
        </select>
        <button
          onClick={onSend}
          className="kx-btn kx-btn-blue"
          style={{ width: "100%", height: 48 }}
        >
          Enviar relatório ao banco
        </button>
      </div>
    </Modal>
  );
}

function Stat({ label, valor, cor }: { label: string; valor: string; cor?: string }) {
  return (
    <div style={{ background: "var(--surface)", padding: 12, borderRadius: 10 }}>
      <div
        style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase" }}
      >
        {label}
      </div>
      <div className="kx-num" style={{ fontSize: 18, color: cor || "var(--ink)", marginTop: 2 }}>
        {valor}
      </div>
    </div>
  );
}
