# Smart CRM — Promaster

Internal web app replacing SharePoint quotation tracking for Promaster (industrial parts, Angola). React frontend with mock data. Backend not yet built.

---

## Current State

**Stage 1 — Frontend with mock data. Final delivery preparation (v4).**
All screens complete. Real client user data and role assignments loaded as mock defaults. Task lifecycle redesigned. Post-v4 bug fixes applied (see Changes Since v3). Awaiting: final human QA pass → Stage 1 closure.

Dev server: `cd frontend && npm run dev` → http://localhost:5299
Demo login: `admin@promaster.co.ao` / `promaster26` (Admin) · `joao.morais@promaster.co.ao` / `promaster26` (Supervisor) · `adelina.rodrigues@promaster.co.ao` / `promaster26` (Standard)

**⚠ Before Stage 1 closes:** delete `src/components/DevTools.jsx` and remove its import from `src/pages/Main.jsx`.

---

## Changes Since v3 (June 2026 session — current)

### Task Lifecycle Redesign (single ID throughout flow)

Tasks now maintain a single ID from creation to completion. All status, type, and owner changes are patches applied to the existing task object — no new tasks are ever created during flow transitions.

**Pré-Entrada → Abertura de Processo flow:**
```
Task T001 created (type: Pré-Entrada, owner: Adelina, status: Por Fazer)
    ↓ Adelina clicks Validar
Task T001 updated (type: Abertura de Processo, owner: Braulio, status: Por Fazer)
    cotacaoOwner field stores "Adelina Rodrigues" for Devolver routing
    ↓ Braulio clicks Devolver com Notas
Task T001 updated (type: Pré-Entrada, owner: Adelina, status: Por Fazer)
    ↓ Adelina clicks Validar again
Task T001 updated (type: Abertura de Processo, owner: Braulio, status: Por Fazer)
    ↓ Braulio clicks Abrir Processo
Task T001 updated (status: Concluído)
Process 2606001 created (status: Entrada, owner: Adelina via cotacaoOwner)
```

One task, one ID, full history. Consistent with the no-deletion rule.

**Pré-Entrada action buttons:** Validar, Enviar Email ao Cliente, Escalar (standard users) / Passar (admin/supervisor), Cancelar Tarefa.

**Abertura de Processo action buttons:** Abrir Processo, Devolver com Notas, Escalar (standard) / Passar (admin/supervisor), Cancelar Tarefa.

**Devolver com Notas behaviour:** When returning an Abertura de Processo task to cotacaoOwner, the type reverts to Pré-Entrada automatically. For all other task types, Devolver preserves the existing type.

### Real Client Data

**14 users** loaded as mock defaults matching real Promaster team:
Adelina Rodrigues, Alexandra Lima, Augusto Gouveia, Braulio Lourenço, Erânio Cassanga, Francisco Leitão, Gabriel Dala, João Chiquica, João Morais, Joaquim César, Luís Quelhas Valente, Lukeny Campos, Susete Ferreira, Tiago Pinto.

**10 roles:** Resp. Pré-Entrada, Resp. Cotação, Resp. FPs, Resp. Abertura, Resp. Fecho, Resp. Técnico, Resp. Contas a Receber e a Pagar, Resp. Comercial, Supervisor, Administrador.

**13 process statuses** matching client specification: Pré-Entrada, Pendente Cliente, Análise Técnica Promaster, Abrir Processo, Entrada, Consulta, Para Fechar, Fechado, FP Para Envio, Enviado, Enviado Pendente, Adjudicado, Cancelado.

**9 task types:** Pré-Entrada, Abertura de Processo, Contas Correntes, Status de Encomenda, Desconto, Cliente Novo, Follow-Up, Escalação, Análise Técnica. Validação de Processo removed (replaced by in-place type change). Não Classificado and Diversos removed.

Legacy `role` field on user objects preserves `"admin"` and `"supervisor"` strings for permission checks in components. New role IDs (`resp-pre-entrada`, `resp-cotacao`, etc.) used in `crm_user_roles` for Mapeamento routing.

### Tarefas — Personal View Default

Admin/Supervisor users default to personal view (own tasks only) on load. Toggle button "Ver todas as tarefas" / "Ver as minhas" switches between personal and global view. All three sections (Por Fazer, Em Curso, Concluídas) respect the toggle consistently. Sidebar badge always shows personal active task count regardless of role or view.

