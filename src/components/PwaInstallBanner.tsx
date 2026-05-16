"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show || !deferredPrompt) return null;

  const install = () => {
    (deferredPrompt as Event & { prompt: () => Promise<void> }).prompt();
    setShow(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "var(--card)",
        borderTop: "1px solid var(--border-soft)",
        padding: "12px 16px",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        animation: "slideUp 300ms ease-out",
      }}
    >
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
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
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Instalar KixiPay</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
          Adiciona ao ecrã principal para acesso rápido
        </div>
      </div>
      <button
        onClick={install}
        style={{
          background: "var(--brand)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "10px 18px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        <Download size={16} /> Instalar
      </button>
      <button
        onClick={() => setShow(false)}
        style={{
          background: "none",
          border: "none",
          color: "var(--ink-3)",
          cursor: "pointer",
          padding: 4,
        }}
      >
        <X size={18} />
      </button>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
