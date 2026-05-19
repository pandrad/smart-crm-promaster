# Smart CRM — Promaster

Internal web app replacing a SharePoint-based quotation tracking system for Promaster (industrial parts, Angola). Automates email intake, AI classification, and process management.

## Current Step

**Step 1 — Frontend with mock data: COMPLETE. Sent to client for review.**

### What was built
All screens fully interactive with mock data. Dev server: `cd frontend && npm run dev` → http://localhost:5299

| File | Screen / Purpose |
|------|-----------------|
| `src/pages/Login.jsx` | Login — mock credentials, saves name to localStorage |
| `src/pages/Main.jsx` | Layout shell — sidebar + route outlet, shared state, global modals |
| `src/pages/Processos.jsx` | Dashboard — stats bar, filters, table/kanban views |
| `src/pages/Tarefas.jsx` | Task management — full task model, validation workflow actions, history timeline |
| `src/pages/Inbox.jsx` | Email triage — preview panel with full body, 4 actions; Confirmar como Processo creates Validação de Processo task |
| `src/pages/Clientes.jsx` | Client list derived from processos — table + detail drawer with process history |
| `src/pages/Arquivo.jsx` | Archived processes — read-only table |
| `src/components/Sidebar.jsx` | Persistent left nav — 3 zones, badges, user chip, logout; Clientes enabled |
| `src/components/StatsBar.jsx` | 6 clickable stat cards incl. Transitados — user-specific in Meus processos |
| `src/components/Toolbar.jsx` | Search + filters + column visibility toggle + table/kanban toggle |
| `src/components/TableView.jsx` | Sortable table, per-column filters, priority inline change, FU conditional |
| `src/components/KanbanView.jsx` | Kanban with drag-and-drop; non-owner cards locked |
| `src/components/DetailDrawer.jsx` | Right panel: process number, Comprador, Consulta checklist, Excel link, FU conditional, reassign for supervisor/owner |
| `src/components/AdminPanel.jsx` | Slide-over: Users, Estados, Prioridades, Funções, Atribuição de Tarefas (process roles + task type assignment incl. Validação de Processo), Marca, Importar |
| `src/components/SupervisorWidget.jsx` | Summary widget: stat cards + escalated tasks section (clickable → TaskDrawer) |
| `src/components/Toast.jsx` | "Nova tarefa atribuída" notification — shows task type, client, assigning user |
| `src/components/Primitives.jsx` | Avatar (photo support), badges — all read from store |
| `src/theme.js` | Dark/light theme system — mutable THEME object, applyTheme(), persisted to localStorage |

### File structure (finalised — do not reorganise)

```
frontend/src/
├── api/
│   └── client.js       — fetch stubs: login, getProcessos, getUsers,
│                          getStages, getFUStatuses, getPriorities.
│                          Swap stub bodies for real fetch() in Stage 5.
├── mock/
│   └── data.js         — all Stage 1 mock content: PROCESSOS, TAREFAS,
│                          INBOX_EMAILS (with full body text), MOCK_CREDENTIALS,
│                          MOCK_TOAST, MOCK_IMPORT_PREVIEW
├── components/         — UI components (import from utils/store/mock only)
├── pages/              — Login.jsx, Main.jsx, Processos.jsx, Tarefas.jsx,
│                          Inbox.jsx, Arquivo.jsx
├── data.js             — seed arrays only (STAGES, FOLLOWUP_STATUSES, USERS)
│                          imported by store.js alone — no components touch it
├── store.js            — localStorage runtime state; seeds from data.js;
│                          also holds getTaskAssignment() per-type default owners
├── theme.js            — dark/light theme system; mutable THEME object,
│                          applyTheme(), getStoredTheme(), saveTheme()
├── utils.js            — pure utilities: daysLeft()
└── icons.jsx           — inline SVG icons
```

### Separation of concerns — confirmed clean
- `data.js` — seeds only, one consumer (`store.js`)
- `mock/data.js` — all hardcoded demo content, no logic
- `utils.js` — pure functions, no data
- `theme.js` — dark/light colour system, no application data
- `store.js` — admin-editable runtime state, localStorage-backed
- `api/client.js` — data-fetching layer; currently returns mock data, ready for real API
- Components import `daysLeft` from `utils.js`, `PROCESSOS` from `mock/data.js`, everything else from `store`

### Deliverable folder
`delivery/` — one subfolder per UI version. Never delete previous versions. Each subfolder contains: the HTML app, the Portuguese instructions as `.md`, and the same instructions as `.pdf`.

