import { useState } from 'react';
import { Modal, Avatar, GeoQR } from './shared';
import { MEMBROS, fmtKz, eligivel, scoreLabel } from './data';
import type { Membro } from './data';
import { Check, Copy } from 'lucide-react';

export function AuthModal({ open, onClose, onLogin }: { open: boolean; onClose: () => void; onLogin: (user: 'conceicao' | 'manuel') => void }) {
  const [tab, setTab] = useState<'entrar' | 'criar'>('entrar');
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const setPinAt = (i: number, v: string) => {
    const next = [...pin]; next[i] = v.slice(-1); setPin(next);
    if (v && i < 3) (document.getElementById(`pin-${i+1}`) as HTMLInputElement)?.focus();
  };
  const fakeLogin = (who: 'conceicao' | 'manuel') => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(who); }, 1200);
  };
  return (
    <Modal open={open} onClose={onClose} width={460}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 26, marginBottom: 8 }}>Bem-vindo ao KixiPay</h2>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 20 }}>A tua kixikila, sempre na palma da mão.</p>
        <div style={{ display: 'flex', background: 'var(--surface-2)', padding: 4, borderRadius: 12, marginBottom: 24 }}>
          {(['entrar', 'criar'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: 10, borderRadius: 8, fontWeight: 600, fontSize: 14,
              background: tab === t ? 'var(--card)' : 'transparent',
              color: tab === t ? 'var(--ink)' : 'var(--ink-3)',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            }}>{t === 'entrar' ? 'Entrar' : 'Criar conta'}</button>
          ))}
        </div>
        {tab === 'entrar' ? (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>Telemóvel</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 12, marginTop: 6, marginBottom: 16 }}>
              <span style={{ padding: '12px 14px', color: 'var(--ink-3)', borderRight: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '12px 0 0 12px' }}>+244</span>
              <input className="kx-input" style={{ border: 'none', background: 'transparent' }} placeholder="9XX XXX XXX" />
            </div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>PIN</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 20 }}>
              {pin.map((d, i) => (
                <input key={i} id={`pin-${i}`} type="password" inputMode="numeric" maxLength={1}
                  value={d} onChange={e => setPinAt(i, e.target.value)}
                  style={{ flex: 1, height: 56, textAlign: 'center', fontSize: 22, fontFamily: 'var(--font-num)', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--card)' }} />
              ))}
            </div>
            <button onClick={() => fakeLogin('conceicao')} disabled={loading} className="kx-btn kx-btn-primary" style={{ width: '100%', height: 48 }}>
              {loading ? 'A entrar...' : 'Entrar no KixiPay'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--ink-3)', fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} /> ou <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <button onClick={() => fakeLogin('conceicao')} className="kx-btn kx-btn-primary" style={{ width: '100%', marginBottom: 8 }}>
              ▶ Demo como Coordenadora (Conceição)
            </button>
            <button onClick={() => fakeLogin('manuel')} className="kx-btn kx-btn-outline" style={{ width: '100%' }}>
              ▶ Demo como Membro (Manuel)
            </button>
          </>
        ) : (
          <>
            <input className="kx-input" placeholder="Nome completo" style={{ marginBottom: 12 }} />
            <input className="kx-input" placeholder="+244 9XX XXX XXX" style={{ marginBottom: 12 }} />
            <input className="kx-input" type="password" placeholder="PIN (4 dígitos)" style={{ marginBottom: 12 }} />
            <input className="kx-input" type="password" placeholder="Confirmar PIN" style={{ marginBottom: 16 }} />
            <label style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
              <input type="checkbox" defaultChecked /> Aceito os termos e condições
            </label>
            <button onClick={() => fakeLogin('conceicao')} className="kx-btn kx-btn-primary" style={{ width: '100%', height: 48 }}>
              Criar conta
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

export function ContribuicaoModal({ open, onClose, onConfirm, prefill }: { open: boolean; onClose: () => void; onConfirm: (msg: string) => void; prefill?: Membro | null }) {
  const [memId, setMemId] = useState<number>(prefill?.id ?? MEMBROS[0].id);
  const mem = MEMBROS.find(m => m.id === memId)!;
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 20 }}>Registar Contribuição</h2>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Membro</label>
        <select value={memId} onChange={e => setMemId(+e.target.value)} className="kx-input" style={{ marginTop: 6, marginBottom: 14 }}>
          {MEMBROS.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Valor (Kz)</label>
        <input className="kx-input" defaultValue="5000" style={{ marginTop: 6, marginBottom: 14 }} />
        <label style={{ fontSize: 13, fontWeight: 600 }}>Data</label>
        <input className="kx-input" type="date" defaultValue="2026-05-15" style={{ marginTop: 6, marginBottom: 14 }} />
        <label style={{ fontSize: 13, fontWeight: 600 }}>Método</label>
        <select className="kx-input" style={{ marginTop: 6, marginBottom: 14 }}>
          <option>App</option><option>USSD</option><option>Dinheiro presencial</option>
        </select>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Notas (opcional)</label>
        <textarea className="kx-input" rows={2} style={{ marginTop: 6, marginBottom: 20, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="kx-btn kx-btn-outline" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={() => onConfirm(`Pagamento de ${mem.nome} confirmado ✓ +5.000 Kz`)} className="kx-btn kx-btn-primary" style={{ flex: 1 }}>
            Confirmar pagamento
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function AddMembroModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (msg: string) => void }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 20 }}>Adicionar membro ao grupo</h2>
        <input className="kx-input" placeholder="Nome completo" style={{ marginBottom: 12 }} />
        <input className="kx-input" placeholder="+244 9XX XXX XXX" style={{ marginBottom: 12 }} />
        <input className="kx-input" placeholder="Email (opcional)" style={{ marginBottom: 12 }} />
        <select className="kx-input" style={{ marginBottom: 20 }}>
          {Array.from({ length: 12 }, (_, i) => <option key={i}>Posição {i + 1}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="kx-btn kx-btn-outline" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={() => onConfirm('Novo membro adicionado ✓ SMS de boas-vindas enviado')} className="kx-btn kx-btn-primary" style={{ flex: 1 }}>
            Adicionar ao grupo
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmarPagamentoModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 16 }}>Confirmar Pagamento ao Manuel Jacinto</h2>
        <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar iniciais="MJ" cor="#1D4ED8" size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Manuel Jacinto</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>7º na rotação · 1 de Junho 2026</div>
          </div>
          <div className="kx-num" style={{ fontSize: 22, color: 'var(--green)' }}>{fmtKz(60000)}</div>
        </div>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Referência de transferência (opcional)</label>
        <input className="kx-input" placeholder="Ex: TRF-202605-001" style={{ marginTop: 6, marginBottom: 20 }} />
        <button onClick={onConfirm} className="kx-btn kx-btn-green" style={{ width: '100%', height: 48 }}>
          ✓ Confirmar recebimento
        </button>
      </div>
    </Modal>
  );
}

