# Smart CRM — Build Brief for Claude Code

**Project:** Smart CRM (internal name)  
**Client:** Promaster (industrial components/parts company, operates in Angola)  
**Builder:** Pedro Andrade  
**Date:** May 2026  
**Language:** Portuguese (pt-PT) throughout the UI  

---

## What We're Building

An internal web application to replace a manual SharePoint-based quotation tracking system. The app automates the intake of commercial emails, classifies them with AI, creates process records, and manages all active work through a task-based model.

This is an **internal tool** — not a public-facing product. Access is via browser from anywhere (office or remote). Simple username/password auth. No OAuth, no SSO.

---

## Core Email Flow (The Automation)

1. Email arrives at **info@promaster.co** (Microsoft Outlook 365 / Office 365 group inbox)
2. Microsoft Graph API webhook fires → backend receives the email
3. Claude API classifies the email and extracts structured data:
   - Email type (quotation request, follow-up, PO, complaint, other)
   - Client name
   - Equipment brand and model
   - VIN/serial number (if present)
   - Client reference number
   - Urgency level
4. A **Pré-Entrada task** is created and assigned to the responsible person — no process is created yet
5. The responsible person opens the task and clicks **Abrir Processo** — only then is a process number generated and the process created in the Processos list with status Entrada
6. Dashboard and Tarefas update in real time. Toast notification appears.

> **Key design decision (confirmed):** Emails never create processes directly. They create tasks. The process is opened by a human action. This ensures every process has a deliberate owner from the start.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL via Supabase |
| Email | Microsoft Graph API (webhook on group inbox) |
| AI | Claude API — `claude-sonnet-4-20250514` |
| Notifications | Email alerts (SMTP or Graph API send) |
| Hosting | Single VPS — DigitalOcean or Hetzner (~€5-10/month) |
| Version control | GitHub |
| File storage | OneDrive/SharePoint links (Graph API) — files stay in Microsoft ecosystem |

**Deployment approach:** Simple VPS, not Vercel/Railway. Backend and frontend served from one server. This is an internal tool; no CDN or enterprise infrastructure needed for MVP.

---

## UI Reference

The current design reference is the **Mission Control layout** at `docs/mockup-mission-control.html`. This is the approved design used for the Stage 1 frontend build. It features:

- Persistent left sidebar with three navigation zones (Principal, Gestão, Sistema)
- Dark theme (bg `#0f172a`, sidebar `#1e293b`, accent `#2563eb`)
- Four main sections: Processos, Tarefas, Inbox, Arquivo
- User profile chip at the bottom of the sidebar

A delivered HTML prototype also exists at `delivery/v2/Smart CRM — Promaster v2.html` — this is the exact build sent to the client for review.

---

## Data Model

### Process number format

```
AAMMMNNN
  AA  = last 2 digits of year  (e.g. 26)
  MMM = month zero-padded      (e.g. 05)
  NNN = sequential per month   (001, 002, …)
Example: 2605001
```

### Process record (core entity)

```
processo {
  id                  -- AAMMMNNN format (e.g. 2605001)
  created             -- DD/MM/YYYY
  deadline            -- DD/MM/YYYY (Data Limite)
  priority            -- "Normal" | "Alta"
  status              -- integer FK → statuses table (1–11)
  fu                  -- follow-up status label | null
                      -- ONLY present when status >= 9 (Enviado)
                      -- hidden entirely for status < 9

  -- Client
  client              -- client name (string)
  ref                 -- client's own reference number
  comprador           -- contact person name at client
                      -- (replaces old "requerente" field)

  -- Equipment
  brand               -- brand/type (e.g. VOLVO, CAT, KOMATSU)
  model               -- model (e.g. EC360BLC)
  vin                 -- serial/VIN number

  -- Team assignment (three distinct roles, all required)
  owner               -- Resp. Cotação (string name)
  comm                -- Resp. Comercial (string name)
  compra              -- Resp. Compra (string name)

  -- Financials
  price               -- sell price in EUR | null
                      -- ONLY present when status >= 9 (Enviado)
                      -- shown as "—" for status < 9

  -- Meta
  emails              -- count of associated emails
  note                -- free text notes
  archived            -- boolean; true = older than 3 years, hidden from main list
  carryover           -- boolean; true = carried over from previous month, still open
  excelLink           -- always "Excel Modelo.xlsx"; shown as link in DrawerAttachments

  -- Consulta sub-task (only present when status === 5)
  consulta {
    pedidoFornecedor    -- boolean (checked = sent)
    pedidoTs            -- timestamp string | null
    respostaFornecedor  -- boolean (checked = received)
    respostaTs          -- timestamp string | null
  }

  -- Timeline
  timeline            -- array of { icon, color, time, text }
}
```

