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
5. The assigned person reviews the task and clicks **Validar** — this patches the same task in place to type **Abertura de Processo**, reassigned to Resp. Abertura. The `cotacaoOwner` field stores the Pré-Entrada person's name so a later Devolver com Notas returns it to them correctly.
6. The Resp. Abertura person attaches the quotation file and clicks **Abrir Processo** — a process number is generated and the process is created at status **Em Abertura**, still owned by whoever opened it (tracked in `respAbertura`). The task itself is marked Concluído. No Resp. Cotação is assigned yet at this point.
7. Only when the Resp. Abertura person manually advances the process status to **Entrada** does the process hand off to a real Resp. Cotação person — resolved through client-based assignment first, then mapping, then round-robin — and the process becomes active work.
8. Dashboard and Tarefas update in real time. Toast notification appears.

> **Key design decision (confirmed):** Emails never create processes directly. They create tasks. The process is opened by a human action, and lands at Em Abertura under that same person before being deliberately handed off to Resp. Cotação at Entrada. This ensures every process has a deliberate owner at every step, never a placeholder or inherited name.

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
  status              -- integer FK → statuses table (see Status stages below)
  fu                  -- follow-up status label | null; always editable regardless
                      -- of status (no longer gated to status >= 9)

  -- Client
  client              -- client name (string)
  ref                 -- client's own reference number
  comprador           -- contact person name at client
  conversationId      -- Graph API conversationId (format `conv-{processId}`),
                      -- used to match inbound replies to this process instead
                      -- of creating a new one

  -- Equipment
  brand               -- brand/type (e.g. VOLVO, CAT, KOMATSU)
  model               -- model (e.g. EC360BLC)
  vin                 -- serial/VIN number

  -- Team assignment — historical record fields vs. one live field
  owner               -- Resp. Cotação (string name). Historical record field:
                      -- set once (at the Em Abertura → Entrada handoff, or by
                      -- manual Reatribuir) and never changed automatically
                      -- afterward — represents who was genuinely responsible
                      -- for that part of the process.
  comm                -- Resp. Comercial (string name). Same historical-record
                      -- behaviour as owner — set once, never auto-changed.
  compra              -- Resp. Compra (string name)
  respAbertura        -- Resp. Abertura (string name) — whoever opened the
                      -- process from the Abertura de Processo task. Set once
                      -- at creation; stays visible as a distinct record even
                      -- after the process moves past Em Abertura.
  respActual          -- Resp. Actual (string name). The only LIVE field: it
                      -- always reflects who currently holds the process right
                      -- now, and updates automatically whenever Reatribui is
                      -- ON for a status and the mapping/round-robin resolves
                      -- someone different from the current holder — following
                      -- the same priority order as everywhere else
                      -- (client-based assignment → mapping → round-robin).
                      -- "Meus Processos" and the passive reassignment
                      -- notification system both key off this field, not owner.

  -- Financials
  price               -- sell price in EUR | null

  -- Meta
  emails              -- count of associated emails
  note                -- free text notes
  archived            -- boolean; true = older than 3 years, hidden from main list
  carryover           -- boolean; true = carried over from previous month, still open
  excelLink           -- always "Excel Modelo.xlsx"; shown as link in DrawerAttachments

  -- Consulta sub-task (only present when status === Consulta)
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

### Status stages (confirmed list, admin-configurable)

```
statuses {
  id, label, color, bg_color, order, active, optional
}

Confirmed current set (13 statuses matching client specification, plus one
additional optional hand-off stage — Em Abertura — inserted into the pipeline):
  1.  Pré-Entrada
  2.  Pendente Cliente
  3.  Análise Técnica Promaster
  4.  Abrir Processo
  5.  Em Abertura          (optional — process stays with whoever opened it,
                             via respAbertura, until manually advanced)
  6.  Entrada              ← hands off to a real Resp. Cotação here
  7.  Consulta
  8.  Para Fechar
  9.  Fechado
  10. FP Para Envio
  11. Enviado
  12. Enviado Pendente
  13. Adjudicado           ← counts as "Ganhos" in the stats bar
  14. Cancelado

Follow-up status and Sell Price are always editable regardless of status —
no longer gated to a specific stage.
```

