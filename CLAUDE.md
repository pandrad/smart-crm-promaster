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
| `src/pages/Tarefas.jsx` | Task management — table, filters, TaskDrawer with all actions |
| `src/pages/Inbox.jsx` | Email triage — 4 actions per email, new-client prompt |
| `src/pages/Arquivo.jsx` | Archived processes — read-only table |
| `src/components/Sidebar.jsx` | Persistent left nav — 3 zones, badges, user chip |
| `src/components/StatsBar.jsx` | 6 clickable stat cards incl. Transitados — user-specific in Meus processos |
| `src/components/Toolbar.jsx` | Search + filters + column visibility toggle + table/kanban toggle |
| `src/components/TableView.jsx` | Sortable table, per-column filters, priority inline change, FU conditional |
| `src/components/KanbanView.jsx` | Kanban with drag-and-drop; non-owner cards locked |
| `src/components/DetailDrawer.jsx` | Right panel: process number, Comprador, Consulta checklist, Excel link, FU conditional, reassign for supervisor/owner |
| `src/components/AdminPanel.jsx` | Slide-over: Users, Estados, Prioridades, Funções, Atribuição de Tarefas, Marca, Importar |
| `src/components/SupervisorWidget.jsx` | Summary widget visible to admin/supervisor only |
| `src/components/Toast.jsx` | Auto email notification demo |
| `src/components/Primitives.jsx` | Avatar (photo support), badges — all read from store |
| `src/theme.js` | Dark theme colour constants |

### File structure (finalised — do not reorganise)

```
frontend/src/
├── api/
│   └── client.js       — fetch stubs: login, getProcessos, getUsers,
│                          getStages, getFUStatuses, getPriorities.
│                          Swap stub bodies for real fetch() in Stage 5.
├── mock/
│   └── data.js         — all Stage 1 mock content: PROCESSOS, TAREFAS,
│                          INBOX_EMAILS, MOCK_CREDENTIALS, MOCK_TOAST,
│                          MOCK_IMPORT_PREVIEW
├── components/         — UI components (import from utils/store/mock only)
├── pages/              — Login.jsx, Main.jsx, Processos.jsx, Tarefas.jsx,
│                          Inbox.jsx, Arquivo.jsx
├── data.js             — seed arrays only (STAGES, FOLLOWUP_STATUSES, USERS)
│                          imported by store.js alone — no components touch it
├── store.js            — localStorage runtime state; seeds from data.js
├── theme.js            — dark theme colour constants
├── utils.js            — pure utilities: daysLeft()
└── icons.jsx           — inline SVG icons
```

### Separation of concerns — confirmed clean
- `data.js` — seeds only, one consumer (`store.js`)
- `mock/data.js` — all hardcoded demo content, no logic
- `utils.js` — pure functions, no data
- `theme.js` — colour constants only, no logic
- `store.js` — admin-editable runtime state, localStorage-backed
- `api/client.js` — data-fetching layer; currently returns mock data, ready for real API
- Components import `daysLeft` from `utils.js`, `PROCESSOS` from `mock/data.js`, everything else from `store`

### Deliverable folder
`entrega/` renamed to `delivery/`. All deliverables live here — do not delete previous versions.

| File | Description |
|------|-------------|
| `delivery/Smart CRM — Promaster v1 (Protótipo Original).html` | v1 — original light-theme prototype (first client review) |
| `delivery/Smart CRM — Promaster v2.html` | v2 — Mission Control redesign (dark theme, sidebar, Tarefas, Inbox, Arquivo) |
| `delivery/Instruções — Smart CRM Promaster.md` | v1 instructions in Portuguese |
| `delivery/Instruções — Smart CRM Promaster v2.md` | v2 instructions in Portuguese (updated for all new screens) |

Demo login: `admin@promaster.co` / `admin123` (Admin) · `supervisor@promaster.co` / `super123` (Supervisor) · `adelina@promaster.co` / `pass123` (standard)

To rebuild a deliverable: enable `vite-plugin-singlefile` in `vite.config.js`, build, patch `type="module"` out of the script tag, move script after `#root`, restore config.

### Mission Control redesign — all phases complete and pushed to GitHub

| Phase | What was done | Commit |
|-------|--------------|--------|
| A | Data foundations: 11-stage status list, Supervisor role, TAREFAS + INBOX_EMAILS mock data, new icons | fc30f90 |
| B | Layout shell: dark sidebar, Main.jsx restructured, Processos.jsx extracted, stub pages, App.jsx routes | fc30f90 |
| C | All components adapted to dark theme: StatsBar, Toolbar, TableView, KanbanView, Primitives, Toast, Login, AdminPanel | 9b0cf42 |
| D | DetailDrawer updates: process number prominence, Comprador first, FU conditional, Consulta checklist, Excel link, supervisor/owner reassign | 6f3bdb6 |
| E | New screens: Tarefas (full table + TaskDrawer), Inbox (4 triage actions + new-client flow), Arquivo | a7a7195 |
| F | AdminPanel dark theme polish, CLAUDE.md updated | 18d7513 |

### Next action
**Pending final browser QA before client delivery. Do not make any code changes until QA is complete.**

Next session:
1. Run the full interactive element checklist from `docs/build-brief.md` (plan file) end-to-end in the browser at http://localhost:5299
2. Fix any failures found during QA (code changes only permitted after QA identifies specific issues)
3. If all checks pass → prepare client deliverable (single-file HTML build)

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

Violation of any of these rules must be corrected before the change is committed, regardless of how small or temporary the change appears to be.

## References

- UI prototype: `docs/prototype.html`
- Full brief: `docs/build-brief.md`
