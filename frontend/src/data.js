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

// today is fixed for mock data so urgency tags are deterministic
const TODAY = new Date("2026-04-27");
export const daysLeft = (ddmmyyyy) =>
  Math.round((new Date(ddmmyyyy.split("/").reverse().join("-")) - TODAY) / 86400000);

export const PROCESSOS = [
  {
    id: "2004470", created: "20/04/2026", deadline: "21/04/2026", priority: "Normal",
    status: 3, fu: "Provável",
    client: "AMF – Agentes de Formação",
    ref: "E26091", brand: "CAT – LUBRIFICAÇÃO", model: "", vin: "",
    owner: "Tiago Pinto", comm: "João Morais", compra: "Carlos Andrade",
    req: "Teodósio Nzunda", price: null, emails: 4,
    note: "Atualizado com sucesso",
    timeline: [
      { icon: "mail",  color: "#3b82f6", time: "20/04 09:12", text: "Email recebido de Teodósio Nzunda — pedido de cotação CAT – LUBRIFICAÇÃO" },
      { icon: "cpu",   color: "#7c3aed", time: "20/04 09:13", text: "IA classificou: Pedido de Cotação · Cliente: AMF · Equipamento: CAT – LUBRIFICAÇÃO" },
      { icon: "user",  color: "#64748b", time: "20/04 09:14", text: "Processo atribuído a Tiago Pinto" },
      { icon: "check", color: "#10b981", time: "20/04 11:30", text: "Cotação enviada ao cliente" },
    ],
  },
  {
    id: "2004624", created: "27/04/2026", deadline: "28/04/2026", priority: "Normal",
    status: 1, fu: "Provável",
    client: "Mauto – Garagem Oliveira",
    ref: "35112019", brand: "SMARTPOWER", model: "DC1065/B", vin: "",
    owner: "Adelina Rodrigues", comm: "João Morais", compra: "Carlos Andrade",
    req: "Evedson Figueiredo", price: null, emails: 1,
    note: "",
    timeline: [
      { icon: "mail", color: "#3b82f6", time: "27/04 08:05", text: "Email recebido de Evedson Figueiredo — pedido de cotação SMARTPOWER DC1065/B" },
      { icon: "cpu",  color: "#7c3aed", time: "27/04 08:06", text: "IA classificou: Pedido de Cotação · Cliente: Mauto · Equipamento: SMARTPOWER DC1065/B" },
      { icon: "user", color: "#64748b", time: "27/04 08:07", text: "Processo atribuído a Adelina Rodrigues" },
    ],
  },
  {
    id: "2004623", created: "27/04/2026", deadline: "28/04/2026", priority: "Normal",
    status: 1, fu: "Provável",
    client: "Sociedade Mineira do Puri, LDA",
    ref: "RJ382/M20", brand: "VOLVO", model: "EC750L", vin: "VOE123456",
    owner: "Vasco Lourenço", comm: "João Morais", compra: "Carlos Andrade",
    req: "Elmo Costa", price: null, emails: 1,
    note: "",
    timeline: [
      { icon: "mail", color: "#3b82f6", time: "27/04 10:22", text: "Email recebido de Elmo Costa — pedido de cotação VOLVO EC750L" },
      { icon: "cpu",  color: "#7c3aed", time: "27/04 10:23", text: "IA classificou: Pedido de Cotação · Cliente: Soc. Mineira do Puri · Equipamento: VOLVO EC750L" },
      { icon: "user", color: "#64748b", time: "27/04 10:24", text: "Processo atribuído a Vasco Lourenço" },
    ],
  },
  {
    id: "2004622", created: "27/04/2026", deadline: "28/04/2026", priority: "Normal",
    status: 5, fu: "Provável",
    client: "Vendap II",
    ref: "", brand: "JCB", model: "", vin: "",
    owner: "Adelina Rodrigues", comm: "João Morais", compra: "Carlos Andrade",
    req: "Sérgio Maia", price: 42500, emails: 7,
    note: "",
    timeline: [
      { icon: "mail",  color: "#3b82f6", time: "27/04 11:00", text: "Email recebido de Sérgio Maia — pedido de cotação JCB" },
      { icon: "cpu",   color: "#7c3aed", time: "27/04 11:01", text: "IA classificou: Pedido de Cotação · Cliente: Vendap II · Equipamento: JCB" },
      { icon: "user",  color: "#64748b", time: "27/04 11:02", text: "Processo atribuído a Adelina Rodrigues" },
      { icon: "check", color: "#10b981", time: "27/04 14:00", text: "Cotação enviada — €42.500" },
    ],
  },
  {
    id: "2004621", created: "27/04/2026", deadline: "28/04/2026", priority: "Normal",
    status: 4, fu: "Provável",
    client: "Mencons Engenharia e Construção Civil",
    ref: "SMA0119/2026", brand: "VOLVO", model: "EC360BLC", vin: "",
    owner: "Adelina Rodrigues", comm: "João Morais", compra: "Carlos Andrade",
    req: "Andelson Chaves", price: null, emails: 3,
    note: "",
    timeline: [
      { icon: "mail", color: "#3b82f6", time: "27/04 09:45", text: "Email recebido de Andelson Chaves — pedido de cotação VOLVO EC360BLC" },
      { icon: "cpu",  color: "#7c3aed", time: "27/04 09:46", text: "IA classificou: Pedido de Cotação · Cliente: Mencons · Equipamento: VOLVO EC360BLC" },
      { icon: "user", color: "#64748b", time: "27/04 09:47", text: "Processo atribuído a Adelina Rodrigues" },
      { icon: "mail", color: "#3b82f6", time: "27/04 15:00", text: "Cliente enviou esclarecimento adicional sobre o modelo" },
    ],
  },
  {
    id: "2004620", created: "27/04/2026", deadline: "28/04/2026", priority: "Alta",
    status: 5, fu: "Confirmado",
    client: "Planasul Engenharia e Construções",
    ref: "", brand: "VOLVO", model: "EC360BLC PRIME", vin: "VOE789012",
    owner: "Adelina Rodrigues", comm: "João Morais", compra: "Carlos Andrade",
    req: "Rui Barros", price: 89000, emails: 5,
    note: "",
    timeline: [
      { icon: "mail",  color: "#3b82f6", time: "27/04 08:30", text: "Email recebido de Rui Barros — pedido urgente VOLVO EC360BLC PRIME" },
      { icon: "cpu",   color: "#7c3aed", time: "27/04 08:31", text: "IA classificou: Pedido de Cotação · Urgência: Alta · Equipamento: VOLVO EC360BLC PRIME" },
      { icon: "user",  color: "#64748b", time: "27/04 08:32", text: "Processo atribuído a Adelina Rodrigues (Alta Prioridade)" },
      { icon: "check", color: "#10b981", time: "27/04 12:00", text: "Cotação enviada — €89.000" },
    ],
  },
  {
    id: "2004590", created: "22/04/2026", deadline: "25/04/2026", priority: "Alta",
    status: 4, fu: "Em Risco",
    client: "Construtora Horizonte SA",
    ref: "CH/2026/04", brand: "CATERPILLAR", model: "320GC", vin: "CAT320GC001",
    owner: "Marta Costa", comm: "Ana Ferreira", compra: "Carlos Andrade",
    req: "Luísa Pinto", price: 165000, emails: 9,
    note: "Cliente aguarda resposta urgente",
    timeline: [
      { icon: "mail",  color: "#3b82f6", time: "22/04 14:10", text: "Email recebido de Luísa Pinto — CATERPILLAR 320GC" },
      { icon: "cpu",   color: "#7c3aed", time: "22/04 14:11", text: "IA classificou: Pedido de Cotação · Urgência: Alta" },
      { icon: "user",  color: "#64748b", time: "22/04 14:12", text: "Processo atribuído a Marta Costa" },
      { icon: "alert", color: "#dc2626", time: "25/04 09:00", text: "Prazo atingido — sem resposta do cliente" },
    ],
  },
  {
    id: "2004512", created: "15/04/2026", deadline: "22/04/2026", priority: "Normal",
    status: 6, fu: "Confirmado",
    client: "TerraMovida Lda",
    ref: "TM-0088", brand: "VOLVO", model: "L90H", vin: "VOL90H2024",
    owner: "João Silva", comm: "Ricardo Neves", compra: "Carlos Andrade",
    req: "Carlos Menezes", price: 210000, emails: 12,
    note: "Negócio fechado",
    timeline: [
      { icon: "mail",  color: "#3b82f6", time: "15/04 10:00", text: "Email recebido de Carlos Menezes — VOLVO L90H" },
      { icon: "cpu",   color: "#7c3aed", time: "15/04 10:01", text: "IA classificou: Pedido de Cotação · Equipamento: VOLVO L90H" },
      { icon: "user",  color: "#64748b", time: "15/04 10:02", text: "Processo atribuído a João Silva" },
      { icon: "check", color: "#10b981", time: "18/04 16:00", text: "Cotação aceite — negócio fechado" },
    ],
  },
  {
    id: "2004480", created: "21/04/2026", deadline: "23/04/2026", priority: "Alta",
    status: 7, fu: "Perdido",
    client: "Obras Nacionais SARL",
    ref: "ON-2026-33", brand: "JCB", model: "JS220", vin: "",
    owner: "Tiago Pinto", comm: "João Morais", compra: "Carlos Andrade",
    req: "Manuel Faria", price: null, emails: 6,
    note: "Cliente escolheu concorrente",
    timeline: [
      { icon: "mail",  color: "#3b82f6", time: "21/04 11:00", text: "Email recebido de Manuel Faria — JCB JS220" },
      { icon: "cpu",   color: "#7c3aed", time: "21/04 11:01", text: "IA classificou: Pedido de Cotação · Equipamento: JCB JS220" },
      { icon: "user",  color: "#64748b", time: "21/04 11:02", text: "Processo atribuído a Tiago Pinto" },
      { icon: "x",     color: "#dc2626", time: "23/04 17:00", text: "Processo marcado como Perdido — cliente escolheu concorrente" },
    ],
  },
  {
    id: "2004610", created: "26/04/2026", deadline: "30/04/2026", priority: "Normal",
    status: 2, fu: "Aguarda Resposta",
    client: "BetãoCerto Construções",
    ref: "BC-291", brand: "LIEBHERR", model: "LTM 1100", vin: "",
    owner: "Vasco Lourenço", comm: "Ana Ferreira", compra: "Carlos Andrade",
    req: "Rui Cardoso", price: null, emails: 2,
    note: "Email recebido há 2h — análise em curso",
    timeline: [
      { icon: "mail", color: "#3b82f6", time: "26/04 16:00", text: "Email recebido de Rui Cardoso — LIEBHERR LTM 1100" },
      { icon: "cpu",  color: "#7c3aed", time: "26/04 16:01", text: "IA classificou: Pedido de Cotação · Equipamento: LIEBHERR LTM 1100" },
      { icon: "user", color: "#64748b", time: "26/04 16:02", text: "Processo atribuído a Vasco Lourenço" },
    ],
  },
];

export const ROLE_LABELS = {
  admin:     "Administrador",
  comercial: "Resp. Comercial",
  cotacao:   "Resp. Cotação",
  compra:    "Resp. Compra",
  viewer:    "Visualizador",
};
