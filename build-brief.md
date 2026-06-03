# Smart CRM — Build Brief for Claude Code

**Project:** Smart CRM (internal name)  
**Client:** Promaster (industrial components/parts company, operates in Angola)  
**Builder:** Pedro Andrade  
**Date:** May 2026  
**Language:** Portuguese (pt-PT) throughout the UI  

---

## What We're Building

An internal web application to replace a manual SharePoint-based quotation tracking system. The app automates the intake of commercial emails, classifies them with AI, creates process records, and presents everything in a dashboard with urgency tracking.

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
4. Backend checks: does this client/thread already have a process?
   - Yes → link email to existing process, update timeline
   - No → create new process record, auto-assign to team
5. Dashboard updates in real time. Toast notification appears.

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

A working HTML prototype exists at `index.html` (provided separately). Use it as the direct design reference. It includes:
- Table view and Kanban view (toggle)
- Stats bar (4 cards: Em Aberto, Em Atraso, Urgentes, Ganhos do mês)
- Search + filter toolbar (by owner, by status, free text search)
- Row click → detail drawer (right panel)
- Email toast notification (demonstrates the automation)

**The prototype uses hardcoded mock data and is not connected to any backend.** The build task is to connect this UI to the real database and email pipeline.

---

## Data Model

### Process record (core entity)

```
processo {
  id                    -- auto-generated (e.g. 2605348)
  numero_processo       -- display number
  created_at
  updated_at
  deadline              -- Data Limite
  priority              -- Normal | Alta
  status_id             -- FK → status table (admin-configurable)
  status_followup_id    -- FK → followup_status table (admin-configurable)
  
  -- Client
  client_id             -- FK → clients table
  ref_cliente           -- client's own reference number
  requerente            -- contact person name at client
  
  -- Equipment
  marca_tipo            -- brand/type (e.g. VOLVO, CAT, KOMATSU)
  modelo                -- model (e.g. EC360BLC)
  ano                   -- year
  numero_serie_vin      -- serial/VIN number
  
  -- Team assignment
  responsavel_comercial_id   -- FK → users (commercial rep role)
  responsavel_cotacao_id     -- FK → users (quotation owner role)
  responsavel_compra_id      -- FK → users (purchasing role)
  
  -- Financials
  sell_price_eur        -- price in euros (default currency)
  
  -- Notes
  notes                 -- free text notes/updates
  justificativa         -- justification field (from SharePoint)
  
  -- Meta
  source                -- 'email' | 'import' | 'manual'
  email_thread_id       -- Graph API conversation ID
}
```

### Supporting tables

```
clients {
  id, name, country, created_at
}

users {
  id, name, email, role, password_hash, active
  -- roles: admin, comercial, cotacao, compra, viewer
}

statuses {
  id, label, color, bg_color, order, active
  -- admin-configurable, not hardcoded
  -- default set: 1. Entrada, 2. Pendente Cliente, 3. Cotação Enviada,
  --              4. Em Análise, 5. Para Fechar, 6. Fechado, 10. Cancelado
}

followup_statuses {
  id, label, color, bg_color, order, active
  -- admin-configurable
  -- default set: Provável, Confirmado, Em Risco, Perdido, Aguarda Resposta
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

### Dashboard (main screen)
- Stats bar: Em Aberto, Em Atraso, Urgentes, Ganhos do mês
- Table view: all process columns, click row → detail drawer
- Kanban view: columns = active statuses, cards show client/brand/urgency
- Filters: search (client name, brand, process number), filter by owner, filter by status
- Real-time sync indicator ("Inbox sincronizada" + green pulse)
- Email toast notification when new email arrives and is classified

### Detail Drawer (per process)
- Process number + client name in header
- Status badge + Follow-up badge + Priority badge
- Overdue alert banner (if applicable)
- Info grid: Cliente, Ref. Cliente, Marca/Tipo, Modelo, Ano, N° Serie/VIN, Data Limite, Prioridade, Requerente, Sell Price
- Team section: Resp. Comercial, Resp. Cotação, Resp. Compra (3 roles, each with avatar)
- Pipeline progress bar (shows stage progress visually)
- Attachments section: list of linked files (OneDrive/SharePoint URLs, open in new tab)
- Activity timeline: chronological log of all events (emails, AI classification, assignments, status changes, notes)
- Action buttons: Enviar Email, Alterar Estado

### Authentication
- Simple login screen (email + password)
- Session token stored in localStorage
- No password reset for MVP (admin resets manually)
- User roles: admin, standard user

### Admin Panel (separate screen, admin-only)
- **Users:** create, edit, deactivate users; assign roles
- **Status stages:** create, rename, reorder, color-code, deactivate
- **Follow-up statuses:** same as above
- **Assignment rules:** define how new processes are auto-assigned (round-robin or by product type — start with round-robin)
- **Import:** CSV/Excel import for existing SharePoint data (1000+ records)

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
  "summary": "one sentence in Portuguese"
}
```