### Follow-up statuses (admin-configurable, always editable regardless of process status)

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
  id                  -- single ID for life — never regenerated on flow
                      -- transitions (Validar, Devolver, Escalar, etc. all
                      -- patch the same task object in place)
  type                -- one of 9 types (see below) | null (unclassified)
  status              -- see Task statuses below
  owner               -- current responsible person (string name) | null
                      -- null = unassigned, appears in Supervisor/Admin list
  client              -- client name | null
  cotacaoOwner        -- set when Pré-Entrada → Abertura de Processo (Validar);
                      -- stores the original Pré-Entrada person's name so
                      -- Devolver com Notas routes back to the right person
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
  devolvido           -- boolean; true when returned via Devolver com Notas
  priority            -- "Normal" | "Alta"
  created             -- DD/MM/YYYY
  due                 -- DD/MM/YYYY
  history[]           -- audit trail of every action taken
    { actor, action, note, ts }
}

Task types (9, confirmed):
  Pré-Entrada           -- email triaged from Inbox awaiting Validar
  Abertura de Processo  -- awaiting Abrir Processo (or Devolver com Notas back
                           to Pré-Entrada)
  Contas Correntes      -- accounts receivable / invoicing query
  Status de Encomenda   -- delivery status follow-up with supplier
  Desconto              -- discount approval request
  Cliente Novo          -- new client onboarding and KYC
  Follow-Up             -- commercial follow-up with client
  Escalação             -- escalation notification task for supervisor/admin
  Análise Técnica       -- technical analysis request

A task can also be unclassified (type: null) when AI classification fails or
is not confident enough — assigned to Supervisor for manual classification.

Task statuses carry a "system role" — a fixed underlying behaviour (Por
Fazer, Em Curso, Devolvido, Escalado, Cancelamento Pendente, Cancelado,
Concluído) that the admin can rename/recolour per status but never delete or
reassign to a different behaviour. Action buttons always resolve the target
status dynamically via its system role — never a hardcoded label string.
There is no "Bloqueado" status.

Task assignment rules (per type, admin-configurable):
  Each task type maps to a role in Mapeamento de Responsabilidades.
  Resolution order: client-based role assignment → mapping → round-robin.
  Unclassified (type: null) → always goes to Supervisor.
  Configured in AdminPanel → Mapeamento de Responsabilidades tab.

Pré-Entrada → Abertura de Processo → process lifecycle (single task ID
throughout, patched in place — see Core Email Flow above for the full chain):
  1. Email arrives in Inbox → Pré-Entrada task created
  2. Assigned person clicks Validar → same task patched to type Abertura de
     Processo, reassigned to Resp. Abertura; cotacaoOwner records the
     original person for Devolver routing
  3. Resp. Abertura attaches the quotation file and clicks Abrir Processo →
     process created at status Em Abertura (owned by the opener via
     respAbertura); task marked Concluído
  4. Resp. Abertura manually advances the process to Entrada → a real Resp.
     Cotação person is resolved and the process becomes active

Task actions (all functional in frontend):
  Validar                    -- Pré-Entrada only; patches task to Abertura de
                                Processo, assigns to Resp. Abertura
  Abrir Processo             -- Abertura de Processo only; generates process
                                number, creates processo at Em Abertura
  Devolver com Notas         -- Abertura de Processo only; returns to
                                cotacaoOwner, type reverts to Pré-Entrada
  Marcar como Concluído      -- requires completion note (optional)
  Passar                     -- reassign to another user; requires handover
                                note (mandatory)
  Escalar                    -- non-privileged users only; sets status
                                Escalado, moves task to chosen
                                Supervisor/Admin
  Retomar                    -- Supervisor/Admin only; resumes an escalated
                                task
  Cancelar Tarefa            -- sets Cancelamento Pendente for supervisor
                                approval
  Classificar Tarefa         -- Supervisor only, on unclassified tasks
  Alterar Tipo               -- Sup/Admin only; reclassify an already-typed
                                task at any time
  Associar a Processo        -- link the task to an existing process; the
    Existente                  task inherits the process's own client/details
                                (the process itself is never altered by this)
  Alterar Estado Manualmente -- Admin/Supervisor override, logged distinctly
