/**
 * Seed data — used by store.js as the fallback defaults when localStorage
 * has no saved values yet. These are the only arrays that belong here.
 * Do not import this file directly from components.
 */

export const STAGES = [
  { id: 1, label: "1. Entrada",          color: "#475569", bg: "#f1f5f9" },
  { id: 2, label: "2. Em Análise",       color: "#7c3aed", bg: "#f5f3ff" },
  { id: 3, label: "3. Cotação Enviada",  color: "#0369a1", bg: "#e0f2fe" },
  { id: 4, label: "4. Consulta",         color: "#b45309", bg: "#fef3c7" },
  { id: 5, label: "5. Para Fechar",      color: "#be185d", bg: "#fdf2f8" },
  { id: 6, label: "6. Ganho",            color: "#15803d", bg: "#f0fdf4" },
  { id: 7, label: "7. Perdido",          color: "#dc2626", bg: "#fef2f2" },
];

export const FOLLOWUP_STATUSES = [
  { id: 1, label: "Provável",         bg: "#dbeafe", color: "#1d4ed8" },
  { id: 2, label: "Confirmado",       bg: "#dcfce7", color: "#15803d" },
  { id: 3, label: "Em Risco",         bg: "#fef3c7", color: "#b45309" },
  { id: 4, label: "Perdido",          bg: "#fee2e2", color: "#dc2626" },
  { id: 5, label: "Aguarda Resposta", bg: "#f3e8ff", color: "#7c3aed" },
];

export const USERS = [
  { id: 1,  name: "Adelina Rodrigues", email: "adelina@promaster.co",  role: "cotacao",   active: true },
  { id: 2,  name: "Tiago Pinto",       email: "tiago@promaster.co",    role: "cotacao",   active: true },
  { id: 3,  name: "Vasco Lourenço",    email: "vasco@promaster.co",    role: "cotacao",   active: true },
  { id: 4,  name: "João Silva",        email: "joao.s@promaster.co",   role: "cotacao",   active: true },
  { id: 5,  name: "Marta Costa",       email: "marta@promaster.co",    role: "cotacao",   active: true },
  { id: 6,  name: "João Morais",       email: "joao.m@promaster.co",   role: "comercial", active: true },
  { id: 7,  name: "Ana Ferreira",      email: "ana@promaster.co",      role: "comercial", active: true },
  { id: 8,  name: "Ricardo Neves",     email: "ricardo@promaster.co",  role: "comercial", active: true },
  { id: 9,  name: "Carlos Andrade",    email: "carlos@promaster.co",   role: "compra",    active: true },
  { id: 10, name: "Admin",             email: "admin@promaster.co",    role: "admin",     active: true },
];
