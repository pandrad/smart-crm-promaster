/**
 * Seed data — used by store.js as the fallback defaults when localStorage
 * has no saved values yet. These are the only arrays that belong here.
 * Do not import this file directly from components.
 */

export const STAGES = [
  { id:  1, label: "1. Pré-Entrada",                color: "#94a3b8", bg: "#1e293b" },
  { id:  2, label: "2. Pendente Cliente",            color: "#b45309", bg: "#1c1005" },
  { id:  3, label: "3. Análise Técnica Promaster",   color: "#7c3aed", bg: "#2e1065" },
  { id:  4, label: "4. Abrir Processo",              color: "#0369a1", bg: "#0c1a2e" },
  { id: 45, label: "Em Abertura",                    color: "#1d4ed8", bg: "#0c1a2e", optional: true },
  { id:  5, label: "5. Entrada",                     color: "#475569", bg: "#1e293b" },
  { id:  6, label: "6. Consulta",                    color: "#0891b2", bg: "#0c2231" },
  { id:  7, label: "7. Para Fechar",                 color: "#be185d", bg: "#2d0a1e" },
  { id:  8, label: "8. Fechado",                     color: "#15803d", bg: "#0a2015" },
  { id:  9, label: "9. FP Para Envio",               color: "#65a30d", bg: "#131d04" },
  { id: 10, label: "10. Enviado",                    color: "#0ea5e9", bg: "#0c2231" },
  { id: 11, label: "11. Enviado Pendente",           color: "#f59e0b", bg: "#1c1005" },
  { id: 12, label: "12. Adjudicado",                 color: "#22c55e", bg: "#052e16" },
  { id: 13, label: "13. Cancelado",                  color: "#dc2626", bg: "#2d0a0a" },
];

export const FOLLOWUP_STATUSES = [
  { id: 1, label: "Provável",         bg: "#1e3a5f", color: "#60a5fa" },
  { id: 2, label: "Confirmado",       bg: "#052e16", color: "#4ade80" },
  { id: 3, label: "Em Risco",         bg: "#1c1005", color: "#fbbf24" },
  { id: 4, label: "Perdido",          bg: "#2d0a0a", color: "#f87171" },
  { id: 5, label: "Aguarda Resposta", bg: "#2e1065", color: "#c084fc" },
];

export const USERS = [
  { id:  1, name: "Adelina Rodrigues",      email: "adelina.rodrigues@promaster.co.ao",  role: "resp-pre-entrada",  active: true },
  { id:  2, name: "Alexandra Lima",         email: "alexandra.lima@oss-eu.com",          role: null,                active: true },
  { id:  3, name: "Augusto Gouveia",        email: "augusto.gouveia@promaster.co.ao",    role: "resp-abertura",     active: true },
  { id:  4, name: "Braulio Lourenço",       email: "braulio.lourenco@promaster.co.ao",   role: "resp-abertura",     active: true },
  { id:  5, name: "Erânio Cassanga",        email: "eranio.cassanga@promaster.co.ao",    role: "resp-abertura",     active: true },
  { id:  6, name: "Francisco Leitão",       email: "francisco.leitao@promaster.co.ao",   role: "resp-pre-entrada",  active: true },
  { id:  7, name: "Gabriel Dala",           email: "gabriel.dala@promaster.co.ao",       role: "resp-abertura",     active: true },
  { id:  8, name: "João Chiquica",          email: "joao.chiquica@promaster.co.ao",      role: "resp-abertura",     active: true },
  { id:  9, name: "João Morais",            email: "joao.morais@promaster.co.ao",        role: "supervisor",        active: true },
  { id: 10, name: "Joaquim César",          email: "joaquim.cesar@promaster.co.ao",      role: "resp-contas",       active: true },
  { id: 11, name: "Luís Quelhas Valente",   email: "luis.valente@promaster.co.ao",       role: "admin",             active: true },
  { id: 12, name: "Lukeny Campos",          email: "lukeny.campos@promaster.co.ao",      role: "resp-abertura",     active: true },
  { id: 13, name: "Susete Ferreira",        email: "susete.ferreira@promaster.co.ao",    role: "admin",             active: true },
  { id: 14, name: "Tiago Pinto",            email: "tiago.pinto@promaster.co.ao",        role: "resp-pre-entrada",  active: true },
];
