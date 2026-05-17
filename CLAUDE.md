# Smart CRM — Promaster

Internal web app replacing a SharePoint-based quotation tracking system for Promaster (industrial parts, Angola). Automates email intake, AI classification, and process management.

## Current Step

**Step 1 — Frontend with mock data: COMPLETE. Sent to client for review.**

### What was built
All screens fully interactive with mock data. Dev server: `cd frontend && npm run dev` → http://localhost:5299

| File | Screen / Purpose |
|------|-----------------|
| `src/pages/Login.jsx` | Login — mock credentials, saves name to localStorage |
| `src/pages/Main.jsx` | Dashboard shell — topbar with profile + admin buttons, stats, tabs |
| `src/components/StatsBar.jsx` | 5 clickable stat cards (Todos, Em Aberto, Em Atraso, Urgentes, Ganhos) — user-specific in "Meus processos" mode |
| `src/components/Toolbar.jsx` | Search + Resp. Cotação + Resp. Comercial filters + table/kanban toggle |
| `src/components/TableView.jsx` | Full process table |
| `src/components/KanbanView.jsx` | Kanban with drag-and-drop; non-owner cards locked |
| `src/components/DetailDrawer.jsx` | Right panel: 3 roles, pipeline, timeline; Enviar Email + Alterar Estado modals; admin Reatribuir |
| `src/components/AdminPanel.jsx` | Slide-over: Users, Estados, Prioridades, Funções, Atribuição de Tarefas, Marca, Importar |
| `src/components/Toast.jsx` | Auto email notification demo |
| `src/components/Primitives.jsx` | Avatar (photo support), badges — all read from store |

### File structure (finalised — do not reorganise)

```
frontend/src/
├── api/
│   └── client.js       — fetch stubs: login, getProcessos, getUsers,
│                          getStages, getFUStatuses, getPriorities.
│                          Swap stub bodies for real fetch() in Stage 5.
├── mock/
│   └── data.js         — all Stage 1 mock content: PROCESSOS,
│                          MOCK_CREDENTIALS, MOCK_TOAST, MOCK_IMPORT_PREVIEW
├── components/         — UI components (import from utils/store/mock only)
├── pages/              — Login.jsx, Main.jsx
├── data.js             — seed arrays only (STAGES, FOLLOWUP_STATUSES, USERS)
│                          imported by store.js alone — no components touch it
├── store.js            — localStorage runtime state; seeds from data.js
├── utils.js            — pure utilities: daysLeft()
└── icons.jsx           — inline SVG icons
```

### Separation of concerns — confirmed clean
- `data.js` — seeds only, one consumer (`store.js`)
- `mock/data.js` — all hardcoded demo content, no logic
- `utils.js` — pure functions, no data
- `store.js` — admin-editable runtime state, localStorage-backed
- `api/client.js` — data-fetching layer; currently returns mock data, ready for real API
- Components import `daysLeft` from `utils.js`, `PROCESSOS` from `mock/data.js`, everything else from `store`

### Deliverable sent to client
`entrega/Smart CRM — Promaster (Protótipo).html` — single self-contained HTML file, opens in any browser without a server. Built with HashRouter + inlined JS, script placed after `#root` in body.

`entrega/Instruções — Smart CRM Promaster.md` — Portuguese instructions covering all sections + open questions A–F.

Demo login: `admin@promaster.co` / `admin123` (Admin) · `adelina@promaster.co` / `pass123` (standard)

### Next action
**Awaiting client feedback and final UI sign-off before Stage 1 closes.**

Do not write any code until feedback is received. Once open questions A–F are answered, resume here to:
1. Incorporate any UI changes from client feedback
2. Finalise `database/schema.sql` with confirmed status list, user list, and SLA rules
3. Proceed to Step 3 (Azure AD + Graph API)

Open questions A–F: see `docs/build-brief.md` § "Questions Still Open".

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
