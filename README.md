# KixiPay — A tua kixikila, organizada e digital

Plataforma angolana que digitaliza as **kixikilas** (poupança rotativa). Gere grupos de poupança, regista contribuições e constrói o **KixiScore** — um histórico financeiro reconhecido por bancos angolanos.

---

## Funcionalidades

### 🏠 Landing Page

- **Hero** com CTA "Criar grupo grátis" + "Ver demonstração", prova social (28.000+ angolanos)
- **Como Funciona** — 4 passos: criar grupo, contribuir, transparência, receber
- **Comunidade** — prazos flexíveis (14–30 dias), grupos por região (Luanda, Benguela, Huambo, Malanje, Huíla), coordenação por score 800+, análise de perfil, valor mínimo 5.000 Kz sem limite máximo
- **KixiScore** — score ring interactivo com slider de 300–1000, bancos parceiros (BFA, Atlântico, BAI, SOL)
- **USSD Simulator** — telemóvel feature phone com 4 ecrãs (menu, pagamento, confirmação, score)
- **Planos** — 3 tiers: Grátis (8 membros), Comunidade (2.500 Kz/mês, 20 membros), Banco (sob consulta)
- **Testemunhos** — 3 histórias reais com KixiScore e rating
- **Para Bancos** — secção institucional com API, risco, potencial 1.25Mrd Kz

### 🔐 Autenticação

- Modal com abas **Entrar** / **Criar conta**
- Login por telefone +244 e PIN 4 dígitos
- 2 perfis demo: **Conceição** (coordenadora) e **Manuel** (membro)
- Detecção automática: se telefone = Manuel → membro, senão → coordenadora

### 👤 Perfil de Coordenador (Conceição)

| View              | Funcionalidades                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**     | 4 KPI cards, gráfico contribuições 6 meses, rotação completa, actividade recente, acções rápidas (contribuir, adicionar membro, exportar, lembrar), notificações |
| **Membros**       | Tabela com 12 membros, busca, filtros (Pago/Pendente/Em atraso), member drawer com calendário contribuições, score, acções                                       |
| **KixiScore**     | Score individual + grupo, tabela elegibilidade, export CSV, partilha via QR code                                                                                 |
| **Pagar USSD**    | Simulador de feature phone e instruções                                                                                                                          |
| **Histórico**     | Filtro por período/tipo, gráfico contribuições vs pagamentos, tabela completa                                                                                    |
| **Configurações** | Perfil (avatar, nome, telefone), Grupo (nome, código, valor, dia corte), Notificações (5 toggles), Plano (actual + histórico)                                    |

### 👤 Perfil de Membro (Manuel)

| View                  | Funcionalidades                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard pessoal** | KPI: Meu KixiScore, Minha Posição, Total Poupado, Status mês. ScoreRing, calendário contribuições, próximo recebimento, pagamentos recentes, acções rápidas |
| **Comunidades**       | Explorar comunidades por região, solicitar entrada, entrar com código                                                                                       |
| **KixiScore**         | Score individual + elegibilidade                                                                                                                            |
| **Histórico pessoal** | Apenas transacções do membro                                                                                                                                |
| **Configurações**     | Perfil e Notificações (sem Grupo/Plano)                                                                                                                     |

### 🏘️ Comunidades

- 8 comunidades mock em 5 regiões
- Filtro por região
- Cards com nome, código, membros, valor mensal
- "Solicitar entrada" (grupos com vaga) ou "Grupo completo"
- Entrar com código da comunidade
- Coordenador pode **convidar por link** (gera URL, copia clipboard)

### 📊 KixiScore

- Score 300–1000 com tiers: Excelente 800+, Bom 600+, Regular 400+, A construir
- Fórmula: 50% pontualidade, 30% tempo, 20% volume
- Partilha via QR code + código verificação
- Elegibilidade para crédito até 500.000 Kz (BFA)

### 📱 USSD

- Simulador de feature phone com ecrãs interactivos
- Código `*920*55#`
- Funciona sem internet, sem smartphone

---

## Stack Técnica

| Categoria       | Tecnologia                              |
| --------------- | --------------------------------------- |
| **Framework**   | TanStack Start (React 19, SSR)          |
| **Linguagem**   | TypeScript 5.8                          |
| **Roteamento**  | TanStack Router (file-based)            |
| **Estado**      | TanStack Query, estado local (useState) |
| **UI**          | Tailwind CSS 4, Radix UI primitives     |
| **Charts**      | Chart.js + react-chartjs-2              |
| **Formulários** | react-hook-form + zod                   |
| **Ícones**      | lucide-react                            |
| **Build**       | Vite 7 + Cloudflare Plugin              |
| **Deploy**      | Cloudflare Workers                      |
| **Code style**  | ESLint + Prettier                       |

---

## Estrutura do Projecto

```
src/
├── routes/
│   ├── __root.tsx          # Root layout (HTML shell)
│   └── index.tsx           # Rota única — orquestra Landing / AppShell / Modals
├── components/
│   ├── ui/                 # Componentes UI genéricos (shadcn-style)
│   │   ├── button.tsx, card.tsx, input.tsx, dialog.tsx, …
│   │   └── chart.tsx       # Chart.js wrapper
│   └── kixipay/            # Componentes específicos do KixiPay
│       ├── Landing.tsx      # Landing page completa (~1588 linhas)
│       ├── AppShell.tsx     # App pós-login: sidebar, views, member drawer (~2900 linhas)
│       ├── Modals.tsx       # AuthModal, ContribuicaoModal, AddMembroModal, …
│       ├── shared.tsx       # Componentes partilhados: Logo, Avatar, ScoreRing, Toast, Modal, …
│       └── data.ts          # Dados mock: membros, histórico, comunidades, helpers
├── hooks/
│   └── use-mobile.tsx      # Hook de detecção mobile
├── lib/
│   ├── utils.ts            # Utilitários (cn())
│   ├── error-page.ts       # Página de erro SSR
│   └── error-capture.ts    # Captura de erros
├── router.tsx              # Criação do router TanStack
├── routeTree.gen.ts        # Árvore de rotas gerada automaticamente
├── start.ts                # Entry point TanStack Start
├── server.ts               # SSR server wrapper com error handling
└── styles.css              # Design tokens, animações, classes utilitárias
```

### Ficheiros de Configuração

| Ficheiro           | Função                                       |
| ------------------ | -------------------------------------------- |
| `vite.config.ts`   | Config Vite + TanStack Start + Cloudflare    |
| `tsconfig.json`    | Path alias `@/`, strict mode, ESNext modules |
| `wrangler.jsonc`   | Config deploy Cloudflare Workers             |
| `eslint.config.js` | Regras ESLint + Prettier                     |
| `.prettierrc`      | Formatação                                   |
| `components.json`  | Config shadcn/ui                             |
| `package.json`     | Dependências e scripts                       |

---

## Scripts

```bash
npm run dev          # Desenvolvimento com Vite
npm run build        # Build produção (Cloudflare)
npm run build:dev    # Build modo desenvolvimento
npm run preview      # Preview local
npm run lint         # ESLint
npm run format       # Prettier
```

---

## Dados Mock

O projecto **não tem backend real**. Todo o conteúdo é simulado:

- **12 membros** no grupo "Kixikila Rangel" com scores, status, histórico
- **15 transacções** no histórico (contribuições, recebimentos, lembretes)
- **8 comunidades** em 5 regiões
- **2 perfis demo** com login simulado (`setTimeout` 1.2s)
- Acções produzem **toasts** em vez de requests

---

## Créditos

Desenvolvido em Angola 🇦🇴 · Parceiro LISPA · Acreditado pelo BNA
