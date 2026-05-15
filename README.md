# KixiPay — A tua kixikila, organizada e digital

Plataforma angolana que digitaliza as **kixikilas** (poupança rotativa). Gere grupos de poupança, regista contribuições e constrói o **KixiScore** — um histórico financeiro reconhecido por bancos angolanos.

---

## Funcionalidades

### Landing Page

- Hero com CTA "Criar grupo grátis" + "Ver demonstração", prova social (28.000+ angolanos)
- Como Funciona — 4 passos: criar grupo, contribuir, transparência, receber
- Comunidade — prazos flexíveis (14–30 dias), grupos por região, coordenação por score 800+, análise de perfil, valor mínimo 5.000 Kz sem limite máximo
- KixiScore — score ring interactivo com slider 300–1000, bancos parceiros (BFA, Atlântico, BAI, SOL)
- USSD Simulator — telemóvel feature phone com 4 ecrãs
- Planos — Grátis, Comunidade (2.500 Kz/mês), Banco (sob consulta)
- Testemunhos, Para Bancos, Footer

### Perfil Coordenador

| View          | Funcionalidades                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| **Dashboard** | 4 KPI cards, gráfico contribuições 6 meses, rotação completa, actividade recente, acções rápidas, notificações |
| **Membros**   | Tabela com busca/filtros, member drawer (calendário, score, acções)                                            |
| **KixiScore** | Score individual + grupo, tabela elegibilidade, export CSV, QR code                                            |
| **USSD**      | Simulador + instruções                                                                                         |
| **Histórico** | Filtro período/tipo, gráfico, tabela                                                                           |
| **Config**    | Perfil, Grupo, Notificações, Plano                                                                             |

### Perfil Membro

| View                  | Funcionalidades                                                                    |
| --------------------- | ---------------------------------------------------------------------------------- |
| **Dashboard pessoal** | KPI, ScoreRing, calendário contribuições, próximo recebimento, pagamentos recentes |
| **Comunidades**       | Explorar por região, solicitar entrada, entrar com código                          |
| **KixiScore**         | Score + elegibilidade                                                              |
| **Histórico pessoal** | Apenas suas transacções                                                            |
| **Config**            | Perfil e Notificações                                                              |

---

## Stack

| Categoria  | Tecnologia                            |
| ---------- | ------------------------------------- |
| Framework  | TanStack Start (React 19, SSR)        |
| Linguagem  | TypeScript 5.8                        |
| Roteamento | TanStack Router                       |
| Estado     | TanStack Query, react-hook-form + zod |
| UI         | Tailwind CSS 4, Radix UI              |
| Charts     | Chart.js + react-chartjs-2            |
| Ícones     | lucide-react                          |
| Build      | Vite 7 + Cloudflare Plugin            |
| Deploy     | Cloudflare Workers                    |

---

## Para o Backend — Contrato de API

O frontend espera os seguintes endpoints REST. Todos os serviços estão em `src/services/` e alternam entre **mock** (sem `VITE_API_URL`) e **API real** (com `VITE_API_URL` definida).

### Autenticação (`src/services/auth.ts`)

| Método | Endpoint         | Request                                       | Response                        |
| ------ | ---------------- | --------------------------------------------- | ------------------------------- |
| `POST` | `/auth/login`    | `{ telefone: string, pin: string }`           | `{ userId, nome, role, token }` |
| `POST` | `/auth/register` | `{ nome, telefone, pin, pinConfirm, termos }` | `{ userId, nome, role, token }` |

O token deve ser retornado no header `Authorization: Bearer <token>` nas requests seguintes.

### Grupo / Dashboard (`src/services/groups.ts`)

| Método | Endpoint                            | Descrição                          |
| ------ | ----------------------------------- | ---------------------------------- |
| `GET`  | `/grupo`                            | Dados do grupo                     |
| `GET`  | `/grupo/dashboard`                  | KPIs, próximo recebimento, rotação |
| `GET`  | `/membros?search=&status=`          | Lista membros (filtros opcionais)  |
| `GET`  | `/historico?periodo=&tipo=&membro=` | Transacções filtradas              |
| `PUT`  | `/grupo`                            | Actualizar grupo                   |
| `POST` | `/membros`                          | Adicionar membro                   |

**Dashboard response esperado:**

```json
{
  "saldoTotal": 185000,
  "membrosActivos": 12,
  "totalMembros": 12,
  "contribuicoesMes": 8,
  "metaContribuicoes": 12,
  "kixiScoreMedio": 824,
  "proximoRecebimento": {
    "nome": "Manuel Jacinto",
    "posicao": 7,
    "mes": "Junho 2026",
    "valor": 60000
  },
  "rotacao": [{ "nome": "Conceição Mateus", "posicao": 1, "mes": "Dez 2025" }]
}
```

### Comunidades (`src/services/community.ts`)