### Supervisor/Admin Button Overrides

For privileged users, across all task types: Escalar button hidden (top of escalation chain), Passar button always shown, Alterar Estado Manualmente always shown. Standard users see buttons exactly as defined by task type.

### Unclassified Email Handling

Emails that cannot be classified (confidence < 0.6, type null, type not in store) create tasks with `type: null` assigned to Supervisor. Task drawer shows "Sem Classificação" tag. Supervisor sees a "Classificar Tarefa" button that opens a picker with all store task types plus "Criar novo tipo". On classification, routing runs via `store.assignForTaskType()` and the task is reassigned.

### Dashboard — Activity Toggle

Single scrollable panel (max 5 visible, scrolls for more) replaces the two stacked sections. Admin/Supervisor see a toggle: "As Minhas" (default) / "Geral". Standard users see only their own activity. Most recent entries always at top.

### Follow-up Status — Always Editable

FU picker in the Alterar Estado modal is always visible regardless of process status — no longer restricted to status >= 9. Standalone FU dropdown in process detail info grid is also always visible. FU badge in Processos table column shows for any process with a FU value set, at any status.

### Reatribuir Modal — All Team Members

All three dropdowns (Resp. Cotação, Resp. Comercial, Resp. Compra) show the complete list of active users from `store.getUsers()` with no role-based filtering. Any team member is selectable for any role.

### SLA Breach Visual Indicators

Process Data Limite column shows breached dates in red with ⚠ prefix when the SLA-calculated due date is in the past. Existing task SLA breach indicators (red border, alert icon) unchanged.

### Email Classification (rewritten)

Two-outcome logic in Inbox.jsx triage useEffect:
- **OUTCOME A** (AI Sim ON, confident): `getAISuggestion()` returns confidence ≥ 0.6, valid type in store → task created with that type via `store.assignForTaskType()`, email status `"auto-triaged"`.
- **OUTCOME B** (all other cases): task created with `type: null`, assigned to Supervisor, email status `"requires-attention"`.

Inbox is fully read-only for all users. Zero action buttons. All routing/classification happens in Tarefas.

### DEV Tools Additions

- **Gerar email por tipo:** Dropdown to select a task type, generates an email with content tailored to that type. When AI Sim ON, classification confidence is 0.85–0.99 for the selected type.
- **Simular incumprimento SLA:** Extended to backdate process `created` field (for Data Limite calculation) and `deadline` field (for stats bar) on 2 active processes. Auto-seeds SLA settings (7 days per status) if not configured.
- **Limpar Processos** now persists the clear to localStorage via `store.saveProcessos([])` — previously only cleared React state and reverted on refresh.

### Post-v4 Bug Fixes (July 2026)

- **ConsultaChecklist crash**: Opening the 3rd process row caused a blank page. Root cause: `sla.tasks["Em Curso"]` accessed on undefined `sla.tasks`. Fixed with optional chaining (`sla.tasks?.["Em Curso"] ?? 48`) in DetailDrawer.jsx.
- **Processo field editable for Admin/Supervisor**: Task drawer "Processo" field was display-only for all users. Restored as an editable `<select>` for privileged users (Admin/Supervisor), allowing manual process association from a list of active processes. Non-privileged users and done tasks remain display-only.
- **Limpar Processos not persisting**: DEV tool clear reverted on page refresh because only React state was cleared. Added `store.getProcessos()` / `store.saveProcessos()` to store.js; Main.jsx now seeds `processos` from store; DevTools calls `store.saveProcessos([])` alongside `setProcessos([])`.
- **Client name separated from contact person in process creation**: `handleAbrirProcesso` in Tarefas.jsx now maps `t.client` → `process.client` (company name) and `email.senderName` → `process.comprador` (contact person) independently — no cross-fallback between the two fields. Client field in DetailDrawer info grid is now an editable `EditableInfoCell` (Admin/Supervisor/assigned user), with changes logged in the activity timeline. `fieldLabels` updated to include `client: "Cliente"`.
- **conversationId + structured email timeline entries**: All 14 mock processes in data.js have a `conversationId` field (format `conv-{processId}`). Inbound email timeline entries now carry a structured `email` object (`{ direction, from, to, subject, body, attachments }`) alongside `text`. `handleEnviarEmailCliente` in Tarefas.jsx and `handleEmailSent` in DetailDrawer.jsx both write structured outbound email objects to the timeline for Stage 4 Graph API compatibility.

