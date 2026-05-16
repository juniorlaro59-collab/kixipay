# Especificação Completa da API Kixikila

> **Objectivo**: Eliminar todos os mocks e tornar a aplicação 100% funcional com dados reais do backend.
> **Status**: ✅ = endpoint existe no Swagger · ❌ = endpoint **precisa de ser criado**

---

## 1. Autenticação (Auth)

### `POST /api/Auth/login` ✅

**Request:**

```json
{ "phoneNumber": "+244923000001", "password": "123456" }
```

**Response (`ApiResult`):**

```json
{
  "success": true,
  "message": "Sucesso",
  "data": {
    "token": "jwt...",
    "user": {
      "id": "uuid",
      "fullName": "Ana Paula",
      "phoneNumber": "+244923000001",
      "score": 50,
      "level": "basic",
      "role": "admin",
      "pendingDebt": 0
    }
  }
}
```

**Usado por:** `Modals.tsx` (AuthModal)

### `POST /api/Auth/register` ✅

**Request:**

```json
{ "fullName": "Novo Membro", "phoneNumber": "+244923000020", "password": "123456" }
```

**Response:** Mesmo formato do login.

---

## 2. Utilizadores (Users)

### `GET /api/Users/me` ✅

**Response (`ApiResult`):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "string",
    "phoneNumber": "string",
    "score": 50,
    "level": "basic",
    "role": "member",
    "pendingDebt": 0
  }
}
```

**Usado por:** `users.ts` → perfil do user logado em todas as views

### `GET /api/Users/me/score` ✅

**Response (`ApiResult`):**

```json
{ "success": true, "data": { "id": "uuid", "fullName": "string", "score": 50, "level": "basic" } }
```

**Usado por:** `MemberDashboard.tsx` (Meu KixiScore)

### `POST /api/Users/me/score-events/{eventType}` ✅

**Request:** `{}` (body vazio)
**Response:** `{ "success": true, "message": "string" }`

---

## 3. Admin (Users)

### `GET /api/admin/users` ✅

**Response (`ApiResult`):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "string",
      "phoneNumber": "string",
      "score": 50,
      "level": "basic",
      "role": "member",
      "pendingDebt": 0
    }
  ]
}
```

**Usado por:** `AdminPanel.tsx` → `getAllMembrosAdmin()`

### `POST /api/admin/users` ✅

**Request:**

```json
{ "fullName": "Novo Admin", "phoneNumber": "+244923000030", "password": "123456", "role": "admin" }
```

### `PUT /api/admin/users/{userId}/role` ✅

**Request:** `{ "role": "coordinator" }`

### `DELETE /api/admin/users/{userId}` ❌ **Endpoint em falta**

**Necessário para:** `removeMembroAdmin()`
**Request:** (sem body)
**Response:** `{ "success": true, "message": "Utilizador removido" }`

---

## 4. Agentes

### `POST /api/agents/members` ✅

**Request:** `{ "fullName": "Novo Membro", "phoneNumber": "+244923000020", "password": "123456" }`

### `POST /api/agents/members/add-to-group` ✅

**Request:** `{ "groupId": "uuid", "phoneNumber": "+244923000020", "vouchedByUserId": null }`

---

## 5. Grupos (Groups)

### `GET /api/Groups` ✅

**Response:** Lista de todos os grupos (admin)
**Usado por:** `getAllGroups()`

### `POST /api/Groups` ✅

**Request:**

```json
{
  "name": "Kixikila Familia Luanda",
  "contributionAmount": 25000,
  "frequency": "Monthly",
  "maxMembers": 6,
  "guaranteeFundContribution": 1000
}
```

### `GET /api/Groups/my` ✅

**Response:** Grupos do user autenticado
**Usado por:** `getGrupo()`

### `GET /api/Groups/{groupId}` ✅

**Response:** Grupo específico
**Usado por:** `getGroupById()`

### `POST /api/Groups/join` ✅

**Request:** `{ "groupId": "uuid", "vouchedByUserId": null }`

### `GET /api/Groups/{groupId}/join-requests` ✅

**Response:** Pedidos pendentes de entrada

### `POST /api/Groups/join-requests/{requestId}/approve` ✅

### `POST /api/Groups/join-requests/{requestId}/reject` ✅

### `DELETE /api/Groups/{groupId}/leave` ✅

---

## 6. Ciclos (Cycles)

