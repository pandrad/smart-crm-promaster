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
│                          MOCK_CREDENTIALS, MOCK_TOAST, MOCK_IMPORT_PREVIEW
├── data.js              — seed arrays only; consumed by store.js alone
├── store.js             — all admin-configurable runtime state (localStorage)
├── theme.js             — dark/light theme system
├── utils.js             — daysLeft(), useWindowSize(), simulateAIClassification()
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
| `Inbox.jsx` | Email triage — 4 manual actions + AI auto-triage when simulation ON; two-section layout (auto-triaged / manual) |
| `Clientes.jsx` | Client list — table + detail drawer + Responsável column |
| `AdminPanel.jsx` | 9 tabs: Utilizadores, Funções, Atribuição, Processos, Tarefas, Mapeamento, SLA, Marca, Importar |
| `DetailDrawer.jsx` | Process detail — number, Comprador, Consulta checklist, Excel link, FU conditional |
| `DevTools.jsx` | 7 DEV-only tools — **delete before Stage 1 closure** |

---

## Admin Panel Structure

Tabs in order:
1. Utilizadores — add/edit/delete users (no role assignment here)
2. Funções — add/edit/delete roles
3. Atribuição de Utilizadores — assign users to roles (one user → many roles; one role → many users, round-robin)
4. Processos — Estados de Processo + Estados de Follow-up
5. Tarefas — Tipos de Tarefa + Estados de Tarefa (with System Role field)
6. Mapeamento de Responsabilidades — por estado de processo / por tipo de tarefa / por estado de tarefa (each with Reatribui toggle)
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

**Reatribui toggle:** each process status, task type, and task status has a `reassigns` boolean stored in `crm_mapeamento` under `processoStatusReatribui`, `taskTypeReatribui`, and `taskStatusReatribui` respectively. When OFF, the role dropdown is hidden and no reassignment occurs. When ON, the dropdown is visible and a new owner is resolved on trigger.

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

AI simulation toggle in DEV panel: when ON, `simulateAIClassification()` runs automatically on every pending inbox email. Emails with confidence ≥ 0.6 and a recognised type are auto-triaged: a task is created via `store.assignForTaskType()` (client assignment checked first, then Mapeamento round-robin), and the email moves to the **Processados automaticamente** section. Emails below the threshold stay in **Requerem atenção manual**. When OFF, no auto-processing occurs and all emails stay pending. **`simulateAIClassification()` is DEV ONLY — do not use in backend.**

**Inbox two-section layout:** `auto-triaged` emails show in a muted read-only section (no action buttons) with task type tag, SIM badge, assigned person, and confidence. `pending` emails show in the manual section with the four action buttons in the preview panel as before. Email status field values: `pending` → `auto-triaged` | `triaged` | `processed` | `diversos`.

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