```
delivery/
├── v1/   — original light-theme prototype (first client review)
│   ├── Smart CRM — Promaster v1.html             (app — open in browser)
│   ├── Instruções — Smart CRM Promaster v1.html   (instructions — open in browser)
│   └── Instruções — Smart CRM Promaster v1.md     (source)
└── v2/   — Mission Control redesign (dark theme, sidebar, Tarefas, Inbox, Arquivo)
    ├── Smart CRM — Promaster v2.html             (app — open in browser)
    ├── Instruções — Smart CRM Promaster v2.html   (instructions — open in browser)
    └── Instruções — Smart CRM Promaster v2.md     (source)
```

Both the app and the instructions are self-contained HTML files — client opens them directly in any browser. Instructions are print-ready (clean print stylesheet included).

Demo login: `admin@promaster.co` / `admin123` (Admin) · `supervisor@promaster.co` / `super123` (Supervisor) · `adelina@promaster.co` / `pass123` (standard)

**To add a new version:** create `delivery/vN/`, write the `.md` instructions, run `node /tmp/md-to-html.js` (adapt paths) to generate the instructions HTML. Rebuild app HTML: enable `vite-plugin-singlefile`, build, patch `type="module"` out, move script after `#root`, restore config.

### Mission Control redesign — all phases complete and pushed to GitHub

| Phase | What was done | Commit |
|-------|--------------|--------|
| A | Data foundations: 11-stage status list, Supervisor role, TAREFAS + INBOX_EMAILS mock data, new icons | fc30f90 |
| B | Layout shell: dark sidebar, Main.jsx restructured, Processos.jsx extracted, stub pages, App.jsx routes | fc30f90 |
| C | All components adapted to dark theme: StatsBar, Toolbar, TableView, KanbanView, Primitives, Toast, Login, AdminPanel | 9b0cf42 |
| D | DetailDrawer updates: process number prominence, Comprador first, FU conditional, Consulta checklist, Excel link, supervisor/owner reassign | 6f3bdb6 |
| E | New screens: Tarefas (full table + TaskDrawer), Inbox (4 triage actions + new-client flow), Arquivo | a7a7195 |
| F | AdminPanel dark theme polish, CLAUDE.md updated | 18d7513 |

### Task model redesign — complete and pushed to GitHub (parked for QA)

Second iteration based on confirmed client feedback. Tarefas is now the primary work surface.

| Phase | What was done | Commit |
|-------|--------------|--------|
| A | New task model (owner, history[], escalationNote, originEmail with body), 8 mock tasks, inbox emails with full body text, store.getTaskAssignment() with per-type default owners | e7cfadf |
| B | Inbox rewrite: email preview panel (full body, all 4 actions inside), fixed triage flow — Confirmar como Processo creates Pré-Entrada task, not a process | 3fd861c |
| C | Tarefas redesign: 8 types, 5 statuses, 4 fully working actions (Abrir Processo, Concluir, Passar, Escalar/Retomar), history timeline in TaskDrawer | 3fd861c |
| D | SupervisorWidget: escalated tasks section (clickable → TaskDrawer), stat cards updated | 3fd861c |
| E | Wiring: shell-level TaskDrawer in Main, onOpenTask through Processos → SupervisorWidget, AdminPanel task type assignment section added alongside existing process role section, sidebar badge fixed | 3fd861c |
| Fix | QA reset button fixed (themeVersion bump, all keys cleared), renamed to "Repor dados mock" | 75085ae |

### Inbox validation workflow — implemented

Third iteration: "Confirmar como Processo" in the Inbox now creates a **Validação de Processo** task instead of a Pré-Entrada task. The Resp. Cotação validates before any process is opened. Core principle: nothing is ever deleted — every action, note, and status change is permanently recorded in the task timeline.

| What changed | Files |
|---|---|
| New task type `Validação de Processo` with `triagedBy` + `validatorOwner` fields | `Tarefas.jsx`, `store.js` |
| New statuses: `Devolvido`, `Cancelado` | `Tarefas.jsx` |
| 4 new modals: `ValidarModal`, `DevolverModal`, `ResubmeterModal`, `CancelarTarefaModal` | `Tarefas.jsx` |
| 3 new actions in TaskDrawer (validator: Validar/Devolver; triage author: Resubmeter; owner only: Cancelar) | `Tarefas.jsx` |
| `handlePreEntrada` creates Validação task (not Pré-Entrada); email marked `triaged` not `processed` | `Inbox.jsx` |
| T009 (Devolvido + full back-and-forth thread) and T010 (Por Fazer) mock tasks; E003 + E006 marked triaged | `mock/data.js` |

