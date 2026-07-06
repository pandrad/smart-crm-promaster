# QA Journeys — Detailed Scripts

Detailed, steppable versions of two journeys from the master tracker (`docs/smart-crm-qa-journeys.xlsx`, 15 journeys total). Each step has its own **Expected Result** so it can be marked Pass/Fail individually during execution.

Dev server: `cd frontend && npm run dev` → http://localhost:5299
Demo logins: `admin@promaster.co.ao` / `promaster26` (Admin) · `joao.morais@promaster.co.ao` / `promaster26` (Supervisor) · `adelina.rodrigues@promaster.co.ao` / `promaster26` (Standard)

---

## Journey 3 — Full lifecycle on a single task (Validar → Devolver → Validar again)

**Goal:** Confirm one task ID is used throughout the entire Pré-Entrada → Abertura de Processo → Pré-Entrada → Abertura de Processo cycle, with no duplicate task ever created (Non-Negotiable Architecture Rule #10), and that the correct action buttons appear at each stage.

### Step 1 — Locate a Pré-Entrada task and record its ID
Log in as the task's Resp. Pré-Entrada owner (e.g. Adelina Rodrigues, `adelina.rodrigues@promaster.co.ao`). Go to Tarefas, find a task of type Pré-Entrada in Por Fazer, open it, and record its task ID exactly as shown in the drawer header.

**Expected Result:** A Pré-Entrada task is found and opens in the drawer; the task ID is clearly visible and recorded (e.g. `T001`).

### Step 2 — Confirm Pré-Entrada action buttons
With the task drawer still open, inspect the action button row.

**Expected Result:** Buttons present are exactly: Validar, Enviar Email ao Cliente, Escalar (standard user — Passar would show instead for admin/supervisor), Cancelar Tarefa. No Abertura-specific buttons (Abrir Processo, Devolver com Notas) are visible.

### Step 3 — Click Validar
Click Validar, confirm the modal, and submit.

**Expected Result:** Task updates in place: type becomes Abertura de Processo, owner changes to the Resp. Abertura assignee, status remains Por Fazer, `cotacaoOwner` is set to the original Pré-Entrada owner. The task ID in the drawer header is **identical** to the ID recorded in Step 1.

### Step 4 — Confirm Abertura de Processo action buttons
With the same task now showing type Abertura de Processo, inspect the action button row.

**Expected Result:** Buttons present are exactly: Abrir Processo, Devolver com Notas, Escalar (standard) or Passar (admin/supervisor), Cancelar Tarefa. Validar and Enviar Email ao Cliente (Pré-Entrada-specific) are no longer shown.

### Step 5 — Switch to the Resp. Abertura owner and click Devolver com Notas
Log out and log in as (or use DevTools "Trocar utilizador" to switch to) the user now shown as task owner. Open the same task (same ID), click Devolver com Notas, enter a note, and submit.

**Expected Result:** The Devolver modal accepts the note and submits without error.

### Step 6 — Confirm task reverted to Pré-Entrada
Inspect the task after the Devolver action.

**Expected Result:** Type reverts to Pré-Entrada, owner reverts to the original `cotacaoOwner` (the Step 1 owner), status is Por Fazer, `devolvido` flag is set. The task ID is **still identical** to the ID recorded in Step 1.

### Step 7 — Confirm Pré-Entrada buttons reappear
Inspect the action button row again.

**Expected Result:** Button set matches Step 2 exactly: Validar, Enviar Email ao Cliente, Escalar, Cancelar Tarefa.

### Step 8 — Click Validar a second time
Log back in as (or switch to) the Pré-Entrada owner, open the task, click Validar again, confirm, and submit.

**Expected Result:** Task transitions to Abertura de Processo again (owner reassigned per mapping/round-robin as in Step 3). The task ID is **identical** to the ID recorded in Step 1 — this is the core check for CLAUDE.md rule #10 (task ID never changes throughout lifecycle, no new task ever created on a flow transition).

### Step 9 — Confirm no duplicate task exists
Go to the Tarefas list (Por Fazer / Em Curso / Concluídas, and toggle "Ver todas as tarefas" if admin/supervisor) and search/filter for the task ID from Step 1.

**Expected Result:** Exactly one row exists for this task ID across the entire list. No second task was created at any transition (Validar, Devolver, or the second Validar).

---

## Journey 5 — Existing owner preserved on routine status changes

**Goal:** Confirm a process or task that already has an owner is not silently reassigned by a routine status change, unless a client-based assignment genuinely points to someone new. Covers the owner-guard logic in `handleStatusSave` (DetailDrawer.jsx) and `applyReatribui` (Tarefas.jsx). Note: mapping/round-robin alone cannot reassign an already-owned process or task — it only resolves an owner when none exists yet — so a client-based assignment is the only valid way to exercise the "genuine reassignment" steps below.

### Part A — Process side

#### Step 1 — Select a process with an existing owner
Go to Processos, open a process that already has a Resp. Cotação (owner) set. Record the process ID and the current owner name.

**Expected Result:** A process with a non-empty owner is found and opens in the drawer; ID and owner name are recorded.

#### Step 2 — First routine status change
Using Alterar Estado, change the process to the next sequential status where Reatribui is ON in Mapeamento (per Admin Panel → Mapeamento → por estado de processo) but where no client-based assignment override exists for this process's client. Save.

**Expected Result:** Status updates successfully. Owner (Resp. Cotação) remains exactly the name recorded in Step 1 — unchanged.

#### Step 3 — Second consecutive routine status change
From the new status, change again to the next status (Reatribui ON, no client override applicable).

**Expected Result:** Status updates successfully. Owner remains unchanged from Step 1.

#### Step 4 — Third consecutive routine status change
Repeat once more to a third status (Reatribui ON, no client override applicable).

**Expected Result:** Status updates successfully. Owner remains unchanged from Step 1 across all three changes.

#### Step 5 — Status change where a client-based assignment genuinely applies
Set up a client-based role assignment for this process's client pointing to a different user (Clientes → assign Resp. Cotação for that client to someone else). Change status again to a status where Reatribui is ON.

**Expected Result:** Owner **does** change to the new person named by the client-based assignment. This confirms the guard is conditional (preserves an existing owner only when a client-based assignment genuinely points elsewhere) rather than blocking all reassignment outright.

Per the code (`handleStatusSave` in DetailDrawer.jsx), a client-based assignment is the **only** path that can reassign a process that already has an owner. Mapping/round-robin (`store.assignForProcessStatus`) is only reached when the process has no owner at all — it never displaces an existing owner. Do not attempt to trigger reassignment via mapping/round-robin alone on an already-owned process; it will not work, and that is expected/correct behavior, not a bug.

### Part B — Task side

#### Step 6 — Select a task with an existing owner
Go to Tarefas, open a task (not Pré-Entrada/Abertura de Processo/unclassified — a standard type) that already has an owner. Record the task ID and owner name.

**Expected Result:** A standard-type task with a non-empty owner is found; ID and owner recorded.

#### Step 7 — First routine status-driven action
Perform an action that changes task status where `taskStatusReatribui` is ON for the target status (per Admin Panel → Mapeamento → por estado de tarefa) but no client-based assignment override applies — e.g. Marcar como Concluído if Concluído has Reatribui on, or another in-scope action.

**Expected Result:** Status updates successfully. Owner remains exactly the name recorded in Step 6 — unchanged.

#### Step 8 — Second consecutive routine action
Repeat with a second routine status-driven action under the same conditions (Reatribui ON, no client override).

**Expected Result:** Owner remains unchanged from Step 6.

#### Step 9 — Third consecutive routine action
Repeat a third time.

**Expected Result:** Owner remains unchanged from Step 6 across all three actions.

#### Step 10 — Action where a client-based assignment genuinely applies
Set up a client-based assignment for this task's client pointing to a different person for the relevant role (Clientes → assign the relevant role for that client to someone else). Perform a status-driven action where `taskStatusReatribui` is ON for the target status.

**Expected Result:** Owner **does** change to the new person named by the client-based assignment, confirming the task-side guard is also conditional, not an unconditional block.

Per the code (`applyReatribui` in Tarefas.jsx), a client-based assignment is the **only** path that can reassign a task that already has an owner. Mapping/round-robin (`store.assignForTaskType`) is only reached when the task has no owner at all — it never displaces an existing owner. Do not attempt to trigger reassignment via mapping/round-robin alone on an already-owned task; it will not work, and that is expected/correct behavior, not a bug.

---

## Reporting format for execution

For each step above, report **Pass** or **Fail** explicitly — no step left unlabeled. On the first Fail within a journey, stop that journey immediately, report exactly what failed and why, and do not attempt a fix without being asked. On completion, produce one summary table listing every step number, its short label, and Pass/Fail, across both journeys.
