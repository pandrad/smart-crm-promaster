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

Dashboard.jsx's `myProcessos` consistency fix (aligning it to the same Resp. Actual definition used elsewhere) — noted as pending at the end of the previous session — has since been confirmed complete.

### Meus Processos — Resp. Actual Only, Not Resp. Cotação

The "Meus processos" filter in Processos.jsx now strictly follows Resp. Actual (who currently holds the process), no longer falling back to the historical Resp. Cotação field. Separately, the Toolbar.jsx role filter dropdowns (Resp. Cotação, Resp. Comercial) were fixed — they were previously empty because they filtered on the legacy `user.role` field (which only ever holds `"admin"`/`"supervisor"`/etc.), instead of resolving actual role assignments via `store.getUserRoles()`.

### Reassignment Continuity — Role History, Not Just Current Holder

The continuity rule for mapping-driven reassignment was refined twice this session:

1. **First pass:** kept the current owner/Resp. Actual in place on a status change if they already held the newly resolved role today, instead of always re-running round-robin. Applied identically to process reassignment (DetailDrawer.jsx) and task reassignment (Tarefas.jsx `applyReatribui`), via a new `store.userHoldsRole()` helper.
2. **Second pass (broader, supersedes the above):** the correct rule looks further back through the process's or task's *own history*, not just who currently holds it. If this record has, at any earlier point, been assigned to a specific person under this exact role, that same person is reassigned again — regardless of who has held it under a different role in between. Round-robin now only applies when this role has genuinely never been resolved for this particular process/task before.

This required adding role attribution to timeline/history entries going forward, since neither `p.timeline` nor `t.history` previously recorded which role justified a past assignment — only who became the owner and a human-readable sentence. Reassignment timeline/history entries written by the mapping-driven path now carry `roleId` + `assignee`; `store.findPastRoleAssignee()` scans a record's own `roleId`-tagged entries for a prior match before falling back to round-robin. Client-based assignment still takes priority over this in both cases, unchanged. Pre-existing entries from before this change carry no `roleId` and correctly fall through to round-robin, since the system never recorded that attribution before now.

### Validar (Pré-Entrada → Abertura de Processo) Missed the Role-History Continuity Fix

`handleValidarPreEntrada` (Tarefas.jsx) is a separate handler from `applyReatribui` and had not been updated when role-history continuity was introduced — it called `store.assignForTaskType()` with no `roleHistory` argument at all, so it always fell through to round-robin regardless of any prior Resp. Abertura holder for that task, and never tagged the resulting reassignment with `roleId`/`assignee`, so even a correct assignment would have been invisible to later continuity lookups. Now builds `roleHistory` from `t.history` and resolves/tags `roleId` the same way `applyReatribui` does.

The Validar confirmation modal's copy was also out of date — it described the pre-redesign behaviour ("a task will be created and this one marked as concluded"). Updated to describe the current behaviour: the task is reassigned to whoever is responsible for Abertura de Processo and stays open until they actually open the process.

### Resp. Cotação Was Never Actually Being Set at Em Abertura → Entrada (Regression)

The "Resp. Cotação Assignment Fix" above (client → mapping → round-robin resolution order) was correct in principle, but a later change — making Resp. Cotação a fixed historical-record field that Reatribui-ON status changes never auto-touch (see "Resp. Cotação / Resp. Comercial vs. Resp. Actual" above) — was applied as a blanket rule in `handleStatusSave` (DetailDrawer.jsx) that also suppressed the one case where Resp. Cotação legitimately needs to be set for the first time: the Em Abertura → Entrada transition. The handler was only ever writing `respActual`; `owner` (Resp. Cotação) was never written there at all, despite `handleAbrirProcesso` (Tarefas.jsx) deliberately leaving `owner` empty at process creation specifically so this transition would fill it in.

Fixed with a narrow, transition-specific check: when moving from Em Abertura (45) to Entrada (5) and `owner` is still unset, `owner` is now set to the same person resolved for `respActual` in that same transition (client assignment → role-history continuity → round-robin). Guarded on `!p.owner`, so it only ever fires once per process — Resp. Cotação remains fixed as a historical record on every subsequent Reatribui-ON transition, exactly as already established; only Resp. Actual continues to move from that point forward.