### DEV ONLY testing tools — `src/components/DevTools.jsx`

Seven QA tools mounted only when `import.meta.env.DEV === true`. Absent from production builds (confirmed 0 matches in dist bundle).

| # | Tool | What it does |
|---|------|-------------|
| 1 | Trocar utilizador | Instantly switches logged-in session to any mock user without going through login |
| 2 | Gerar email aleatório | Adds a random inbound email to the Inbox; appears in real time (Inbox reads prop directly, no local state copy) |
| 3 | Gerar processo aleatório | Adds a random processo with sequential 2605NNN ID, random client/equipment from built-in lists, team from store |
| 4 | Limpar Inbox e Tarefas | Resets both inbox and tasks to empty — clean slate for flow testing |
| 5 | Limpar Processos | Clears the processo list entirely |
| 6 | Limpar dados admin | Clears all admin config (keeps current user) — simulates fresh installation |
| 7 | Repor todos os dados mock | Master reset — restores all processos, tarefas, inbox, and admin data to mock baseline |

**⚠ Must be deleted before Stage 2 client review.** Delete `src/components/DevTools.jsx` and remove its import from `src/pages/Main.jsx`.

### Pre-QA fixes applied during human review

Fixes applied between static QA and manual browser review sign-off:

| Fix | Files | Commit |
|-----|-------|--------|
| Topbar "Repor dados mock" button removed (duplicated in DEV panel) | `Main.jsx` | 26cf8c4 |
| Toast changed from "novo email" to "nova tarefa atribuída" — shows type badge, client, assigning user, note | `Toast.jsx`, `mock/data.js` | 26cf8c4 |
| Clientes page built — table derived from processos, detail drawer with process history | `Clientes.jsx` | 26cf8c4 |
| Sidebar Clientes item enabled (was disabled/greyed out) | `Sidebar.jsx` | 26cf8c4 |
| Inbox real-time update fixed — removed local `emails` state, reads `inboxEmails` prop directly | `Inbox.jsx` | 4864a32 |
| DEV Tool 3 added: Gerar processo aleatório | `DevTools.jsx` | 4864a32 |
| DEV Tool 5 added: Limpar Processos | `DevTools.jsx` | 4864a32 |

### Stage 1 status — complete, in human review

| Item | Status |
|------|--------|
| Frontend build (all screens) | ✅ Complete |
| Mission Control dark theme redesign | ✅ Complete |
| Task model (owner, history, escalation) | ✅ Complete |
| Inbox validation workflow | ✅ Complete |
| Clientes page | ✅ Complete |
| No-deletion rule (architecture rule 6) | ✅ Enforced |
| `docs/build-brief.md` updated | ✅ Current |
| DEV ONLY testing tools (7 tools) | ✅ Built, awaiting deletion pre-delivery |
| Static QA (code analysis + build) | ✅ Complete — 1 bug found and fixed (see below) |
| Pre-QA fixes from human review | ✅ Applied (see table above) |
| Human browser review | 🔄 In progress — owner testing manually |
| Stage 1 closed | ⏳ Pending human review sign-off |

### Static QA result (complete)

Full static analysis pass was run across all source files against the QA plan checklist.

**One bug found and fixed:**
- `AdminPanel.jsx` — `TASK_TYPE_LIST` was missing `"Validação de Processo"`, so the admin had no way to configure who receives validation tasks from Inbox triage. Fixed: added as first entry. Committed as `QA fix — Validacao de Processo added to task assignment tab`.

**All other checks passed:**
- Login, auth guard, 3 demo profiles — correct
- DevTools: all tools wired, `import.meta.env.DEV` guard confirmed, absent from dist bundle
- Processos filters, Meus/Todos tabs, sort, column visibility — correct
- SupervisorWidget `onOpenTask` wiring, privilege flags — correct
- DetailDrawer: FU conditional (`status >= 9`), Consulta checklist (`status === 5 && p.consulta`), `canReassign` — correct
- KanbanView: `locked = !isOwned(p)`, draggable guard — correct
- Tarefas: scope filter, `isValidation`/`isValidator`/`isTriagedBy`/`isOwner`/`isDone` flags — correct
- Inbox `handlePreEntrada`: creates Validação task with correct `triagedBy`/`validatorOwner` fields, marks email `triaged` — correct
- Validation modals (Validar, Devolver, Resubmeter, Cancelar) action guards — correct
- T009/T010 field names match exactly what TaskDrawer reads — confirmed
- No-deletion rule: no `delete`/`remove` in any task/email/process handler — confirmed
- Arquivo: read-only, opens DetailDrawer — correct
- Theme toggle — correct

