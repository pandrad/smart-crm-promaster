/**
 * Simple localStorage-backed store.
 * All admin mutations go through here so state survives panel close/reopen.
 */

import { USERS, STAGES, FOLLOWUP_STATUSES } from "./data.js";
import { PROCESSOS, TAREFAS, INBOX_EMAILS } from "./mock/data.js";

// ── Default seed data ─────────────────────────────────────────────────────────

const DEFAULT_PRIORITIES = [
  { id: 1, label: "Normal", color: "#94a3b8", bg: "#1e293b" },
  { id: 2, label: "Alta",   color: "#f87171", bg: "#2d0a0a" },
];

// Roles — label only; id is a string slug
const DEFAULT_ROLES = [
  { id: "resp-pre-entrada",  label: "Resp. Pré-Entrada"              },
  { id: "resp-cotacao",      label: "Resp. Cotação"                   },
  { id: "resp-fps",          label: "Resp. FPs"                       },
  { id: "resp-abertura",     label: "Resp. Abertura"                  },
  { id: "resp-fecho",        label: "Resp. Fecho"                     },
  { id: "resp-tecnico",      label: "Resp. Técnico"                   },
  { id: "resp-contas",       label: "Resp. Contas a Receber e a Pagar"},
  { id: "resp-comercial",    label: "Resp. Comercial"                 },
  { id: "supervisor",        label: "Supervisor"                      },
  { id: "admin",              label: "Administrador"                   },
];

// Task types — label + colour; no system behaviour
const DEFAULT_TASK_TYPES = [
  { id: 1,  label: "Pré-Entrada",           color: "#60a5fa", bg: "#1e3a5f" },
  { id: 2,  label: "Abertura de Processo",   color: "#4ade80", bg: "#0a2015" },
  { id: 3,  label: "Contas Correntes",       color: "#fb923c", bg: "#1c1005" },
  { id: 4,  label: "Status de Encomenda",    color: "#4ade80", bg: "#052e16" },
  { id: 5,  label: "Desconto",              color: "#fbbf24", bg: "#1c1005" },
  { id: 6,  label: "Cliente Novo",          color: "#c084fc", bg: "#2e1065" },
  { id: 7,  label: "Follow-Up",             color: "#38bdf8", bg: "#0c2231" },
  { id: 8,  label: "Escalação",             color: "#f87171", bg: "#2d0a0a" },
  { id: 9,  label: "Análise Técnica",       color: "#7c3aed", bg: "#2e1065" },
];

// SYSTEM_ROLES — fixed list of system behaviours a task status can carry.
// The admin can rename the label but the systemRole value never changes.
export const SYSTEM_ROLES = [
  "Por Fazer",
  "Em Curso",
  "Devolvido",
  "Escalado",
  "Cancelamento Pendente",
  "Cancelado",
  "Concluído",
  "Nenhum",
];

// Task statuses — label + colour + systemRole
const DEFAULT_TASK_STATUSES = [
  { id: 1, label: "Por Fazer",             color: "#94a3b8", bg: "#1e293b", systemRole: "Por Fazer"             },
  { id: 2, label: "Em Curso",              color: "#60a5fa", bg: "#1e3a5f", systemRole: "Em Curso"              },
  { id: 3, label: "Devolvido",             color: "#fb923c", bg: "#1c1005", systemRole: "Devolvido"             },
  { id: 4, label: "Escalado",              color: "#e879f9", bg: "#2d0a2d", systemRole: "Escalado"              },
  { id: 5, label: "Concluído",             color: "#4ade80", bg: "#052e16", systemRole: "Concluído"             },
  { id: 6, label: "Cancelado",             color: "#64748b", bg: "#1e293b", systemRole: "Cancelado"             },
  { id: 7, label: "Cancelamento Pendente", color: "#fb923c", bg: "#2d1505", systemRole: "Cancelamento Pendente" },
];

