# Verificação de Integração — Kixikila API

> **Fonte**: Swagger vivo em `https://3034-2c0f-f888-a180-40c3-e84a-19b6-ffb6-ec82.ngrok-free.app/swagger/v1/swagger.json` (16/05/2026)
> **Branch**: `api-integracao`

## Seed Data (API)

Senha padrão: **`123456`**

| Nome             | Telefone        | Role          |
| ---------------- | --------------- | ------------- |
| Ana Paula        | `+244923000001` | `admin`       |
| Carlos Manuel    | `+244923000002` | `coordinator` |
| Beatriz Gomes    | `+244923000003` | `member`      |
| João Pedro       | `+244923000004` | `member`      |
| Marina Lopes     | `+244923000005` | `member`      |
| Paulo Agente     | `+244923000006` | `agent`       |
| Conceição Mateus | `+244923000007` | `coordinator` |
| Helena Costa     | `+244923000008` | `member`      |
| Miguel Domingos  | `+244923000009` | `member`      |
| Teresa Afonso    | `+244923000010` | `coordinator` |
| Rui Manuel       | `+244923000011` | `member`      |
| Ema Fernandes    | `+244923000012` | `member`      |

## Mapeamento Endpoint → Frontend

### Auth

| Endpoint             | Método | Policy  | Frontend (ficheiro) | Serviço      |
| -------------------- | ------ | ------- | ------------------- | ------------ |
| `/api/Auth/register` | POST   | Pública | `auth.ts`           | `register()` |
| `/api/Auth/login`    | POST   | Pública | `auth.ts`           | `login()`    |

**Request bodies**: `{ fullName, phoneNumber, password }` / `{ phoneNumber, password }`

### Users

| Endpoint                                 | Método | Policy      | Frontend   | Serviço             |
| ---------------------------------------- | ------ | ----------- | ---------- | ------------------- |
| `/api/Users/me`                          | GET    | Auth        | `users.ts` | `getCurrentUser()`  |
| `/api/Users/me/score`                    | GET    | Auth        | `users.ts` | `getMyScore()`      |
| `/api/Users/me/score-events/{eventType}` | POST   | Coord/Admin | `users.ts` | `applyScoreEvent()` |

### Admin

| Endpoint                         | Método | Policy | Frontend   | Serviço                |
| -------------------------------- | ------ | ------ | ---------- | ---------------------- |
| `/api/admin/users`               | GET    | Admin  | `admin.ts` | `getAllMembrosAdmin()` |
| `/api/admin/users`               | POST   | Admin  | `admin.ts` | `createUser()`         |
| `/api/admin/users/{userId}/role` | PUT    | Admin  | `admin.ts` | `updateAgenteStatus()` |

**Request body (createUser)**: `{ fullName, phoneNumber, password, role }`

### Agents

| Endpoint                           | Método | Policy      | Frontend    | Serviço                        |
| ---------------------------------- | ------ | ----------- | ----------- | ------------------------------ |
| `/api/agents/members`              | POST   | Agent/Admin | `agents.ts` | `cadastrarMembro()`            |
| `/api/agents/members/add-to-group` | POST   | Agent/Admin | `agents.ts` | `addMemberToGroupByAgent()` ✨ |

**Request body**: `{ fullName, phoneNumber, password }` / `{ groupId, phoneNumber, vouchedByUserId }`

### Payments

| Endpoint                        | Método | Policy  | Frontend      | Serviço             |
| ------------------------------- | ------ | ------- | ------------- | ------------------- |
| `/api/payments/initiate`        | POST   | Auth    | `payments.ts` | `initiatePayment()` |
| `/api/payments/{paymentId}`     | GET    | Auth    | `payments.ts` | `getPayment()`      |
| `/api/payments/webhook/ussd404` | POST   | Pública | —             | server-side         |

**Request body (initiate)**: `{ cycleId, phoneNumber }`

### Groups

