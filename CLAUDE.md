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
| `src/store.js` | localStorage-backed store for users, stages, FU statuses, priorities, roles, assignment rules |
| `src/data.js` | Seed mock data (overridden by store once admin makes changes) |
| `src/icons.jsx` | Inline SVG icons |

Demo login: `admin@promaster.co` / `admin123` (Admin) · `adelina@promaster.co` / `pass123` (standard)

### Deliverable sent to client
`entrega/Smart CRM — Promaster (Protótipo).html` — single self-contained HTML file, opens in any browser without a server. Built with HashRouter + inlined JS, script placed after `#root` in body.

`entrega/Instruções — Smart CRM Promaster.md` — Portuguese instructions covering all sections + open questions A–F.

### Next action
**Await client feedback (Step 2).**
Once feedback is collected and open questions A–F are answered, resume here to:
1. Incorporate any UI changes from client feedback
2. Finalise `database/schema.sql` with confirmed status list, user list, and SLA rules
3. Proceed to Step 3 (Azure AD + Graph API)

Open questions A–F: see `docs/build-brief.md` § "Questions Still Open".

See `docs/build-brief.md` § "Build Order" for full step list.

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

## References

- UI prototype: `docs/prototype.html`
- Full brief: `docs/build-brief.md`
