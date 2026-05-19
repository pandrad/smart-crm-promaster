/**
 * Simple localStorage-backed store.
 * All admin mutations go through here so state survives panel close/reopen.
 */

import { USERS, STAGES, FOLLOWUP_STATUSES } from "./data.js";
import { TAREFAS, INBOX_EMAILS } from "./mock/data.js";

const DEFAULT_PRIORITIES = [
  { id: 1, label: "Normal", color: "#94a3b8", bg: "#1e293b" },
  { id: 2, label: "Alta",   color: "#f87171", bg: "#2d0a0a" },
];

const DEFAULT_ROLES = [
  { id: "admin",      label: "Administrador"   },
  { id: "supervisor", label: "Supervisor"       },
  { id: "comercial",  label: "Resp. Comercial"  },
  { id: "cotacao",    label: "Resp. Cotação"    },
  { id: "compra",     label: "Resp. Compra"     },
  { id: "viewer",     label: "Visualizador"     },
];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers()       { return load("crm_users", USERS); },
  saveUsers(users) { save("crm_users", users); },

  // ── Stages ─────────────────────────────────────────────────────────────────
  getStages()        { return load("crm_stages", STAGES); },
  saveStages(stages) { save("crm_stages", stages); },

  // ── Follow-up statuses ─────────────────────────────────────────────────────
  getFUStatuses()    { return load("crm_fu", FOLLOWUP_STATUSES); },
  saveFUStatuses(fu) { save("crm_fu", fu); },

  // ── Priorities ─────────────────────────────────────────────────────────────
  getPriorities()      { return load("crm_priorities", DEFAULT_PRIORITIES); },
  savePriorities(list) { save("crm_priorities", list); },

  // ── Roles ──────────────────────────────────────────────────────────────────
  getRoles()       { return load("crm_roles", DEFAULT_ROLES); },
  saveRoles(roles) { save("crm_roles", roles); },

  getRoleLabel(id) {
    const roles = load("crm_roles", DEFAULT_ROLES);
    return roles.find(r => r.id === id)?.label ?? id;
  },

  // ── Process role assignment (cotacao / comercial / compra) ────────────────
  getAssignment()       { return load("crm_assignment", { cotacao: null, comercial: null, compra: null }); },
  saveAssignment(rules) { save("crm_assignment", rules); },

  // ── Task type assignment ───────────────────────────────────────────────────
  // Maps each task type to a default owner name (string) or null.
  // null → task appears in Supervisor/Admin list for manual assignment.
  // Configured via the "Atribuição de Tarefas" admin tab (task section).
  getTaskAssignment() {
    return load("crm_task_assignment", {
      "Validação de Processo": "Adelina Rodrigues", // Resp. Cotação validates before opening
      "Pré-Entrada":           "Adelina Rodrigues",
      "Desconto":              "Marta Costa",
      "Status Encomenda":      "Tiago Pinto",
      "Contas Correntes":      "Adelina Rodrigues",
      "Cliente Novo":          "Vasco Lourenço",
      "Diversos":              null,
      "Follow-up":             "João Silva",
      "Escalação":             null,
    });
  },
  saveTaskAssignment(rules) { save("crm_task_assignment", rules); },

  // ── Tarefas (tasks) ────────────────────────────────────────────────────────
  getTarefas()         { return load("crm_tarefas", TAREFAS); },
  saveTarefas(tarefas) { save("crm_tarefas", tarefas); },

  // ── Inbox emails ───────────────────────────────────────────────────────────
  getInboxEmails()       { return load("crm_inbox", INBOX_EMAILS); },
  saveInboxEmails(items) { save("crm_inbox", items); },

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
