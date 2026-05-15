import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Avatar, GeoQR, Logo } from "./shared";
import { MEMBROS, fmtKz, eligivel, scoreLabel } from "./data";
import type { Membro, UserId } from "./data";
import {
  Check,
  Copy,
  User,
  Smartphone,
  LogIn,
  UserPlus,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  loginSchema,
  registerSchema,
  contribuicaoSchema,
  addMembroSchema,
} from "@/lib/validations";
import type {
  LoginFormData,
  RegisterFormData,
  ContribuicaoFormData,
  AddMembroFormData,
} from "@/lib/validations";
import { login, registrarContribuicao, addMembro } from "@/services";

export function AuthModal({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: (user: UserId) => void;
}) {
  const [tab, setTab] = useState<"entrar" | "criar">("entrar");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { telefone: "", pin: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", telefone: "", pin: "", pinConfirm: "", termos: true },
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setLoadingMsg("A verificar credenciais...");
    try {
      const result = await login(data);
      onLogin(result.userId);
    } catch (err) {
      loginForm.setError("root", { message: "Credenciais inválidas. Tente novamente." });
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setLoadingMsg("A criar conta...");
    try {
      const result = await login({ telefone: data.telefone, pin: data.pin });
      onLogin(result.userId);
    } catch (err) {
      registerForm.setError("root", { message: "Erro ao criar conta. Tente novamente." });
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const fakeLogin = async (who: UserId) => {
    setLoading(true);
    setLoadingMsg("A entrar como demo...");
    try {
      const phones: Record<UserId, string> = {
        conceicao: "923456789",
        manuel: "912345678",
        admin: "900000001",
        agente1: "900000002",
        agente2: "900000003",
      };
      const result = await login({
        telefone: phones[who] || "923456789",
        pin: "0000",
      });
      onLogin(result.userId);
    } finally {
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
                  {...loginForm.register("telefone")}
                />
              </div>
            </FormField>

            <FormField label="PIN de acesso" error={loginForm.formState.errors.pin?.message}>
              <div style={{ position: "relative" }}>
                <input
                  className="kx-input"
                  style={{ paddingRight: 44 }}
                  type={showPin ? "text" : "password"}
                  placeholder="4 dígitos"
                  maxLength={4}
                  inputMode="numeric"
                  {...loginForm.register("pin")}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{ position: "absolute", right: 12, top: 10, color: "var(--ink-3)" }}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="kx-btn kx-btn-primary"
              style={{ width: "100%", height: 50, fontSize: 15, marginTop: 4 }}
            >
              {loading ? loadingMsg : "Entrar no KixiPay"}
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
              type="button"
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
              type="button"
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
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => fakeLogin("admin")}
                className="kx-btn"
                style={{
                  flex: 1,
                  background: "rgba(139,92,246,0.12)",
                  color: "#8B5CF6",
                  fontWeight: 600,
                  height: 44,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <Shield size={16} /> Admin
              </button>
              <button
                type="button"
                onClick={() => fakeLogin("agente1")}
                className="kx-btn"
                style={{
                  flex: 1,
                  background: "rgba(6,182,212,0.12)",
                  color: "#06B6D4",
                  fontWeight: 600,
                  height: 44,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <User size={16} /> Agente
              </button>
            </div>
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
                  {...registerForm.register("telefone")}
                />
              </div>
            </FormField>

            <FormField
              label="Criar PIN (4 dígitos)"
              error={registerForm.formState.errors.pin?.message}
            >
              <input
                className="kx-input"
                type="password"
                placeholder="4 dígitos"
                maxLength={4}
                inputMode="numeric"
                {...registerForm.register("pin")}
              />
            </FormField>

            <FormField
              label="Confirmar PIN"
              error={registerForm.formState.errors.pinConfirm?.message}
            >
              <input
                className="kx-input"
                type="password"
                placeholder="Repetir PIN"
                maxLength={4}
                inputMode="numeric"
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
                  cursor: "pointer",
                  padding: "6px 0",
                }}
              >
                <input
                  type="checkbox"
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
              style={{ width: "100%", height: 50, fontSize: 15, marginTop: 4 }}
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
  prefill,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (msg: string) => void;
  prefill?: Membro | null;
}) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ContribuicaoFormData>({
    resolver: zodResolver(contribuicaoSchema),
    defaultValues: {
      membroId: prefill?.id ?? MEMBROS[0].id,
      valor: 5000,
      data: "2026-05-15",
      metodo: "App",
    },
  });
  const onSubmit = async (data: ContribuicaoFormData) => {
    setLoading(true);
    try {
      await registrarContribuicao(data);
      onConfirm(`Pagamento de ${fmtKz(data.valor)} registado com sucesso ✓`);
    } catch {
      setError("root", { message: "Erro ao registar contribuição. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };
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
          marginBottom: 16,
        }}
      >
        {message}
      </div>
    ) : null;
  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 20 }}>
          Registar Contribuição
        </h2>
        <RootError message={errors.root?.message} />
        <label style={{ fontSize: 13, fontWeight: 600 }}>Membro</label>
        <select
          {...register("membroId", { valueAsNumber: true })}
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
          {...register("valor", { valueAsNumber: true })}
          className="kx-input"
          style={{ marginTop: 6, marginBottom: 14 }}
        />
        {errors.valor && (
          <span style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 8 }}>
            {errors.valor.message}
          </span>
        )}
        <label style={{ fontSize: 13, fontWeight: 600 }}>Data</label>
        <input
          {...register("data")}
          type="date"
          className="kx-input"
          style={{ marginTop: 6, marginBottom: 14 }}
        />
        {errors.data && (
          <span style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 8 }}>
            {errors.data.message}
          </span>
        )}
        <label style={{ fontSize: 13, fontWeight: 600 }}>Método</label>
        <select
          {...register("metodo")}
          className="kx-input"
          style={{ marginTop: 6, marginBottom: 14 }}
        >
          <option value="App">App</option>
          <option value="USSD">USSD</option>
          <option value="Dinheiro presencial">Dinheiro presencial</option>
        </select>
        {errors.metodo && (
          <span style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 8 }}>
            {errors.metodo.message}
          </span>
        )}
        <label style={{ fontSize: 13, fontWeight: 600 }}>Notas (opcional)</label>
        <textarea
          {...register("notas")}
          className="kx-input"
          rows={2}
          style={{ marginTop: 6, marginBottom: 20, resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            className="kx-btn kx-btn-outline"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="kx-btn kx-btn-primary"
            style={{ flex: 1 }}
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<AddMembroFormData>({
    resolver: zodResolver(addMembroSchema),
    defaultValues: { nome: "", telefone: "", email: "", posicao: 1 },
  });
  const onSubmit = async (data: AddMembroFormData) => {
    setLoading(true);
    try {
      await addMembro(data);
      onConfirm(`${data.nome} adicionado ao grupo ✓ Convite enviado por SMS`);
    } catch {
      setError("root", { message: "Erro ao adicionar membro. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };
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
          marginBottom: 16,
        }}
      >
        {message}
      </div>
    ) : null;
  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 20 }}>
          Adicionar membro ao grupo
        </h2>
        <RootError message={errors.root?.message} />
        <input
          {...register("nome")}
          className="kx-input"
          placeholder="Nome completo"
          style={{ marginBottom: 12 }}
        />
        {errors.nome && (
          <span style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 8 }}>
            {errors.nome.message}
          </span>
        )}
        <input
          {...register("telefone")}
          className="kx-input"
          placeholder="+244 9XX XXX XXX"
          style={{ marginBottom: 12 }}
        />
        {errors.telefone && (
          <span style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 8 }}>
            {errors.telefone.message}
          </span>
        )}
        <input
          {...register("email")}
          className="kx-input"
          placeholder="Email (opcional)"
          style={{ marginBottom: 12 }}
        />
        <select
          {...register("posicao", { valueAsNumber: true })}
          className="kx-input"
          style={{ marginBottom: 20 }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Posição {i + 1}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            className="kx-btn kx-btn-outline"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="kx-btn kx-btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? "A adicionar..." : "Adicionar ao grupo"}
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