### Notifications
- Email alert to Resp. Cotação + Resp. Comercial when deadline is 48h away
- Email alert to supervisor when process goes overdue
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

4. **Existing processes must show on day one.** The app needs the SharePoint data imported before going live. The import tool is an MVP requirement, not optional.

5. **Files stay in Microsoft ecosystem.** Attachments are OneDrive/SharePoint links, not uploads to our own storage. The app stores the URL, not the file.

6. **Currency is euros.** AOA (Angolan Kwanza) reference may appear in client emails but the app records prices in EUR only.

7. **The app runs alongside SharePoint during transition.** No two-way sync required — users will manually keep both updated during the transition period, then cut over.

---

## Project File Structure

```
smart-crm/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DetailDrawer.jsx
│   │   │   ├── KanbanView.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   ├── Toolbar.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── admin/
│   │   │       ├── AdminPanel.jsx
│   │   │       ├── UserManager.jsx
│   │   │       ├── StatusManager.jsx
│   │   │       └── ImportTool.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Main.jsx
│   │   │   └── Admin.jsx
│   │   ├── api/           -- API client functions
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── main.py            -- FastAPI app, all routes
│   ├── graph_api.py       -- Outlook/Graph API + webhook
│   ├── email_processor.py -- Email parsing + thread matching
│   ├── claude_client.py   -- Claude API classification calls
│   ├── models.py          -- SQLAlchemy models
│   ├── database.py        -- Supabase/PostgreSQL connection
│   ├── notifications.py   -- Email alerts
│   ├── auth.py            -- Login, session tokens
│   ├── importer.py        -- CSV/Excel bulk import
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   └── schema.sql
│
└── docs/
    └── SETUP.md           -- Setup guide for client handoff
```

---

## Build Order (do not skip steps)

**Step 1 — Azure AD + Graph API (do this first)**
- Register app in Azure AD portal
- Request permissions: `Mail.Read` on group inbox, `Files.Read` for OneDrive
- Set up webhook subscription to `info@promaster.co` inbox
- Test: log incoming emails to terminal
- Do NOT proceed to Step 2 until emails are flowing

**Step 2 — Database + Backend skeleton**
- Set up Supabase project
- Run `schema.sql`
- FastAPI with working `/health` endpoint
- Auth endpoints: `POST /login`, `GET /me`

**Step 3 — Email pipeline**
- Webhook handler receives Graph API notification
- Fetch full email via Graph API
- Run Claude classification
- Store email + create/update processo record
- Activity log entry created

**Step 4 — REST API for frontend**
- `GET /processos` — list with filters
- `GET /processos/:id` — detail
- `PATCH /processos/:id` — update status, notes, assignments
- `GET /users`, `GET /statuses`, `GET /followup-statuses`
- `POST /admin/*` — admin CRUD endpoints

**Step 5 — Frontend (use prototype as base)**
- Connect prototype components to real API
- Replace hardcoded `DATA`, `STAGES`, `OWNERS` arrays with API calls
- Implement login screen
- Implement detail drawer with real data (add 3rd role + attachments)
- Real-time updates via polling (every 30s) or WebSocket

**Step 6 — Admin Panel**
- User management
- Status/followup status management
- Import tool (CSV/Excel → processo records)

**Step 7 — Notifications**
- Scheduled job: check for 48h deadline processes, send alerts
- Overdue alert to supervisor

**Step 8 — Testing + VPS deployment**
- End-to-end email flow test
- Data import test with real SharePoint export
- Deploy to VPS
- Configure domain/SSL

---

## Questions Still Open (answer before starting Step 1)

**A) Auto-assignment rule for MVP:**  
Round-robin (next person in rotation) is the recommendation. Confirm yes/no.

**B) Full list of current users:**  
Confirm names and roles (Comercial / Cotação / Compra / Admin) for all ~10-15 people.

**C) Full status list:**  
From SharePoint screenshot I can see: 1. Entrada, 2. Pendente Cliente, 5. Para Fechar, 6. Fechado, 10. Cancelado. What are stages 3, 4, 7, 8, 9? Or do the numbers just skip?

**D) SLA timelines per stage:**  
How many days is each stage allowed before it triggers an urgency alert?  
(Example: Entrada → 1 day, Cotação Enviada → 3 days, etc.)

**E) Who is the supervisor for overdue alerts?**  
Which user(s) should receive the overdue notification?

**F) SharePoint export:**  
Can they export the existing process list to Excel/CSV? If yes, can you get a sample file (even 10 rows with real columns) before starting the import tool?

---

## Notes for Claude Code Sessions

- Always run the backend first before touching the frontend
- Test the Graph API webhook with Microsoft's Graph Explorer tool before writing code
- The `conversationId` field in Graph API emails is the key to thread matching
- Claude API model to use: `claude-sonnet-4-20250514`
- All UI text in Portuguese (pt-PT)
- Dates in DD/MM/YYYY format
- Currency formatted as `€1.234,56` (Portuguese locale)
- Keep the prototype's visual style — do not redesign from scratch
