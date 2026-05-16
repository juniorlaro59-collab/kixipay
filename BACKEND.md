# KixiPay — Documentação do Backend

## Visão Geral

Plataforma angolana que digitaliza **kixikilas** (poupança rotativa).  
Frontend: React + TanStack Start + TypeScript.  
Este documento define o contrato de API que o backend deve implementar.

---

## 1. Convenções da API

### Base URL

```
VITE_API_URL=https://api.kixipay.ao/v1
```

### Formato de Resposta

```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```

### Paginação

```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Autenticação

- Header: `Authorization: Bearer <token>`
- Token obtido via `POST /auth/login`
- O frontend envia o token em todos os requests autenticados

---

## 2. Endpoints

### 2.1 Autenticação

#### `POST /auth/login`

```typescript
// Request
{
  telefone: string; // "+244 923 456 789"
  pin: string; // "1234"
}

// Response: ApiResponse<LoginResult>
{
  data: {
    userId: UserId; // "conceicao" | "manuel" | "admin" | "agente1" | "agente2"
    nome: string; // "Conceição Mateus"
    role: UserRole; // "admin" | "agent" | "coordinator" | "member"
    token: string; // JWT ou token de sessão
  }
}
```

#### `POST /auth/register`

```typescript
// Request
{
  nome: string; // 3-80 chars, apenas letras e espaços
  telefone: string; // formato: 9XX XXX XXX
  pin: string; // 4 dígitos
  pinConfirm: string; // deve coincidir com pin
  termos: boolean; // deve ser true
}