// Mapeamento — maps role IDs to process status IDs, task type IDs, task status IDs.
// taskStatusReatribui: per-status boolean — when true the mapeamento lookup runs and
// can reassign the task owner on status change. Defaults ON for system-role statuses.
// processoStatusReatribui: per-status boolean — when true changing to that process
// status triggers the Mapeamento lookup and reassigns the responsible person.
// Defaults ON only for "Para Fechar" (id 6) and "Fechado" (id 7) since those
// explicitly hand off to a new person; all other statuses default OFF.
const DEFAULT_MAPEAMENTO = {
  processoStatus: {
    2: "resp-cotacao", 3: "resp-tecnico", 4: "resp-abertura", 45: "resp-abertura", 5: "resp-cotacao",
    6: "resp-cotacao", 7: "resp-cotacao", 8: "resp-fecho", 9: "resp-fps",
    10: "resp-cotacao", 11: "resp-cotacao", 12: "supervisor", 13: "supervisor",
  },
  taskType: {
    1: "resp-pre-entrada", 2: "resp-abertura", 3: "resp-contas", 4: "resp-cotacao",
    5: "resp-cotacao", 6: "supervisor", 9: "resp-tecnico",
  },
  taskStatus: {
    4: "supervisor", 7: "supervisor",
  },
  // Cancelado (id 6) intentionally excluded — it's a terminal status, same as
  // Concluído (id 5, also absent here): once a task is cancelled, ownership
  // must stay exactly as it was at that moment, not get silently reassigned
  // via the mapping/round-robin lookup in applyReatribui. That reassignment
  // was previously happening (taskStatusReatribui[6] was true), which caused
  // a cancelled task to vanish from the approving/original user's own task
  // list the moment they navigated away and back, since it had quietly
  // changed owner. Cancelamento Pendente (id 7) replaces id 6 in both maps
  // above/below — that's the actual transition that should route to a
  // supervisor (handled explicitly in handleCancelar via
  // store.assignForTaskStatus), not the terminal Cancelado transition itself.
  taskStatusReatribui:     { 3: true, 4: true, 7: true },
  // Em Abertura (id 45) defaults OFF — the process must stay with whoever
  // opened it while they populate required files. Entrada (id 5) stays ON so
  // the manual Em Abertura → Entrada transition hands off to Resp. Cotação
  // via the mapping above.
  processoStatusReatribui: { 2: true, 3: true, 4: true, 45: false, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true, 12: true, 13: true },
  taskTypeReatribui:       {},
};

