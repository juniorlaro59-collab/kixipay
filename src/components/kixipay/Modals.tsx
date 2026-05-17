import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, GeoQR, Logo } from "./shared";
import { fmtKz, eligivel, scoreLabel } from "./data";
import type { Membro } from "./data";
import { Check, Copy, User, Smartphone, LogIn, UserPlus, Shield, Eye, EyeOff } from "lucide-react";
import { loginSchema, registerSchema } from "@/lib/validations";
import type { LoginFormData, RegisterFormData } from "@/lib/validations";
import { login, register } from "@/services";
import type { LoginResult } from "@/services";
import { getApiErrorMessage } from "@/services/client";

export function AuthModal({
  open,
  onClose,
  onLogin,
  toast,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: (result: LoginResult) => void;
  toast?: (tipo: "sucesso" | "aviso" | "erro" | "info", mensagem: string) => void;
}) {
  const [tab, setTab] = useState<"entrar" | "criar">("entrar");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const authRequestRef = useRef(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { telefone: "", pin: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      biNumber: "",
      pin: "",
      pinConfirm: "",
      termos: true,
    },
  });

 const handleLogin = async (data: LoginFormData) => {
  if (authRequestRef.current) return;

  authRequestRef.current = true;
  setLoading(true);
  setLoadingMsg("A verificar credenciais...");
  loginForm.clearErrors("root");

  try {
    const result = await login(data.telefone, data.pin);
    onLogin(result);
} catch (err) {
  const msg = getApiErrorMessage(err, "Não foi possível iniciar sessão");

  console.error("[LOGIN ERROR]", msg);

  loginForm.setError("root", { message: msg });
  toast?.("erro", msg);
  } finally {
    authRequestRef.current = false;
    setLoading(false);
    setLoadingMsg("");
  }
};