// Response: ApiResponse<LoginResult>
```

### 2.2 Grupos

#### `GET /grupo`

Retorna o grupo do coordenador logado.

#### `GET /grupo/dashboard`

```typescript
// Response: ApiResponse<DashboardData>
{
  saldoTotal: number;           // 185000
  membrosActivos: number;       // 12
  totalMembros: number;         // 12
  contribuicoesMes: number;     // 10
  metaContribuicoes: number;    // 12
  kixiScoreMedio: number;       // 743
  proximoRecebimento: {
    nome: string; posicao: number; mes: string; valor: number;
  } | null;
  rotacao: { nome: string; posicao: number; mes: string }[];
}
```

#### `GET /membros?search=&status=`

```typescript
// Query: search?: string, status?: "Pago" | "Pendente" | "Em atraso" | "todos"
// Response: ApiResponse<Membro[]>
```

#### `GET /historico?periodo=&tipo=&membro=`

```typescript
// Query: periodo?: string, tipo?: string, membro?: string
// Response: ApiResponse<Transacao[]>
```

#### `PUT /grupo`

```typescript
// Request: Partial<Grupo>
// Response: ApiResponse<Grupo>
```

#### `POST /membros`

```typescript
// Request
{
  nome: string;         // 3-80 chars
  telefone: string;     // formato 9XX XXX XXX
  email?: string;
  posicao: number;      // 1-12
}
// Response: ApiResponse<Membro>
```

#### `POST /contribuicoes`

```typescript
// Request
{
  membroId: number;
  valor: number;        // mínimo 1000
  data: string;         // "2026-05-15"
  metodo: "App" | "USSD" | "Dinheiro presencial";
  notas?: string;       // máximo 200 chars
}
// Response: ApiResponse<Transacao>
```

### 2.3 Comunidades

#### `GET /comunidades?regiao=`

Retorna lista de comunidades, opcionalmente filtrada por região.

#### `GET /comunidades/codigo/:codigo`

Busca comunidade por código (ex: `KXRNG-2024`).

#### `POST /comunidades/solicitar`

```typescript
{
  comunidadeId: number;
}
// Response: { success: boolean; message: string }
```

#### `POST /comunidades/convite`

```typescript
{
  membroNome: string;
}
// Response: { link: string }
```

### 2.4 Score

#### `GET /score/:membroId`

```typescript
// Response: ApiResponse<ScoreInfo>
{
  score: number; // 0-1000
  nivel: "Excelente" | "Bom" | "Regular" | "A construir";
  cor: string; // hex color
  pontualidade: number; // 0-100%
  mesesAtivo: number;
  totalPoupado: number;
}
```

#### `GET /score/distribuicao`

```typescript
// Response: ApiResponse<{ nivel: string; count: number }[]>
```

### 2.5 Agentes

#### `GET /agentes/:agentId/dashboard`

```typescript
// Response: ApiResponse<AgentDashboardData>
{
  membrosCadastradosMes: number;
  metaMensal: number;              // 20
  progressoMeta: number;           // 70 (%)
  taxaRetencao: number;            // 89 (%)
  scoreMedioCarteira: number;      // 742
  ultimosCadastros: Membro[];
  notificacoes: Notificacao[];
  actividadesRecentes: ActividadeAgente[];
  gruposNaRegiao: number;
}
```

#### `POST /agentes/cadastrar`

```typescript
// Request
{
  nome: string;
  telefone: string;
  regiao: string;             // "Luanda" | "Benguela" | ...
  grupoCodigo?: string;       // opcional
  coordenadorNome?: string;   // opcional
  observacoes?: string;       // opcional
}
// Response: ApiResponse<Membro>
```

#### `GET /agentes/:agentId/actividades`

Retorna lista de actividades do agente.

### 2.6 Admin

#### `GET /admin/stats`

```typescript
// Response: ApiResponse<PlatformStats>
{
  totalMembros: number;
  totalGrupos: number;
  totalAgentes: number;
  totalCoordenadores: number;
  volumeTotal: number; // Kz
  scoreMedio: number;
  membrosActivos: number;
  fundosCirculacao: number; // Kz
  crescimentoMensal: number; // percentual
}
```

#### `GET /admin/activity?page=1&pageSize=20`

```typescript
// Response: { entries: ActivityLogEntry[]; total: number }
```

#### `GET /admin/agentes`

Retorna todos os agentes.

#### `GET /admin/agentes/:id/status?status=`

Altera status do agente (`activo` | `inactivo` | `suspenso`).

#### `GET /admin/membros?page=1&pageSize=50`

```typescript
// Response: { membros: Membro[]; total: number }
```

#### `DELETE /admin/membros/:id`

Remove membro da plataforma.

### 2.7 AI Score

#### `GET /ai/score/dashboard`

```typescript
// Response: ApiResponse<AScoreDashboard>
{
  scoreMedioGeral: number;
  totalAnalises: number;
  alertasActivos: number;
  membrosEmRisco: number;
  distribuicao: {
    nivel: string;
    count: number;
  }
  [];
  tendencias: {
    mes: string;
    scoreMedio: number;
  }
  [];
}
```

#### `GET /ai/score/predicoes`

```typescript
// Response: ApiResponse<ScorePredictao[]>
```

#### `GET /ai/score/predicoes/:membroId`

```typescript
// Response: ApiResponse<ScorePredictao | null>
```

#### `GET /ai/score/alertas`

```typescript
// Response: ApiResponse<ScoreAlert[]>
```

#### `POST /ai/score/alertas/:alertaId/ler`

Marca alerta como lido.

#### `GET /ai/score/analisar/:membroId`

Executa análise de IA para um membro específico.

```typescript
// Response: ApiResponse<ScorePredictao>
```

#### `GET /ai/score/risco?scoreMaximo=500`

Retorna membros com score abaixo do limite.

```typescript
// Response: { membroId: number; nome: string; score: number }[]
```

---

## 3. Modelos de Dados

### 3.1 Membro

```typescript
interface Membro {
  id: number;
  nome: string; // "Conceição Mateus"
  tel: string; // "+244 923 456 789"
  posicao: number; // posição na rotação (1-12)
  totalPoupado: number; // Kz
  score: number; // 300-1000
  status: "Pago" | "Pendente" | "Em atraso";
  iniciais: string; // "CM"
  cor: string; // hex para avatar
  meses: number; // meses activo
  pontualidade: number; // 0-100%
}
```

### 3.2 Transação

```typescript
interface Transacao {
  id: number;
  data: string; // "15/05/2026"
  membro: string; // nome do membro
  tipo: "Contribuição" | "Recebimento" | "Lembrete SMS";
  valor: number; // Kz
  ref: string; // "KXP-0515-001"
  status: "Pago" | "Pendente" | "Em atraso" | "Recebido" | "Enviado" | "Recuperado";
}
```

### 3.3 Grupo

```typescript
interface Grupo {
  id: string; // "KXRNG-2024"
  nome: string; // "Kixikila Rangel"
  codigo: string; // "KXRNG-2024"
  valorMensal: number; // 5000 Kz
  diaCorte: number; // 15
  membros: Membro[];
  createdAt: string; // "Setembro 2025"
}
```

### 3.4 Comunidade

```typescript
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
```

### 3.5 Agente

```typescript
interface Agente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  regiao: string;
  status: "activo" | "inactivo" | "suspenso";
  membrosCadastrados: number;
  scoreMedioAgente: number;
  taxaRetencao: number; // %
  metaMensal: number;
  atingidoEsteMes: number;
  dataContratacao: string; // "Jan 2025"
  iniciais: string;
  cor: string;
  gruposAssociados: string[];
}
```

### 3.6 Predição de Score (IA)

```typescript
interface ScorePredictao {
  membroId: number;
  membroNome: string;
  scoreActual: number;
  scoreProjectado: number;
  tendencia: "subindo" | "estavel" | "descendo";
  confianca: number; // 0.0 - 1.0
  factores: ScoreFactor[];
  recomendacao: string;
  dataAnalise: string;
}

