# Smart CRM — Promaster

Internal web app replacing SharePoint quotation tracking for Promaster (industrial parts, Angola). React frontend with mock data. Backend not yet built.

---

## Current State

**Stage 1 — Frontend with mock data.**
All screens complete. Technical QA passed. Awaiting: client document on task types/triggers/timings → second client review → final human QA pass → Stage 1 closure.

Dev server: `cd frontend && npm run dev` → http://localhost:5299
Demo login: `admin@promaster.co` / `admin123` · `supervisor@promaster.co` / `super123` · `adelina@promaster.co` / `pass123`

**⚠ Before Stage 1 closes:** delete `src/components/DevTools.jsx` and remove its import from `src/pages/Main.jsx`.

---

## Recent Changes (June 2026 session)

**Dashboard page** added as new default landing route (`/dashboard`) and first sidebar item. Reuses `StatsBar` (process overview, click-to-navigate to Processos with filter) and `SupervisorWidget` (admin/supervisor only). All users see a personal summary: active tasks, open processes, overdue, urgent. Sidebar order is now: Dashboard, Tarefas, Processos, Inbox, Clientes, Arquivo.

**Clientes — Responsável dropdown** no longer filters by role. All active users from `store.getUsers()` are selectable regardless of assigned roles.

**Email de Origem clickable** in process detail drawer (`DetailDrawer.jsx`). New `OriginEmailModal` shows sender, subject, full body read-only. `originEmail` field added to all mock process records in `data.js`.

**Admin Panel — SLA tab renamed to Avisos.** Label-only change, no functional difference.

**Pré-Entrada → Validação de Processo** conversion implemented. "Abrir Processo" button replaced with "Enviar para Validação" — converts the Pré-Entrada task into a Validação de Processo task assigned to Resp. Cotação (via mapeamento or "cotacao" role fallback). No process number generated until the validator approves via the existing Validar e Criar Processo flow.

**Alterar Estado Manualmente** — new action for Admin/Supervisor on any task (including Concluído/Cancelado). Opens a picker with all statuses including System Role ones, mandatory reason field. Logs a distinct `⚠ Alteração manual` history entry. Deliberately separate from normal action buttons.

**Reclassificar Tarefa** — new action for Admin/Supervisor on Não Classificado tasks in Tarefas. Two paths: (a) reclassify as existing task type, or (b) create a brand-new task type on the spot. Either path re-runs assignment routing and updates the task's type and owner.

**Tarefas — three-section split (Por Fazer / Em Curso / Concluídas).** Task list now has three persistent, always-visible sections. **Por Fazer** = new or returned/reassigned tasks not yet actioned by the current owner. **Em Curso** = actioned by current owner, no ownership change, not yet done. **Concluídas** = System Role Concluído or Cancelado — fully excluded from all SLA/Avisos evaluation, only returnable to active via Alterar Estado Manualmente. Active tasks breaching their due date are visually flagged (red border/background, alert icon). Tasks that arrived via pass/escalation/devolvido show a `↩` indicator in the Por Fazer section.

**Task ownership rule (finalised).** Every ownership-changing action (Passar, Escalar, Devolver, Enviar para Validação) resets the task to "Por Fazer" status so it appears in the new owner's Por Fazer section as fresh work. Actions that don't change ownership (Enviar Email, etc.) transition Por Fazer → Em Curso and stay with the same person. Retomar (supervisor taking an escalated task) goes directly to Em Curso since the supervisor is actively choosing to work on it.

**Dashboard — SLA breach tile** added to the "As minhas tarefas" row, showing count of the user's own tasks currently breaching their due date.

**Dashboard — task stat alignment.** Task stat calculations now use the same `doneLabels` and `porFazerLabel` logic as Tarefas.jsx, so the numbers always match exactly.

**Dashboard — Actividade Recente split by role.** Standard users see activity filtered to tasks where they are owner or appear in history. Admin/Supervisor see two sections: "Actividade geral" (all system activity) and "As minhas" (same filtered view).

**Dashboard — process stats scoped by role.** Standard users see "Visão geral de processos" filtered to their own processes by default, with a "Ver todos" / "Ver meus" toggle. Admin/Supervisor see all processes by default.

**Processos — Meus Processos default.** Tab order swapped: "Meus processos" is first and pre-selected on load. "Todos os processos" is second.

**Processos — Data Limite column.** The column previously labelled "SLA" is now "Data Limite" and shows the calculated due date (process creation date + Avisos duration configured for that status). Shows "Sem SLA definido" when no timing is configured.