const handleRegister = async (data: RegisterFormData) => {
  if (authRequestRef.current) return;

  authRequestRef.current = true;
  setLoading(true);
  setLoadingMsg("A criar conta...");
  registerForm.clearErrors("root");

  try {
    const result = await register(data.nome, data.telefone, data.pin, data.biNumber);
    onLogin(result);
  } catch (err) {
  const msg = getApiErrorMessage(err, "Não foi possível criar conta");

  console.error("[REGISTER ERROR]", msg);

  registerForm.setError("root", { message: msg });
  toast?.("erro", msg);
  } finally {
    authRequestRef.current = false;
    setLoading(false);
    setLoadingMsg("");
  }
};

  const FormField = ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: React.ReactNode;
  }) => (
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
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 11, color: "var(--red)", marginTop: 4, display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );

  const RootError = ({ message }: { message?: string }) =>
    message ? (
      <div
        style={{
          padding: "10px 14px",
          background: "var(--red-light)",
          color: "var(--red)",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {message}
      </div>
    ) : null;

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
      type="button"
      disabled={loading}
      onClick={() => {
        if (loading) return;
        setTab(id);
        loginForm.clearErrors();
        registerForm.clearErrors();
      }}
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
        opacity: loading ? 0.7 : 1,
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
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <RootError message={loginForm.formState.errors.root?.message} />

            <FormField label="Telemóvel" error={loginForm.formState.errors.telefone?.message}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
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
                  style={{ border: "none", borderRadius: 0 }}
                  placeholder="9XX XXX XXX"
                  disabled={loading}
                  {...loginForm.register("telefone")}
                />
              </div>
            </FormField>

            <FormField label="Senha / PIN" error={loginForm.formState.errors.pin?.message}>
              <div style={{ position: "relative" }}>
                <input
                  className="kx-input"
                  style={{ paddingRight: 44 }}
                  type={showPin ? "text" : "password"}
                  placeholder="Mínimo 4 caracteres"
                  disabled={loading}
                  {...loginForm.register("pin")}
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 10,
                    color: "var(--ink-3)",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="kx-btn kx-btn-primary"
              style={{ width: "100%", height: 50, fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? loadingMsg : "Entrar no KixiPay"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <RootError message={registerForm.formState.errors.root?.message} />

            <FormField label="Nome completo" error={registerForm.formState.errors.nome?.message}>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-3)" }}
                />
                <input
                  className="kx-input"
                  placeholder="Ex: Maria João"
                  style={{ paddingLeft: 40 }}
                  disabled={loading}
                  {...registerForm.register("nome")}
                />
              </div>
            </FormField>

            <FormField label="Telemóvel" error={registerForm.formState.errors.telefone?.message}>
              <div style={{ position: "relative" }}>
                <Smartphone
                  size={16}
                  style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-3)" }}
                />
                <input
                  className="kx-input"
                  placeholder="+244 9XX XXX XXX"
                  style={{ paddingLeft: 40 }}
                  disabled={loading}
                  {...registerForm.register("telefone")}
                />
              </div>
            </FormField>

            <FormField label="Número do BI" error={registerForm.formState.errors.biNumber?.message}>
              <input
                className="kx-input"
                placeholder="Ex: 000000000LA000"
                style={{ textTransform: "uppercase" }}
                disabled={loading}
                {...registerForm.register("biNumber")}
              />
            </FormField>

            <FormField label="Criar senha" error={registerForm.formState.errors.pin?.message}>
              <input
                className="kx-input"
                type="password"
                placeholder="Mínimo 4 caracteres"
                disabled={loading}
                {...registerForm.register("pin")}
              />
            </FormField>

            <FormField
              label="Confirmar senha"
              error={registerForm.formState.errors.pinConfirm?.message}
            >
              <input
                className="kx-input"
                type="password"
                placeholder="Repetir senha"
                disabled={loading}
                {...registerForm.register("pinConfirm")}
              />
            </FormField>

            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--ink-2)",
                  cursor: loading ? "not-allowed" : "pointer",
                  padding: "6px 0",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <input
                  type="checkbox"
                  disabled={loading}
                  {...registerForm.register("termos")}
                  style={{ width: 18, height: 18, accentColor: "var(--brand)" }}
                />
                Aceito os{" "}
                <a href="#" style={{ color: "var(--brand)", textDecoration: "none" }}>
                  termos e condições
                </a>
              </label>
              {registerForm.formState.errors.termos && (
                <span style={{ fontSize: 11, color: "var(--red)" }}>
                  {registerForm.formState.errors.termos.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="kx-btn kx-btn-primary"
              style={{ width: "100%", height: 50, fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? loadingMsg : "Criar conta grátis"}
            </button>
          </form>
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
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");
  const contributionRequestRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contributionRequestRef.current) return;

    if (!ref.trim()) {
      setError("Indique a referência da transferência");
      return;
    }

    contributionRequestRef.current = true;
    setLoading(true);
    setError("");

    try {
      const { getGrupo, getCurrentCycle, registerContribution } = await import("@/services");

      const grupo = await getGrupo();
      const cycle = await getCurrentCycle(grupo.id);

      await registerContribution({
        cycleId: cycle.id,
        transactionReference: ref.trim(),
      });

      setRef("");
      onConfirm("Contribuição registada com sucesso ✓");
    } catch (err) {
      setError(getApiErrorMessage(err, "Erro ao registar contribuição"));
    } finally {
      contributionRequestRef.current = false;
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 20 }}>
          Registar Contribuição
        </h2>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--red-light)",
              color: "var(--red)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <label style={{ fontSize: 13, fontWeight: 600 }}>Referência da transferência</label>

        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          className="kx-input kx-mono"
          placeholder="Ex: TRF-202605-001"
          disabled={loading}
          style={{ marginTop: 6, marginBottom: 20 }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="kx-btn kx-btn-outline"
            style={{ flex: 1, opacity: loading ? 0.5 : 1 }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="kx-btn kx-btn-primary"
            style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "A registar..." : "Confirmar pagamento"}
          </button>
        </div>
      </form>
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
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [biNumber, setBiNumber] = useState("");
  const [error, setError] = useState("");
  const addMemberRequestRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addMemberRequestRef.current) return;

    if (!nome.trim() || !telefone.trim() || !biNumber.trim()) {
      setError("Preencha nome, telefone e BI");
      return;
    }

    addMemberRequestRef.current = true;
    setLoading(true);
    setError("");

    try {
      const { cadastrarMembro } = await import("@/services");

      await cadastrarMembro({
        nome: nome.trim(),
        telefone: telefone.trim(),
        biNumber: biNumber.trim().toUpperCase(),
        regiao: "",
      });

      const nomeCriado = nome.trim();

      setNome("");
      setTelefone("");
      setBiNumber("");

      onConfirm(`${nomeCriado} cadastrado com sucesso ✓`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Erro ao cadastrar membro"));
    } finally {
      addMemberRequestRef.current = false;
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 20 }}>
          Adicionar membro ao grupo
        </h2>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--red-light)",
              color: "var(--red)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="kx-input"
          placeholder="Nome completo"
          disabled={loading}
          style={{ marginBottom: 12 }}
        />

        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="kx-input"
          placeholder="+244 9XX XXX XXX"
          disabled={loading}
          style={{ marginBottom: 12 }}
        />

        <input
          value={biNumber}
          onChange={(e) => setBiNumber(e.target.value.toUpperCase())}
          className="kx-input"
          placeholder="BI: 000000000LA000"
          disabled={loading}
          style={{ marginBottom: 12, textTransform: "uppercase" }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="kx-btn kx-btn-outline"
            style={{ flex: 1, opacity: loading ? 0.5 : 1 }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="kx-btn kx-btn-primary"
            style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "A cadastrar..." : "Adicionar ao grupo"}
          </button>
        </div>
      </form>
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
      <div style={{ padding: 32, textAlign: "center" }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 16 }}>
          Confirmar Recebimento
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
          Confirma que o pagamento foi recebido?
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} className="kx-btn kx-btn-outline" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="kx-btn kx-btn-green" style={{ flex: 1 }}>
            ✓ Confirmar recebimento
          </button>
        </div>
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