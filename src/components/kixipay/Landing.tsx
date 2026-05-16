import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Users,
  Smartphone,
  Eye,
  Coins,
  Check,
  Star,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Play,
  ArrowRight,
  Shield,
  Calendar,
  MapPin,
  Award,
} from "lucide-react";
import { Logo, Avatar, ScoreRing } from "./shared";

const NAV = [
  { id: "como-funciona", label: "Como funciona" },
  { id: "comunidade", label: "Comunidade" },
  { id: "kixiscore", label: "KixiScore" },
  { id: "bancos", label: "Para Bancos" },
  { id: "precos", label: "Preços" },
];

export function PublicNavbar({
  onAuth,
  onMenu,
  scrolled,
}: {
  onAuth: () => void;
  onMenu: () => void;
  scrolled: boolean;
}) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 68,
        zIndex: 100,
        background: "var(--card)",
        borderBottom: "1px solid var(--border-soft)",
        boxShadow: scrolled ? "0 2px 16px rgba(15,15,15,0.08)" : "none",
        transition: "box-shadow 200ms",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo />
        <div className="kx-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              style={{
                color: "var(--ink-2)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              {n.label}
            </a>
          ))}
        </div>
        <div className="kx-nav-cta" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="kx-btn kx-btn-outline" onClick={onAuth}>
            Entrar
          </button>
          <button className="kx-btn kx-btn-primary" onClick={onAuth}>
            Começar grátis
          </button>
        </div>
        <button
          className="kx-nav-burger"
          onClick={onMenu}
          aria-label="Menu"
          style={{ display: "none" }}
        >
          <Menu size={24} />
        </button>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .kx-nav-links, .kx-nav-cta { display: none !important; }
          .kx-nav-burger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