### `GET /api/Cycles/group/{groupId}/current` ✅

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "groupId": "uuid",
    "cycleNumber": 7,
    "beneficiaryName": "Manuel Jacinto",
    "deadlineDate": "2026-06-01",
    "status": "active",
    "totalCollected": 40000,
    "totalContributions": 8,
    "pendingContributions": 4
  }
}
```

**Usado por:** `CoordinatorDashboard.tsx`, `MemberDashboard.tsx`

### `POST /api/Cycles/group/{groupId}/start` ✅

**Request:** `{}`
**Response:** `{ "success": true, "message": "Ciclo iniciado" }`

### `POST /api/Cycles/contribute` ✅

**Request:** `{ "cycleId": "uuid", "transactionReference": "MANUAL-001" }`

### `GET /api/Cycles/{cycleId}/contributions` ✅

**Response:** Lista de contribuições do ciclo

---

## 7. Pagamentos (Payments)

### `POST /api/payments/initiate` ✅

**Request:** `{ "cycleId": "uuid", "phoneNumber": "+244923000001" }`

### `GET /api/payments/{paymentId}` ✅

**Response:** Detalhes do pagamento

### `POST /api/payments/webhook/ussd404` ✅ (server-side)

---

## 8. Análise de Risco

### `GET /api/RiskAnalysis/me` ✅

### `GET /api/RiskAnalysis/by-phone?phoneNumber=...` ✅

---

## 9. Métricas

### `GET /api/Metrics/me` ✅

**Response:**

```json
{
  "success": true,
  "data": {
    "score": 720,
    "level": "Bom",
    "activeGroups": 1,
    "totalContributions": 8,
    "pendingContributions": 4
  }
}
```

### `GET /api/Metrics/platform` ✅

**Response:**

```json
{
  "success": true,
  "data": {
    "totalMembros": 156,
    "totalGrupos": 23,
    "totalAgentes": 5,
    "totalCoordenadores": 18,
    "volumeTotal": 28900000,
    "scoreMedio": 720,
    "membrosActivos": 142,
    "fundosCirculacao": 4850000,
    "crescimentoMensal": 12.5
  }
}
```

**Usado por:** `AdminPanel.tsx` (DashboardView) — substitui `getPlatformStats()`

---

## ❌ ENDPOINTS EM FALTA (MOCK DATA)

Os endpoints abaixo **não existem na API actual** e são necessários para eliminar todos os mocks.

---

### **`GET /api/groups/{groupId}/members`** ❌

**Substitui o mock:** `MEMBROS` (12 membros)
**Usado por:** `CoordinatorShell.tsx` (MembrosView), `MemberDrawer.tsx`, `Modals.tsx` (ContribuicaoModal), `ScoreView.tsx` (ScoreModoGrupo)
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": "uuid",
      "fullName": "Conceição Mateus",
      "phoneNumber": "+244923456789",
      "position": 1,
      "totalSaved": 40000,
      "score": 891,
      "status": "paid",
      "monthsActive": 8,
      "punctuality": 94,
      "initials": "CM",
      "color": "#FF5C1A"
    }
  ]
}
```

**Campos obrigatórios:** `id`, `userId`, `fullName`, `phoneNumber`, `position`, `totalSaved`, `score`, `status` (paid/pending/overdue), `monthsActive`, `punctuality`, `initials`, `color`

---

### **`GET /api/groups/{groupId}/transactions`** ❌

