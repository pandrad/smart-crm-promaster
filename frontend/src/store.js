/**
 * Simple localStorage-backed store.
 * All admin mutations go through here so state survives panel close/reopen.
 */

import { USERS, STAGES, FOLLOWUP_STATUSES } from "./data.js";

const DEFAULT_PRIORITIES = [
  { id: 1, label: "Normal", color: "#64748b", bg: "#f1f5f9" },
  { id: 2, label: "Alta",   color: "#dc2626", bg: "#fee2e2" },
];

const DEFAULT_ROLES = [
  { id: "admin",     label: "Administrador"   },
  { id: "comercial", label: "Resp. Comercial"  },
  { id: "cotacao",   label: "Resp. Cotação"    },
  { id: "compra",    label: "Resp. Compra"     },
  { id: "viewer",    label: "Visualizador"     },
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
  getPriorities()          { return load("crm_priorities", DEFAULT_PRIORITIES); },
  savePriorities(list)     { save("crm_priorities", list); },

  // ── Roles ──────────────────────────────────────────────────────────────────
  getRoles()       { return load("crm_roles", DEFAULT_ROLES); },
  saveRoles(roles) { save("crm_roles", roles); },

  // ── AI assignment override ─────────────────────────────────────────────────
  // Stored as { cotacao: userId|null, comercial: userId|null, compra: userId|null }
  getAssignment()       { return load("crm_assignment", { cotacao: null, comercial: null, compra: null }); },
  saveAssignment(rules) { save("crm_assignment", rules); },
};
