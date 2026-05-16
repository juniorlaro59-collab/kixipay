# KixiPay — Organização e Implementação de Perfis

> Documento de referência para arquitectura de perfis, responsabilidades, e estado actual da implementação.

---

## 1. Visão Geral da Hierarquia

```
ADMIN
 └── Supervisão de toda a plataforma
      ├── AGENTE
      │    └── Recruta e cadastra membros no campo
      └── COORDENADOR
           └── Gere um grupo kixikila
                └── MEMBRO
                     └── Participa no grupo, poupa e acede ao crédito
```

---

## 2. Análise de Cada Perfil

### 2.1 MEMBRO (`role: "member"`)

**Propósito:** Utilizador final da plataforma. Participa numa kixikila, acompanha as suas poupanças e acede ao crédito com base no KixiScore.

**Responsabilidades:**

- Ver o seu dashboard pessoal (contribuições, saldo, próxima rotação)
- Consultar o KixiScore pessoal e entender os factores
- Ver histórico de transacções pessoais
- Explorar e pedir entrada em comunidades/grupos
- Gerir configurações da conta

**NÃO pode:**

- Adicionar ou remover outros membros
- Registar contribuições de outros
- Ver dados de outros membros
- Aceder a funções de gestão do grupo

**Navegação actual:**

```
Início | Comunidades | KixiScore | Histórico | Configurações
```

**Estado:** Correcto. UI em `MemberShell.tsx` → `MemberDashboard.tsx`.

---

### 2.2 COORDENADOR (`role: "coordinator"`)

**Propósito:** Gere um grupo kixikila específico. Responsável pela saúde financeira do grupo, registo de contribuições e acompanhamento dos membros.

**Responsabilidades:**