**Substitui o mock:** `HISTORICO` (15 transacções)
**Usado por:** `HistoricoView.tsx`, `CoordinatorDashboard.tsx` (ActividadeRecente), `MemberDashboard.tsx` (Meus pagamentos recentes)
**Query params:** `?memberName=&type=&period=&page=1&pageSize=20`
**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "date": "2026-05-15",
        "memberName": "Conceição Mateus",
        "type": "contribution",
        "amount": 5000,
        "reference": "KXP-0515-001",
        "status": "paid"
      }
    ],
    "total": 15,
    "stats": {
      "totalReceived": 185000,
      "totalDistributed": 120000,
      "membersOnTime": 10,
      "totalMembers": 12,
      "paymentRate": 92
    }
  }
}
```

**Tipos de transacção:** `contribution`, `payout`, `sms_reminder`
**Status:** `paid`, `pending`, `overdue`, `received`, `sent`, `recovered`

---

### **`GET /api/groups/{groupId}/rotation`** ❌

**Substitui o mock:** lógica de rotação (posição + mês de recebimento)
**Usado por:** `CoordinatorDashboard.tsx` (RotacaoCompleta), `MemberDashboard.tsx`, `MemberDrawer.tsx`
**Response:**

```json
{
  "success": true,
  "data": {
    "members": [
      { "userId": "uuid", "fullName": "Conceição Mateus", "position": 1, "month": "Dez 2025" }
    ],
    "currentBeneficiary": { "position": 7, "fullName": "Manuel Jacinto", "month": "Jun 2026" },
    "nextPayout": {
      "position": 8,
      "fullName": "Beatriz Capita",
      "month": "Jul 2026",
      "amount": 60000
    }
  }
}
```

---

### **`GET /api/groups/{groupId}/dashboard`** ❌

**Substitui o mock:** `getDashboard()` + `CoordinatorDashboard.tsx` KPIs
**Usado por:** `CoordinatorDashboard.tsx`
**Response:**

```json
{
  "success": true,
  "data": {
    "totalBalance": 185000,
    "activeMembers": 12,
    "totalMembers": 12,
    "monthContributions": 8,
    "monthTarget": 12,
    "averageScore": 824,
    "nextPayout": {
      "fullName": "Manuel Jacinto",
      "position": 7,
      "month": "Jun 2026",
      "amount": 60000
    },
    "monthlyChart": [
      { "month": "Dez", "collected": 55000 },
      { "month": "Jan", "collected": 60000 },
      { "month": "Fev", "collected": 58000 },
      { "month": "Mar", "collected": 60000 },
      { "month": "Abr", "collected": 57000 },
      { "month": "Mai", "collected": 40000 }
    ]
  }
}
```

---

### **`GET /api/communities`** ❌

**Substitui o mock:** `COMUNIDADES` (8 comunidades)
**Usado por:** `ComunidadesView.tsx` (Member), `AgentPanel.tsx` (MonitoriaView)
**Query params:** `?region=Luanda`
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kixikila Rangel",
      "region": "Luanda",
      "memberCount": 12,
      "maxMembers": 12,
      "monthlyValue": 5000,
      "code": "KXRNG-2024",
      "description": "Grupo do bairro Rangel · Rotação mensal"
    }
  ]
}
```

**Campos obrigatórios:** `id`, `name`, `region`, `memberCount`, `maxMembers`, `monthlyValue`, `code`, `description`

---

### **`GET /api/notifications`** ❌

**Substitui o mock:** `NOTIFICACOES` (4 notificações)
**Usado por:** `AgentPanel.tsx` (DashboardView), shell/header
**Query params:** `?unreadOnly=false&page=1&pageSize=10`
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "payment",
      "message": "Ana Paula pagou a contribuição de Maio",
      "read": false,
      "date": "2026-05-15"
    }
  ]
}
```

**Tipos:** `payment`, `reminder`, `payout`, `invite`

---

### **`GET /api/agents`** ❌

**Substitui o mock:** `AGENTES` (5 agentes)
**Usado por:** `AdminPanel.tsx` (AgentesView)
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "Maria Agostinho",
      "phoneNumber": "+244900000002",
      "email": "maria@kixipay.ao",
      "region": "Luanda",
      "status": "active",
      "registeredMembers": 47,
      "averageScore": 742,
      "retentionRate": 89,
      "monthlyGoal": 20,
      "achievedThisMonth": 14,
      "hireDate": "Jan 2025",
      "initials": "MA",
      "color": "#8B5CF6",
      "associatedGroups": ["KXRNG-2024", "SLS-2026"]
    }
  ]
}
```

**Status:** `active`, `inactive`, `suspended`

---

### **`POST /api/agents`** ❌

**Criar novo agente (admin)**
**Usado por:** `AdminPanel.tsx` (AgentesView)
**Request:**

```json
{
  "fullName": "Novo Agente",
  "phoneNumber": "+244923000040",
  "email": "agente@kixipay.ao",
  "region": "Luanda"
}
```

### **`PUT /api/agents/{agentId}`** ❌

**Actualizar dados do agente**

---

### **`GET /api/coordinators`** ❌

**Substitui o mock:** Coordenadores (dados hardcoded em CoordenadoresView)
**Usado por:** `AdminPanel.tsx` (CoordenadoresView)
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "Conceição Mateus",
      "phoneNumber": "+244923456789",
      "email": "conceicao@kixipay.ao",
      "region": "Luanda",
      "status": "active",
      "supervisedAgents": 3,
      "totalMembers": 12,
      "averageScore": 845,
      "hireDate": "Set 2025",
      "initials": "CM",
      "color": "#FF5C1A"
    }
  ]
}
```

---

### **`GET /api/activity-log`** ❌

**Substitui o mock:** `ACTIVITY_LOG` (8 entradas)
**Usado por:** `AdminPanel.tsx` (ActivityView, DashboardView)
**Query params:** `?page=1&pageSize=20&type=&entity=`
**Response:**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": 1,
        "type": "creation",
        "entity": "member",
        "entityId": "13",
        "description": "Novo membro cadastrado: João Chimuco",
        "responsible": "Maria Agostinho",
        "date": "2026-05-15T09:32:00"
      }
    ],
    "total": 50
  }
}
```