### Status stages (confirmed 11-stage list, admin-configurable)

```
statuses {
  id, label, color, bg_color, order, active, optional
}

Confirmed default set:
  1.  Entrada
  2.  Qualificacao
  3.  Pendente Cliente    (optional — does not appear in every process)
  4.  Pendente Master     (optional — does not appear in every process)
  5.  Consulta
  6.  Para Fechar
  7.  Fechado
  8.  Fechado Pendente
  9.  Enviado             ← follow-up status and price become visible from here
  10. Encomenda           ← counts as "Ganhos" in the stats bar
  11. Cancelado

Note: There is no "Pré-Entrada" process status. Pré-Entrada is a task type only.
```

### Follow-up statuses (admin-configurable, only shown when processo status >= 9)

```
followup_statuses {
  id, label, color, bg_color, order, active
}

Default set:
  Provável | Confirmado | Em Risco | Perdido | Aguarda Resposta
```

### Users and roles

```
users {
  id, name, email, role, password_hash, active, photo
}

Roles (admin-configurable):
  admin       -- full access; all processes and tasks; system configuration
  supervisor  -- same as admin except: cannot delete users, cannot change
                 passwords, cannot access system-wide settings;
                 can: change priorities, reassign any process or task,
                 approve closures, receive escalated tasks
  comercial   -- Resp. Comercial role
  cotacao     -- Resp. Cotação role
  compra      -- Resp. Compra role
  viewer      -- read-only (future use)
```

### Priorities (admin-configurable)

```
priorities {
  id, label, color, bg_color
}

Default set:
  Normal | Alta
```

### Tasks (Tarefas — primary work surface)

Every action in the system generates a task with an owner. Nothing exists without an owner. Tarefas is where active work happens; Processos is the record of completed work.

```
tarefa {
  id                  -- "T001", "T002", etc.
  type                -- one of 8 types (see below)
  status              -- one of 5 statuses (see below)
  owner               -- current responsible person (string name) | null
                      -- null = unassigned, appears in Supervisor/Admin list
  client              -- client name | null
  originEmail {       -- email that generated this task | null
    sender
    senderName
    subject
    preview
    body              -- full email body text
    attachments[]     -- array of { name }
  }
  originProcesso      -- process id string | null
  description         -- free text description
  escalationNote      -- escalation reason | null (set when status = Escalado)
  priority            -- "Normal" | "Alta"
  created             -- DD/MM/YYYY
  due                 -- DD/MM/YYYY
  history[]           -- audit trail of every action taken
    { actor, action, note, ts }
}

Task types:
  Pré-Entrada     -- email triaged from Inbox awaiting process creation
  Desconto        -- discount approval request
  Status Encomenda -- delivery status follow-up with supplier
  Contas Correntes -- accounts receivable / invoicing query
  Cliente Novo    -- new client onboarding and KYC
  Diversos        -- miscellaneous
  Follow-up       -- commercial follow-up with client
  Escalação       -- escalation notification task for supervisor/admin

Task statuses:
  Por Fazer  -- not yet started
  Em Curso   -- in progress
  Bloqueado  -- blocked (internal hold)
  Escalado   -- escalated to supervisor/admin; owner changes to escalation target
  Concluído  -- completed

Task assignment rules (per type, admin-configurable):
  Each task type maps to a default owner name.
  null = unassigned → goes to Supervisor list for manual assignment.
  Configured in AdminPanel → Atribuição de Tarefas tab.

Pré-Entrada task lifecycle:
  1. Email arrives in Inbox
  2. User clicks "Confirmar como Processo" → creates Pré-Entrada task
     (owner resolved from assignment rules, NOT a process yet)
  3. Assigned person opens task in Tarefas, reviews email
  4. Clicks "Abrir Processo" → process number generated, processo created
     with status Entrada, task marked Concluído

Task actions (all functional in frontend):
  Abrir Processo      -- Pré-Entrada only; generates AAMMMNNN, creates processo
  Marcar como Concluído -- requires completion note (optional)
  Passar              -- reassign to another user; requires handover note (mandatory)
  Escalar             -- non-privileged users only; sets status Escalado,
                        moves task to chosen Supervisor/Admin
  Retomar             -- Supervisor/Admin only; resumes an escalated task
```