export function RecomendacaoModal({ open, onClose, membro, onSend }: { open: boolean; onClose: () => void; membro: Membro | null; onSend: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!membro) return null;
  const el = eligivel(membro.score);
  const code = `KXP-VRFC-${membro.score}-2026-${membro.iniciais}`;
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 32 }}>
        <h2 className="kx-display" style={{ fontSize: 22, marginBottom: 4 }}>Relatório de Elegibilidade</h2>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 20 }}>{membro.nome}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <Stat label="KixiScore" valor={String(membro.score)} cor="var(--gold)" />
          <Stat label="Nível" valor={scoreLabel(membro.score)} />
          <Stat label="Meses" valor={String(membro.meses)} />
          <Stat label="Pontualidade" valor={`${membro.pontualidade}%`} cor="var(--green)" />
        </div>
        <div style={{ background: 'var(--blue-light)', padding: 16, borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>Elegível para crédito até</div>
          <div className="kx-num" style={{ fontSize: 24, color: 'var(--blue)' }}>{el.ok ? fmtKz(el.limite) : 'Não elegível ainda'}</div>
          {el.ok && <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>Banco recomendado: {el.banco}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><GeoQR seed={code} /></div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <code className="kx-mono" style={{ flex: 1, padding: 10, background: 'var(--surface)', borderRadius: 8, fontSize: 12, textAlign: 'center' }}>{code}</code>
          <button className="kx-btn kx-btn-outline kx-btn-sm" onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <select className="kx-input" style={{ marginBottom: 14 }}>
          <option>BFA</option><option>Atlântico</option><option>BAI</option><option>SOL</option>
        </select>
        <button onClick={onSend} className="kx-btn kx-btn-blue" style={{ width: '100%', height: 48 }}>Enviar relatório ao banco</button>
      </div>
    </Modal>
  );
}

function Stat({ label, valor, cor }: { label: string; valor: string; cor?: string }) {
  return (
    <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <div className="kx-num" style={{ fontSize: 18, color: cor || 'var(--ink)', marginTop: 2 }}>{valor}</div>
    </div>
  );
}