export function MobileMenu({
  open,
  onClose,
  onAuth,
}: {
  open: boolean;
  onClose: () => void;
  onAuth: () => void;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 280,
          background: "var(--card)",
          padding: 24,
          animation: "slideInRight 250ms ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Logo />
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={onClose}
            style={{
              display: "block",
              padding: "14px 0",
              color: "var(--ink)",
              fontWeight: 500,
              textDecoration: "none",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            {n.label}
          </a>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          <button
            className="kx-btn kx-btn-outline"
            onClick={() => {
              onAuth();
              onClose();
            }}
          >
            Entrar
          </button>
          <button
            className="kx-btn kx-btn-primary"
            onClick={() => {
              onAuth();
              onClose();
            }}
          >
            Começar grátis
          </button>
        </div>
      </div>
    </div>
  );
}

export function Hero({ onAuth }: { onAuth: () => void }) {
  return (
    <section
      style={{
        position: "relative",
        background: "var(--surface)",
        paddingTop: 140,
        paddingBottom: 100,
        overflow: "hidden",
      }}
      className="kx-pattern-overlay"
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 60,
          alignItems: "center",
        }}
        className="kx-hero-grid"
      >
        <div>
          <span
            className="kx-pill"
            style={{ background: "var(--brand-light)", color: "var(--brand)", fontWeight: 600 }}
          >
            Kixipay - A tua Kixikila
          </span>
          <h1
            className="kx-display"
            style={{ fontSize: "clamp(40px, 6vw, 72px)", margin: "20px 0" }}
          >
            <span style={{ color: "var(--ink)" }}>A tua kixikila.</span>
            <br />
            <span style={{ color: "var(--brand)" }}>Organizada.</span>
            <br />
            <span style={{ color: "var(--ink)" }}>Digital.</span>
            <br />
            <span style={{ color: "var(--gold)" }}>Poderosa.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", maxWidth: 520, lineHeight: 1.5 }}>
            Gere o teu grupo de poupança, regista cada contribuição e constrói o teu histórico
            financeiro — sem ir ao banco.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <button className="kx-btn kx-btn-primary kx-btn-lg" onClick={onAuth}>
              Criar o meu grupo grátis <ArrowRight size={18} />
            </button>
            <button className="kx-btn kx-btn-outline kx-btn-lg" onClick={onAuth}>
              <Play size={16} /> Ver demonstração
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32 }}>
            <div style={{ display: "flex" }}>
              {[
                { i: "CM", c: "#FF5C1A" },
                { i: "MJ", c: "#1D4ED8" },
                { i: "AP", c: "#16A34A" },
                { i: "JK", c: "#6D28D9" },
                { i: "EL", c: "#059669" },
              ].map((a, idx) => (
                <div
                  key={idx}
                  style={{
                    marginLeft: idx === 0 ? 0 : -8,
                    border: "2px solid var(--surface)",
                    borderRadius: "50%",
                  }}
                >
                  <Avatar iniciais={a.i} cor={a.c} size={36} />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 14, color: "var(--ink-2)", fontWeight: 500 }}>
              <strong style={{ color: "var(--ink)" }}>28.000+</strong> angolanos já poupam com o
              KixiPay
            </span>
          </div>
        </div>
        <HeroVisual />
      </div>
      <style>{`@media (max-width: 900px) { .kx-hero-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function HeroVisual() {
  return (
    <div style={{ position: "relative", minHeight: 480 }}>
      <div
        style={{
          background: "var(--card)",
          borderRadius: 16,
          boxShadow: "0 30px 60px rgba(15,15,15,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#F1ECE3",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
          <span
            style={{
              marginLeft: 12,
              fontSize: 12,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            kixipay.ao
          </span>
        </div>
        <div style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Saldo do grupo
              </div>
              <div className="kx-num" style={{ fontSize: 28, color: "var(--ink)" }}>
                185.000 Kz
              </div>
            </div>
            <div
              style={{
                background: "var(--green-light)",
                color: "var(--green)",
                padding: "4px 10px",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              ↑ +5.000 Kz
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MiniStat label="Membros" valor="12/12" cor="var(--blue)" />
            <MiniStat label="Pagas" valor="8/12" cor="var(--brand)" />
          </div>
          <div
            style={{ marginTop: 14, padding: 12, background: "var(--surface)", borderRadius: 12 }}
          >
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, marginBottom: 6 }}>
              Próximo a receber
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar iniciais="MJ" cor="#1D4ED8" size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Manuel Jacinto</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>7º na rotação</div>
              </div>
              <div className="kx-num" style={{ color: "var(--green)", fontSize: 16 }}>
                60.000 Kz
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          background: "var(--card)",
          borderRadius: 16,
          padding: "14px 16px",
          boxShadow: "0 10px 30px rgba(15,15,15,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          animation: "slideInCard 0.6s ease forwards, float 4s ease-in-out infinite 0.6s",
          opacity: 0,
        }}
      >
        <Avatar iniciais="MJ" cor="#1D4ED8" size={36} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Manuel recebeu 60.000 Kz</div>
          <div style={{ fontSize: 11, color: "var(--green)" }}>✓ Confirmado</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -10,
          left: -20,
          background: "var(--card)",
          borderRadius: 16,
          padding: "14px 16px",
          boxShadow: "0 10px 30px rgba(15,15,15,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          animation: "slideInCard 0.6s ease 0.5s forwards, float 4s ease-in-out infinite 1.1s",
          opacity: 0,
        }}
      >
        <ScoreRing score={847} size={56} animate={false} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>KixiScore 847</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Elegível para crédito</div>
        </div>
      </div>
    </div>
  );
}
function MiniStat({ label, valor, cor }: { label: string; valor: string; cor: string }) {
  return (
    <div style={{ background: "var(--surface)", padding: 10, borderRadius: 10 }}>
      <div
        style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase" }}
      >
        {label}
      </div>
      <div className="kx-num" style={{ fontSize: 18, color: cor }}>
        {valor}
      </div>
    </div>
  );
}

export function SocialProof() {
  const items = [
    { v: "2.400+", l: "Grupos activos" },
    { v: "890M Kz", l: "Geridos em 2025" },
    { v: "9/10", l: "Membros elegíveis para crédito" },
  ];
  return (
    <section style={{ background: "var(--dark-bg)", padding: "64px 24px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
        }}
        className="kx-proof-grid"
      >
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "12px 24px",
              borderLeft: i === 0 ? "none" : "1px solid var(--dark-border)",
            }}
          >
            <div
              className="kx-num"
              style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "var(--brand)" }}
            >
              {it.v}
            </div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>{it.l}</div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 700px) { .kx-proof-grid { grid-template-columns: 1fr !important; gap: 24px !important; } .kx-proof-grid > div { border-left: none !important; } }`}</style>
    </section>
  );
}