### Dashboard "Actividade Recente" Now Includes Process Activity, Not Just Task Activity

Dashboard.jsx's activity feed (`myActivity` / `allActivity`) previously read only `tarefas[].history` — `processos[].timeline` was never consulted at all, so every process-side action (email sent from a process, status changes, reassignments, field edits, attachments, Follow-up changes) was invisible on the Dashboard regardless of how it was logged, even though it was correctly recorded in the process's own drawer timeline. This was reported as "email sent from a task doesn't show in Actividade Recente" but traced to the broader gap: the feed only ever had one data source.

Fixed by merging both sources through two normaliser functions (`normaliseTask`, `normaliseProcesso`) that map each record's own entry shape onto one common display shape (`{ ts, actor, action, note, recordId, ownerAtTime }`) before filtering/sorting/slicing. Task history entries keep their existing `{ actor, action, note, ts }` shape; process timeline entries (`{ icon, color, time, text }`, no explicit actor) map `time → ts` and `text → action`, with the acting user approximated via the process's current `respActual`/`owner`/`comm`/`compra` — the same "owner at time" approximation already used for task entries via `taskOwner`. `ActivityList` was updated to render process entries (no short action tag, full descriptive text as the detail line) alongside task entries (short action tag + separate note line) in the same list.

Each drawer's own local history/timeline view (TaskDrawer, DetailDrawer) is unchanged — this fix only affects the Dashboard-level aggregation.

**Known pre-existing inconsistency (not introduced by this fix, not fixed):** `nowTs()` in Tarefas.jsx stamps task history against a frozen mock date (`2026-05-15T12:00:00`), while `nowTs()` in DetailDrawer.jsx stamps process timeline against the real `new Date()`. Both use identical `pt-PT` locale formatting, so string-sort works correctly for entries on the same calendar day, but once real time diverges from the mock date the two timestamp sources will no longer interleave in correct chronological order. Worth resolving before Stage 1 closes if this drift becomes visible in testing.

### Personal Activity Feed Was Losing the Actor on Process Handoffs (Follow-up Fix)

The process-activity merge above still had a gap: `normaliseProcesso` hardcoded `actor: null` on every process entry, since process timeline entries never captured a structured actor field at the source — only baked into the human-readable `text` string. Personal-view filtering (`h.actor === userName || h.ownerAtTime === userName`) could therefore never match a process entry on `actor`, only on `ownerAtTime` (current `respActual`/`owner`/`comm`/`compra`). So when a user performed an action on a process that handed it off to someone else — e.g. a status change that triggers a mapping-driven reassignment — their own entry vanished from their personal feed the instant `ownerAtTime` stopped resolving to them, even though they were genuinely the actor. Task entries never had this problem, since `t.history` entries always carried a real `actor` field independent of current ownership.

Fixed at the source: every `entries.push(...)`/timeline-entry object literal in DetailDrawer.jsx (`handleEmailSent`, `updateField`, `handleStatusSave` ×4, `handleReassignSave` ×3, the inline FU-select handler, the "modelo superseded" handler, attachment remove, attachment add) now carries `actor: currentUser.name || null`. `normaliseProcesso` reads it through instead of hardcoding `null`. The personal-view OR-filter itself was already correct and untouched — both conditions (`actor === userName`, `ownerAtTime === userName`) already applied independently; the fix was making `actor` a real value instead of always `null`.

`ActivityList`'s task-vs-process display-style branch (short action tag vs. full descriptive line) previously inferred type from "does this entry have an actor" — no longer valid once process entries also carry one. Both normalisers now tag their output with an explicit `kind: "task"` / `kind: "processo"`, and `ActivityList` branches on that instead.

### Newest-First Sort Order — Timeline/History Lists