// User-role assignments — maps userId → array of roleIds
const DEFAULT_USER_ROLES = {
  1:  ["resp-pre-entrada", "resp-cotacao"],                                    // Adelina Rodrigues
  // 2: Alexandra Lima — no roles
  3:  ["resp-abertura", "resp-fps"],                                           // Augusto Gouveia
  4:  ["resp-abertura", "resp-fps"],                                           // Braulio Lourenço
  5:  ["resp-abertura", "resp-fps"],                                           // Erânio Cassanga
  6:  ["resp-pre-entrada", "resp-cotacao", "resp-fecho"],                      // Francisco Leitão
  7:  ["resp-abertura", "resp-fps"],                                           // Gabriel Dala
  8:  ["resp-abertura", "resp-fps"],                                           // João Chiquica
  9:  ["supervisor", "resp-fecho", "resp-tecnico", "resp-comercial"],          // João Morais
  10: ["resp-contas"],                                                         // Joaquim César
  11: ["admin"],                                                       // Luís Quelhas Valente
  12: ["resp-abertura"],                                                       // Lukeny Campos
  13: ["admin"],                                                       // Susete Ferreira
  14: ["resp-pre-entrada", "resp-cotacao"],                                    // Tiago Pinto
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const store = {
  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers()       { return load("crm_users", USERS); },
  saveUsers(users) { save("crm_users", users); },

  // ── Stages (process statuses) ──────────────────────────────────────────────
  getStages()        { return load("crm_stages", STAGES); },
  saveStages(stages) { save("crm_stages", stages); },

  // ── Follow-up statuses ─────────────────────────────────────────────────────
  getFUStatuses()    { return load("crm_fu", FOLLOWUP_STATUSES); },
  saveFUStatuses(fu) { save("crm_fu", fu); },

  // ── Priorities (used for process Alta/Normal toggle) ──────────────────────
  getPriorities()      { return load("crm_priorities", DEFAULT_PRIORITIES); },
  savePriorities(list) { save("crm_priorities", list); },

  // ── Roles ──────────────────────────────────────────────────────────────────
  getRoles()        { return load("crm_roles",      DEFAULT_ROLES);      },
  saveRoles(roles)  { save("crm_roles", roles); },
  getRoleLabel(id) {
    return load("crm_roles", DEFAULT_ROLES).find(r => r.id === id)?.label ?? id;
  },

  // ── User-role assignments (Tab 3) ─────────────────────────────────────────
  // Maps userId (number) → array of roleId (string)
  getUserRoles()         { return load("crm_user_roles", DEFAULT_USER_ROLES); },
  saveUserRoles(mapping) { save("crm_user_roles", mapping); },

  // Returns array of role labels for a given userId
  getUserRoleLabels(userId) {
    const mapping = load("crm_user_roles", DEFAULT_USER_ROLES);
    const roles   = load("crm_roles", DEFAULT_ROLES);
    const ids     = mapping[userId] ?? [];
    return ids.map(id => roles.find(r => r.id === id)?.label ?? id);
  },

  // ── Task types ─────────────────────────────────────────────────────────────
  getTaskTypes()      { return load("crm_task_types",    DEFAULT_TASK_TYPES);    },
  saveTaskTypes(list) { save("crm_task_types",    list); },

  // ── Task statuses (with systemRole) ───────────────────────────────────────
  getTaskStatuses()      { return load("crm_task_statuses", DEFAULT_TASK_STATUSES); },
  saveTaskStatuses(list) { save("crm_task_statuses", list); },

  // Returns the label of the task status whose systemRole === role, or null
  getLabelForSystemRole(role) {
    const statuses = load("crm_task_statuses", DEFAULT_TASK_STATUSES);
    return statuses.find(s => s.systemRole === role)?.label ?? null;
  },

  // Returns the full status object whose systemRole === role, or null
  getStatusForSystemRole(role) {
    const statuses = load("crm_task_statuses", DEFAULT_TASK_STATUSES);
    return statuses.find(s => s.systemRole === role) ?? null;
  },

  // ── Mapeamento de Responsabilidades (Tab 8) ────────────────────────────────
  getMapeamento()          { return load("crm_mapeamento", DEFAULT_MAPEAMENTO); },
  saveMapeamento(mapping)  { save("crm_mapeamento", mapping); },

  // Resolve which users hold a given roleId; returns array of user objects
  resolveRoleUsers(roleId) {
    if (!roleId) return [];
    const userRoles = load("crm_user_roles", DEFAULT_USER_ROLES);
    const users     = load("crm_users", USERS);
    return users.filter(u => u.active !== false && (userRoles[u.id] ?? []).includes(roleId));
  },

  // Pick next user for a roleId using round-robin; returns user name or null
  assignRoundRobin(roleId) {
    const users = store.resolveRoleUsers(roleId);
    if (users.length === 0) return null;
    if (users.length === 1) return users[0].name;
    const counters = load("crm_rr_counters", {});
    const idx = (counters[roleId] ?? 0) % users.length;
    counters[roleId] = idx + 1;
    save("crm_rr_counters", counters);
    return users[idx].name;
  },

  // ── Client responsibility assignments ────────────────────────────────────────
  // Maps client name (string) → { [roleId]: user name (string) } for direct,
  // role-aware routing. When a client has an assignment for the specific role
  // being resolved, that assignment bypasses round-robin and goes directly to
  // the assigned user. A client with no entry for that role falls through to
  // the mapping/round-robin logic as usual.
  getClientAssignments()          { return load("crm_client_assignments", {}); },
  saveClientAssignments(mapping)  { save("crm_client_assignments", mapping); },

  // Resolve a client's role-specific assignment, or null if none exists.
  // clientMap[clientName] may be a role → user-name object (current shape).
  resolveClientRoleAssignment(clientName, roleId) {
    if (!clientName || !roleId) return null;
    const clientMap = load("crm_client_assignments", {});
    const entry = clientMap[clientName];
    if (!entry) return null;
    return entry[roleId] ?? null;
  },

  // Returns true if userName currently holds roleId.
  userHoldsRole(userName, roleId) {
    if (!userName || !roleId) return false;
    return store.resolveRoleUsers(roleId).some(u => u.name === userName);
  },

  // Continuity lookup — scans this specific process/task's own past
  // role-attributed assignments (roleHistory: array of { roleId, assignee }
  // entries, most recent last) for one made under roleId, and returns the
  // assignee from the most recent match. Returns null if this role has never
  // been resolved for this process/task before — genuinely the first time.
  // Deliberately does NOT check who currently holds the process/task, nor
  // whether that person still holds roleId today: continuity follows this
  // specific record's own history, not present-day role membership.
  findPastRoleAssignee(roleHistory, roleId) {
    if (!roleId || !roleHistory || roleHistory.length === 0) return null;
    for (let i = roleHistory.length - 1; i >= 0; i--) {
      if (roleHistory[i].roleId === roleId && roleHistory[i].assignee) {
        return roleHistory[i].assignee;
      }
    }
    return null;
  },

  // Resolve the responsible user for a given task type id.
  // Priority: client-specific role assignment first; then, if this task has
  // previously had this exact role resolved for it (per roleHistory), reuse
  // that same person regardless of who holds the task now or who else has
  // held it under a different role since; otherwise round-robin among role
  // holders — only when this role is genuinely being resolved for this task
  // for the first time.
  assignForTaskType(typeId, clientName, roleHistory) {
    const mapeamento = load("crm_mapeamento", DEFAULT_MAPEAMENTO);
    const roleId = mapeamento.taskType?.[typeId] ?? null;
    const clientAssignee = store.resolveClientRoleAssignment(clientName, roleId);
    if (clientAssignee) return clientAssignee;
    const pastAssignee = store.findPastRoleAssignee(roleHistory, roleId);
    if (pastAssignee) return pastAssignee;
    return store.assignRoundRobin(roleId);
  },

  // Resolve the responsible user for a given process status id.
  // Same client-first, role-history-continuity logic as assignForTaskType.
  assignForProcessStatus(statusId, clientName, roleHistory) {
    const mapeamento = load("crm_mapeamento", DEFAULT_MAPEAMENTO);
    const roleId = mapeamento.processoStatus?.[statusId] ?? null;
    const clientAssignee = store.resolveClientRoleAssignment(clientName, roleId);
    if (clientAssignee) return clientAssignee;
    const pastAssignee = store.findPastRoleAssignee(roleHistory, roleId);
    if (pastAssignee) return pastAssignee;
    return store.assignRoundRobin(roleId);
  },

  // Resolve the responsible user for a given task status id (e.g.
  // Cancelamento Pendente), reading mapeamento.taskStatus rather than
  // mapeamento.taskType — the two are configured independently in the
  // Mapeamento tab. Same client-first, role-history-continuity logic as
  // assignForTaskType/assignForProcessStatus.
  assignForTaskStatus(statusId, clientName, roleHistory) {
    const mapeamento = load("crm_mapeamento", DEFAULT_MAPEAMENTO);
    const roleId = mapeamento.taskStatus?.[statusId] ?? null;
    const clientAssignee = store.resolveClientRoleAssignment(clientName, roleId);
    if (clientAssignee) return clientAssignee;
    const pastAssignee = store.findPastRoleAssignee(roleHistory, roleId);
    if (pastAssignee) return pastAssignee;
    return store.assignRoundRobin(roleId);
  },

  // ── Processos ──────────────────────────────────────────────────────────────
  getProcessos()           { return load("crm_processos", PROCESSOS); },
  saveProcessos(processos) { save("crm_processos", processos); },

  // ── Tarefas (tasks) ────────────────────────────────────────────────────────
  getTarefas()         { return load("crm_tarefas", TAREFAS); },
  saveTarefas(tarefas) { save("crm_tarefas", tarefas); },

  // ── Inbox emails ───────────────────────────────────────────────────────────
  getInboxEmails()       { return load("crm_inbox", INBOX_EMAILS); },
  saveInboxEmails(items) { save("crm_inbox", items); },

  // ── SLA settings ─────────────────────────────────────────────────────────────
  getSLASettings() { return load("crm_sla", {}); },
  saveSLASettings(settings) { save("crm_sla", settings); },

  // ── Column visibility preferences (keyed by user email) ───────────────────
  getColumnPrefs(email) {
    const all = load("crm_col_prefs", {});
    return all[email] ?? null;
  },
  saveColumnPrefs(email, prefs) {
    const all = load("crm_col_prefs", {});
    all[email] = prefs;
    save("crm_col_prefs", all);
  },

  // ── Sort preferences (keyed by user email) ─────────────────────────────────
  getSortPrefs(email) {
    const all = load("crm_sort_prefs", {});
    return all[email] ?? { col: null, dir: "asc" };
  },
  saveSortPrefs(email, prefs) {
    const all = load("crm_sort_prefs", {});
    all[email] = prefs;
    save("crm_sort_prefs", all);
  },
};