**Tipos:** `creation`, `update`, `removal`, `alert`, `login`, `registration`
**Entidades:** `member`, `agent`, `coordinator`, `group`, `system`

---

### **`GET /api/ai/dashboard`** ❌

**Substitui o mock:** `AScoreDashboard`
**Usado por:** `AdminPanel.tsx` (AIScoreView)
**Response:**

```json
{
  "success": true,
  "data": {
    "averageScore": 745,
    "totalAnalyses": 156,
    "activeAlerts": 2,
    "membersAtRisk": 3,
    "distribution": [
      { "level": "Excelente", "count": 5 },
      { "level": "Bom", "count": 4 },
      { "level": "Regular", "count": 2 },
      { "level": "A construir", "count": 1 }
    ],
    "trends": [
      { "month": "Jan", "averageScore": 680 },
      { "month": "Fev", "averageScore": 695 },
      { "month": "Mar", "averageScore": 710 },
      { "month": "Abr", "averageScore": 723 },
      { "month": "Mai", "averageScore": 745 }
    ]
  }
}
```

---

### **`GET /api/ai/predictions`** ❌

**Substitui o mock:** `SCORE_PREDICOES` (4 predições)
**Usado por:** `AdminPanel.tsx`, `AgentPanel.tsx` (ScoreView)
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "memberId": 1,
      "memberName": "Conceição Mateus",
      "currentScore": 891,
      "projectedScore": 912,
      "trend": "rising",
      "confidence": 0.92,
      "factors": [
        {
          "factor": "Pontualidade",
          "impact": "positivo",
          "weight": 35,
          "description": "94% de pagamentos a tempo"
        }
      ],
      "recommendation": "Perfil excelente. Recomendar aumento de limite de crédito.",
      "analysisDate": "2026-05-15"
    }
  ]
}
```

**Tendências:** `rising`, `stable`, `falling`
**Impactos:** `positive`, `negative`, `neutral`

---

### **`GET /api/ai/predictions/{memberId}`** ❌

**Predição por membro específico**

### **`POST /api/ai/predictions/{memberId}/analyze`** ❌

**Forçar re-análise de um membro → retorna `ScorePredictao`**

---

### **`GET /api/ai/alerts`** ❌

**Substitui o mock:** `SCORE_ALERTAS` (3 alertas)
**Usado por:** `AdminPanel.tsx`, `AgentPanel.tsx` (ScoreView)
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberId": 9,
      "memberName": "Carlos Futila",
      "score": 445,
      "type": "critical",
      "message": "Score abaixo de 450 — risco de exclusão do grupo",
      "date": "2026-05-14",
      "read": false,
      "recommendedAction": "Contactar membro urgentemente"
    }
  ]
}
```

**Tipos:** `critical`, `warning`, `improvement`

### **`POST /api/ai/alerts/{alertId}/read`** ❌

**Marcar alerta como lido**

---

### **`GET /api/ai/risk-members`** ❌

**Substitui o mock:** `getMembrosRisco()`
**Query params:** `?maxScore=500`
**Response:**

```json
{
  "success": true,
  "data": [{ "memberId": 9, "name": "Carlos Futila", "score": 445 }]
}
```

---

### **`GET /api/agents/{agentId}/dashboard`** ❌

**Substitui o mock:** `getAgentDashboard()` → `AgentDashboardData`
**Usado por:** `AgentPanel.tsx` (DashboardView)
**Response:**

```json
{
  "success": true,
  "data": {
    "registeredThisMonth": 14,
    "monthlyGoal": 20,
    "progressPercentage": 70,
    "retentionRate": 89,
    "averageWalletScore": 742,
    "lastRegistrations": [
      { "id": 1, "fullName": "João Chimuco", "phoneNumber": "+244900000010", "score": 300 }
    ],
    "notifications": [
      {
        "id": 1,
        "type": "payment",
        "message": "João Chimuco fez primeiro pagamento",
        "read": false,
        "date": "2026-05-15"
      }
    ],
    "recentActivities": [
      {
        "id": 1,
        "type": "registration",
        "description": "Cadastrou João Chimuco no grupo Kixikila Rangel",
        "memberInvolved": "João Chimuco",
        "date": "2026-05-15T09:30:00",
        "result": "Concluído"
      }
    ],
    "groupsInRegion": 5
  }
}
```