### Next action
**Human browser review in progress. Do not make code changes unless the manual review identifies a specific failure.**

When human review is complete and all issues resolved:
1. Fix any remaining failures identified during browser review
2. Delete `src/components/DevTools.jsx` and remove its import from `src/pages/Main.jsx`
3. Final commit: `git commit -m "Stage 1 complete — frontend closed"`
4. Push to GitHub
5. Build v3 deliverable (vite-plugin-singlefile → patch → `delivery/v3/`)
6. Write `delivery/v3/Instruções — Smart CRM Promaster v3.md`
7. Proceed to Stage 2: schema finalisation (`database/schema.sql`)

Dev server auto-starts on login via launch agent → http://localhost:5299

See `docs/build-brief.md` § "Build Order" for full step list.

## Stage 4 — Reviewer Agent Protocol

After each significant backend module is built, run a **separate Claude Code session with clean context** to review it before proceeding to the next module. Do not reuse the build session.

Modules to review (in order): `graph_api.py`, `email_processor.py`, `claude_client.py`, `auth.py`, `models.py`, `notifications.py`, `importer.py`.

Reviewer prompt template: `docs/reviewer-prompt.md`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL via Supabase |
| Email | Microsoft Graph API (webhook) |
| AI | Claude API — `claude-sonnet-4-20250514` |
| Hosting | Single VPS (DigitalOcean or Hetzner) |

## Key Rules

1. **Never hardcode statuses.** Labels, colors, IDs always come from the database.
2. **One process per email thread.** Match on Graph API `conversationId`.
3. **Three roles per process.** Resp. Comercial, Resp. Cotação, Resp. Compra — always distinct people.
4. **Files stay in Microsoft.** Store OneDrive/SharePoint URLs, never upload files to our server.
5. **Frontend first (Step 1).** Build and get UI approved before any backend work. From Step 3 onward: run the backend before touching the frontend, and test Graph API with Graph Explorer before writing code.
6. **Locale.** All UI text pt-PT. Dates DD/MM/YYYY. Currency `€1.234,56`.
7. **Keep the prototype's visual style.** Do not redesign — connect to real data.
8. **Git — commit locally freely, but never `git push` unless explicitly asked.** Commits are fine as local milestones; pushing to GitHub is a deliberate action that requires an explicit instruction.

## Non-negotiable architecture rules

These apply to every change made in every session, no exceptions:

1. **All mock data lives in `src/mock/data.js`.** No component, page, or utility may contain hardcoded arrays, objects, or strings that represent application data (users, processes, statuses, credentials, sample rows, etc.).
2. **All data fetching goes through `src/api/client.js`.** Components never call `fetch()`, import from `data.js`, or read from `mock/data.js` directly. They call a function in `api/client.js`, which currently returns mock data and will later call the real API.
3. **No component may import `data.js` directly.** That file is consumed only by `store.js`. Components read runtime state from `store.js` or fetch data via `api/client.js`.

4. **All statuses, users, priorities, and follow-up statuses must be read from `store.js`.** Never hardcode these values inline in a component, even as a fallback or placeholder. Always call the appropriate `store.get*()` method.
5. **`/frontend` and `/backend` are completely isolated.** Nothing in `/frontend` may import from or reference `/backend`. Nothing in `/backend` may import from or reference `/frontend`. They communicate only via the HTTP API.

6. **No data is ever permanently deleted.** This is the most important business rule in the entire application. Processes, tasks, emails, notes, attachments, and activity log entries are never deleted from the system. Every action is permanently recorded.
   - **Cancelado** = record marked with status `Cancelado` and a mandatory reason field. The record stays, full history visible.
   - **Arquivado** = record moved to archive view. The record stays, accessible via the Arquivo section.
   - **Triaged** = inbox email moved to processed state. The record stays, accessible in processed emails view.
   - The words `delete` and `remove` must never appear in any function name, API endpoint, or database operation that touches process, task, email, note, or activity log data.
   - The only permitted exception is the **DEV ONLY** "Repor dados mock" button, which exists solely for mock data testing and must be removed before any production deployment (`import.meta.env.DEV` guard ensures it never appears in production builds).

Violation of any of these rules must be corrected before the change is committed, regardless of how small or temporary the change appears to be.

## References

- Current design reference: `docs/mockup-mission-control.html` (Mission Control layout — approved)
- Original light-theme prototype: `docs/prototype.html`
- Full brief (updated to reflect current state): `docs/build-brief.md`
