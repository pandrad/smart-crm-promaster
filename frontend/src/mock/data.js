/**
 * All hardcoded mock data used during Stage 1 (no backend).
 * When the real API is wired up in Stage 5, imports of these constants
 * are replaced by calls to src/api/client.js — nothing else changes.
 */

// ── Auth ──────────────────────────────────────────────────────────────────────
// Used by Login.jsx. Replaced by POST /login in Stage 5.
export const MOCK_CREDENTIALS = [
  { email: "admin@promaster.co",   password: "admin123",  role: "admin",   name: "Admin" },
  { email: "adelina@promaster.co", password: "pass123",   role: "cotacao", name: "Adelina Rodrigues" },
];

// ── Toast demo ────────────────────────────────────────────────────────────────
// Simulates a live email notification arriving. Replaced by a real WebSocket
// or polling event in Stage 5.
export const MOCK_TOAST = {
  sender:    "carlos.menezes@terramovida.pt",
  excerpt:   "Solicito cotação urgente para VOLVO EC480E…",
  equipment: "VOLVO EC480E",
  isNew:     true,
  processId: "2004631",
};

// ── Import preview ────────────────────────────────────────────────────────────
// Sample rows shown in the admin Import tab before a real file is uploaded.
export const MOCK_IMPORT_PREVIEW = [
  ["2003001", "Cliente Exemplo Lda", "VOLVO", "EC360BLC", "Entrada",    "15/05/2026"],
  ["2003002", "Construtora Demo SA", "CAT",   "320GC",    "Em Análise", "20/05/2026"],
  ["2003003", "Obras Angola SARL",   "JCB",   "JS220",    "Ganho",      "10/04/2026"],
];