### Inbox emails

```
inbox_email {
  id
  sender              -- email address
  senderName          -- display name
  to                  -- recipient address
  subject
  preview             -- first ~100 chars
  body                -- full email body text
  attachments[]       -- array of { name }
  received            -- "DD/MM/YYYY HH:MM"
  isInternal          -- boolean; true = team email, excluded from Inbox entirely
  isNewClient         -- boolean; true = sender not in client DB, show onboarding banner
  aiSuggestion {      -- AI classification result
    type              -- suggested task type or "Diversos"
    category          -- human-readable category label
    confidence        -- 0.0–1.0
  } | null
  status              -- "pending" | "processed" | "diversos"
}

Triage flow (4 actions, all inside the email preview panel):
  Confirmar como Processo  → creates Pré-Entrada task (NOT a process)
  Confirmar como Tarefa    → creates task of selected type
  Associar a Processo      → links email to existing processo by ID
  Marcar como Diversos     → removes from pending list
```

### Supporting tables (unchanged from original design)

```
clients {
  id, name, country, created_at
}

emails {
  id, processo_id, graph_message_id, sender, subject,
  body_preview, received_at, direction (inbound|outbound),
  raw_json
}

attachments {
  id, processo_id, filename, onedrive_url, sharepoint_url,
  uploaded_by, uploaded_at
}

activity_log {
  id, processo_id, user_id, action_type, description, created_at
  -- action_types: email_received, ai_classified, assigned, status_changed,
  --               note_added, attachment_added, email_sent
}
```

---

## Features — MVP Scope

### Navigation (sidebar)

Persistent left sidebar with three zones:
- **Principal:** Processos (badge = active count), Tarefas (badge = active tasks for user), Inbox (badge = pending triage count)
- **Gestão:** Clientes (future), Arquivo (archived processes)
- **Sistema:** Administração (admin/supervisor only)

User profile chip at the bottom. Clicking opens profile edit modal (name, photo, password).

### Processos (dashboard)

- Stats bar: 6 clickable cards — Todos, Em Aberto, Em Atraso, Urgentes, Ganhos (= Encomenda), Transitados (previous month carryover, muted)
- "Meus processos" / "Todos os processos" tab toggle — stats update per scope
- Table view: sortable columns, per-column filter dropdowns, column visibility toggle (saved per user)
- Kanban view: drag-and-drop between stages; non-owner cards locked with visual indicator
- Search across: client, brand, model, id, comprador, owner, comm, status label

### Detail Drawer (per process)

- Process number prominent at top (large monospace)
- Comprador immediately below client name (before all other fields)
- Info grid: Cliente, Ref. Cliente, Marca/Tipo, Modelo, Nº Série/VIN, Data Limite, Prioridade, Sell Price
- Follow-up badge and field: only visible when status >= 9 (Enviado)
- Team section: Resp. Cotação, Resp. Comercial, Resp. Compra (avatars + photos)
- Reatribuir button: visible to admin, supervisor, and the process owner
- Consulta checklist (status 5 only): Pedido ao fornecedor + Resposta do fornecedor, each with timestamp and SLA overdue indicator
- Attachments: Excel Modelo.xlsx link always present as first item
- Pipeline bar: visual progress through non-optional stages
- Timeline: chronological event log
- Actions: Enviar Email (compose modal), Alterar Estado (stage + FU picker; FU only shown when target status >= 9)