### Role-Aware Client Assignments (July 2026)

Client responsibility assignments moved from a single `{ clientName: userName }` mapping to role-aware `{ clientName: { roleId: userName } }`, distinguishing "Resp. Cotação" and "Resp. Comercial" per client independently. Old string-shaped entries auto-migrate on load and persist once. Clientes.jsx list/table/drawer now show two responsible-user dropdowns per client instead of one.

`store.resolveClientRoleAssignment(clientName, roleId)` replaces the old client-override shortcut — a client assignment only wins routing if it matches the *specific role* being resolved for that trigger, not a blanket per-client override. `assignForTaskType` / `assignForProcessStatus` updated accordingly.

### New Process Stage — "Em Abertura" (id 45)

Added between "4. Abrir Processo" and "5. Entrada", flagged `optional: true`. `processoStatusReatribui[45]` defaults OFF, so a newly opened process stays with whoever opened it (tracked in a new `respAbertura` field) instead of auto-reassigning. Moving the process on to "Entrada" (still Reatribui-ON) hands off to Resp. Cotação as before. The process-opening flow in Tarefas.jsx now creates the processo at status 45 with `owner`/`respAbertura` set to the opener, rather than immediately assigning a Resp. Cotação at status 5. DetailDrawer shows a new "Resp. Abertura" TeamCard when `respAbertura` is set.

### Owner-Preserving Reassignment

Both the process status change flow (DetailDrawer.jsx) and `applyReatribui` (Tarefas.jsx) now only trigger reassignment when there's no current owner, or a role-specific client assignment names someone else. Previously Reatribui-ON always reran round-robin/mapping on every status change, which could bounce an existing owner off a process they were actively working. This was a deliberate behavior change, not a bug fix — Reatribui ON now means "eligible for reassignment," not "always reassign."

### DetailDrawer — Wider Field Editing

`Cliente`, `Marca/Tipo`, `Modelo`, `Sell Price` are now editable by any user via a new `canEditFields = true` flag, decoupled from `canEdit` (still admin/supervisor/owner-only), which continues to gate attachments and Follow-up.

### Tarefas — New Actions and UI

- **CC field** added to "Enviar Email ao Cliente" modal; persisted in history and the structured email object.
- **Associar a Processo Existente**: new searchable modal (`AssociarProcessoModal`) replaces the old inline `<select>`; now available to the task owner as well as Sup/Admin, not privileged-only.
- **Alterar Tipo**: new action letting Sup/Admin reclassify an already-typed task at any time (reuses `ReclassificarModal` / `handleReclassificar`), which now also re-runs assignment logic on type change.
- **Baseline action fallback**: the task drawer's action panel no longer goes empty when no type-specific action group applies.
- Task drawer auto-closes when an action reassigns the task away from the current user.
- **Acknowledgment cards** (`AckCard`) surfaced in Por Fazer for tasks/processes passively handed to the user without them clicking anything — dismissible, persisted per-user in localStorage.
- New pooled **SummaryStrip** (Por Fazer / Activas / SLA Excedido) added to both Tarefas.jsx and Processos.jsx, clickable through to `/dashboard`.

### Dashboard — Activity Feed Accuracy Fix

