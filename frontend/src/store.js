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

const DEFAULT_TASK_TYPES = [
  { id: 1,  label: "Validação de Processo", color: "#93c5fd", bg: "#0c1a2e" },
  { id: 2,  label: "Não Classificado",      color: "#f87171", bg: "#2d0a0a" },
  { id: 3,  label: "Pré-Entrada",           color: "#60a5fa", bg: "#1e3a5f" },
  { id: 4,  label: "Desconto",              color: "#fbbf24", bg: "#1c1005" },
  { id: 5,  label: "Status Encomenda",      color: "#4ade80", bg: "#052e16" },
  { id: 6,  label: "Contas Correntes",      color: "#fb923c", bg: "#1c1005" },
  { id: 7,  label: "Cliente Novo",          color: "#c084fc", bg: "#2e1065" },
  { id: 8,  label: "Diversos",              color: "#94a3b8", bg: "#1e293b" },
  { id: 9,  label: "Follow-up",             color: "#38bdf8", bg: "#0c2231" },
  { id: 10, label: "Escalação",             color: "#f87171", bg: "#2d0a0a" },
  { id: 11, label: "Abertura de Processo",  color: "#4ade80", bg: "#0a2015" },
];

const DEFAULT_TASK_STATUSES = [
  { id: 1, label: "Por Fazer",             color: "#94a3b8", bg: "#1e293b" },
  { id: 2, label: "Em Curso",              color: "#60a5fa", bg: "#1e3a5f" },
  { id: 3, label: "Devolvido",             color: "#fb923c", bg: "#1c1005" },
  { id: 4, label: "Escalado",              color: "#e879f9", bg: "#2d0a2d" },
  { id: 5, label: "Concluído",             color: "#4ade80", bg: "#052e16" },
  { id: 6, label: "Cancelado",             color: "#64748b", bg: "#1e293b" },
  { id: 7, label: "Cancelamento Pendente", color: "#fb923c", bg: "#2d1505" },
];

const DEFAULT_ROLES = [
  { id: "admin",      label: "Administrador"   },
  { id: "supervisor", label: "Supervisor"       },
  { id: "comercial",  label: "Resp. Comercial"  },
  { id: "cotacao",    label: "Resp. Cotação"    },
  { id: "compra",     label: "Resp. Compra"     },
  { id: "abertura",   label: "Resp. Abertura"   },
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
      "Validação de Processo": "Adelina Rodrigues",
      "Não Classificado":      null,               // routes to Supervisor for manual triage
      "Abertura de Processo":  null,               // assigned to Resp. Abertura when configured
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

  // ── Task types (admin-configurable, label + colour) ──────────────────────────
  getTaskTypes()           { return load("crm_task_types",    DEFAULT_TASK_TYPES);    },
  saveTaskTypes(list)      { save("crm_task_types",    list); },

  // ── Task statuses (admin-configurable, label + colour) ───────────────────────
  getTaskStatuses()        { return load("crm_task_statuses", DEFAULT_TASK_STATUSES); },
  saveTaskStatuses(list)   { save("crm_task_statuses", list); },

  // ── SLA settings ─────────────────────────────────────────────────────────────
  getSLASettings() {
    return load("crm_sla", {
      tasks: {
        "Por Fazer":  48,
        "Em Curso":   72,
        "Devolvido":  24,
        "Escalado":   4,
      },
      stages: {
        1:  1,
        2:  2,
        3:  3,
        4:  3,
        5:  5,
        6:  2,
        7:  3,
        8:  3,
        9:  5,
        10: 7,
        11: 1,
      },
    });
  },
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
