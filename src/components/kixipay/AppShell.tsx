import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Home, Users, Star, Smartphone, Clock, Settings, Search, Eye, MessageSquare, Trash2, Wallet, ArrowDownRight, X, Copy, Check, ChevronDown, LogOut, User as UserIcon, Plus, Download, Send, Building2 } from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { Logo, Avatar, ScoreRing, MiniScoreBar, StatusBadge } from './shared';
import { MEMBROS, HISTORICO, ROTACAO_MESES, fmtKz, scoreColor, scoreLabel, eligivel } from './data';
import type { Membro } from './data';
import { FeaturePhone } from './Landing';

Chart.register(...registerables);

type ViewName = 'dashboard' | 'membros' | 'score' | 'ussd' | 'historico' | 'config';

const NAV_ITEMS: { id: ViewName; label: string; Icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Início', Icon: Home },
  { id: 'membros', label: 'Membros', Icon: Users },
  { id: 'score', label: 'KixiScore', Icon: Star },
  { id: 'ussd', label: 'Pagar USSD', Icon: Smartphone },
  { id: 'historico', label: 'Histórico', Icon: Clock },
  { id: 'config', label: 'Configurações', Icon: Settings },
];

export function AppShell({ user, onLogout, openModal, openDrawer, toast }: {
  user: 'conceicao' | 'manuel';
  onLogout: () => void;
  openModal: (m: 'contribuicao' | 'addMembro' | 'confirmarPagamento' | 'recomendacao', data?: Membro) => void;
  openDrawer: (m: Membro) => void;
  toast: (tipo: 'sucesso' | 'aviso' | 'erro' | 'info', msg: string) => void;
}) {
  const [view, setView] = useState<ViewName>('dashboard');
  const userMem = MEMBROS[user === 'conceicao' ? 0 : 1];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', animation: 'fadeIn 200ms' }}>
      <AppNavbar user={userMem} viewLabel={NAV_ITEMS.find(n => n.id === view)?.label || ''} onLogout={onLogout} toast={toast} />
      <div style={{ display: 'flex', paddingTop: 60 }}>
        <Sidebar view={view} onView={setView} />
        <main style={{ flex: 1, padding: 28, minHeight: 'calc(100vh - 60px)', paddingBottom: 100 }} className="kx-main">
          {view === 'dashboard' && <Dashboard user={userMem} openModal={openModal} toast={toast} />}
          {view === 'membros' && <MembrosView openDrawer={openDrawer} openModal={openModal} />}
          {view === 'score' && <KixiScoreView user={userMem} toast={toast} />}
          {view === 'ussd' && <UssdView />}
          {view === 'historico' && <HistoricoView />}
          {view === 'config' && <ConfigView toast={toast} />}
        </main>
      </div>
      <BottomNav view={view} onView={setView} />
      <style>{`
        @media (max-width: 900px) {
          .kx-sidebar { display: none !important; }
          .kx-main { padding: 16px !important; padding-bottom: 100px !important; }
          .kx-bottom-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function AppNavbar({ user, viewLabel, onLogout, toast }: { user: Membro; viewLabel: string; onLogout: () => void; toast: (t: 'sucesso'|'aviso'|'erro'|'info', m: string) => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [unread, setUnread] = useState(3);
  const notifs = [
    { c: 'var(--red)', t: 'Rosa Amélia não pagou — 3 dias em atraso' },
    { c: 'var(--red)', t: 'Carlos Futila — 2ª contribuição em falta' },
    { c: 'var(--orange-mid)', t: 'Beatriz Capita — lembrete automático enviado' },
    { c: 'var(--green)', t: 'Manuel Jacinto confirmou pagamento ✓' },
  ];
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: 'var(--card)',
      borderBottom: '1px solid var(--border)', zIndex: 50, display: 'flex', alignItems: 'center',
      padding: '0 24px', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Logo />
        <span className="kx-pill" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>Kixikila Rangel</span>
        <span style={{ color: 'var(--ink-3)', fontSize: 13 }} className="kx-hide-sm">/ {viewLabel}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setNotifOpen(o => !o)} aria-label="Notificações" style={{ position: 'relative', padding: 8 }}>
            <Bell size={20} color="var(--ink-2)" />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="kx-fade-in" style={{ position: 'absolute', top: 44, right: 0, width: 320, background: 'var(--card)', borderRadius: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.12)', border: '1px solid var(--border-soft)', overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid var(--border-soft)', fontWeight: 600 }}>Notificações</div>
              {notifs.map((n, i) => (
                <div key={i} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.c, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{n.t}</span>
                </div>
              ))}
              <button onClick={() => { setUnread(0); setNotifOpen(false); toast('info', 'Notificações marcadas como lidas'); }} style={{ width: '100%', padding: 12, color: 'var(--brand)', fontWeight: 600, fontSize: 13 }}>
                Marcar todas como lidas
              </button>
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setUserOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar iniciais={user.iniciais} cor={user.cor} size={36} />
            <ChevronDown size={14} color="var(--ink-3)" />
          </button>
          {userOpen && (
            <div className="kx-fade-in" style={{ position: 'absolute', top: 44, right: 0, width: 200, background: 'var(--card)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.12)', border: '1px solid var(--border-soft)', overflow: 'hidden' }}>
              <div style={{ padding: 12, borderBottom: '1px solid var(--border-soft)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user.nome}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{user.tel}</div>
              </div>
              {[
                { Icon: UserIcon, l: 'Perfil' },
                { Icon: Settings, l: 'Configurações' },
                { Icon: LogOut, l: 'Sair', danger: true, action: onLogout },
              ].map((it, i) => (
                <button key={i} onClick={() => { setUserOpen(false); it.action?.(); }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, color: it.danger ? 'var(--red)' : 'var(--ink)', fontSize: 14 }}>
                  <it.Icon size={16} /> {it.l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 600px) { .kx-hide-sm { display: none !important; } }`}</style>
    </header>
  );
}