`myActivity` now filters per history entry (actor === user OR the task's current owner === user) instead of per-task. Previously, a task the user merely touched once would leak all other actors' history entries into "As Minhas".

---

## Changes Since v4 (current session)

### Resp. Cotação Assignment Fix — Em Abertura → Entrada

When a process advances from Em Abertura to Entrada, a real Resp. Cotação person is now correctly resolved through client-based assignment first, then mapping, then round-robin — rather than incorrectly inheriting the Resp. Abertura person's name. While a process sits at Em Abertura, Resp. Cotação now correctly stays empty rather than showing a placeholder name.

Resp. Abertura now also appears as its own column in the Processos table, in addition to already showing correctly in the drawer.

### Quotation File Naming Convention

Naming pattern implemented: `<processo> Lista_T.xlsx`. For testing purposes only, a synthetic placeholder file with a `_TEST` suffix is generated in the browser, since real Microsoft Graph API integration does not exist yet. Documented as a known Stage 4 dependency (see Stage 4 Dependencies section) — real production behavior must call the Microsoft Graph API to create an actual copy of the template inside the client's SharePoint.

### Attachment Uploads — Clickable, Locally Stored

Uploaded attachments are now clickable and functional, but only stored locally in the browser session of whoever is testing. Documented as a known Stage 4 dependency (see Stage 4 Dependencies section) requiring real backend or database file storage in production.

### Associar a Processo Existente — Direction Fix

Previously the process itself was incorrectly overwritten with the task's client details. Now the task correctly inherits the existing process's details instead, and the process itself remains unchanged. This action is now logged correctly in both the task history and the Dashboard activity feed.

### Reassignment Design Decision Reversed (Intentional)

Previously an existing process owner was preserved through routine status changes unless a client-specific assignment named someone different. Now, whenever Reatribui is ON for a status and the mapping or round-robin resolves a different person than the current holder, that person becomes the new Resp. Actual, following the same priority order used everywhere else: client-based assignment first, then mapping, then round-robin.

### Resp. Cotação / Resp. Comercial vs. Resp. Actual

Two roles are now clearly separated by design:
- **Resp. Cotação and Resp. Comercial** are historical record fields, set once and never changed automatically afterward — representing who was genuinely responsible for that part of the process.
- **Resp. Actual** is a live field that always reflects who currently holds the process right now, and updates automatically whenever the mapping reassigns ownership at a new status.

The Processos table column order is now: Resp. Actual, Resp. Abertura, Resp. Cotação, Resp. Comercial.

Meus Processos, the summary strip, and the passive reassignment notification system in Tarefas.jsx now correctly check Resp. Actual to determine what belongs to the current user, rather than the old Resp. Cotação owner field — fixing a bug where mapping-driven reassignments never surfaced as notifications. The Dashboard stat tiles were also updated to the same Resp. Actual definition for consistency.

The Resp. Cotação–labeled filter dropdown in Toolbar.jsx intentionally still filters by the historical Resp. Cotação field, not Resp. Actual, since its label specifically refers to that role.

### Passive Reassignment Notification System

Now correctly fires for any process that changes owner without a direct action from the new owner, including routine status changes through the pipeline — not only the initial Em Abertura → Entrada handover. A visible badge count was added combining active tasks and unacknowledged notifications together on the Tarefas sidebar tab, and a separate dedicated Notificações tile was added to the Dashboard under "As minhas tarefas", distinct from the existing Activas tile.

**Pending / not yet confirmed:** the Dashboard.jsx consistency fix for `myProcessos` (aligning it to the same Resp. Actual definition used elsewhere) was the very last instruction sent before pausing this session, and has not yet been confirmed back as completed.

---

## Steps to Close Stage 1

1. Final human QA pass across all screens (see `docs/stage1-testing-guide.md`)
2. Delete DevTools.jsx + remove import from Main.jsx
3. Final commit: `Stage 1 complete — frontend closed`
4. Push to GitHub
5. Build v4 deliverable → `delivery/v4/`
6. Proceed to Stage 2: schema finalisation (`database/schema.sql`)

---

## File Structure

```
frontend/src/
├── api/client.js        — fetch stubs; swap for real fetch() in Stage 5
├── mock/data.js         — all mock content: PROCESSOS, TAREFAS, INBOX_EMAILS,
│                          MOCK_CREDENTIALS, MOCK_TOAST, MOCK_IMPORT_PREVIEW
├── data.js              — seed arrays only; consumed by store.js alone
├── store.js             — all admin-configurable runtime state (localStorage)
├── theme.js             — dark/light theme system
├── utils.js             — daysLeft(), useWindowSize()
├── icons.jsx            — inline SVG icons
├── pages/               — Login, Main, Processos, Tarefas, Inbox, Clientes, Arquivo
└── components/          — Sidebar, StatsBar, Toolbar, TableView, KanbanView,
                           DetailDrawer, AdminPanel, SupervisorWidget,
                           Toast, Primitives, DevTools
```

**Do not reorganise this structure.**

---

## Key Pages and Components

| File | Purpose |
|------|---------|
| `Main.jsx` | Layout shell — sidebar, routing, shared state, global modals |
| `Processos.jsx` | Process list — stats bar, filters, table/kanban, Data Limite with breach indicator |
| `Tarefas.jsx` | Task management — full lifecycle workflow, three-section split, personal/global view toggle |
| `Inbox.jsx` | Email observation — read-only two-section layout; all routing happens in Tarefas |
| `Dashboard.jsx` | Personal summary — task/process stats, activity panel with toggle |
| `Clientes.jsx` | Client list — table + detail drawer + Responsável column |
| `AdminPanel.jsx` | 9 tabs: Utilizadores, Funções, Atribuição, Processos, Tarefas, Mapeamento, SLA, Marca, Importar |
| `DetailDrawer.jsx` | Process detail — number, Comprador, FU always editable, Reatribuir (all users), full timeline |
| `DevTools.jsx` | DEV-only tools — **delete before Stage 1 closure** |

---

## Admin Panel Structure

Tabs in order:
1. Utilizadores — add/edit/delete users (no role assignment here)
2. Funções — add/edit/delete roles
3. Atribuição de Utilizadores — assign users to roles (one user → many roles; one role → many users, round-robin)
4. Processos — Estados de Processo + Estados de Follow-up
5. Tarefas — Tipos de Tarefa + Estados de Tarefa (with System Role field)
6. Mapeamento de Responsabilidades — por estado de processo (with Reatribui toggle) / por tipo de tarefa (role dropdown only) / por estado de tarefa (with Reatribui toggle)
7. SLA — timings per process status, task type, task status
8. Marca — branding
9. Importar — CSV/Excel bulk import

---

## Responsibility Routing Logic

When a trigger fires (process status change, task created, email triaged):
1. Check `crm_client_assignments` — if client has assigned user, route there
2. Otherwise look up mapped role in `crm_mapeamento`
3. Find users with that role in `crm_user_roles`
4. Assign round-robin via `crm_rr_counters`

**Reatribui toggle:** each process status and task status has a `reassigns` boolean stored in `crm_mapeamento` under `processoStatusReatribui` and `taskStatusReatribui` respectively. When OFF, the role dropdown is hidden and no reassignment occurs. When ON, the dropdown is visible and a new owner is resolved on trigger. Task types in Mapeamento show only the role dropdown — no Reatribui toggle.

**System roles:** 7 fixed task status behaviours (Escalado, Devolvido, Cancelamento Pendente, Cancelado, Concluído, Em Curso, Por Fazer). Admin can rename/recolour but cannot delete. Action buttons set status via `sysStatus()` dynamic lookup — never hardcoded strings.

---

## DEV Tools (DEV only)

| # | Tool | Purpose |
|---|------|---------|
| 1 | Trocar utilizador | Switch session without login |
| 2 | Gerar email aleatório | Add random inbox email |
| 2b | Gerar email não classificável | Add email with type: null |
| 2c | Gerar email por tipo | Select task type, generate tailored email |
| 3 | Gerar processo aleatório | Add random process |
| 4 | Simular incumprimento SLA | Backdate task due + process created/deadline |
| 5 | Limpar Inbox e Tarefas | Empty inbox + tasks |
| 6 | Limpar Processos | Clear process list |
| 7 | Limpar dados admin | Clear admin config (keeps current user) |
| 8 | Repor todos os dados mock | Full reset to baseline |

AI simulation toggle in DEV panel: controls whether generated emails receive AI classification. When ON, ~78% of generated emails get a confident type, ~22% get `type: null`. When OFF, all generated emails get `type: null`.

---

## Stage 4 Dependencies — Known Frontend Limitations to Resolve

These are temporary, browser-only workarounds in the current frontend that have no real backend equivalent yet. Both must be properly resolved once Stage 4 backend work begins — they are not production-ready and must not be mistaken for real functionality.

- **Quotation spreadsheet is a synthetic placeholder, not a real file.** The quotation file shown on a process (named `"<processo> Lista_T_TEST.xlsx"`) is currently a synthetic placeholder Blob generated entirely in the browser for testing purposes — it has no real content and lives only as a temporary browser blob, not a persisted or shared file. In production, this must instead call the **Microsoft Graph API** to create a real copy of the **Modelo de Proposta** template inside the client's actual SharePoint, using the same naming pattern but **without** the `_TEST` suffix (i.e. `"<processo> Lista_T.xlsx"`). The resulting real SharePoint link must then be stored on the process record instead of a local blob.

- **Manually attached files are only stored in the browser session, not shared or persistent.** Any file a user manually attaches to a process or task is currently stored only in that user's local browser session (on their own machine) — it is not shared with the team, not persisted anywhere durable, and disappears once that session ends. In production, this must be stored in real backend storage: either the client's SharePoint or a proper file storage service connected to the database, so attached files are genuinely shared and permanently accessible to the whole team.

---

## Stage 4 — Reviewer Agent Protocol

After each backend module: open a separate Claude Code session with minimal context. Provide only the module spec and the code. Ask for bug review. Do not reuse the build session.

Modules: `graph_api.py`, `email_processor.py`, `claude_client.py`, `auth.py`, `models.py`, `notifications.py`, `importer.py`

Reviewer prompt: `docs/reviewer-prompt.md`

---

## Deployment

**Live prototype:** https://smart-crm-promaster.vercel.app

Frontend only — backend not yet deployed (Stage 4). Every push to the `main` branch on GitHub automatically triggers a new Vercel deployment within ~30 seconds.

The DEV tools panel is visible on the deployed version because the environment variable `VITE_SHOW_DEV_TOOLS=true` is set in Vercel project settings. **⚠ This variable must be deleted from Vercel before real production deployment in Stage 7** — leaving it in place would expose DEV tools to real users.

**Login credentials for the prototype:**
- `admin@promaster.co.ao` / `promaster26` — Admin (maps to Luís Quelhas Valente)
- All other users: their real Promaster email (e.g. `joao.morais@promaster.co.ao`, `adelina.rodrigues@promaster.co.ao`) with password `promaster26`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, inline styles, useWindowSize hook (no Tailwind) |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL via Supabase |
| Email | Microsoft Graph API (webhook on info@promaster.co) |
| AI | Claude API — `claude-sonnet-4-20250514` |
| Hosting | Vercel (frontend) + Supabase (Stage 5+) |

### File Storage — Architecture Decision

The app currently supports file attachments via URL only — files are stored in SharePoint/OneDrive and the app stores the URL string in the database.

In Stage 4, add **Supabase Storage** as a direct file upload option for files that do not originate from SharePoint (supplier catalogues, client attachments received by email, photos, PDFs, etc.).

**Implementation:** A file upload endpoint in FastAPI accepts files, stores them in a Supabase Storage bucket, and returns a URL that gets stored in the attachments table alongside SharePoint URLs — the schema is unchanged since both are just URL strings. The frontend attachment UI needs a file picker option added alongside the existing URL input.

**Estimated additional effort:** 2–3 days in Stage 4.

**Cost:** ~€0.021 per GB per month via Supabase Storage — negligible at expected volumes.

**Migration:** Existing SharePoint files stay in SharePoint permanently — no migration needed.

**Practical rule for client:** Files that need editing (quotation Excel files) stay in SharePoint. Read-only reference files (catalogues, received PDFs, photos) can be uploaded directly in the app.

---

## Non-Negotiable Architecture Rules

1. **All mock data in `src/mock/data.js`.** No hardcoded data in components.
2. **All data fetching through `src/api/client.js`.** No direct fetch() in components.
3. **No component imports `data.js` directly.** Only `store.js` consumes it.
4. **All statuses, types, users read from `store.js`.** Never inline.
5. **`/frontend` and `/backend` completely isolated.** HTTP API only.
6. **No data ever permanently deleted.** Cancelled = marked. Archived = moved. Triaged = processed state. Exception: DEV tools only.
7. **Never hardcode status labels, task type labels, or role names.** Always read from store or database dynamically.
8. **Git — commit freely locally. Never push without explicit per-message instruction. "Commit" does not mean "commit and push". Always stop after the commit and wait.**
9. **All UI text pt-PT. Dates DD/MM/YYYY. Currency €1.234,56.**
10. **Task ID never changes throughout a task's lifecycle.** All flow transitions (Validar, Devolver, Escalar, etc.) patch the existing task object in place. Never create a new task as part of a flow transition.

---

## AI Classification Rule (Backend — Stage 4)

Never hardcode task type or status labels in the classification prompt. At runtime: fetch current task types and process statuses from DB, inject dynamically into prompt. If classification returns unrecognised label → assign task with `type: null` → assign to Supervisor for manual classification.

---

## References

- Testing guide: `docs/stage1-testing-guide.md`
- QA journeys tracker: `docs/smart-crm-qa-journeys.xlsx` (personal tracking copy, 15 journeys, with formatting)
- Full brief: `docs/build-brief.md`
- Design reference: `docs/mockup-mission-control.html`
- Reviewer prompt: `docs/reviewer-prompt.md`