### Tarefas (task management — primary work surface)

- Standard users see only their own tasks
- Admin/Supervisor see all tasks with "Ver por pessoa" filter
- Table: Tipo badge, Cliente, Processo (monospace), Responsável (avatar), Estado (with escalated/blocked indicator), Prazo, Prioridade
- TaskDrawer: type + status badges, escalation note banner, owner card, fields grid, history timeline, collapsible origin email (with full body), all 4 action buttons

### Inbox (email triage)

- Internal emails excluded automatically
- Email list rows are click-to-open only (no inline action buttons)
- Preview panel (right drawer): full body text, attachments, AI suggestion badge, new-client banner, all 4 triage action buttons
- New client banner: yellow alert when sender not in client DB, with "Criar Cliente" form

### Arquivo

- Archived processes only (archived = true)
- Read-only table, search only, full detail drawer

### Authentication

- Simple login screen (email + password)
- Session stored in localStorage: `{ email, role, name, photo }`
- No password reset for MVP (admin sets initial password in AdminPanel)
- User can change own name, photo, password via profile modal in sidebar

### Admin Panel (slide-over, admin/supervisor)

- **Utilizadores:** add/edit/deactivate; assign roles; upload photo; set initial password
- **Estados:** add/edit/reorder process stages; colour picker with presets
- **Follow-Up:** same as Estados
- **Prioridades:** add/edit priority levels with colours
- **Funções:** add/edit user role definitions
- **Atribuição de Tarefas:** two sections:
  1. Process role assignment (cotacao/comercial/compra) — round-robin when multiple
  2. Task type assignment — per-type default owner; null = supervisor list
- **Marca/Logótipo:** upload logo (zoom/pan editor), app name, accent colour; persists to localStorage
- **Importar:** CSV/Excel drag-and-drop, preview, bulk import

### Supervisor widget (admin/supervisor only, above stats bar)

- 4 stat cards: Abertos mês, Fechados mês, Em atraso, Tarefas activas
- Escalated tasks section: list of all Escalado tasks with type, client, escalated-by, note preview; clicking opens TaskDrawer
- Most overdue processes: top 3 with process number and overdue duration

### Email Classification (Claude API)

Prompt must extract and return JSON:
```json
{
  "email_type": "cotacao | followup | po | reclamacao | outro",
  "client_name": "string or null",
  "brand": "string or null",
  "model": "string or null",
  "serial_vin": "string or null",
  "client_ref": "string or null",
  "urgency": "normal | alta",
  "task_type": "Pré-Entrada | Status Encomenda | Desconto | Contas Correntes | Cliente Novo | Follow-up | Diversos",
  "summary": "one sentence in Portuguese"
}
```

### Notifications

