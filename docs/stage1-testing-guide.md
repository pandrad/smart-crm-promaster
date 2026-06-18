# Smart CRM — Stage 1 Testing Guide

## Mock Users to Create in Admin Panel

Go to Admin → Utilizadores and create these users. Then go to Funções and create the roles. Then go to Atribuição and assign each person their role.

### Users

| Name | Email | Password | Role |
|---|---|---|---|
| Luís Valente | luis@promaster.co | admin123 | Admin |
| João Morais | joao@promaster.co | pass123 | Supervisor |
| Adelina Rodrigues | adelina@promaster.co | pass123 | Resp. Cotação |
| Ana Ferreira | ana@promaster.co | pass123 | Resp. Cotação |
| Tiago Pinto | tiago@promaster.co | pass123 | Resp. Abertura |
| Marta Costa | marta@promaster.co | pass123 | Resp. Comercial |

### Roles to Create in Funções

- Admin
- Supervisor
- Resp. Cotação
- Resp. Abertura
- Resp. Comercial

### Mapeamento de Responsabilidades

| Trigger | Role to Assign |
|---|---|
| Task type: Pré-Entrada | Resp. Cotação |
| Task type: Validação de Processo | Resp. Cotação |
| Task type: Abertura de Processo | Resp. Abertura |
| Task type: Contas Correntes | Resp. Comercial |
| Task type: Status de Encomenda | Resp. Comercial |
| Task type: Desconto | Resp. Comercial |
| Task type: Cliente Novo | Supervisor |
| Task type: Não Classificado | Supervisor |
| Task type: Diversos | Supervisor |
| Process status: Entrada | Resp. Cotação |
| Process status: Qualificação | Resp. Cotação |
| Process status: Consulta | Resp. Cotação |
| Process status: Para Fechar | Supervisor |
| Process status: Fechado | Admin |

---

## Before Starting Each Journey

Use DEV Tool 5 — Repor todos os dados mock to reset everything to baseline. This ensures each journey starts from a clean known state.

---

## Journey 1 — New email becomes a process (round-robin)

**Purpose:** Verify that emails route correctly to the right person and that round-robin works between Adelina and Ana.

**Steps:**
1. Log in as Luís (Admin)
2. Go to Admin → Atribuição. Confirm both Adelina and Ana are assigned to Resp. Cotação
3. Go to Admin → Mapeamento. Confirm Pré-Entrada maps to Resp. Cotação
4. Turn AI Simulation ON in DEV tools
5. Use DEV Tool 2 to generate a random email — watch for Pré-Entrada AI suggestion
6. In Inbox — click Confirmar como Processo
7. Switch to Adelina using DEV Tool 1
8. Go to Tarefas — confirm a Validação de Processo task appears assigned to Adelina
9. Switch back to Luís
10. Generate a second random email and confirm as Processo again
11. Switch to Ana
12. Go to Tarefas — confirm the second task is assigned to Ana (round-robin)

**Expected result:** First task goes to Adelina, second goes to Ana, alternating correctly.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Journey 2 — Validation task with email to client

**Purpose:** Verify that the validator can request missing information from the client directly from the task.

**Steps:**
1. Switch to Adelina using DEV Tool 1
2. Open the Validação de Processo task from Journey 1
3. Click Enviar Email ao Cliente
4. Confirm the compose modal opens with client email pre-filled
5. Add a test attachment (any file)
6. Write a message asking for missing information
7. Click Send
8. Check the task timeline — confirm the email is logged with the attachment filename
9. Confirm the task status changed automatically to Em Curso

**Expected result:** Email logged in timeline, attachment shown, status Em Curso.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Journey 3 — Validation task kicked back (Devolver com Notas)

**Purpose:** Verify the full devolver and resubmeter flow works correctly.

**Steps:**
1. Switch to Adelina
2. Open a Por Fazer validation task
3. Click Devolver com Notas
4. Write a note explaining what is missing
5. Submit
6. Confirm task status changed to Devolvido
7. Switch to Luís (the person who triaged the original email)
8. Open the same task in Tarefas
9. Confirm you can see Adelina's note in the timeline
10. Confirm the Resubmeter button is visible
11. Click Resubmeter
12. Write a response note with the additional information
13. Submit
14. Switch back to Adelina
15. Confirm the task is back in her list as Por Fazer
16. Confirm the full note thread is visible in the timeline

**Expected result:** Complete threaded exchange visible, task returned to validator correctly.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Journey 4 — Task escalation

**Purpose:** Verify that escalating a task routes it to the Supervisor correctly.

**Steps:**
1. Switch to Adelina
2. Open any Por Fazer task in her list
3. Click Escalar
4. Write a mandatory escalation note
5. Confirm
6. Confirm the task disappears from Adelina's active list
7. Switch to João (Supervisor)
8. Go to Tarefas — confirm the escalated task appears with the correct Escalado status
9. Confirm João can see Adelina's escalation note in the timeline
10. Confirm João can reassign or act on the task

**Expected result:** Task moves to Supervisor's list with correct status and full history.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Journey 5 — Task cancellation with Supervisor approval

**Purpose:** Verify the full cancellation approval workflow.