- Dashboard do grupo (saldo total, membros activos, próxima rotação)
- Adicionar membros ao grupo
- Registar e confirmar contribuições mensais
- Acompanhar status de pagamentos (Pago / Pendente / Em atraso)
- Ver distribuição do KixiScore do grupo
- Enviar lembretes/SMS a membros em atraso
- Gerir configurações do grupo
- Aceder ao USSD (*920*55#)
- Ver histórico de transacções do grupo

**NÃO pode:**

- Cadastrar membros novos na plataforma (isso é função do Agente)
- Ver dados de outros grupos
- Gerir agentes ou outros coordenadores
- Aceder ao painel de admin

**Navegação actual:**

```
Início | Membros | KixiScore | Pagar USSD | Histórico | Configurações
```

**Estado:** Correcto. UI em `CoordinatorShell.tsx` → `CoordinatorDashboard.tsx`.

---

### 2.3 AGENTE (`role: "agent"`)

**Propósito:** Trabalhador de campo. Responsável pelo crescimento da base de utilizadores — recruta, cadastra e acompanha novos membros nas suas comunidades.

**Responsabilidades:**

- Dashboard pessoal de desempenho (meta mensal, registos, taxa de retenção)
- Cadastrar novos membros na plataforma (associar a grupos/comunidades)
- Monitorizar portfolio de membros cadastrados
- Registar actividades de campo (visitas, lembretes, resolução de problemas)
- Consultar Score IA para intervenção proactiva nos membros em risco
- Receber comissão por cadastro (500 Kz/registo)
- Ver grupos disponíveis por região

**NÃO pode:**

- Gerir grupos (aprovar contribuições, rotações)
- Aceder a dados de toda a plataforma
- Gerir outros agentes
- Remover membros

**Navegação actual:**

```
Painel | Cadastrar | Monitoria | Score IA
```

**Estado:** Correcto. Implementado em `AgentPanel.tsx` (~1770 linhas).

---

### 2.4 ADMIN (`role: "admin"`)

**Propósito:** Supervisão completa da plataforma KixiPay. Gere coordenadores, agentes, analisa dados agregados e monitoriza a saúde do ecossistema.

**Responsabilidades:**

- Dashboard da plataforma (stats globais: 156 membros, 23 grupos, volumes)
- Gerir todos os membros (pesquisar, filtrar, remover)
- Gerir agentes (status: activo/inactivo/suspenso, metas, performance)
- Supervisionar coordenadores (5 coordenadores, por região)
- AI Score: análises, predições, alertas, membros em risco
- Registo de actividades/auditoria

**Navegação actual:**

```
Dashboard | Membros | Agentes | Coordenadores | AI Score | Actividades
```

**Estado:** Completo e bem separado. Implementado em `AdminPanel.tsx` (~1900 linhas).

---

## 3. Mapa de Capacidades por Perfil

| Funcionalidade            | Membro | Coordenador | Agente | Admin |
| ------------------------- | :----: | :---------: | :----: | :---: |
| Dashboard pessoal         |   ✅   |     ✅      |   ✅   |   —   |
| Dashboard do grupo        |   —    |     ✅      |   —    |   —   |
| Dashboard da plataforma   |   —    |      —      |   —    |  ✅   |
| Ver membros do grupo      |   —    |     ✅      |   —    |   —   |
| Adicionar membro ao grupo |   —    |     ✅      |   —    |   —   |
| Cadastrar novo membro     |   —    |      —      |   ✅   |   —   |
| Registar contribuição     |   —    |     ✅      |   —    |   —   |
| KixiScore pessoal         |   ✅   |     ✅      |   —    |   —   |
| KixiScore do grupo        |   —    |     ✅      |   —    |   —   |
| Score IA (portfolio)      |   —    |      —      |   ✅   |   —   |
| Score IA (plataforma)     |   —    |      —      |   —    |  ✅   |
| Histórico pessoal         |   ✅   |     ✅      |   —    |   —   |
| Histórico do grupo        |   —    |     ✅      |   —    |   —   |
| Explorar comunidades      |   ✅   |      —      |   —    |   —   |
| Pagar USSD                |   —    |     ✅      |   —    |   —   |
| Monitoria de campo        |   —    |      —      |   ✅   |   —   |
| Gerir agentes             |   —    |      —      |   —    |  ✅   |
| Gerir coordenadores       |   —    |      —      |   —    |  ✅   |
| Auditoria/Actividades     |   —    |      —      |   —    |  ✅   |
| Configurações pessoais    |   ✅   |     ✅      |   —    |   —   |

---

## 4. Estrutura Actual do Código

### 4.1 Componentes por Perfil (v2 — Extraído)

```
src/components/
├── admin/
│   └── AdminPanel.tsx                ← ✅ (~1900 linhas)
├── agent/
│   └── AgentPanel.tsx                ← ✅ (~1770 linhas)
├── coordinator/                      ← NOVO
│   ├── CoordinatorShell.tsx          ← Shell do coordenador
│   ├── CoordinatorDashboard.tsx      ← Dashboard + KPI + gráficos
│   └── (MembrosView, UssdView in-line no shell)
├── member/                           ← NOVO
│   ├── MemberShell.tsx               ← Shell do membro
│   ├── MemberDashboard.tsx           ← Dashboard + score + calendário
│   └── (ComunidadesView in-line no shell)
├── shared/                           ← NOVO
│   ├── AppLayout.tsx                 ← Layout partilhado (navbar + sidebar + bottom nav)
│   ├── ScoreView.tsx                 ← KixiScore (membro + grupo)
│   ├── HistoricoView.tsx             ← Histórico de transacções
│   ├── ConfigView.tsx                ← Configurações (perfil, grupo, notif, plano)
│   └── MemberDrawer.tsx              ← Drawer lateral de membro
└── kixipay/
    ├── AppShell.tsx                  ← ELIMINADO ✅
    ├── Landing.tsx                   ← Landing page
    ├── Modals.tsx                    ← Modais partilhados
    ├── shared.tsx                    ← Componentes base (Logo, Avatar, ScoreRing, etc.)
    └── data.ts                       ← Re-exports de serviços
```

### 4.2 Routing Actual (v2 — Switch por Role)

```typescript
// src/routes/index.tsx
if (user.role === "admin")       return <AdminPanel />;
if (user.role === "agent")       return <AgentPanel />;
if (user.role === "coordinator") return <CoordinatorShell />;
if (user.role === "member")      return <MemberShell />;
```

### 4.3 Tipos Actual

```typescript
// src/types/index.ts
export type UserRole = "admin" | "agent" | "coordinator" | "member";

// auth-store.ts
export interface AuthUser {
  userId: UserId;
  nome: string;
  role: UserRole;
  token: string;
  // NOTA: grupoId, regiaoId, coordenadorId NÃO implementados
}
```

**Pendente:** Adicionar `grupoId`, `regiaoId`, `coordenadorId` ao `AuthUser`.

### 4.4 Routing Actual

```typescript
// src/routes/index.tsx
if (user.role === "admin")   return <AdminPanel />;
if (user.role === "agent")   return <AgentPanel />;
// coordinator e member: AppShell (com role flag)
return <AppShell role={user.role} />;
```

---

## 5. Problemas Conhecidos (Bugs)

### 5.1 Registo atribuía role "coordinator" por defeito (CORRIGIDO ✅)

**Ficheiro:** `src/services/auth.ts:59`

```typescript
return {
  ...
  role: "member",  // ← CORRIGIDO: era "coordinator"
  ...
};
```

**Correcção:** Mudado para `role: "member"`. Commit incluído no refactoring Fase 1.

### 5.2 Terminologia Score inconsistente

- Agente vê "Score IA"
- Coordenador vê "KixiScore"
- Admin vê "AI Score"

**Sugestão:** Unificar como "KixiScore IA" com scope por perfil:

- Membro: "O meu KixiScore"
- Coordenador: "KixiScore do Grupo"
- Agente: "KixiScore do Portfolio"
- Admin: "KixiScore da Plataforma"

### 5.3 Coordenador sem visão de membro próprio

Conceição Mateus é simultaneamente Coordenadora e Membro #1 do grupo "Kixikila Rangel", mas a UI do Coordenador não mostra a sua perspectiva como membro (score pessoal, posição na rotação).

---

## 6. Regras de Negócio por Perfil

### Membro

- Score inicial: **300** (ao ser cadastrado)
- Score máximo: **1000**
- Pode ter score em múltiplos grupos (futura funcionalidade)
- Elegível a crédito com score ≥ **600**

### Coordenador

- Cada coordenador gere **1 grupo** (poderia gerir N no futuro)
- É também **membro** do seu próprio grupo
- Responsável por mínimo **2 membros activos** por grupo

### Agente

- Meta mensal: **20 cadastros**
- Comissão: **500 Kz** por cadastro validado
- Região atribuída: fixada pelo Admin
- Taxa de retenção mínima esperada: **80%**

### Admin

- Único perfil que pode alterar roles
- Único com acesso ao log de auditoria completo
- Único com visão de todas as regiões e grupos

---

## 7. Resumo de Responsabilidades (Referência Rápida)

| Acção                                   | Quem faz                                  |
| --------------------------------------- | ----------------------------------------- |
| Cadastrar novo utilizador na plataforma | **Agente**                                |
| Criar/gerir grupo kixikila              | **Admin** (cria) + **Coordenador** (gere) |
| Registar contribuição mensal            | **Coordenador**                           |
| Aprovar entrada de membro no grupo      | **Coordenador**                           |
| Pagar contribuição                      | **Membro** (via USSD)                     |
| Monitorizar portfolio de membros        | **Agente**                                |
| Supervisionar agentes e coordenadores   | **Admin**                                 |
| Analisar score de toda a plataforma     | **Admin**                                 |
| Ver score do grupo                      | **Coordenador**                           |
| Ver score do portfolio                  | **Agente**                                |
| Ver score pessoal                       | **Membro**                                |
| Suspender/activar agente                | **Admin**                                 |
| Promover membro a coordenador/agente    | **Admin**                                 |

---

## 8. Próximos Passos Recomendados

### Fase 1 — Bugs e Correcções (COMPLETO ✅)

| #   | Tarefa                                                         | Status |
| --- | -------------------------------------------------------------- | ------ |
| 1.1 | Fix: registo → `role: "member"`                                | ✅     |
| 1.2 | Extrair `CoordinatorDashboard` de `AppShell`                   | ✅     |
| 1.3 | Extrair `MemberDashboard` de `AppShell`                        | ✅     |
| 1.4 | Criar `AppLayout` partilhado                                   | ✅     |
| 1.5 | Mover `KixiScore`, `Historico`, `Configuracoes` para `shared/` | ✅     |

### Fase 2 — Melhorias (Prioridade Média)

| #   | Tarefa                                                         | Perfil       | Complexidade |
| --- | -------------------------------------------------------------- | ------------ | ------------ |
| 2.1 | Unificar terminologia "KixiScore IA"                           | Múltiplos    | Baixa        |
| 2.2 | Cartão "O meu perfil" no Coordenador                           | Coordenador  | Baixa        |
| 2.3 | Adicionar `grupoId`, `regiaoId`, `coordenadorId` ao `AuthUser` | Types + Auth | Média        |
| 2.4 | Diferenciar scope do KixiScore por perfil                      | KixiScore    | Baixa        |

### Fase 3 — Funcionalidades em Falta (Prioridade Normal)

| #   | Tarefa                                                | Perfil      | Complexidade |
| --- | ----------------------------------------------------- | ----------- | ------------ |
| 3.1 | Ver grupos disponíveis na região para cadastro        | Agente      | Média        |
| 3.2 | Aprovar/rejeitar pedidos de entrada de membros        | Coordenador | Média        |
| 3.3 | Ver posição na rotação e data prevista de recebimento | Membro      | Baixa        |
| 3.4 | Atribuir role a utilizador (upgrade/downgrade)        | Admin       | Alta         |
| 3.5 | Notificações push/SMS por perfil                      | Todos       | Alta         |

---

## 9. Fluxos de Utilizador

### Fluxo: Novo utilizador entra na plataforma

```
Registo → role: "member"
   └── Admin/Agente promove → role: "coordinator" ou "agent"
```

**Nota:** O bug 5.1 faz com que o registo atribua `coordinator` em vez de `member`.

### Fluxo: Membro junta-se a um grupo

```
Membro → Comunidades → Ver grupos → Pedir entrada (código)
   └── Coordenador recebe pedido → Aprova → Membro aparece na lista
```

### Fluxo: Agente cadastra novo membro

```
Agente → Cadastrar → Preenche dados → Associa a grupo/região
   └── Membro criado com score: 300 (inicial), status: pendente
   └── Coordenador do grupo vê novo membro pendente
```

### Fluxo: Contribuição mensal

```
Membro paga via USSD (*920*55#) ou presencialmente
   └── Coordenador → Membros → Regista contribuição
   └── Score do membro actualiza (factor: pontualidade +)
   └── Membro vê pagamento no histórico pessoal
```

### Fluxo: Acesso ao crédito

```
Membro → KixiScore → Ver elegibilidade
   └── Score ≥ 600 → Ver banco parceiro + limite
   └── Score < 600 → Ver dicas para melhorar score
```

---

_Documento gerado em 2026-05-16 para o projecto KixiPay._
_Branch de implementação: `hackathon-presentation`_