| Método | Endpoint                      | Descrição                                     |
| ------ | ----------------------------- | --------------------------------------------- |
| `GET`  | `/comunidades?regiao=`        | Lista comunidades (filtro região opcional)    |
| `GET`  | `/comunidades/codigo/:codigo` | Buscar por código                             |
| `POST` | `/comunidades/solicitar`      | `{ comunidadeId: number }`                    |
| `POST` | `/comunidades/convite`        | `{ membroNome: string }` → `{ link: string }` |

### KixiScore (`src/services/score.ts`)

| Método | Endpoint              | Descrição                                                 |
| ------ | --------------------- | --------------------------------------------------------- |
| `GET`  | `/score/:membroId`    | Score info (score, nivel, pontualidade, meses, total)     |
| `GET`  | `/score/distribuicao` | Contagem por nivel (Excelente, Bom, Regular, A construir) |

---

## Como ligar o backend

### 1. Definir a URL da API

```bash
# .env (raiz do projecto)
VITE_API_URL=https://api.kixipay.ao/v1
```

### 2. A flag `IS_MOCK` desliga automaticamente

```typescript
// src/services/client.ts
export const IS_MOCK = !import.meta.env.VITE_API_URL;
```

Quando `VITE_API_URL` está definida, todos os serviços fazem fetch real.
Quando não está (dev), usam dados mock com `delay()`.

### 3. Formato das responses

Todas as respostas devem seguir o formato:

```json
{
  "data": { ... },
  "success": true,
  "message": "opcional",
  "timestamp": "2026-05-15T10:30:00Z"
}
```

Paginação:

```json
{
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

Erros:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Credenciais inválidas",
    "details": { "telefone": ["Número não registado"] }
  }
}
```

### 4. Autenticação

O token é guardado no `localStorage` com a chave `kx_auth_token` e enviado como `Authorization: Bearer <token>` em todas as requests.

### 5. CORS

Permitir origens: `http://localhost:4321`, `https://kixipay.ao`

---

## Dados Mock

O modo mock usa dados em `src/services/mock-data.ts`:

- 12 membros no grupo "Kixikila Rangel"
- 15 transacções no histórico
- 8 comunidades em 5 regiões
- 2 perfis demo (Conceição coordenadora, Manuel membro)
- Login simulado com `delay(1200)`

---

## Estrutura do Código

```
src/
├── types/
│   └── index.ts              # Tipos centralizados (Membro, Transacao, Comunidade, API response, etc.)
├── lib/
│   ├── constants.ts           # Constantes (prazos, regex, API base URL)
│   └── validations.ts         # Schemas Zod (9 schemas: login, register, contribuicao, addMembro, perfil, etc.)
├── services/                  # ← Camada que o backend substitui
│   ├── client.ts              # HTTP client (fetch wrappers + IS_MOCK flag + token management)
│   ├── auth.ts                # login(), register()
│   ├── groups.ts              # getGrupo(), getDashboard(), getMembros(), getHistorico(), addMembro()
│   ├── community.ts           # getComunidades(), solicitarEntrada(), gerarConvite()
│   ├── score.ts               # getScoreInfo(), scoreColor(), scoreLabel(), elegibilidade()
│   ├── mock-data.ts           # Dados mock (12 membros, 15 transações, 8 comunidades)
│   └── index.ts               # Barrel export
├── components/
│   ├── ui/                    # Componentes UI genéricos (shadcn)
│   └── kixipay/
│       ├── Landing.tsx        # Landing page
│       ├── AppShell.tsx       # App pós-login (2900+ linhas)
│       ├── Modals.tsx         # AuthModal (react-hook-form + zod), ContribuicaoModal, etc.
│       ├── shared.tsx         # Logo, Avatar, ScoreRing, Toast, Modal, Skeleton, ErrorState, EmptyState
│       └── data.ts            # Re-export dos services (compatibilidade)
├── routes/
│   ├── __root.tsx
│   └── index.tsx
├── styles.css
└── server.ts
```

---

## Scripts

```bash
npm run dev          # Desenvolvimento com Vite (localhost:4321)
npm run build        # Build produção (Cloudflare Workers)
npm run build:dev    # Build modo desenvolvimento
npm run lint         # ESLint
npm run format       # Prettier
```

---

## Types principais (`src/types/index.ts`)

```typescript
interface Membro {
  id: number;
  nome: string;
  tel: string;
  posicao: number;
  totalPoupado: number;
  score: number;
  status: "Pago" | "Pendente" | "Em atraso";
  iniciais: string;
  cor: string;
  meses: number;
  pontualidade: number;
}

interface Transacao {
  id: number;
  data: string;
  membro: string;
  tipo: string;
  valor: number;
  ref: string;
  status: string;
}

interface Comunidade {
  id: number;
  nome: string;
  regiao: string;
  membros: number;
  maxMembros: number;
  valorMensal: number;
  codigo: string;
  descricao: string;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

interface LoginRequest {
  telefone: string;
  pin: string;
}
```

Ver o ficheiro completo em `src/types/index.ts`.

---

## Créditos

Desenvolvido em Angola 🇦🇴 · Hackathon 2026 · Parceiro LISPA · Acreditado pelo BNA