**Process detail — SLA/Avisos section.** New section in the detail drawer showing the configured timing for the current status with an "Editar SLA" button (always visible when user has edit permission). SLA changes are logged in the process timeline.

**Process detail — follow-up status restored.** FU field now always visible when process status ≥ 9 (Enviado+), with an editable dropdown for users with edit permission, even when no FU was previously set.

**Process detail — editable fields.** Marca/Tipo, Modelo, and Sell Price are now inline-editable (click-to-edit with confirm/cancel) for admin, supervisor, or process owner/comm/compra.

**Process detail — file attachment.** "Anexar ficheiro" button in Anexos section allows uploading files, logged in timeline with uploader name and timestamp.

**Process detail — attachment supersede with confirmation.** "Remover" action on each attachment (including Modelo de Proposta) requires a confirmation prompt before proceeding. Superseded attachments are marked `superseded: true` and hidden from the active list but preserved in the attachments array and logged in the timeline — consistent with the no-deletion rule.

**Process detail — full activity timeline logging.** Every status change, reassignment (owner/comm/compra), field edit (Marca/Tipo, Modelo, Sell Price), and attachment add/remove is logged with timestamp, actor name, and description. Mirrors the task history pattern.

**Process detail — originEmail on all creation paths.** `originEmail` now populated on processes created via Validar e Criar Processo (copied from the validation task) and via DEV tool "Gerar processo aleatório" (synthetic content), ensuring Email de Origem is always clickable.

**Process number format** fixed to AAMMNNN with real current date (`new Date()`). Sequential counter resets per month prefix. Created/deadline dates on new processes are also dynamic.

**Unassigned task visibility** — tasks with no owner (null/undefined/empty) now visible only to Admin/Supervisor. Standard users see only their own tasks.

**Toast notification disabled** — `<Toast>` removed from Main.jsx render (import also removed). Toast.jsx file kept intact for potential reintroduction.

**Admin Panel — system task status protection.** Task statuses with a System Role other than "Nenhum" show a lock icon, cannot be deleted (delete button disabled), and have the System Role dropdown locked when editing. Label and colour remain editable.

**Admin Panel — Mapeamento: Reatribui toggle removed from Por Tipo de Tarefa.** Task type rows in Mapeamento now show only the role dropdown. The Reatribui toggle remains on process status and task status sections.

**Process assignment notification cards.** When a process is assigned to a user, a dismissable notification card appears at the top of their Por Fazer section in Tarefas. Cards show process number, client, brand/model, assignment reason, and have "Ver Processo" (navigates + dismisses) and "Dispensar" (dismisses only) actions. Cards are ephemeral — not task records, don't affect counts or stats. Two mock cards seeded in `MOCK_PROCESS_NOTIFICATIONS`. Store methods: `getProcessNotifications()`, `saveProcessNotifications()`, `dismissProcessNotification()`.

### Email Classification & Routing (rewritten — 19 June 2026)

The classification/routing flow was fully rewritten to eliminate accumulated patches. The architecture is now:

**Data flow:** Classification is determined once at email generation time in DevTools and stored as `email.aiSuggestion`. The `getAISuggestion(email)` function in `api/client.js` is a pure passthrough: `return email.aiSuggestion ?? null`. No heuristics, no simulation toggle check.

**DevTools email generation:** When AI Simulation is ON, ~78% of generated emails get a confident classification (type randomly selected from current `store.getTaskTypes()`, confidence 0.75–0.99). ~22% get `{ type: null, confidence: 0 }`. When OFF, all emails get `{ type: null, confidence: 0 }`. The "Gerar email não classificável" button always generates `{ type: null, confidence: 0 }` regardless of toggle.

**Inbox triage (single useEffect in Inbox.jsx):** Three paths:
- **AI Sim OFF:** Every pending email → task assigned to Supervisor (resolved via `crm_user_roles` "supervisor" role), email status `"requires-attention"`, appears in Requerem atenção manual section.
- **AI Sim ON, OUTCOME A:** `getAISuggestion()` returns non-null, confidence ≥ 0.6, type not null, type exists in `store.getTaskTypes()` → task created with that type via `store.assignForTaskType()`, email status `"auto-triaged"`, appears in Processados automaticamente section.
- **AI Sim ON, OUTCOME B:** All other cases → task type "Não Classificado", assigned to Supervisor, email status `"requires-attention"`, appears in Requerem atenção manual section.

