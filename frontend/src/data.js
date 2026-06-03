/**
 * Seed data — used by store.js as the fallback defaults when localStorage
 * has no saved values yet. These are the only arrays that belong here.
 * Do not import this file directly from components.
 */

export const STAGES = [
  { id:  1, label: "1. Entrada",           color: "#475569", bg: "#1e293b" },
  { id:  2, label: "2. Qualificacao",       color: "#7c3aed", bg: "#2e1065" },
  { id:  3, label: "3. Pendente Cliente",   color: "#b45309", bg: "#1c1005", optional: true },
  { id:  4, label: "4. Pendente Master",    color: "#0369a1", bg: "#0c1a2e", optional: true },
  { id:  5, label: "5. Consulta",           color: "#0891b2", bg: "#0c2231" },
  { id:  6, label: "6. Para Fechar",        color: "#be185d", bg: "#2d0a1e" },
  { id:  7, label: "7. Fechado",            color: "#15803d", bg: "#0a2015" },
  { id:  8, label: "8. Fechado Pendente",   color: "#65a30d", bg: "#131d04" },
  { id:  9, label: "9. Enviado",            color: "#0ea5e9", bg: "#0c2231" },
  { id: 10, label: "10. Encomenda",         color: "#22c55e", bg: "#052e16" },
  { id: 11, label: "11. Cancelado",         color: "#dc2626", bg: "#2d0a0a" },
];

export const FOLLOWUP_STATUSES = [
  { id: 1, label: "Provável",         bg: "#1e3a5f", color: "#60a5fa" },
  { id: 2, label: "Confirmado",       bg: "#052e16", color: "#4ade80" },
  { id: 3, label: "Em Risco",         bg: "#1c1005", color: "#fbbf24" },
  { id: 4, label: "Perdido",          bg: "#2d0a0a", color: "#f87171" },
  { id: 5, label: "Aguarda Resposta", bg: "#2e1065", color: "#c084fc" },
];

export const USERS = [
  { id:  1, name: "Adelina Rodrigues", email: "adelina@promaster.co",    role: "cotacao",    active: true },
  { id:  2, name: "Tiago Pinto",       email: "tiago@promaster.co",      role: "cotacao",    active: true },
  { id:  3, name: "Vasco Lourenço",    email: "vasco@promaster.co",      role: "cotacao",    active: true },
  { id:  4, name: "João Silva",        email: "joao.s@promaster.co",     role: "cotacao",    active: true },
  { id:  5, name: "Marta Costa",       email: "marta@promaster.co",      role: "cotacao",    active: true },
  { id:  6, name: "João Morais",       email: "joao.m@promaster.co",     role: "comercial",  active: true },
  { id:  7, name: "Ana Ferreira",      email: "ana@promaster.co",        role: "comercial",  active: true },
  { id:  8, name: "Ricardo Neves",     email: "ricardo@promaster.co",    role: "comercial",  active: true },
  { id:  9, name: "Carlos Andrade",    email: "carlos@promaster.co",     role: "compra",     active: true },
  { id: 10, name: "Admin",             email: "admin@promaster.co",      role: "admin",      active: true },
  { id: 11, name: "Supervisor",        email: "supervisor@promaster.co", role: "supervisor", active: true },
  { id: 12, name: "Luísa Baptista",    email: "luisa@promaster.co",      role: "abertura",   active: true },
];