export function ComoFunciona() {
  const passos = [
    {
      Icon: Users,
      t: "Cria o grupo",
      d: "Define o valor mensal, adiciona os membros e estabelece a ordem de rotação. Leva 3 minutos.",
    },
    {
      Icon: Smartphone,
      t: "Todos contribuem",
      d: "Via app no browser ou por USSD (*920*55#) em qualquer telemóvel, mesmo sem internet.",
    },
    {
      Icon: Eye,
      t: "Transparência total",
      d: "Cada membro vê em tempo real quem pagou, quanto está no fundo e quando é a sua vez.",
    },
    {
      Icon: Coins,
      t: "Recebe o teu mês",
      d: "Na tua vez, recebes o total automaticamente com confirmação por SMS e registo permanente.",
    },
  ];
  return (
    <section id="como-funciona" style={{ background: "var(--surface-2)", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2
          className="kx-display"
          style={{ fontSize: "clamp(32px, 4.5vw, 48px)", textAlign: "center", marginBottom: 12 }}
        >
          Simples como sempre foi.
          <br />
          <span style={{ color: "var(--brand)" }}>Só que melhor.</span>
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--ink-2)",
            fontSize: 16,
            maxWidth: 580,
            margin: "0 auto 60px",
          }}
        >
          A kixikila tradicional ganha visibilidade, controlo e oportunidade financeira.
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}
          className="kx-passos"
        >
          {passos.map((p, i) => (
            <div
              key={i}
              className="kx-card kx-card-hover"
              style={{ padding: 28, position: "relative" }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--brand)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-num)",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                {i + 1}
              </div>
              <p.Icon size={28} color="var(--brand)" style={{ marginBottom: 12 }} />
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {p.t}
              </h3>
              <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>{p.d}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-passos { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 600px) { .kx-passos { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

export function ComunidadeLanding() {
  const regioes = [
    { nome: "Luanda", grupos: 24, cor: "#FF5C1A" },
    { nome: "Benguela", grupos: 12, cor: "#1D4ED8" },
    { nome: "Huambo", grupos: 8, cor: "#16A34A" },
    { nome: "Malanje", grupos: 5, cor: "#7C3AED" },
    { nome: "Huíla", grupos: 6, cor: "#F5A623" },
  ];
  return (
    <section id="comunidade" style={{ background: "var(--surface)", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            className="kx-pill"
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            <Shield size={14} /> Comunidade segura e transparente
          </span>
          <h2
            className="kx-display"
            style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginTop: 16 }}
          >
            Kixikilas para todos.
            <br />
            <span style={{ color: "var(--brand)" }}>Em toda Angola.</span>
          </h2>
          <p style={{ color: "var(--ink-2)", fontSize: 16, maxWidth: 640, margin: "16px auto 0" }}>
            Prazos flexíveis, grupos por região e coordenação com score excelente — a confiança
            começa aqui.
          </p>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 60 }}
          className="kx-com-grid"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="kx-card" style={{ padding: 28 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--brand-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Calendar size={24} color="var(--brand)" />
              </div>
              <h3 className="kx-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Prazos flexíveis
              </h3>
              <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                Define o ciclo da tua kixikila entre <strong>14 e 30 dias</strong>. Quanto mais
                curto o prazo, mais rápido rodam os recebimentos.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    flex: 1,
                    background: "var(--green-light)",
                    borderRadius: 12,
                    padding: 14,
                    textAlign: "center",
                  }}
                >
                  <div className="kx-num" style={{ fontSize: 24, color: "var(--green)" }}>
                    14
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginTop: 2 }}
                  >
                    dias mínimo
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "var(--blue-light)",
                    borderRadius: 12,
                    padding: 14,
                    textAlign: "center",
                  }}
                >
                  <div className="kx-num" style={{ fontSize: 24, color: "var(--blue)" }}>
                    30
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600, marginTop: 2 }}
                  >
                    dias máximo
                  </div>
                </div>
              </div>
            </div>

            <div className="kx-card" style={{ padding: 28 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--gold-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Award size={24} color="var(--gold)" />
              </div>
              <h3 className="kx-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Coordenação de confiança
              </h3>
              <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6 }}>
                Grupos coordenados apenas por utilizadores com <strong>KixiScore excelente</strong>{" "}
                (800+). A equipa do KixiPay faz análise de perfil para garantir transparência,
                reduzir riscos e manter a credibilidade de toda a comunidade.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <span
                  className="kx-pill"
                  style={{ background: "var(--green-light)", color: "var(--green)" }}
                >
                  <Shield size={12} /> Perfil verificado
                </span>
                <span
                  className="kx-pill"
                  style={{ background: "var(--gold-light)", color: "var(--gold)" }}
                >
                  Score 800+
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="kx-card" style={{ padding: 28, flex: 1 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--blue-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <MapPin size={24} color="var(--blue)" />
              </div>
              <h3 className="kx-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Comunidades por região
              </h3>
              <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                Qualquer utilizador pode aceder a um grupo da sua região. Encontra a kixikila mais
                próxima de ti ou cria o teu próprio grupo.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {regioes.map((r) => (
                  <div
                    key={r.nome}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "var(--surface)",
                      padding: "10px 14px",
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: r.cor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{r.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{r.grupos} grupos</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="kx-card" style={{ padding: 28 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Users size={24} color="var(--ink)" />
              </div>
              <h3 className="kx-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Aderir é simples
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Encontra um grupo na tua região",
                  "Solicita entrada com o código da comunidade",
                  "O coordenador aprova a tua participação",
                  "Começa a contribuir no primeiro ciclo",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--brand)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 14, color: "var(--ink-2)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="kx-card"
          style={{
            padding: 40,
            textAlign: "center",
            maxWidth: 700,
            margin: "0 auto",
            background: "var(--brand)",
            color: "#fff",
          }}
        >
          <h3 className="kx-display" style={{ fontSize: 26, marginBottom: 8 }}>
            Valor mínimo da kixikila: <strong>5.000 Kz</strong>
          </h3>
          <p style={{ fontSize: 15, opacity: 0.9, margin: 0 }}>
            Sem limite máximo. Desde pequenos grupos de poupança até kixikilas de maior escala,
            adaptadas à realidade de cada comunidade.
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .kx-com-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

export function KixiScoreLanding() {
  const [score, setScore] = useState(847);
  return (
    <section
      id="kixiscore"
      style={{ background: "var(--dark-bg)", padding: "100px 24px", color: "#fff" }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
        className="kx-score-grid"
      >
        <div>
          <span
            className="kx-pill"
            style={{ background: "rgba(255,92,26,0.15)", color: "var(--brand)" }}
          >
            Inovação KixiPay
          </span>
          <h2
            className="kx-display"
            style={{ fontSize: "clamp(32px, 4.5vw, 48px)", color: "#fff", margin: "20px 0 16px" }}
          >
            O teu comportamento vira{" "}
            <span style={{ color: "var(--gold)" }}>histórico de crédito.</span>
          </h2>
          <p style={{ color: "#B5B0A8", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
            O KixiScore traduz a tua disciplina nas kixikilas num número que os bancos angolanos
            aceitam.
          </p>
          {[
            "Calculado automaticamente a cada contribuição",
            "Aceite pelo BFA, Atlântico, BAI e SOL",
            "Partilhável via QR code ou código de verificação",
          ].map((t, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
            >
              <Check size={18} color="var(--green)" />
              <span style={{ color: "#E0DCD3" }}>{t}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
            {["BFA", "Atlântico", "BAI", "SOL"].map((b) => (
              <span
                key={b}
                style={{
                  background: "var(--dark-card)",
                  color: "#E0DCD3",
                  padding: "8px 14px",
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <ScoreRing score={score} size={220} />
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#B5B0A8" }}>
            <span>92% pontualidade</span>
            <span>•</span>
            <span>8 meses activo</span>
            <span>•</span>
            <span>40.000 Kz</span>
          </div>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <input
              type="range"
              min={300}
              max={1000}
              value={score}
              onChange={(e) => setScore(+e.target.value)}
              style={{ width: "100%", accentColor: "var(--brand)" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "#888",
                marginTop: 6,
              }}
            >
              <span>Iniciante</span>
              <span>Exemplar</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-score-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </section>
  );
}

const USSD_SCREENS = [
  `KixiPay *920*55#\n──────────────\nBem-vindo(a)\nConceicao M.\n\n1. Pagar contribu.\n2. Ver saldo grupo\n3. O meu KixiScore\n4. Proxima rotacao\n0. Sair`,
  `KIXIPAY PAGAMENTO\n──────────────\nGrupo:\n Kixikila Rangel\nValor: 5.000 Kz\nMes: Maio 2026\n\n1. Confirmar\n2. Cancelar`,
  `PAGAMENTO OK v\n──────────────\nRef: KXP-0515-089\nValor: 5.000 Kz\nData: 15/05/2026\n\nSaldo grupo:\n185.000 Kz\n\nObrigada Conceicao`,
  `O MEU KIXISCORE\n──────────────\nScore: 847\nNivel: EXCELENTE\n\nContrib: 11/12\nMeses activo: 8\n\nCredito ate:\n500.000 Kz - BFA`,
];

export function FeaturePhone({
  screen,
  onScreen,
}: {
  screen: number;
  onScreen: (i: number) => void;
}) {
  const [input, setInput] = useState("");
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
  return (
    <div
      style={{
        background: "#1A1A1A",
        borderRadius: 24,
        padding: 18,
        width: 240,
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          background: "#000",
          borderRadius: 8,
          padding: 12,
          height: 200,
          marginBottom: 14,
          position: "relative",
        }}
      >
        <pre
          className="kx-mono"
          style={{
            color: "#00FF00",
            fontSize: 10,
            lineHeight: 1.4,
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {USSD_SCREENS[screen]}
        </pre>
        {input && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 12,
              right: 12,
              color: "#00FF00",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              borderTop: "1px dashed #003300",
              paddingTop: 4,
            }}
          >
            &gt; {input}
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => setInput((s) => (s + k).slice(-12))}
            style={{
              background: "#2A2A2A",
              color: "#fff",
              padding: "10px 0",
              borderRadius: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              transition: "transform 100ms",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {k}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          onClick={() => onScreen((screen + USSD_SCREENS.length - 1) % USSD_SCREENS.length)}
          style={{
            flex: 1,
            background: "#3A2A2A",
            color: "#fff",
            padding: 8,
            borderRadius: 6,
            fontSize: 11,
          }}
        >
          ← Ant.
        </button>
        <button
          onClick={() => {
            onScreen((screen + 1) % USSD_SCREENS.length);
            setInput("");
          }}
          style={{
            flex: 1,
            background: "#2A3A2A",
            color: "#fff",
            padding: 8,
            borderRadius: 6,
            fontSize: 11,
          }}
        >
          Próx. →
        </button>
      </div>
    </div>
  );
}

export function UssdLanding() {
  const [screen, setScreen] = useState(0);
  return (
    <section id="ussd" style={{ background: "var(--surface)", padding: "100px 24px" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
        className="kx-ussd-grid"
      >
        <div>
          <span
            className="kx-pill"
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            Para todos os telemóveis
          </span>
          <h2
            className="kx-display"
            style={{ fontSize: "clamp(32px, 4.5vw, 48px)", margin: "20px 0" }}
          >
            Funciona em <span style={{ color: "var(--brand)" }}>qualquer telemóvel.</span>
          </h2>
          <p style={{ color: "var(--ink-2)", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
            Marca <strong className="kx-mono">*920*55#</strong> e participa na tua kixikila — sem
            internet, sem smartphone, sem app.
          </p>
          {[
            "Funciona em Unitel e Angola Telecom",
            "Confirmação por SMS imediata",
            "Sem custos de dados móveis",
          ].map((t, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
            >
              <Check size={18} color="var(--green)" />
              <span style={{ color: "var(--ink-2)" }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <FeaturePhone screen={screen} onScreen={setScreen} />
          <span className="kx-pill">
            Ecrã {screen + 1} de {USSD_SCREENS.length}
          </span>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-ussd-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </section>
  );
}

export function PlanosLanding({ onAuth }: { onAuth: () => void }) {
  const planos = [
    {
      nome: "Básico",
      preco: "Grátis",
      destaque: false,
      badge: "Ideal para começar",
      items: ["Até 8 membros", "Contribuições ilimitadas", "KixiScore básico", "Acesso USSD"],
      cta: "Começar grátis",
    },
    {
      nome: "Comunidade",
      preco: "2.500 Kz",
      sub: "/mês",
      destaque: true,
      badge: "Mais popular",
      items: [
        "Até 20 membros",
        "Grupos ilimitados",
        "KixiScore completo",
        "Relatórios PDF",
        "SMS automáticos",
        "WhatsApp Business",
      ],
      cta: "Começar agora",
    },
    {
      nome: "Banco",
      preco: "Sob consulta",
      destaque: false,
      badge: "Para instituições",
      items: ["API KixiScore", "Dashboard analítico", "Relatórios em massa", "SLA 99.9%"],
      cta: "Falar com equipa",
    },
  ];
  return (
    <section id="precos" style={{ background: "var(--surface-2)", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2
          className="kx-display"
          style={{ fontSize: "clamp(32px, 4.5vw, 48px)", textAlign: "center", marginBottom: 48 }}
        >
          Começa grátis.
          <br />
          <span style={{ color: "var(--brand)" }}>Cresce com a tua kixikila.</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            alignItems: "center",
          }}
          className="kx-planos"
        >
          {planos.map((p) => (
            <div
              key={p.nome}
              className="kx-card"
              style={{
                padding: 32,
                background: p.destaque ? "var(--brand)" : "var(--card)",
                color: p.destaque ? "#fff" : "var(--ink)",
                transform: p.destaque ? "scale(1.05)" : "none",
                boxShadow: p.destaque
                  ? "0 20px 40px rgba(255,92,26,0.3)"
                  : "0 2px 12px rgba(15,15,15,0.07)",
              }}
            >
              <span
                className="kx-pill"
                style={{
                  background: p.destaque ? "var(--gold)" : "var(--surface-2)",
                  color: p.destaque ? "#fff" : "var(--ink-2)",
                }}
              >
                {p.badge}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 800,
                  marginTop: 16,
                }}
              >
                {p.nome}
              </h3>
              <div style={{ marginTop: 8, marginBottom: 24 }}>
                <span className="kx-num" style={{ fontSize: 36 }}>
                  {p.preco}
                </span>
                {p.sub && <span style={{ fontSize: 16, opacity: 0.8 }}>{p.sub}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {p.items.map((it) => (
                  <div
                    key={it}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
                  >
                    <Check size={16} color={p.destaque ? "#fff" : "var(--green)"} />
                    <span>{it}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onAuth}
                className={p.destaque ? "kx-btn" : "kx-btn kx-btn-outline"}
                style={{
                  width: "100%",
                  background: p.destaque ? "#fff" : undefined,
                  color: p.destaque ? "var(--brand)" : undefined,
                }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-planos { grid-template-columns: 1fr !important; } .kx-planos > div { transform: none !important; } }`}</style>
    </section>
  );
}

export function Testemunhos() {
  const t = [
    {
      n: "Conceição Mateus",
      cidade: "Luanda",
      oc: "Coordenadora",
      i: "CM",
      c: "#FF5C1A",
      s: 891,
      q: "Antes usava um caderno e havia sempre confusão no fim do mês. Agora toda a gente vê os pagamentos no telemóvel e não há mais discussões na kixikila.",
    },
    {
      n: "Manuel Jacinto",
      cidade: "Benguela",
      oc: "Comerciante",
      i: "MJ",
      c: "#1D4ED8",
      s: 847,
      q: "Nunca pensei que ia conseguir crédito no banco. O meu KixiScore mostrou 8 meses de pagamentos e o BFA aprovou 300.000 Kz em uma semana.",
    },
    {
      n: "Rosa Amélia Santos",
      cidade: "Huambo",
      oc: "Professora",
      i: "RS",
      c: "#F5A623",
      s: 823,
      q: "A minha kixikila tem membros em Luanda e no Huambo. Antes era impossível gerir à distância. Agora é tudo automático e recebo o SMS quando alguém paga.",
    },
  ];
  return (
    <section style={{ background: "var(--dark-bg)", padding: "100px 24px", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2
          className="kx-display"
          style={{
            fontSize: "clamp(32px, 4.5vw, 48px)",
            textAlign: "center",
            color: "#fff",
            marginBottom: 48,
          }}
        >
          Angolanos que mudaram a forma de poupar
        </h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
          className="kx-test-grid"
        >
          {t.map((item) => (
            <div
              key={item.n}
              style={{ background: "var(--dark-card)", borderRadius: 20, padding: 28 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <Avatar iniciais={item.i} cor={item.c} size={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{item.n}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {item.cidade} · {item.oc}
                  </div>
                </div>
              </div>
              <span
                className="kx-pill"
                style={{
                  background: "rgba(245,166,35,0.15)",
                  color: "var(--gold)",
                  marginBottom: 16,
                  display: "inline-flex",
                }}
              >
                KixiScore {item.s} ★
              </span>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 17,
                  lineHeight: 1.5,
                  color: "#E8E4DD",
                  marginTop: 12,
                }}
              >
                "{item.q}"
              </p>
              <div style={{ color: "var(--gold)", marginTop: 12 }}>★★★★★</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-test-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

export function ParaBancos({ onAuth }: { onAuth: () => void }) {
  const cards = [
    {
      t: "População não bancarizada com score verificado",
      d: "Acesso a 28.000 angolanos com histórico real, não estimado.",
    },
    {
      t: "API de elegibilidade pronta a integrar",
      d: "REST + webhooks. Documentação completa em 48h.",
    },
    {
      t: "Risco reduzido por comportamento histórico",
      d: "Taxa de incumprimento abaixo dos 3% nos últimos 12 meses.",
    },
  ];
  return (
    <section
      id="bancos"
      style={{ background: "var(--surface)", padding: "100px 24px" }}
      className="kx-pattern-overlay"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span
            className="kx-pill"
            style={{ background: "var(--blue-light)", color: "var(--blue)" }}
          >
            Para instituições financeiras
          </span>
          <h2
            className="kx-display"
            style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginTop: 16 }}
          >
            Um segmento que <span style={{ color: "var(--blue)" }}>nunca chegou ao banco.</span>
          </h2>
          <p style={{ color: "var(--ink-2)", fontSize: 16, maxWidth: 640, margin: "16px auto 0" }}>
            28.000 clientes com histórico de crédito verificado, prontos para serem bancarizados.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 48,
          }}
          className="kx-bancos-grid"
        >
          {cards.map((c) => (
            <div key={c.t} className="kx-card kx-card-hover" style={{ padding: 24 }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {c.t}
              </h3>
              <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>{c.d}</p>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            padding: 32,
            background: "var(--card)",
            borderRadius: 20,
            border: "1px solid var(--border-soft)",
          }}
          className="kx-bancos-grid"
        >
          {[
            { v: "9/12", l: "Membros elegíveis" },
            { v: "<3%", l: "Incumprimento" },
            { v: "1.25Mrd Kz", l: "Potencial de crédito" },
          ].map((m) => (
            <div key={m.l} style={{ textAlign: "center" }}>
              <div className="kx-num" style={{ fontSize: 32, color: "var(--blue)" }}>
                {m.v}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{m.l}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button onClick={onAuth} className="kx-btn kx-btn-blue kx-btn-lg">
            Solicitar acesso à API KixiScore
          </button>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-bancos-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

export function Footer() {
  return (
    <footer style={{ background: "var(--dark-bg)", color: "#888", padding: "60px 24px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
          className="kx-footer-grid"
        >
          <div>
            <Logo dark />
            <p style={{ fontSize: 14, marginTop: 16, lineHeight: 1.6, color: "#888" }}>
              Digitalizamos a kixikila para que cada angolano construa o seu futuro financeiro.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a key={i} href="#" style={{ color: "#888" }}>
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <FooterCol titulo="Produto" links={["Como funciona", "KixiScore", "USSD", "Preços"]} />
          <FooterCol titulo="Empresa" links={["Sobre", "Equipa", "Imprensa", "Carreiras"]} />
          <FooterCol titulo="Suporte">
            <a
              href="#"
              style={{
                display: "block",
                color: "#B5B0A8",
                fontSize: 14,
                padding: "4px 0",
                textDecoration: "none",
              }}
            >
              Centro de ajuda
            </a>
            <a
              href="#"
              style={{
                display: "block",
                color: "#B5B0A8",
                fontSize: 14,
                padding: "4px 0",
                textDecoration: "none",
              }}
            >
              Contacto
            </a>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
                color: "var(--green)",
              }}
            >
              <MessageCircle size={16} /> <span style={{ fontSize: 13 }}>+244 900 000 000</span>
            </div>
          </FooterCol>
        </div>
        <div
          style={{
            borderTop: "1px solid var(--dark-border)",
            paddingTop: 24,
            fontSize: 12,
            color: "#666",
            textAlign: "center",
          }}
        >
          © 2026 KixiPay · Desenvolvido em Angola 🇦🇴 · Parceiro LISPA · Acreditado pelo BNA
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-footer-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 600px) { .kx-footer-grid { grid-template-columns: 1fr !important; } }`}</style>
    </footer>
  );
}
function FooterCol({
  titulo,
  links,
  children,
}: {
  titulo: string;
  links?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ color: "#fff", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>{titulo}</div>
      {links?.map((l) => (
        <a
          key={l}
          href="#"
          style={{
            display: "block",
            color: "#B5B0A8",
            fontSize: 14,
            padding: "4px 0",
            textDecoration: "none",
          }}
        >
          {l}
        </a>
      ))}
      {children}
    </div>
  );
}

export function Landing({ onAuth }: { onAuth: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ animation: "fadeIn 200ms" }}>
      <PublicNavbar onAuth={onAuth} onMenu={() => setMenu(true)} scrolled={scrolled} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} onAuth={onAuth} />
      <Hero onAuth={onAuth} />
      <SocialProof />
      <ComoFunciona />
      <ComunidadeLanding />
      <KixiScoreLanding />
      <UssdLanding />
      <PlanosLanding onAuth={onAuth} />
      <Testemunhos />
      <ParaBancos onAuth={onAuth} />
      <AILanding />
      <AgentesLanding onAuth={onAuth} />
      <AdminLanding />
      <Footer />
    </div>
  );
}

function AILanding() {
  return (
    <section
      style={{
        padding: "100px 24px",
        background: "linear-gradient(180deg, var(--card) 0%, var(--surface) 100%)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              background: "var(--brand-light)",
              color: "var(--brand-dark)",
              padding: "4px 14px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            🤖 Inteligência Artificial
          </span>
          <h2 className="kx-display" style={{ fontSize: 40, marginTop: 20, marginBottom: 16 }}>
            Análise de Score com IA
          </h2>
          <p
            style={{
              color: "var(--ink-3)",
              fontSize: 16,
              maxWidth: 600,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            O nosso modelo de IA analisa padrões de pagamento, pontualidade e comportamento para
            prever tendências de score e identificar membros em risco antes que seja tarde.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            {
              icon: "📊",
              title: "Predição de Score",
              desc: "Algoritmos preditivos calculam a evolução do score de cada membro com 85%+ de precisão, identificando tendências de subida ou descida.",
            },
            {
              icon: "🚨",
              title: "Alertas Inteligentes",
              desc: "Alertas automáticos quando um membro apresenta risco de incumprimento. O sistema recomenda acções como contacto do agente ou lembretes SMS.",
            },
            {
              icon: "📋",
              title: "Factores de Impacto",
              desc: "Cada score é decomposto nos factores que mais influenciam: pontualidade, tempo de conta, volume poupado e regularidade de contribuições.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="kx-card kx-card-hover"
              style={{ padding: 28, borderRadius: 20 }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{c.icon}</div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {c.title}
              </h3>
              <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentesLanding({ onAuth }: { onAuth: () => void }) {
  return (
    <section style={{ padding: "100px 24px", background: "var(--card)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}
        >
          <div>
            <span
              style={{
                background: "var(--green-light)",
                color: "var(--green)",
                padding: "4px 14px",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              👥 Rede de Agentes
            </span>
            <h2 className="kx-display" style={{ fontSize: 36, marginTop: 20, marginBottom: 16 }}>
              Agentes de Campo em Todo o País
            </h2>
            <p style={{ color: "var(--ink-3)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              A nossa rede de agentes leva o KixiPay a todos os cantos de Angola. Os agentes
              cadastram novos membros, monitorizam a participação nos grupos e garantem que cada
              kixikila funciona sem problemas.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              {[
                { icon: "📝", label: "Cadastro presencial de membros sem smartphone" },
                { icon: "📱", label: "Suporte USSD para comunidades rurais" },
                { icon: "📈", label: "Monitorização de score e pontualidade" },
                { icon: "🎯", label: "Metas mensais e comissões por cadastro" },
              ].map((f) => (
                <div
                  key={f.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 14,
                    color: "var(--ink-2)",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
            <button onClick={onAuth} className="kx-btn kx-btn-primary kx-btn-lg">
              Quero ser agente KixiPay
            </button>
          </div>
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 24,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Agentes em Destaque
            </div>
            {[
              {
                nome: "Maria Agostinho",
                regiao: "Luanda",
                cadastros: 47,
                score: 742,
                cor: "#8B5CF6",
              },
              {
                nome: "Pedro Kussumua",
                regiao: "Benguela",
                cadastros: 32,
                score: 689,
                cor: "#EC4899",
              },
              {
                nome: "Helena Muxito",
                regiao: "Huambo",
                cadastros: 18,
                score: 651,
                cor: "#06B6D4",
              },
            ].map((a) => (
              <div
                key={a.nome}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: a.cor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {a.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.nome}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {a.regiao} · {a.cadastros} cadastros
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-num)",
                      fontWeight: 700,
                      fontSize: 16,
                      color: a.score >= 700 ? "var(--green)" : "var(--orange-mid)",
                    }}
                  >
                    {a.score}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--ink-4)" }}>score médio</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminLanding() {
  return (
    <section
      style={{
        padding: "100px 24px",
        background: "var(--dark-bg)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}
          className="kx-admin-grid"
        >
          <div>
            <span
              style={{
                background: "var(--brand-light)",
                color: "var(--brand)",
                padding: "4px 14px",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              ⚙️ Gestão Centralizada
            </span>
            <h2
              className="kx-display"
              style={{ fontSize: 36, marginTop: 20, marginBottom: 16, color: "#fff" }}
            >
              Controla Toda a Plataforma num{" "}
              <span style={{ color: "var(--brand)" }}>Painel Unificado</span>
            </h2>
            <p
              style={{
                color: "var(--ink-3)",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 28,
                maxWidth: 480,
              }}
            >
              Membros, agentes, coordenadores, grupos, análise de score e muito mais — tudo
              organizado num painel feito para quem gere o ecossistema KixiPay.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  icon: "👥",
                  label: "Gestão de Membros",
                  desc: "Cadastro, remoção, histórico completo e pesquisa avançada",
                },
                {
                  icon: "🕵️",
                  label: "Controlo de Agentes",
                  desc: "Metas mensais, desempenho por região, comissões e status",
                },
                {
                  icon: "🤖",
                  label: "Análise IA",
                  desc: "Predições de score, alertas de risco e membros em atenção",
                },
                {
                  icon: "📊",
                  label: "Relatórios e Métricas",
                  desc: "Estatísticas em tempo real, auditoria e crescimento da plataforma",
                },
              ].map((f) => (
                <div
                  key={f.label}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 18px",
                    background: "var(--dark-card)",
                    borderRadius: 12,
                    border: "1px solid var(--dark-border)",
                  }}
                >
                  <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{f.icon}</span>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#fff",
                        marginBottom: 2,
                      }}
                    >
                      {f.label}
                    </div>
                    <div style={{ fontSize: 13, color: "#999", lineHeight: 1.4 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              background: "var(--dark-card)",
              borderRadius: 24,
              border: "1px solid var(--dark-border)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "var(--dark-bg)",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: "1px solid var(--dark-border)",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#FF5F56",
                }}
              />
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#FFBD2E",
                }}
              />
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#27C93F",
                }}
              />
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                admin.kixipay.ao
              </span>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  { label: "Membros", value: "156", cor: "var(--brand)" },
                  { label: "Grupos", value: "23", cor: "var(--blue)" },
                  { label: "Agentes", value: "14", cor: "var(--gold)" },
                  { label: "Volume", value: "12.4M Kz", cor: "var(--green)" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "var(--dark-bg)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-num)",
                        fontSize: 24,
                        fontWeight: 700,
                        color: s.cor,
                      }}
                    >
                      {s.value}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "var(--dark-bg)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--ink-3)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 12,
                  }}
                >
                  Membros em Risco 🚨
                </div>
                {[
                  { nome: "Rosa Amélia", score: 756, status: "Pendente", icon: "🟡" },
                  { nome: "Carlos Futila", score: 423, status: "Crítico", icon: "🔴" },
                  { nome: "Beatriz Capita", score: 601, status: "Atenção", icon: "🟠" },
                ].map((m) => (
                  <div
                    key={m.nome}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: "1px solid var(--dark-border)",
                    }}
                  >
                    <span>{m.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, color: "#ddd" }}>{m.nome}</span>
                    <span
                      style={{
                        fontFamily: "var(--font-num)",
                        fontSize: 13,
                        color: m.score < 500 ? "#EF4444" : m.score < 700 ? "#F59E0B" : "#10B981",
                      }}
                    >
                      {m.score}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 100,
                        background:
                          m.status === "Crítico"
                            ? "rgba(239,68,68,0.15)"
                            : m.status === "Atenção"
                              ? "rgba(245,158,11,0.15)"
                              : "rgba(255,255,255,0.06)",
                        color:
                          m.status === "Crítico"
                            ? "#EF4444"
                            : m.status === "Atenção"
                              ? "#F59E0B"
                              : "#888",
                      }}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, var(--brand-light), rgba(6,182,212,0.15))",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>Score Médio</div>
                  <div
                    style={{
                      fontFamily: "var(--font-num)",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--brand)",
                    }}
                  >
                    742
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>Crescimento</div>
                  <div
                    style={{
                      fontFamily: "var(--font-num)",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--green)",
                    }}
                  >
                    +12%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-admin-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