| Endpoint                                        | Método | Policy      | Frontend       | Serviço                     |
| ----------------------------------------------- | ------ | ----------- | -------------- | --------------------------- |
| `/api/Groups`                                   | GET    | Admin       | `groups.ts`    | `getAllGroups()` ✨         |
| `/api/Groups`                                   | POST   | Admin       | `groups.ts`    | `createGroup()`             |
| `/api/Groups/{groupId}`                         | GET    | Auth        | `groups.ts`    | `getGroupById()`            |
| `/api/Groups/my`                                | GET    | Auth        | `groups.ts`    | `getGrupo()`                |
| `/api/Groups/join`                              | POST   | Auth        | `community.ts` | `solicitarEntrada()`        |
| `/api/Groups/{groupId}/join-requests`           | GET    | Coord/Admin | `groups.ts`    | `getGroupJoinRequests()` ✨ |
| `/api/Groups/join-requests/{requestId}/approve` | POST   | Coord/Admin | `groups.ts`    | `approveJoinRequest()` ✨   |
| `/api/Groups/join-requests/{requestId}/reject`  | POST   | Coord/Admin | `groups.ts`    | `rejectJoinRequest()` ✨    |
| `/api/Groups/{groupId}/leave`                   | DELETE | Auth        | `groups.ts`    | `leaveGroup()`              |

**Request body (create)**: `{ name, contributionAmount, frequency, maxMembers, guaranteeFundContribution }`
**Request body (join)**: `{ groupId, vouchedByUserId }`

### Cycles

| Endpoint                              | Método | Policy      | Frontend    | Serviço               |
| ------------------------------------- | ------ | ----------- | ----------- | --------------------- |
| `/api/Cycles/group/{groupId}/current` | GET    | Auth        | `groups.ts` | `getCurrentCycle()`   |
| `/api/Cycles/group/{groupId}/start`   | POST   | Coord/Admin | `groups.ts` | `startCycle()`        |
| `/api/Cycles/contribute`              | POST   | Coord/Admin | `groups.ts` | `contributeToCycle()` |
| `/api/Cycles/{cycleId}/contributions` | GET    | Auth        | `groups.ts` | `getContribuicoes()`  |

**Request body (contribute)**: `{ cycleId, transactionReference }`

### Risk Analysis

| Endpoint                     | Método | Policy      | Frontend          | Serviço                    |
| ---------------------------- | ------ | ----------- | ----------------- | -------------------------- |
| `/api/RiskAnalysis/me`       | GET    | Auth        | `riskanalysis.ts` | `getMyRiskAnalysis()`      |
| `/api/RiskAnalysis/by-phone` | GET    | Coord/Admin | `riskanalysis.ts` | `getRiskAnalysisByPhone()` |

### Metrics

| Endpoint                | Método | Policy | Frontend   | Serviço                   |
| ----------------------- | ------ | ------ | ---------- | ------------------------- |
| `/api/Metrics/me`       | GET    | Auth   | `admin.ts` | `getMyMetrics()` ✨       |
| `/api/Metrics/platform` | GET    | Admin  | `admin.ts` | `getPlatformMetrics()` ✨ |

### USSD

| Endpoint            | Método | Policy  | Frontend | Serviço     |
| ------------------- | ------ | ------- | -------- | ----------- |
| `/api/ussd/session` | POST   | Pública | —        | server-side |

## Request Body Convention

**TODOS os request bodies usam camelCase** (ex: `fullName`, `phoneNumber`, `password`, `cycleId`, `transactionReference`).

## URL Path Convention

**PascalCase** para: Auth, Users, Cycles, Groups, RiskAnalysis, Metrics
**lowercase** para: admin, agents, payments, ussd

## Total: 29 endpoints

| Status                            | Quantidade                                    |
| --------------------------------- | --------------------------------------------- |
| ✅ Integrados (com fallback mock) | 26                                            |
| 🔧 Server-side (webhook/ussd)     | 2                                             |
| 📝 Não implementado no frontend   | 1 (`GET /api/Groups/{groupId}/join-requests`) |

## Como actualizar a URL da API

Editar no `.env`:

```
VITE_API_URL=https://novo-url.ngrok-free.app
```

E também em `vite.config.ts` (linha 11):

```ts
// Nao ha proxy no Vite; a API e chamada diretamente via VITE_API_URL.
```