```

### Inbox emails

Inbox is **fully read-only for every user, including admin and supervisor.**
There are zero action buttons anywhere in Inbox. All classification and
routing decisions happen inside Tarefas, not inside Inbox itself — Inbox is
purely an observation window onto what has already been triaged.

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
    type              -- suggested task type, or null if unclassified
    category          -- human-readable category label
    confidence        -- 0.0–1.0
  } | null
  status              -- "auto-triaged" | "requires-attention"
}

Automatic triage (two-outcome logic, runs the moment an email lands — there
is no manual triage action inside Inbox):
  OUTCOME A (AI Sim ON, confident): confidence >= 0.6 and the suggested type
    exists in the store → a task is created with that type and routed via the
    normal assignment resolution (client-based → mapping → round-robin);
    email status becomes "auto-triaged".
  OUTCOME B (everything else — low confidence, no type, or an unrecognised
    type): a task is created with type: null, assigned to Supervisor; email
    status becomes "requires-attention". The Supervisor classifies it from
    inside the task drawer in Tarefas (Classificar Tarefa), not from Inbox.
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

### Role-Aware Client Assignments

Client responsibility assignments are role-aware: `{ clientName: { roleId: userName } }`, not a single blanket override. This lets Resp. Cotação and Resp. Comercial be assigned to different people independently for the same client. A client assignment only wins routing when it matches the *specific role* being resolved for that trigger — it never silently overrides an unrelated role. Every resolution in the system (task type, process status, Em Abertura → Entrada handoff) follows the same order: client-based role assignment first, then mapping, then round-robin as last resort.

### Passive Reassignment Notifications

When a process changes owner without a direct action from the new owner — either a mapping/round-robin-driven status change, or a manual Reatribuir performed by someone else — the system surfaces it as a passive handoff notification rather than leaving it silent. Self-reassignment (someone assigning a process to themselves) never triggers this, since that's a deliberate action, not a passive handoff. Task-level ownership changes never trigger this notification either — only a process changing owner does.

Dismissible **acknowledgment cards** appear above the Por Fazer section in Tarefas for each unacknowledged handoff; dismissal ("Visto") is persisted per-user so a card never reappears once seen. A combined badge count (active tasks + unacknowledged notifications) shows on the Tarefas sidebar tab, and a separate dedicated "Notificações" tile appears on the Dashboard under "As minhas tarefas".

---

## Features — MVP Scope

### Navigation (sidebar)

Persistent left sidebar with three zones:
- **Principal:** Processos (badge = active count), Tarefas (badge = active tasks for user), Inbox (badge = pending triage count)
- **Gestão:** Clientes (future), Arquivo (archived processes)
- **Sistema:** Administração (admin/supervisor only)

User profile chip at the bottom. Clicking opens profile edit modal (name, photo, password).

### Processos (dashboard)

- Stats bar: clickable cards including Todos, Em Aberto, Em Atraso, Urgentes, Ganhos (= Adjudicado), Transitados (previous month carryover, muted)
- "Meus processos" / "Todos os processos" tab toggle — stats update per scope; "Meus processos" is based on Resp. Actual, the live current-holder field, not the historical Resp. Cotação field
- Table view: sortable columns (including Resp. Actual, Resp. Abertura, Resp. Cotação, Resp. Comercial, in that order), per-column filter dropdowns, column visibility toggle (saved per user)
- Kanban view: drag-and-drop between stages; non-owner cards locked with visual indicator
- Search across: client, brand, model, id, comprador, owner, comm, status label
- Pooled SummaryStrip (Por Fazer / Activas / SLA Excedido) linking through to Dashboard

### Detail Drawer (per process)

- Process number prominent at top (large monospace)
- Comprador immediately below client name (before all other fields)
- Info grid: Cliente, Ref. Cliente, Marca/Tipo, Modelo, Nº Série/VIN, Data Limite, Prioridade, Sell Price (Cliente, Marca/Tipo, Modelo, Sell Price editable by any user)
- Follow-up badge and field: always visible and editable, regardless of process status
- Team section: Resp. Cotação, Resp. Comercial, Resp. Compra (historical record fields, avatars + photos), plus Resp. Abertura when set
- Reatribuir button: visible to admin, supervisor, and the process owner
- Consulta checklist (Consulta status only): Pedido ao fornecedor + Resposta do fornecedor, each with timestamp and SLA overdue indicator
- Attachments: Email de Origem and the process's own quotation file copy (see Stage 4 Dependencies) always present as pinned items
- Pipeline bar: visual progress through non-optional stages
- Timeline: chronological event log
- Actions: Enviar Email (compose modal), Alterar Estado (stage + always-visible FU picker)

### Tarefas (task management — primary work surface)

- Standard users see only their own tasks; Admin/Supervisor default to personal view too, with a "Ver todas as tarefas" / "Ver as minhas" toggle
- Three-section split: Por Fazer, Em Curso, Concluídas — the toggle applies consistently across all three
- Acknowledgment cards for passive process handoffs shown above Por Fazer (see Passive Reassignment Notifications above)
- Sidebar badge combines active task count + unacknowledged notification count
- Table: Tipo badge, Cliente, Processo (monospace), Responsável (avatar), Estado (with escalated indicator), Prazo, Prioridade
- TaskDrawer: type + status badges, escalation note banner, owner card, fields grid, history timeline, collapsible origin email (with full body), action buttons per type (see Task actions above)

### Inbox (email triage)

- Fully read-only for every user, including admin and supervisor — zero action buttons
- Internal emails excluded automatically
- Email list rows are click-to-open only, showing full body text, attachments, and the AI suggestion badge/outcome in a preview panel
- New client banner: yellow alert when sender not in client DB, with "Criar Cliente" form
- All classification and routing decisions happen inside Tarefas — Inbox never initiates them

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
  "task_type": "Pré-Entrada | Abertura de Processo | Contas Correntes | Status de Encomenda | Desconto | Cliente Novo | Follow-Up | Escalação | Análise Técnica",
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

4. **No direct process creation from email.** Emails create Pré-Entrada tasks. A process is only opened once that task is validated (Validar → Abertura de Processo) and the Resp. Abertura person clicks "Abrir Processo" — and even then it lands at Em Abertura, not directly at active status. This is a confirmed design decision.

5. **Follow-up status and sell price are always editable, regardless of process status.** Neither field is gated to a specific stage.

6. **Existing processes must show on day one.** The app needs the SharePoint data imported before going live. The import tool is an MVP requirement, not optional.

7. **Files stay in Microsoft ecosystem.** Attachments are OneDrive/SharePoint links, not uploads to our own storage. The app stores the URL, not the file. The Excel proposal template link (Excel Modelo.xlsx) is always shown in the process drawer.

8. **Currency is euros.** AOA (Angolan Kwanza) reference may appear in client emails but the app records prices in EUR only.

9. **The app runs alongside SharePoint during transition.** No two-way sync required — users will manually keep both updated during the transition period, then cut over.

10. **Tarefas is the primary work surface.** Every action generates a task with an owner. Nothing exists without a responsible person.

11. **Two known frontend-only limitations are tracked as Stage 4 Dependencies in `CLAUDE.md`, not silently left undocumented:** the quotation file naming convention (`<processo> Lista_T.xlsx`, currently a synthetic `_TEST`-suffixed placeholder Blob generated in the browser, to be replaced by a real Microsoft Graph API copy of the Modelo de Proposta template into the client's SharePoint) and the local file storage limitation (manually attached files currently persist only in the uploading user's own browser session, not shared with the team or durable — real backend/database file storage is required in production). See the **Stage 4 Dependencies** section in `CLAUDE.md` for full detail.

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
The real Promaster team (14 people) is already loaded as the mock default, matching client-confirmed names and roles: Adelina Rodrigues, Alexandra Lima, Augusto Gouveia, Braulio Lourenço, Erânio Cassanga, Francisco Leitão, Gabriel Dala, João Chiquica, João Morais, Joaquim César, Luís Quelhas Valente, Lukeny Campos, Susete Ferreira, Tiago Pinto. Roles are assigned via the 10-role set (Resp. Pré-Entrada, Resp. Cotação, Resp. FPs, Resp. Abertura, Resp. Fecho, Resp. Técnico, Resp. Contas a Receber e a Pagar, Resp. Comercial, Supervisor, Administrador), with one user able to hold multiple roles. Confirm emails and password policy for go-live.

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