function Sidebar({ view, onView }: { view: ViewName; onView: (v: ViewName) => void }) {
  return (
    <aside className="kx-sidebar" style={{
      width: 240, flexShrink: 0, background: 'var(--card)', borderRight: '1px solid var(--border-soft)',
      padding: 20, position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto',
    }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Kixikila Rangel</div>
        <span className="kx-pill kx-mono" style={{ fontSize: 11 }}>KXRNG-2024</span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(it => {
          const active = view === it.id;
          return (
            <button key={it.id} onClick={() => onView(it.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderRadius: 10, background: active ? 'var(--brand-light)' : 'transparent',
              color: active ? 'var(--brand)' : 'var(--ink-2)', fontWeight: active ? 600 : 500,
              fontSize: 14, textAlign: 'left', borderLeft: active ? '3px solid var(--brand)' : '3px solid transparent',
              transition: 'all 200ms',
            }}>
              <it.Icon size={18} /> {it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: 32, padding: 16, background: 'var(--surface)', borderRadius: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>Saldo do grupo</div>
        <div className="kx-num" style={{ fontSize: 22, color: 'var(--green)', marginTop: 4 }}>185.000 Kz</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 12, marginBottom: 6 }}>8/12 membros pagaram</div>
        <div style={{ height: 6, background: 'var(--border-soft)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: '67%', height: '100%', background: 'var(--brand)' }} />
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ view, onView }: { view: ViewName; onView: (v: ViewName) => void }) {
  const items = NAV_ITEMS.slice(0, 5);
  return (
    <nav className="kx-bottom-nav" style={{
      display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
      background: 'var(--card)', borderTop: '1px solid var(--border)', zIndex: 50,
      justifyContent: 'space-around', alignItems: 'center',
    }}>
      {items.map(it => {
        const active = view === it.id;
        return (
          <button key={it.id} onClick={() => onView(it.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: active ? 'var(--brand)' : 'var(--ink-3)', fontSize: 10, fontWeight: 500, padding: 6,
          }}>
            <it.Icon size={20} /> {it.label}
          </button>
        );
      })}
    </nav>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────
function Dashboard({ user, openModal, toast }: { user: Membro; openModal: AppShellProps['openModal']; toast: AppShellProps['toast'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 className="kx-display" style={{ fontSize: 28 }}>Olá, {user.nome.split(' ')[0]} 👋</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <span style={{ color: 'var(--ink-3)', fontSize: 14 }}>15 de Maio de 2026</span>
          <span className="kx-pill" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>Coordenadora · Kixikila Rangel</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="kx-kpi-grid">
        <KpiCard cor="var(--brand)" bg="var(--brand-light)" Icon={Wallet} label="Saldo Total" valor="185.000 Kz" sub="↑ +5.000 Kz este mês" subCor="var(--green)" />
        <KpiCard cor="var(--green)" bg="var(--green-light)" Icon={Users} label="Membros Activos" valor="12 / 12" sub="100% presentes" subCor="var(--green)" />
        <KpiCard cor="var(--orange-mid)" bg="var(--gold-light)" Icon={Clock} label="Contribuições do Mês" valor="8 / 12" sub="67% recebidas · 4 pendentes" progress={67} />
        <KpiCard cor="var(--gold)" bg="var(--gold-light)" Icon={Star} label="KixiScore Médio" valor="824 ★" sub="Grupo excelente" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }} className="kx-dash-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ProximoRecebimento openModal={openModal} toast={toast} />
          <RotacaoCompleta />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ContribuicoesChart />
          <ActividadeRecente />
          <AccoesRapidas openModal={openModal} toast={toast} />
        </div>
      </div>
      <style>{`
        @media (max-width: 1100px) { .kx-kpi-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .kx-kpi-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 1000px) { .kx-dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
type AppShellProps = Parameters<typeof AppShell>[0];

function KpiCard({ Icon, label, valor, sub, subCor, cor, bg, progress }: { Icon: typeof Wallet; label: string; valor: string; sub: string; subCor?: string; cor: string; bg: string; progress?: number }) {
  return (
    <div className="kx-card kx-card-hover" style={{ padding: 20, borderTop: `3px solid ${cor}`, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={cor} />
        </div>
      </div>
      <div className="kx-num" style={{ fontSize: 28, color: 'var(--ink)', marginTop: 8 }}>{valor}</div>
      <div style={{ fontSize: 12, color: subCor || 'var(--ink-3)', marginTop: 4 }}>{sub}</div>
      {progress !== undefined && (
        <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: cor }} />
        </div>
      )}
    </div>
  );
}

function ProximoRecebimento({ openModal, toast }: { openModal: AppShellProps['openModal']; toast: AppShellProps['toast'] }) {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>Quem recebe este mês — Junho 2026</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Avatar iniciais="MJ" cor="#1D4ED8" size={60} />
        <div style={{ flex: 1 }}>
          <div className="kx-display" style={{ fontSize: 22, fontWeight: 700 }}>Manuel Jacinto</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>7º na rotação · Recebe a 1 de Junho</div>
        </div>
        <div className="kx-num" style={{ fontSize: 26, color: 'var(--green)' }}>{fmtKz(60000)}</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>
          <span>8 de 12 contribuições recebidas</span><span>67%</span>
        </div>
        <div style={{ height: 6, background: 'var(--border-soft)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: '67%', height: '100%', background: 'var(--brand)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => openModal('confirmarPagamento')} className="kx-btn kx-btn-primary" style={{ flex: 1, minWidth: 200 }}>
          ✓ Confirmar pagamento ao Manuel
        </button>
        <button onClick={() => toast('info', 'SMS de aviso enviado a Manuel')} className="kx-btn kx-btn-outline">
          <Send size={14} /> Enviar SMS
        </button>
      </div>
    </div>
  );
}

function RotacaoCompleta() {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>Rotação completa do grupo</div>
      <div className="kx-scroll" style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[...MEMBROS].sort((a, b) => a.posicao - b.posicao).map(m => {
          const isCurrent = m.posicao === 7;
          const isPast = m.posicao < 7;
          return (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
              background: isCurrent ? 'var(--brand-light)' : 'transparent',
              color: isCurrent ? 'var(--brand)' : 'var(--ink)',
              fontWeight: isCurrent ? 600 : 400,
            }}>
              <span className="kx-num" style={{ width: 24, fontSize: 13, color: isCurrent ? 'var(--brand)' : 'var(--ink-3)' }}>{m.posicao}</span>
              <Avatar iniciais={m.iniciais} cor={m.cor} size={28} />
              <span style={{ flex: 1, fontSize: 13 }}>{m.nome}</span>
              <span style={{ fontSize: 12, color: isCurrent ? 'var(--brand)' : 'var(--ink-3)' }}>{ROTACAO_MESES[m.posicao - 1]}</span>
              {isPast && <Check size={14} color="var(--green)" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContribuicoesChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 200);
    grad.addColorStop(0, 'rgba(255,92,26,0.3)');
    grad.addColorStop(1, 'rgba(255,92,26,0)');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
        datasets: [
          { label: 'Contribuições', data: [55000, 60000, 58000, 60000, 57000, 40000], borderColor: '#FF5C1A', backgroundColor: grad, fill: true, tension: 0.35, pointRadius: 4, pointBackgroundColor: '#FF5C1A' },
          { label: 'Meta', data: [60000, 60000, 60000, 60000, 60000, 60000], borderColor: '#B0ABA3', borderDash: [5, 5], pointRadius: 0, fill: false },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => fmtKz(Number(c.parsed.y ?? 0)) } },
        },
        scales: {
          y: { ticks: { callback: (v) => `${(+v / 1000)}k` }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } },
        },
      },
    });
    return () => chart.destroy();
  }, []);
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>Contribuições — Últimos 6 meses</div>
      <div style={{ height: 220 }}><canvas ref={ref} /></div>
    </div>
  );
}

function ActividadeRecente() {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>Actividade recente</div>
      <div className="kx-scroll" style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {HISTORICO.slice(0, 6).map(t => {
          const m = MEMBROS.find(x => x.nome === t.membro);
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
              {m ? <Avatar iniciais={m.iniciais} cor={m.cor} size={32} /> : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)' }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.membro}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.tipo} · {t.data}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {t.valor > 0 && <div className="kx-num" style={{ fontSize: 14 }}>{fmtKz(t.valor)}</div>}
                <StatusBadge status={t.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccoesRapidas({ openModal, toast }: { openModal: AppShellProps['openModal']; toast: AppShellProps['toast'] }) {
  return (
    <div className="kx-card" style={{ padding: 24 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>Acções rápidas</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => openModal('contribuicao')} className="kx-btn kx-btn-primary"><Plus size={14} /> Contribuição</button>
        <button onClick={() => openModal('addMembro')} className="kx-btn kx-btn-outline"><Plus size={14} /> Membro</button>
        <button onClick={() => toast('info', 'Relatório PDF gerado · A descarregar...')} className="kx-btn kx-btn-outline"><Download size={14} /> Exportar</button>
        <button onClick={() => toast('info', 'SMS enviado para 4 membros pendentes')} className="kx-btn kx-btn-outline"><Send size={14} /> Lembrar</button>
      </div>
    </div>
  );
}

// ─── MEMBROS ──────────────────────────────────────────────────────────────
function MembrosView({ openDrawer, openModal }: { openDrawer: AppShellProps['openDrawer']; openModal: AppShellProps['openModal'] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'Pago' | 'Pendente' | 'Em atraso'>('todos');
  const filtered = useMemo(() => MEMBROS.filter(m =>
    (filter === 'todos' || m.status === filter) &&
    (search === '' || m.nome.toLowerCase().includes(search.toLowerCase()))
  ), [search, filter]);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 className="kx-display" style={{ fontSize: 26 }}>12 membros · Kixikila Rangel</h1>
        <button onClick={() => openModal('addMembro')} className="kx-btn kx-btn-primary"><Plus size={14} /> Adicionar membro</button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
          <input className="kx-input" placeholder="Pesquisar membro..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['todos', 'Pago', 'Pendente', 'Em atraso'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="kx-pill" style={{
              background: filter === f ? 'var(--brand)' : 'var(--surface-2)',
              color: filter === f ? '#fff' : 'var(--ink-2)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div className="kx-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
                {['#', 'Membro', 'Telemóvel', 'Pos.', 'Total Poupado', 'KixiScore', 'Status Maio', 'Acções'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} onClick={() => openDrawer(m)} style={{
                  borderTop: '1px solid var(--border-soft)', cursor: 'pointer',
                  background: i % 2 === 0 ? 'transparent' : 'var(--surface)',
                  transition: 'background 150ms',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--surface)'}>
                  <td style={{ padding: 14, color: 'var(--ink-3)' }}>{i + 1}</td>
                  <td style={{ padding: 14 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar iniciais={m.iniciais} cor={m.cor} size={32} /><span style={{ fontWeight: 600 }}>{m.nome}</span></div></td>
                  <td style={{ padding: 14, color: 'var(--ink-2)' }}>{m.tel}</td>
                  <td style={{ padding: 14 }} className="kx-num">{m.posicao}</td>
                  <td style={{ padding: 14 }} className="kx-num">{fmtKz(m.totalPoupado)}</td>
                  <td style={{ padding: 14 }}><MiniScoreBar score={m.score} /></td>
                  <td style={{ padding: 14 }}><StatusBadge status={m.status} /></td>
                  <td style={{ padding: 14 }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, color: 'var(--ink-3)' }}>
                      <button onClick={() => openDrawer(m)} aria-label="Ver"><Eye size={16} /></button>
                      <button aria-label="Mensagem"><MessageSquare size={16} /></button>
                      <button aria-label="Remover"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MEMBER DRAWER ────────────────────────────────────────────────────────
export function MemberDrawer({ open, membro, onClose, openModal, toast }: {
  open: boolean; membro: Membro | null; onClose: () => void;
  openModal: AppShellProps['openModal']; toast: AppShellProps['toast'];
}) {
  if (!open || !membro) return null;
  const calendario = ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
  const states = membro.id === 6 || membro.id === 9 ? ['p','p','p','p','p','p','a','a','a'] : ['p','p','p','p','p','p','p','p', membro.status === 'Pendente' ? 'x' : 'p'];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.4)' }}>
      <aside onClick={e => e.stopPropagation()} className="kx-scroll" style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(420px, 100vw)',
        background: 'var(--card)', overflowY: 'auto', animation: 'slideInRight 250ms ease-out', padding: 28,
      }}>
        <button onClick={onClose} aria-label="Fechar" style={{ position: 'absolute', top: 16, right: 16, color: 'var(--ink-3)' }}><X size={20} /></button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
          <Avatar iniciais={membro.iniciais} cor={membro.cor} size={80} />
          <h2 className="kx-display" style={{ fontSize: 22, marginTop: 12 }}>{membro.nome}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)' }}>
            {membro.tel}
            <button onClick={() => { navigator.clipboard?.writeText(membro.tel); toast('sucesso', 'Telemóvel copiado'); }} aria-label="Copiar"><Copy size={12} /></button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>Membro desde Setembro 2025 · {membro.meses} meses</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>Posição {membro.posicao}º · Recebe em {ROTACAO_MESES[membro.posicao - 1]}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <ScoreRing score={membro.score} size={140} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="kx-num" style={{ fontSize: 14, color: scoreColor(membro.score) }}>{membro.score} · {scoreLabel(membro.score)}</div>
          <div style={{ color: 'var(--gold)', marginTop: 2 }}>★★★★★</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>Calendário de contribuições</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 6 }}>
            {calendario.map((m, i) => {
              const s = states[i];
              const cor = s === 'p' ? 'var(--green)' : s === 'a' ? 'var(--red)' : 'var(--ink-4)';
              return (
                <div key={i} style={{ textAlign: 'center' }} title={`${m} 2026: ${s === 'p' ? 'Pago' : s === 'a' ? 'Em atraso' : 'Pendente'}`}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: cor, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                    {s === 'p' ? '✓' : s === 'a' ? '!' : ''}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 4 }}>{m}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
          <Mini label="Total" v={fmtKz(membro.totalPoupado)} />
          <Mini label="Pontualidade" v={`${membro.pontualidade}%`} />
          <Mini label="Sequência" v={`${Math.min(membro.meses, 8)} meses`} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => openModal('contribuicao', membro)} className="kx-btn kx-btn-primary">✓ Registar pagamento</button>
          <button onClick={() => toast('info', `SMS de lembrete enviado a ${membro.nome.split(' ')[0]}`)} className="kx-btn kx-btn-outline"><Send size={14} /> Enviar lembrete SMS</button>
          <button onClick={() => openModal('recomendacao', membro)} className="kx-btn kx-btn-blue"><Building2 size={14} /> Recomendar ao banco</button>
          <button onClick={() => { if (confirm(`Remover ${membro.nome} do grupo?`)) { onClose(); toast('aviso', `${membro.nome} removido do grupo`); } }} className="kx-btn" style={{ color: 'var(--red)', border: '1.5px solid var(--red)' }}>
            <X size={14} /> Remover do grupo
          </button>
        </div>
      </aside>
    </div>
  );
}
function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div className="kx-num" style={{ fontSize: 14, marginTop: 2 }}>{v}</div>
    </div>
  );
}

// ─── KIXISCORE VIEW ───────────────────────────────────────────────────────
function KixiScoreView({ user, toast }: { user: Membro; toast: AppShellProps['toast'] }) {
  const [mode, setMode] = useState<'membro' | 'grupo'>('membro');
  return (
    <div>
      <div style={{ display: 'inline-flex', background: 'var(--surface-2)', padding: 4, borderRadius: 100, marginBottom: 24 }}>
        {(['membro', 'grupo'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 600,
            background: mode === m ? 'var(--card)' : 'transparent',
            color: mode === m ? 'var(--ink)' : 'var(--ink-3)',
            boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
          }}>
            {m === 'membro' ? 'O meu score' : 'Score do grupo'}
          </button>
        ))}
      </div>
      {mode === 'membro' ? <ScoreModoMembro user={user} toast={toast} /> : <ScoreModoGrupo toast={toast} />}
    </div>
  );
}

function ScoreModoMembro({ user, toast }: { user: Membro; toast: AppShellProps['toast'] }) {
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const code = `KXP-VRFC-${user.score}-2026-${user.iniciais}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="kx-card" style={{ padding: 32, textAlign: 'center' }}>
        <ScoreRing score={user.score} size={200} />
        <div style={{ marginTop: 16, color: 'var(--gold)' }}>★★★★★ Pagador Exemplar</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="kx-kpi-grid">
        <ScoreMetric label="Pontualidade" v={`${user.pontualidade}%`} sub="92% no prazo" pct={user.pontualidade} cor="var(--green)" />
        <ScoreMetric label="Meses activos" v={`${user.meses} meses`} sub="Histórico sólido" pct={(user.meses / 12) * 100} cor="var(--blue)" />
        <ScoreMetric label="Total poupado" v={fmtKz(user.totalPoupado)} sub="Valor acumulado" pct={80} cor="var(--brand)" />
      </div>
      <div className="kx-card" style={{ padding: 24, background: 'var(--surface-2)' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 16 }}>Como o score é calculado</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="kx-formula">
          {[
            { l: 'Pontualidade', p: 50, v: '92%' },
            { l: 'Tempo activo', p: 30, v: '67%' },
            { l: 'Volume médio', p: 20, v: '80%' },
          ].map(b => (
            <div key={b.l} title={`${b.l}: ${b.v} ponderado a ${b.p}%`} className="kx-card" style={{ padding: 16, background: 'var(--card)' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{b.l}</div>
              <div className="kx-num" style={{ fontSize: 22, marginTop: 4 }}>{b.v}</div>
              <div style={{ fontSize: 11, color: 'var(--brand)', marginTop: 2 }}>Peso {b.p}%</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-2)' }}>
          (92% × 0.5) + (67% × 0.3) + (80% × 0.2) = <strong>{user.score}</strong>
        </div>
      </div>
      <div className="kx-card" style={{ padding: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 16 }}>O que o score desbloqueia</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { min: 800, lvl: 'Excelente', cor: 'var(--green)', d: 'Elegível para micro-crédito até 500.000 Kz · BFA · Atlântico · BAI' },
            { min: 600, lvl: 'Bom', cor: 'var(--blue)', d: 'Conta poupança premium sem taxa de manutenção' },
            { min: 400, lvl: 'Regular', cor: 'var(--orange-mid)', d: 'Membro verificado KixiPay com selo oficial' },
            { min: 0, lvl: 'A construir', cor: 'var(--ink-4)', d: 'Continue a pagar no prazo para subir de nível' },
          ].map(l => {
            const active = user.score >= l.min;
            return (
              <div key={l.lvl} style={{
                padding: 14, borderRadius: 12, border: `2px solid ${active ? l.cor : 'var(--border-soft)'}`,
                opacity: active ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: l.cor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {active ? <Check size={14} /> : '·'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: l.cor }}>{l.lvl} <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 6 }}>≥ {l.min}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{l.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={() => setShare(true)} className="kx-btn kx-btn-blue kx-btn-lg" style={{ alignSelf: 'flex-start' }}>
        <Building2 size={16} /> Partilhar Score com o banco
      </button>
      {share && (
        <div onClick={() => setShare(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="kx-scale-in" style={{ background: 'var(--card)', borderRadius: 24, padding: 32, maxWidth: 400, textAlign: 'center' }}>
            <h3 className="kx-display" style={{ fontSize: 22, marginBottom: 12 }}>Partilhar KixiScore</h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><GeoQR seed={code} /></div>
            <code className="kx-mono" style={{ display: 'block', padding: 10, background: 'var(--surface)', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>{code}</code>
            <button onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); toast('sucesso', 'Código copiado'); }} className="kx-btn kx-btn-primary" style={{ width: '100%' }}>
              {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar código</>}
            </button>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 10 }}>Válido até 31 de Maio 2026</div>
          </div>
        </div>
      )}
    </div>
  );
}
function ScoreMetric({ label, v, sub, pct, cor }: { label: string; v: string; sub: string; pct: number; cor: string }) {
  return (
    <div className="kx-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <div className="kx-num" style={{ fontSize: 22, color: cor, marginTop: 4 }}>{v}</div>
      <div style={{ height: 5, background: 'var(--border-soft)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: cor }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

import { GeoQR } from './shared';

function ScoreModoGrupo({ toast }: { toast: AppShellProps['toast'] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dist = useMemo(() => {
    const buckets = { exc: 0, bom: 0, reg: 0, baixo: 0 };
    MEMBROS.forEach(m => {
      if (m.score >= 800) buckets.exc++;
      else if (m.score >= 600) buckets.bom++;
      else if (m.score >= 400) buckets.reg++;
      else buckets.baixo++;
    });
    return buckets;
  }, []);
  useEffect(() => {
    if (!ref.current) return;
    const c = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: ['Excelente (800+)', 'Bom (600-799)', 'Regular (400-599)', 'Baixo (<400)'],
        datasets: [{ data: [dist.exc, dist.bom, dist.reg, dist.baixo], backgroundColor: ['#16A34A', '#1D4ED8', '#F97316', '#DC2626'], borderRadius: 8 }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } }, y: { grid: { display: false } } },
      },
    });
    return () => c.destroy();
  }, [dist]);
  const total = MEMBROS.filter(m => eligivel(m.score).ok).reduce((s, m) => s + eligivel(m.score).limite, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="kx-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>Distribuição de scores</div>
          <span className="kx-pill" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>Score médio: 824 · Grupo Excelente</span>
        </div>
        <div style={{ height: 220 }}><canvas ref={ref} /></div>
      </div>
      <div className="kx-card" style={{ padding: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>Tabela de elegibilidade</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
                {['Membro', 'Score', 'Meses', 'Total Kz', 'Elegível', 'Limite sugerido', 'Banco'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEMBROS.map(m => {
                const e = eligivel(m.score);
                return (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar iniciais={m.iniciais} cor={m.cor} size={24} /> {m.nome}
                    </td>
                    <td style={{ padding: '10px 14px' }}><MiniScoreBar score={m.score} /></td>
                    <td className="kx-num" style={{ padding: '10px 14px' }}>{m.meses}</td>
                    <td className="kx-num" style={{ padding: '10px 14px' }}>{fmtKz(m.totalPoupado)}</td>
                    <td style={{ padding: '10px 14px', color: e.ok ? 'var(--green)' : 'var(--ink-4)', fontWeight: 700 }}>{e.ok ? '✓' : '✕'}</td>
                    <td className="kx-num" style={{ padding: '10px 14px' }}>{e.ok ? fmtKz(e.limite) : 'Não elegível'}</td>
                    <td style={{ padding: '10px 14px' }}>{e.banco}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="kx-card" style={{ padding: 28, background: 'linear-gradient(135deg, var(--blue-light), var(--card))', borderLeft: '4px solid var(--blue)' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>Impacto colectivo</div>
        <h2 className="kx-display" style={{ fontSize: 24, marginTop: 6 }}>10 de 12 membros elegíveis para crédito formal</h2>
        <div className="kx-num" style={{ fontSize: 28, color: 'var(--blue)', marginTop: 8 }}>Total potencial: {fmtKz(total)}</div>
        <button onClick={() => toast('info', 'CSV exportado · 12 membros incluídos')} className="kx-btn kx-btn-blue" style={{ marginTop: 14 }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>
    </div>
  );
}

// ─── USSD VIEW ────────────────────────────────────────────────────────────
function UssdView() {
  const [screen, setScreen] = useState(0);
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>USSD · Para todos os telemóveis</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32, alignItems: 'flex-start' }} className="kx-ussd-app">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <FeaturePhone screen={screen} onScreen={setScreen} />
          <span className="kx-pill">Ecrã {screen + 1} de 4</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="kx-card" style={{ padding: 24 }}>
            <h3 className="kx-display" style={{ fontSize: 20, marginBottom: 8 }}>Para quem não tem smartphone</h3>
            <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5 }}>
              Cada membro pode contribuir, consultar saldo e ver o seu KixiScore directamente do feature phone — sem internet.
            </p>
          </div>
          <div className="kx-card" style={{ padding: 24, background: 'var(--brand-light)' }}>
            <div style={{ fontSize: 12, color: 'var(--brand-dark)', fontWeight: 600, textTransform: 'uppercase' }}>Como activar</div>
            <div className="kx-mono" style={{ fontSize: 24, marginTop: 6, color: 'var(--brand)' }}>*920*55#</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <span className="kx-pill" style={{ background: 'var(--card)' }}>Unitel</span>
              <span className="kx-pill" style={{ background: 'var(--card)' }}>Angola Telecom</span>
            </div>
          </div>
          <div className="kx-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>Fluxo USSD</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {['Menu', 'Pagar', 'Confirmar', 'Score'].map((s, i, arr) => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="kx-pill" style={{ background: i === screen ? 'var(--brand)' : 'var(--surface-2)', color: i === screen ? '#fff' : 'var(--ink-2)', cursor: 'pointer' }} onClick={() => setScreen(i)}>{i + 1}. {s}</span>
                  {i < arr.length - 1 && <span style={{ color: 'var(--ink-4)' }}>→</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="kx-card" style={{ padding: 20, background: 'var(--surface)' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>SMS automático</div>
            <div className="kx-mono" style={{ fontSize: 12, lineHeight: 1.6, padding: 12, background: 'var(--card)', borderRadius: 10, color: 'var(--ink-2)' }}>
              KixiPay: Conceição, lembre-se de pagar 5.000 Kz até dia 30. Marque *920*55# para confirmar. Saldo grupo: 185.000 Kz.
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .kx-ussd-app { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ─── HISTORICO VIEW ───────────────────────────────────────────────────────
function HistoricoView() {
  const [periodo, setPeriodo] = useState('mes');
  const [tipo, setTipo] = useState<'todos' | 'Contribuição' | 'Recebimento' | 'Lembrete SMS'>('todos');
  const ref = useRef<HTMLCanvasElement>(null);
  const filtered = HISTORICO.filter(h => tipo === 'todos' || h.tipo === tipo);
  useEffect(() => {
    if (!ref.current) return;
    const c = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
        datasets: [
          { label: 'Contribuições', data: [60, 58, 60, 57, 40], borderColor: '#1D4ED8', backgroundColor: 'rgba(29,78,216,0.1)', fill: true, tension: 0.35 },
          { label: 'Pagamentos', data: [60, 60, 0, 0, 60], borderColor: '#16A34A', backgroundColor: 'rgba(22,163,74,0.1)', fill: true, tension: 0.35 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    });
    return () => c.destroy();
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 className="kx-display" style={{ fontSize: 26 }}>Histórico de transacções</h1>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="kx-input" style={{ width: 'auto' }}>
          <option value="mes">Este mês</option>
          <option value="trimestre">Último trimestre</option>
          <option value="2025">2025</option>
          <option value="tudo">Tudo</option>
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['todos', 'Contribuição', 'Recebimento', 'Lembrete SMS'] as const).map(t => (
            <button key={t} onClick={() => setTipo(t)} className="kx-pill" style={{
              background: tipo === t ? 'var(--brand)' : 'var(--surface-2)',
              color: tipo === t ? '#fff' : 'var(--ink-2)', cursor: 'pointer',
            }}>{t === 'todos' ? 'Todos' : t}</button>
          ))}
        </div>
      </div>
      <div className="kx-card" style={{ padding: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>Movimentos no período</div>
        <div style={{ height: 220 }}><canvas ref={ref} /></div>
      </div>
      <div className="kx-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
                {['Data', 'Membro', 'Tipo', 'Valor', 'Referência', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderTop: '1px solid var(--border-soft)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--ink-2)' }}>{t.data}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{t.membro}</td>
                  <td style={{ padding: '12px 14px' }}>{t.tipo}</td>
                  <td className="kx-num" style={{ padding: '12px 14px', color: t.status === 'Em atraso' ? 'var(--red)' : t.tipo === 'Lembrete SMS' ? 'var(--ink-3)' : 'var(--green)' }}>
                    {t.valor > 0 ? fmtKz(t.valor) : '—'}
                  </td>
                  <td className="kx-mono" style={{ padding: '12px 14px', color: 'var(--ink-3)', fontSize: 11 }}>{t.ref}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="kx-kpi-grid">
        <KpiCard cor="var(--green)" bg="var(--green-light)" Icon={ArrowDownRight} label="Total Recebido" valor={fmtKz(185000)} sub="Este período" />
        <KpiCard cor="var(--blue)" bg="var(--blue-light)" Icon={Wallet} label="Total Distribuído" valor={fmtKz(120000)} sub="2 recebimentos" />
        <KpiCard cor="var(--brand)" bg="var(--brand-light)" Icon={Users} label="Membros em dia" valor="10 / 12" sub="83% do grupo" />
        <KpiCard cor="var(--gold)" bg="var(--gold-light)" Icon={Star} label="Taxa de pagamento" valor="92%" sub="Acima da média" />
      </div>
    </div>
  );
}

// ─── CONFIG VIEW ──────────────────────────────────────────────────────────
function ConfigView({ toast }: { toast: AppShellProps['toast'] }) {
  const [tab, setTab] = useState<'perfil' | 'grupo' | 'notif' | 'plano'>('perfil');
  return (
    <div>
      <h1 className="kx-display" style={{ fontSize: 26, marginBottom: 20 }}>Configurações</h1>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {[
          { id: 'perfil', l: 'Perfil' }, { id: 'grupo', l: 'Grupo' },
          { id: 'notif', l: 'Notificações' }, { id: 'plano', l: 'Plano' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{
            padding: '10px 16px', fontSize: 14, fontWeight: 600,
            color: tab === t.id ? 'var(--brand)' : 'var(--ink-3)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--brand)' : 'transparent'}`,
            marginBottom: -1, whiteSpace: 'nowrap',
          }}>{t.l}</button>
        ))}
      </div>
      <div className="kx-card" style={{ padding: 28, maxWidth: 640 }}>
        {tab === 'perfil' && <ConfigPerfil toast={toast} />}
        {tab === 'grupo' && <ConfigGrupo toast={toast} />}
        {tab === 'notif' && <ConfigNotif />}
        {tab === 'plano' && <ConfigPlano />}
      </div>
    </div>
  );
}
function ConfigPerfil({ toast }: { toast: AppShellProps['toast'] }) {
  const cores = ['#FF5C1A', '#1D4ED8', '#16A34A', '#F5A623', '#7C3AED', '#DC2626'];
  const [cor, setCor] = useState('#FF5C1A');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <Avatar iniciais="CM" cor={cor} size={64} />
        <div style={{ display: 'flex', gap: 8 }}>
          {cores.map(c => (
            <button key={c} onClick={() => setCor(c)} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: cor === c ? '2px solid var(--ink)' : '2px solid transparent' }} aria-label={`Cor ${c}`} />
          ))}
        </div>
      </div>
      <Field l="Nome completo"><input className="kx-input" defaultValue="Conceição Mateus" /></Field>
      <Field l="Telemóvel"><input className="kx-input" defaultValue="+244 923 456 789" /></Field>
      <Field l="Email (opcional)"><input className="kx-input" placeholder="exemplo@kixipay.ao" /></Field>
      <Field l="PIN"><input className="kx-input" type="password" defaultValue="1234" /></Field>
      <button onClick={() => toast('sucesso', 'Alterações guardadas com sucesso')} className="kx-btn kx-btn-primary" style={{ alignSelf: 'flex-start' }}>Guardar alterações</button>
    </div>
  );
}
function ConfigGrupo({ toast }: { toast: AppShellProps['toast'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field l="Nome do grupo"><input className="kx-input" defaultValue="Kixikila Rangel" /></Field>
      <Field l="Código do grupo">
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="kx-input kx-mono" defaultValue="KXRNG-2024" readOnly />
          <button className="kx-btn kx-btn-outline kx-btn-sm" onClick={() => { navigator.clipboard?.writeText('KXRNG-2024'); toast('sucesso', 'Código copiado'); }}><Copy size={14} /></button>
        </div>
      </Field>
      <Field l="Valor mensal (Kz)"><input className="kx-input" defaultValue="5000" /></Field>
      <Field l="Dia de corte"><select className="kx-input">{[15, 20, 25, 30].map(d => <option key={d}>Dia {d} de cada mês</option>)}</select></Field>
      <button onClick={() => toast('info', 'Novo código gerado: KXRNG-2026')} className="kx-btn kx-btn-outline" style={{ alignSelf: 'flex-start' }}>Gerar novo código</button>
    </div>
  );
}
function ConfigNotif() {
  const [opts, setOpts] = useState<Record<string, boolean>>({
    sms_conf: true, lembrete_5: true, aviso_atraso: true, conf_receb: true, relatorio: false,
  });
  const items = [
    { k: 'sms_conf', l: 'SMS de confirmação' },
    { k: 'lembrete_5', l: 'Lembrete 5 dias antes' },
    { k: 'aviso_atraso', l: 'Aviso de atraso' },
    { k: 'conf_receb', l: 'Confirmação de recebimento' },
    { k: 'relatorio', l: 'Relatório mensal' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map(it => (
        <div key={it.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
          <span style={{ fontWeight: 500 }}>{it.l}</span>
          <div className={`kx-switch ${opts[it.k] ? 'on' : ''}`} onClick={() => setOpts(o => ({ ...o, [it.k]: !o[it.k] }))} />
        </div>
      ))}
    </div>
  );
}
function ConfigPlano() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--brand-light)', padding: 20, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="kx-pill" style={{ background: 'var(--brand)', color: '#fff' }}>Activo</span>
          <h3 className="kx-display" style={{ fontSize: 22, marginTop: 8 }}>Comunidade · 2.500 Kz/mês</h3>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Renovação: 1 de Junho 2026</div>
        </div>
      </div>
      <div className="kx-card" style={{ padding: 16, background: 'var(--surface)' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Histórico de pagamentos</div>
        {['1 Mai 2026', '1 Abr 2026', '1 Mar 2026'].map(d => (
          <div key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--border-soft)' }}>
            <span>{d}</span><span className="kx-num">2.500 Kz</span>
          </div>
        ))}
      </div>
      <button className="kx-btn kx-btn-outline" style={{ alignSelf: 'flex-start' }}>Mudar de plano</button>
    </div>
  );
}
function Field({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>{l}</label>
      {children}
    </div>
  );
}