Dashboard.jsx's activity feed was already correctly sorted newest-first (`.sort((a, b) => (b.ts || "").localeCompare(a.ts || ""))`). The two drawer-local lists were not: DetailDrawer.jsx's process "Histórico" section rendered `p.timeline.map(...)` directly, and Tarefas.jsx's TaskDrawer "Histórico" section rendered `t.history.map(...)` directly — both arrays are always appended-to at the end, so both rendered oldest-first with the newest entry at the bottom. Fixed by reversing a shallow copy before mapping (`[...p.timeline].reverse().map(...)` / `[...t.history].reverse().map(...)`) in both drawers, so the most recent entry is now always shown first, consistent with the Dashboard feed.

### Em Abertura → Entrada — Original Pré-Entrada Person Gets Priority for Resp. Cotação

The general role-history continuity rule (see "Reassignment Continuity" above) scans a process's *own* timeline for a past holder of the target role — but at Em Abertura → Entrada specifically, Resp. Cotação is being set for the very first time, so the process has no prior role-tagged timeline entries to scan; that check would always fall through to round-robin. This transition needed its own priority rule: the person who originally validated the Pré-Entrada task that started this journey is the true anchor, and should get Resp. Cotação back if they still hold that role — ahead of round-robin and ahead of the general continuity check, but still behind client-specific assignment (unchanged as the top priority everywhere).

That identity was not recoverable from the process before this fix. `t.cotacaoOwner` (set in `handleValidarPreEntrada`, Tarefas.jsx, when a Pré-Entrada task is validated) lives only on the task and was never copied onto the process at creation — `handleAbrirProcesso`'s `newProcesso` object had no field carrying it, and the process's own timeline never recorded it either. Fixed by adding `origPreEntradaOwner: t.cotacaoOwner || null` to `newProcesso` in `handleAbrirProcesso` (Tarefas.jsx), so the identity is carried from task to process at the moment the process is born.

`handleStatusSave` (DetailDrawer.jsx) now checks, specifically when `p.status === 45 && newStatus === 5`: if there's no client-specific assignment for the resolved role, and `p.origPreEntradaOwner` currently holds that role (via the existing `store.userHoldsRole()`), that person is used directly as `newActual` — bypassing the role-history scan and round-robin call entirely for this transition. Every other Reatribui-ON transition is untouched and still uses the unmodified general logic.

### Task Attachments — Enviar Email ao Cliente Now Saves Real Files