- Email alert to Resp. Cotação + Resp. Comercial when deadline is 48h away
- Email alert to supervisor when process goes overdue
- Email alert to supervisor when a task is escalated
- Send via SMTP or Microsoft Graph API (client's Outlook)

### Data Import

- Admin can upload Excel/CSV file
- System maps columns, previews data, confirms import
- Creates processo + client records in bulk
- Marks imported records with `source: 'import'`

---

## Features — Explicitly OUT of MVP Scope

- Quotation builder / Excel integration (Phase 2)
- WhatsApp/SMS reporting bot (Phase 2)
- Advanced analytics and reporting (Phase 2)
- Mobile app (Phase 2)
- Two-way SharePoint sync (not needed — running in parallel, then cutover)
- Currency conversion (Phase 2 — euros only for now)
- Cloudflare CDN
- Docker

---

## Key Business Rules

1. **One process per email thread.** If a reply arrives on an existing thread, it links to the existing process — it does not create a new one. Use Graph API `conversationId` to match.

2. **Three responsible roles per process.** Resp. Comercial, Resp. Cotação, Resp. Compra. These are always different people, managed by admin assignment rules.

3. **Statuses are admin-configurable.** Never hardcode status labels, colors, or IDs in the frontend. Always fetch from the database.

4. **No direct process creation from email.** Emails create Pré-Entrada tasks. Processes are opened by a human clicking "Abrir Processo" inside the task. This is a confirmed design decision.

5. **Follow-up status and sell price are only meaningful at Enviado and beyond.** Both fields are hidden/null for status < 9.

6. **Existing processes must show on day one.** The app needs the SharePoint data imported before going live. The import tool is an MVP requirement, not optional.

7. **Files stay in Microsoft ecosystem.** Attachments are OneDrive/SharePoint links, not uploads to our own storage. The app stores the URL, not the file. The Excel proposal template link (Excel Modelo.xlsx) is always shown in the process drawer.

8. **Currency is euros.** AOA (Angolan Kwanza) reference may appear in client emails but the app records prices in EUR only.

9. **The app runs alongside SharePoint during transition.** No two-way sync required — users will manually keep both updated during the transition period, then cut over.

10. **Tarefas is the primary work surface.** Every action generates a task with an owner. Nothing exists without a responsible person.

---

## Project File Structure

```
smart-crm/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       -- fetch stubs (Stage 1); swap for real API in Stage 5
│   │   ├── mock/
│   │   │   └── data.js         -- all Stage 1 mock content
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   ├── Toolbar.jsx
│   │   │   ├── TableView.jsx
│   │   │   ├── KanbanView.jsx
│   │   │   ├── DetailDrawer.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── SupervisorWidget.jsx
│   │   │   ├── Primitives.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Main.jsx        -- shell; all shared state lives here
│   │   │   ├── Processos.jsx
│   │   │   ├── Tarefas.jsx     -- exports TaskDrawer for shell-level use
│   │   │   ├── Inbox.jsx
│   │   │   └── Arquivo.jsx
│   │   ├── data.js             -- seed arrays only (STAGES, FOLLOWUP_STATUSES, USERS)
│   │   ├── store.js            -- localStorage runtime state
│   │   ├── theme.js            -- dark/light theme (mutable THEME object)
│   │   ├── utils.js            -- daysLeft()
│   │   └── icons.jsx
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── graph_api.py
│   ├── email_processor.py
│   ├── claude_client.py
│   ├── models.py
│   ├── database.py
│   ├── notifications.py
│   ├── auth.py
│   ├── importer.py
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   └── schema.sql
│
├── delivery/
│   ├── v1/   -- original light-theme prototype
│   └── v2/   -- Mission Control redesign (current, sent to client)
│
└── docs/
    ├── build-brief.md
    ├── mockup-mission-control.html   -- current design reference
    ├── prototype.html                -- original light-theme prototype
    ├── reviewer-prompt.md
    └── step1-azure-setup.md
```

---

## Build Order (do not skip steps)

**Step 1 — Full frontend with mock data ✅ COMPLETE — in QA**
- All screens built and interactive: Processos, Tarefas, Inbox, Arquivo, Admin Panel
- Design: Mission Control layout (dark sidebar, dark theme) per `docs/mockup-mission-control.html`
- Delivered to client as `delivery/v2/Smart CRM — Promaster v2.html`
- Currently in browser QA — do not make code changes until QA identifies specific issues

**Step 2 — Client review and schema finalisation ← CURRENT STEP**
- Present Stage 1 frontend to client for feedback (v2 already sent)
- Resolve open questions (A–F below) based on review session
- Finalise `database/schema.sql` with confirmed status list, user roles, and field names
- Do NOT proceed to Step 3 until schema is signed off

**Step 3 — Azure AD + Graph API**
- Register app in Azure AD portal (client's tenant)
- Request permissions: `Mail.Read` on group inbox, `Files.Read` for OneDrive
- Set up webhook subscription to `info@promaster.co` inbox
- Test: log incoming emails to terminal
- Do NOT proceed to Step 4 until emails are flowing
- See `docs/step1-azure-setup.md` for detailed portal checklist

**Step 4 — Backend**
- Set up Supabase project and run `schema.sql`
- FastAPI with working `/health` endpoint
- Auth endpoints: `POST /login`, `GET /me`
- Webhook handler receives Graph API notification
- Fetch full email via Graph API, run Claude classification
- Create Pré-Entrada task (not process) on new email
- REST API for frontend: `GET /processos`, `GET /processos/:id`, `PATCH /processos/:id`
- `GET /tarefas`, `PATCH /tarefas/:id`
- `GET /users`, `GET /statuses`, `GET /followup-statuses`
- `POST /admin/*` — admin CRUD endpoints
- Notifications: 48h deadline alerts + overdue alert to supervisor + escalation alert

> **Reviewer agent pass (run after each significant module):**
> After building each backend module, open a separate Claude Code session with
> minimal context — provide only the module's spec and the code produced — and ask
> it to review for bugs, missing logic, and spec compliance.
> The reviewer prompt is stored in `docs/reviewer-prompt.md`.
> Modules to review in order: `graph_api.py`, `email_processor.py`, `claude_client.py`,
> `auth.py`, `models.py`, `notifications.py`, `importer.py`.

**Step 5 — Connect frontend to real data**
- Replace stub functions in `src/api/client.js` with real `fetch()` calls
- Implement real auth (session tokens, not mock credentials)
- Real-time updates via polling (every 30s) or WebSocket
- End-to-end email flow test
- Data import test with real SharePoint export
- Deploy to VPS, configure domain/SSL

---

## Questions Still Open (resolve in Step 2)

**A) Auto-assignment rule for MVP:**
The frontend already implements per-task-type assignment rules (admin-configurable in the panel). For processes: round-robin is the default when multiple people share a role. Confirm whether round-robin is correct or if there are client-specific or equipment-type rules.

**B) Full list of current users:**
Confirm names, emails, and roles (Comercial / Cotação / Compra / Admin / Supervisor) for all ~10–15 people. The mock data currently uses: Adelina Rodrigues, Tiago Pinto, Vasco Lourenço, João Silva, Marta Costa (cotacao); João Morais, Ana Ferreira, Ricardo Neves (comercial); Carlos Andrade (compra).