**Inbox rendering:** Two sections always present. Section 1 ("Processados automaticamente") only visible when AI Sim ON, shows type badge + assigned person name, muted read-only style. Section 2 ("Requerem atenção manual") always visible, shows no badge/label on any email. Both sections are read-only. Preview panel shows only sender, subject, body, attachments. Zero action buttons anywhere in Inbox — all routing/categorisation happens in Tarefas.

**Email status values:** `"pending"` → `"auto-triaged"` | `"requires-attention"`. Task status uses `store.getLabelForSystemRole("Por Fazer")` — never hardcoded.

### Known Open Issues (pending fix)

- **System Behaviour field for task types:** planned to mirror System Role on task statuses, resolving inconsistent action-button availability across task types — not yet implemented, to be tackled in next session
- **Email de Origem clickability intermittent:** programmatically-created processes (via Validar e Criar Processo) may lack `originEmail` field if the originating task had none

---

## Steps to Close Stage 1

1. Apply client feedback from second review session
2. Final human QA pass across all screens (see `docs/stage1-testing-guide.md`)
3. Delete DevTools.jsx + remove import from Main.jsx
4. Final commit: `Stage 1 complete — frontend closed`
5. Push to GitHub
6. Build v4 deliverable → `delivery/v4/`
7. Proceed to Stage 2: schema finalisation (`database/schema.sql`)

---

## File Structure

```
frontend/src/
├── api/client.js        — fetch stubs; swap for real fetch() in Stage 5
├── mock/data.js         — all mock content: PROCESSOS, TAREFAS, INBOX_EMAILS,
│                          MOCK_CREDENTIALS, MOCK_TOAST, MOCK_IMPORT_PREVIEW,
│                          MOCK_PROCESS_NOTIFICATIONS
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
| `Processos.jsx` | Dashboard — stats bar, filters, table/kanban |
| `Tarefas.jsx` | Task management — full workflow, validation, history timeline |
| `Inbox.jsx` | Email observation — read-only two-section layout (Processados automaticamente / Requerem atenção manual); all routing happens in Tarefas |
| `Clientes.jsx` | Client list — table + detail drawer + Responsável column |
| `AdminPanel.jsx` | 9 tabs: Utilizadores, Funções, Atribuição, Processos, Tarefas, Mapeamento, SLA, Marca, Importar |
| `DetailDrawer.jsx` | Process detail — number, Comprador, Consulta checklist, Excel link, FU, SLA edit, full activity timeline |
| `DevTools.jsx` | 7 DEV-only tools — **delete before Stage 1 closure** |

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

## DEV Tools (7 tools — DEV only)

| # | Tool | Purpose |
|---|------|---------|
| 1 | Trocar utilizador | Switch session without login |
| 2 | Gerar email aleatório | Add random inbox email |
| 3 | Gerar processo aleatório | Add random process |
| 4 | Limpar Inbox e Tarefas | Empty inbox + tasks |
| 5 | Limpar Processos | Clear process list |
| 6 | Limpar dados admin | Clear admin config (keeps current user) |
| 7 | Repor todos os dados mock | Full reset to baseline |

AI simulation toggle in DEV panel: controls whether generated emails receive AI classification. When ON, ~78% of generated emails get a confident type (from current `store.getTaskTypes()`), ~22% get `type: null`. When OFF, all generated emails get `type: null`. The Inbox triage useEffect then processes each email according to the three-path logic documented in "Email Classification & Routing" above.

---

## Stage 4 — Reviewer Agent Protocol

After each backend module: open a separate Claude Code session with minimal context. Provide only the module spec and the code. Ask for bug review. Do not reuse the build session.

Modules: `graph_api.py`, `email_processor.py`, `claude_client.py`, `auth.py`, `models.py`, `notifications.py`, `importer.py`

Reviewer prompt: `docs/reviewer-prompt.md`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, inline styles, useWindowSize hook (no Tailwind) |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL via Supabase |
| Email | Microsoft Graph API (webhook on info@promaster.co) |
| AI | Claude API — `claude-sonnet-4-20250514` |
| Hosting | Railway (frontend + backend) + Supabase |

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

---

## AI Classification Rule (Backend — Stage 4)

Never hardcode task type or status labels in the classification prompt. At runtime: fetch current task types and process statuses from DB, inject dynamically into prompt. If classification returns unrecognised label → default to Não Classificado → assign to Supervisor.

---

## References

- Testing guide: `docs/stage1-testing-guide.md`
- Full brief: `docs/build-brief.md`
- Design reference: `docs/mockup-mission-control.html`
- Reviewer prompt: `docs/reviewer-prompt.md`