Attaching a file while composing "Enviar Email ao Cliente" from a task previously only ever stored the filename as a string, both in the modal's local state and in the resulting history/email entries — the actual file content was never captured, so nothing was saved as a genuine, clickable task attachment. Fixed by having `EnviarEmailClienteModal` track `{ name, file }` pairs (real `File` references) instead of bare names, and making `handleEnviarEmailCliente` (Tarefas.jsx) async: it reads each file via `FileReader.readAsDataURL` into a base64 data URL — the same interim local-storage mechanism DetailDrawer.jsx already uses for manually attached process files — and saves the resulting `{ name, url, uploadedBy, uploadedAt }` objects onto `t.attachments`. If the task is linked to an existing process via `originProcesso`, the same attachments are also pushed onto that process's own `p.attachments`, so the file is visible from both places. A new "Anexos" section was added to the task drawer (it didn't exist before) to actually render `t.attachments` as clickable/downloadable entries.

### Process Drawer Now Surfaces Linked Tasks' History and Attachments

`originProcesso` links a task to a process (set via Associar a Processo Existente), but the process's own drawer (DetailDrawer.jsx) never read anything from any task — its "Histórico" and "Anexos" sections only ever showed the process's own `p.timeline`/`p.attachments` in isolation. Fixed by passing `tarefas` into `DetailDrawer` as a new prop (from Main.jsx, where it was already in scope) and computing `linkedTasks = tarefas.filter(t => t.originProcesso === p.id)` live on every render. Linked tasks' history entries are mapped into the same timeline entry shape (prefixed `[Tarefa <id>]`, distinct purple icon/colour) and merged with `p.timeline`, sorted newest-first together; their attachments are merged into the Anexos list, tagged with a "Tarefa `<id>`" pill and rendered read-only (removal stays in the task's own drawer, which remains the owning record). This is a pure display-time merge — `p.timeline`/`p.attachments` themselves are never mutated by it. The existing Associar a Processo direction rule (task inherits process's client; process is never overwritten) is unchanged.

### Task Cancellation Journey — Full Rework

A closer QA pass on Cancelar Tarefa surfaced several compounding issues, fixed together:

- **New "Canceladas" section in Tarefas.** Cancelled tasks were previously merged into the same bucket as Concluídas and effectively disappeared from normal view. `doneLabels` was split into separate `concluidoLabel`/`canceladoLabel` sets; `doneTasks` (Concluído only) and a new `cancelledTasks` (Cancelado only) are now rendered as two distinct sections, both styled consistently with the existing pattern (de-emphasized `opacity: 0.7`, same empty-state copy convention). Applies automatically under the personal/global (`showAll`) view toggle since both derive from the same filtered array as every other section.
- **Cancelar Tarefa hidden for Supervisor/Admin.** They already have direct authority to set any status — including Cancelado — via Alterar Estado Manualmente, so the dedicated Cancelar Tarefa button (mandatory-reason → Cancelamento Pendente → approval flow) is now only shown to standard users. Passar remains universal for everyone, unchanged.
- **`handleCancelar` role resolution was hardcoded.** It previously searched `users` directly for anyone with `role === "supervisor" || role === "admin"`, ignoring whatever the admin had actually configured for "Cancelamento Pendente" in the Mapeamento tab — `mapeamento.taskStatus` (status→role map) turned out to be dead config, read by no code path at all. Added `store.assignForTaskStatus(statusId, clientName, roleHistory)` to store.js, mirroring `assignForTaskType`/`assignForProcessStatus` exactly (client assignment → role-history continuity → round-robin), and rewrote `handleCancelar` to resolve `roleId` from `mapeamento.taskStatus` and call it — bringing this transition in line with the same non-hardcoded resolution rule used everywhere else. `DEFAULT_MAPEAMENTO.taskStatus` updated from `{ 4: "supervisor", 6: "supervisor" }` to `{ 4: "supervisor", 7: "supervisor" }` (id 7 = Cancelamento Pendente, the actual transition needing a default role; the old id-6 entry was misplaced).
- **Cancelled tasks were vanishing from view on navigation.** Root cause: `taskStatusReatribui[6]` (Cancelado) was `true`, so approving a cancellation ran the full `applyReatribui` reassignment and silently changed `owner` to someone else — the task then dropped out of the approving/original user's own task list (`myTasks` filters by `t.owner === currentUser.name`) the moment `Tarefas` re-rendered from persisted state. Fixed by removing `6` from `taskStatusReatribui` — Cancelado is now a terminal status exactly like Concluído (id 5, already absent from that map): ownership stays fixed at whatever it was when the task was cancelled, never silently reassigned.
- **Approval note was minimal.** `handleAprovarCancelamento`'s history note previously just re-echoed `t.cancelReason`. Now composes a full sentence: `"Cancelamento aprovado por <name>. Motivo original: <reason>."` — consistent with how every other action in the file builds a fresh descriptive note rather than repeating existing data.
- **Removed two non-interactive info banners** from the task drawer that were being mistaken for buttons: the "Pedido de cancelamento — `<reason>`" pill shown to supervisors (the real Aprovar/Rejeitar buttons remain), and the "A aguardar aprovação de cancelamento" pill shown to standard users while their request is pending. Both were plain `<div>`s with no `onClick`, styled to look clickable.

### DEV Tools — Generate Email From Existing Client

Added a new DEV tool generator (`handleGenerateClientEmail`) that creates an inbox email using an existing client's exact company name (drawn from `processos`, same derivation Clientes.jsx uses) rather than a random contact name — needed because Inbox.jsx's triage flow uses `email.senderName` verbatim as the `clientName` passed into `store.assignForTaskType`/`resolveClientRoleAssignment`, so only an exact client-name match will exercise client-based routing rules configured in the Clientes tab. Behaves like the other generators otherwise (same AI simulation toggle, same confidence range, same classification path).

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
