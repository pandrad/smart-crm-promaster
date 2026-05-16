/**
 * API client — Stage 1 stubs.
 *
 * Every function here mirrors the real endpoint it will call in Stage 5.
 * Components import from this file only; switching to the real backend
 * means replacing the stub bodies below — no changes needed in components.
 *
 * Stub pattern:
 *   return Promise.resolve(<mock data>)   →   return fetch('/api/...')
 */

import { MOCK_CREDENTIALS, PROCESSOS } from "../mock/data.js";
import { store } from "../store.js";

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * POST /login
 * Returns the logged-in user object or null on bad credentials.
 */
export async function login(email, password) {
  const user = MOCK_CREDENTIALS.find(
    u => u.email === email && u.password === password
  );
  return Promise.resolve(user ?? null);
}

// ── Processos ─────────────────────────────────────────────────────────────────

/**
 * GET /processos
 * Returns the full list of process records.
 */
export async function getProcessos() {
  return Promise.resolve(PROCESSOS);
}

/**
 * PATCH /processos/:id
 * Persists a status / FU / assignment change on a single process.
 */
export async function updateProcesso(id, patch) {
  // No-op in mock mode — state is managed in Main.jsx
  return Promise.resolve({ id, ...patch });
}

// ── Reference data ────────────────────────────────────────────────────────────

/**
 * GET /users
 * Returns the active user list.
 */
export async function getUsers() {
  return Promise.resolve(store.getUsers());
}

/**
 * GET /statuses
 * Returns the process stage list.
 */
export async function getStages() {
  return Promise.resolve(store.getStages());
}

/**
 * GET /followup-statuses
 * Returns the follow-up status list.
 */
export async function getFUStatuses() {
  return Promise.resolve(store.getFUStatuses());
}

/**
 * GET /priorities
 */
export async function getPriorities() {
  return Promise.resolve(store.getPriorities());
}