interface ScoreFactor {
  factor: string; // "Pontualidade"
  impacto: "positivo" | "negativo" | "neutro";
  peso: number; // 0-100 (soma entre factores)
  descricao: string;
}
```

### 3.7 Alerta de Score

```typescript
interface ScoreAlert {
  id: number;
  membroId: number;
  membroNome: string;
  score: number;
  tipo: "critico" | "atencao" | "melhoria";
  mensagem: string;
  data: string;
  lido: boolean;
  accaoRecomendada: string;
}
```

### 3.8 Activity Log

```typescript
interface ActivityLogEntry {
  id: number;
  tipo: "criacao" | "actualizacao" | "remocao" | "alerta" | "login" | "registo";
  entidade: "membro" | "agente" | "coordenador" | "grupo" | "sistema";
  entidadeId: string | number;
  descricao: string;
  responsavel: string;
  data: string;
  metadata?: Record<string, unknown>;
}
```

---

## 4. Sistema de Roles

```typescript
type UserRole = "admin" | "agent" | "coordinator" | "member";
```

| Role          | Acesso                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `admin`       | Painel administrativo completo: gestão de membros, agentes, coordenadores, visualização de activity log, AI score dashboard |
| `agent`       | Painel do agente: cadastro de membros, monitoria, dashboard pessoal com metas                                               |
| `coordinator` | App principal: gestão do grupo, membros, contribuições, histórico                                                           |
| `member`      | App principal: dashboard pessoal, comunidades, score pessoal                                                                |

---

## 5. Sistema de IA para Score

### 5.1 Algoritmo de Score (pesos sugeridos)

| Factor         | Peso | Descrição                                |
| -------------- | ---- | ---------------------------------------- |
| Pontualidade   | 35%  | Percentual de pagamentos dentro do prazo |
| Tempo de conta | 25%  | Meses desde o primeiro registo           |
| Volume poupado | 20%  | Total acumulado em Kz                    |
| Regularidade   | 10%  | Frequência de contribuições sem falhas   |
| Engajamento    | 10%  | Participação em comunidades, convites    |

### 5.2 Níveis de Score

| Range    | Nível       | Cor                  |
| -------- | ----------- | -------------------- |
| 800-1000 | Excelente   | `#16A34A` (verde)    |
| 600-799  | Bom         | `#1D4ED8` (azul)     |
| 400-599  | Regular     | `#F97316` (laranja)  |
| 0-399    | A construir | `#DC2626` (vermelho) |

### 5.3 Elegibilidade para Crédito

| Score Mínimo | Limite       | Banco     |
| ------------ | ------------ | --------- |
| 800          | 500.000 Kz   | BFA       |
| 700          | 300.000 Kz   | Atlântico |
| 600          | 150.000 Kz   | BAI       |
| < 600        | Não elegível | —         |

### 5.4 Alertas Automáticos

- **Crítico** (score < 400): Contacto imediato necessário
- **Atenção** (score < 600): Visita do agendada do agente
- **Melhoria** (tendência negativa 3+ meses): Oferta de educação financeira

### 5.5 Modelo de Predição (sugestão)

O endpoint `GET /ai/score/analisar/:membroId` deve:

1. Recolher dados históricos do membro (pagamentos, atrasos, meses)
2. Aplicar modelo preditivo (regressão linear, random forest ou equivalente)
3. Calcular tendência (derivada da projecção vs actual)
4. Devolver factores com impacto e recomendação

---

## 6. Como Ligar o Frontend ao Backend

1. Definir `VITE_API_URL` no ambiente (`.env`):

   ```
   VITE_API_URL=https://api.kixipay.ao/v1
   ```

2. Quando `VITE_API_URL` está definido, o frontend muda automaticamente de mock para API real:

   ```typescript
   export const IS_MOCK = !import.meta.env.VITE_API_URL;
   ```

3. O frontend usa os métodos HTTP: `get()`, `post()`, `put()`, `del()` de `src/services/client.ts`

4. Todos os requests incluem `Authorization: Bearer <token>` automaticamente

---

## 7. Estrutura do Projecto (Frontend para referência)

```
src/
├── types/              # Interfaces TypeScript (contrato)
│   └── index.ts
├── services/           # Camada de serviços (mock + API)
│   ├── client.ts       # HTTP client, token, mock flag
│   ├── auth.ts         # Login, register
│   ├── groups.ts       # Grupo, membros, contribuições
│   ├── community.ts    # Comunidades
│   ├── score.ts        # Score, elegibilidade
│   ├── agents.ts       # Agentes
│   ├── admin.ts        # Admin
│   ├── ai-score.ts     # IA Score
│   └── mock-data.ts    # Dados mock para desenvolvimento
├── components/         # UI components
│   ├── kixipay/        # App principal (Landing, AppShell, Modals)
│   ├── admin/          # Painel administrativo
│   └── agent/          # Painel do agente
├── lib/                # Constantes, validações
├── routes/             # TanStack Router routes
└── router.tsx
```