**Steps:**
1. Switch to Adelina
2. Open any active task in her list
3. Click Cancelar Tarefa
4. Write a mandatory cancellation reason
5. Submit
6. Confirm task status changed to Cancelamento Pendente
7. Confirm the task is still visible (not deleted)
8. Switch to João (Supervisor)
9. Open the task — confirm Approve and Reject buttons appear
10. Click Approve
11. Confirm task status changed to Cancelado
12. Confirm task is still visible in the list (not deleted)
13. Use DEV Tool 5 to restore mock data
14. Repeat steps 1-8 but this time click Reject
15. Write a rejection note
16. Confirm task returns to Em Curso with João's note in the timeline

**Expected result:** Full approval flow works, task never disappears, rejection returns task to active.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Journey 6 — Admin configures from scratch

**Purpose:** Verify the admin can set up the entire system from zero and it works correctly.

**Steps:**
1. Switch to Luís (Admin)
2. Use DEV Tool 4 — Limpar dados admin
3. Confirm Luís is still logged in as admin after clearing
4. Go to Admin Panel
5. Add all 5 roles from the roles list above
6. Add all 6 users from the users list above
7. Go to Atribuição — assign each user to their role
8. Go to Estados de Processo — confirm the 11 stages are present or re-add them
9. Go to Tipos de Tarefa — confirm task types exist or re-add them
10. Go to Mapeamento — set all assignments from the mapping table above
11. Go to SLA — set at least one timing per category
12. Turn AI Simulation ON in DEV tools
13. Generate a random email via DEV Tool 2
14. In Inbox — confirm AI suggests a task type
15. Confirm as Processo
16. Switch to Adelina
17. Confirm validation task appears in her Tarefas list

**Expected result:** Fresh configuration works end to end, tasks route correctly.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Journey 7 — Process moves through statuses

**Purpose:** Verify that as a process advances through statuses the responsible person updates correctly per the Mapeamento.

**Steps:**
1. Switch to Adelina
2. Open a validation task and click Validar e Criar Processo
3. Go to Processos — confirm new process appears with correctly formatted number (AAMMMNNN)
4. Open the process detail drawer
5. Confirm Adelina is shown as Resp. Cotação
6. Change process status to Qualificação
7. Confirm responsible person is still Adelina
8. Change status to Consulta
9. Confirm still Adelina
10. Change status to Para Fechar
11. Confirm responsible changes to João (Supervisor)
12. Change status to Fechado
13. Confirm responsible changes to Luís (Admin)
14. Confirm the full activity timeline shows every status change with timestamp
15. In the admin panel, find a task status with Reatribui responsável set to OFF. Change a task to that status. Confirm the task stays assigned to the same person and does not reassign.

**Expected result:** Responsible person updates dynamically at each status change per Mapeamento.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Journey 8 — Mobile experience

**Purpose:** Verify the app works correctly on a phone screen.

**Steps:**
1. Open Chrome DevTools (F12)
2. Click the device toggle icon (top left of DevTools)
3. Select iPhone SE (375px) from the device dropdown
4. Refresh the page
5. Confirm bottom navigation appears and sidebar is hidden
6. Navigate to Processos — confirm card view instead of table
7. Tap a process card — confirm detail drawer slides up from bottom
8. Navigate to Tarefas — confirm card view
9. Tap a task — confirm task drawer slides up from bottom
10. Navigate to Inbox — confirm email list is readable
11. Open Admin panel — confirm it opens full screen
12. Confirm DEV tools panel does not overlap the bottom navigation
13. Switch to 390px (iPhone 14) and repeat the same checks

**Expected result:** All screens usable on mobile, no overlapping elements, all interactions work.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Journey 9 — Client assignment routing

**Purpose:** Verify that when a client has a specific person assigned, emails from that client route directly to them instead of round-robin.

**Steps:**
1. Switch to Luís (Admin)
2. Go to Clientes tab
3. Find a mock client and assign Adelina as their responsible person
4. Find a second mock client and assign Ana as their responsible person
5. Turn AI Simulation ON
6. Generate a random email via DEV Tool 2
7. Triage as Processo in Inbox
8. Switch to Adelina
9. Confirm the validation task is assigned to Adelina (not Ana)
10. Use DEV Tool 5 to restore mock data
11. Repeat for a client assigned to Ana — confirm it routes to Ana

**Expected result:** Client assignment overrides round-robin, correct person receives the task.

**Result:** [ ] Pass [ ] Fail
**Notes:**

---

## Quick Reference — DEV Tools

| Tool | What it does |
|---|---|
| Tool 1 — User Switcher | Switch between users without logging out |
| Tool 2 — Generate Email | Creates a random inbox email with AI suggestion |
| Tool 3 — Limpar Inbox e Tarefas | Empties inbox and all tasks for clean flow testing |
| Tool 4 — Limpar dados admin | Wipes all admin config — preserves current logged-in user |
| Tool 5 — Repor todos os dados mock | Resets everything to baseline mock data |
| Tool 6 — AI Simulation Toggle | ON shows Simulado badge, OFF shows nothing |

---

## Overall Results Summary

| Journey | Result | Notes |
|---|---|---|
| 1 — Round-robin routing | | |
| 2 — Email to client with attachment | | |
| 3 — Devolver and Resubmeter | | |
| 4 — Task escalation | | |
| 5 — Cancellation approval | | |
| 6 — Admin from scratch | | |
| 7 — Process status progression | | |
| 8 — Mobile experience | | |
| 9 — Client assignment routing | | |

---

## When Client Sends Real User List

Replace the Users and Mapeamento tables at the top of this document with the real data provided by the client. Then repeat all 9 journeys with the real configuration before v4 HTML delivery.