**Tipos de actividade:** `registration`, `visit`, `reminder`, `resolution`

---

### **`GET /api/agents/{agentId}/activities`** ❌

**Actividades recentes do agente**
**Query params:** `?page=1&pageSize=20`

---

### **`GET /api/scores/{memberId}`** ❌

**Substitui o mock:** `getScoreInfo()` → `ScoreInfo`
**Usado por:** `ScoreView.tsx` (ScoreModoMembro)
**Response:**

```json
{
  "success": true,
  "data": {
    "score": 891,
    "level": "Excelente",
    "color": "#16A34A",
    "punctuality": 94,
    "monthsActive": 8,
    "totalSaved": 40000
  }
}
```

---

### **`GET /api/scores/distribution`** ❌

**Distribuição de scores do grupo**
**Usado por:** `ScoreView.tsx` (ScoreModoGrupo)
**Response:**

```json
{
  "success": true,
  "data": [
    { "level": "Excelente", "count": 5 },
    { "level": "Bom", "count": 4 },
    { "level": "Regular", "count": 2 },
    { "level": "A construir", "count": 1 }
  ]
}
```

---

### **`GET /api/eligibility/{memberId}`** ❌

**Elegibilidade de crédito por membro**
**Usado por:** `ScoreView.tsx` (tabela elegibilidade), `RecomendacaoModal.tsx`
**Response:**

```json
{
  "success": true,
  "data": {
    "eligible": true,
    "limit": 500000,
    "recommendedBank": "BFA"
  }
}
```

---

### **`GET /api/eligibility/group/{groupId}`** ❌

**Elegibilidade de todos os membros do grupo**
**Usado por:** `ScoreView.tsx` (ScoreModoGrupo — tabela completa)
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "memberId": 1,
      "fullName": "Conceição Mateus",
      "score": 891,
      "monthsActive": 8,
      "totalSaved": 40000,
      "eligible": true,
      "limit": 500000,
      "bank": "BFA"
    }
  ]
}
```

---

## Resumo: Endpoints Necessários

| Status                  | Quantidade | Categoria                                                                                                                                          |
| ----------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Existem no Swagger   | 29         | Auth, Users, Admin, Agents, Groups, Cycles, Payments, Risk, Metrics                                                                                |
| ❌ Precisam ser criados | 20         | Members, Transactions, Rotation, Dashboard, Communities, Notifications, Agents CRUD, Coordinators, Activity Log, AI Score, Score Info, Eligibility |

### Dados Mock que podem ser removidos após implementação

| Ficheiro               | Variável                 | Substituído por                          |
| ---------------------- | ------------------------ | ---------------------------------------- |
| `mock-data.ts`         | `MEMBROS`                | `GET /api/groups/{groupId}/members`      |
| `mock-data.ts`         | `HISTORICO`              | `GET /api/groups/{groupId}/transactions` |
| `mock-data.ts`         | `COMUNIDADES`            | `GET /api/communities`                   |
| `mock-data.ts`         | `GRUPO_MOCK`             | `GET /api/Groups/my`                     |
| `mock-data.ts`         | `NOTIFICACOES`           | `GET /api/notifications`                 |
| `mock-data.ts`         | `AGENTES`                | `GET /api/agents`                        |
| `mock-data.ts`         | `ACTIVITY_LOG`           | `GET /api/activity-log`                  |
| `mock-data.ts`         | `SCORE_PREDICOES`        | `GET /api/ai/predictions`                |
| `mock-data.ts`         | `SCORE_ALERTAS`          | `GET /api/ai/alerts`                     |
| `mock-data.ts`         | `REGIOES`                | `GET /api/communities` (derivado)        |
| `services/score.ts`    | `getScoreInfo()`         | `GET /api/scores/{memberId}`             |
| `services/score.ts`    | `getScoreDistribuicao()` | `GET /api/scores/distribution`           |
| `services/score.ts`    | `elegibilidade()`        | `GET /api/eligibility/{memberId}`        |
| `services/ai-score.ts` | `getADashboard()`        | `GET /api/ai/dashboard`                  |
| `services/ai-score.ts` | `getMembrosRisco()`      | `GET /api/ai/risk-members`               |
| `services/agents.ts`   | `getAgentDashboard()`    | `GET /api/agents/{agentId}/dashboard`    |
| `services/admin.ts`    | `getPlatformStats()`     | `GET /api/Metrics/platform`              |
| `services/admin.ts`    | `getActivityLog()`       | `GET /api/activity-log`                  |
| `services/admin.ts`    | `getAgentes()`           | `GET /api/agents`                        |