**C) Status list:**
The 11-stage list is confirmed in the frontend. Verify the labels are exact: 1. Entrada, 2. Qualificacao, 3. Pendente Cliente, 4. Pendente Master, 5. Consulta, 6. Para Fechar, 7. Fechado, 8. Fechado Pendente, 9. Enviado, 10. Encomenda, 11. Cancelado. Are stages 3 and 4 truly optional (not every process passes through them)?

**D) SLA timelines per stage:**
How many days is each stage allowed before it triggers an urgency alert? (Example: Entrada → 1 day, Qualificacao → 2 days, Consulta → 48h for pedido + 72h for resposta, etc.)

**E) Who is the supervisor for overdue alerts?**
Which user(s) should receive the overdue notification and escalated task alerts? Can be configured in the admin panel but need a default.

**F) SharePoint export:**
Can they export the existing process list to Excel/CSV? A sample file with 10–20 real rows before building the import tool would prevent mapping mistakes.

---

## Notes for Claude Code Sessions

- The `conversationId` field in Graph API emails is the key to thread matching
- Claude API model to use: `claude-sonnet-4-20250514`
- All UI text in Portuguese (pt-PT)
- Dates in DD/MM/YYYY format
- Currency formatted as `€1.234,56` (Portuguese locale)
- Current design reference: `docs/mockup-mission-control.html`
- All architecture rules in `CLAUDE.md` — read before every session
- Git: commit freely, push only when explicitly asked
