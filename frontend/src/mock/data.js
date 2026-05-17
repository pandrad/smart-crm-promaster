/**
 * All hardcoded mock data used during Stage 1 (no backend).
 * When the real API is wired up in Stage 5, imports of these constants
 * are replaced by calls to src/api/client.js — nothing else changes.
 *
 * Process number format: AAMMMNNN
 *   AA  = last 2 digits of year  (26)
 *   MMM = month zero-padded      (05)
 *   NNN = sequential per month   (001, 002, …)
 */

// ── Auth ──────────────────────────────────────────────────────────────────────
export const MOCK_CREDENTIALS = [
  { email: "admin@promaster.co",      password: "admin123",  role: "admin",      name: "Admin" },
  { email: "adelina@promaster.co",    password: "pass123",   role: "cotacao",    name: "Adelina Rodrigues" },
  { email: "supervisor@promaster.co", password: "super123",  role: "supervisor", name: "Supervisor" },
];

// ── Toast demo ────────────────────────────────────────────────────────────────
export const MOCK_TOAST = {
  sender:    "carlos.menezes@terramovida.pt",
  excerpt:   "Solicito cotação urgente para VOLVO EC480E…",
  equipment: "VOLVO EC480E",
  isNew:     true,
  processId: "2605011",
};

// ── Import preview ────────────────────────────────────────────────────────────
export const MOCK_IMPORT_PREVIEW = [
  ["2605001", "Cliente Exemplo Lda", "VOLVO", "EC360BLC", "Entrada",    "15/05/2026"],
  ["2605002", "Construtora Demo SA", "CAT",   "320GC",    "Qualificacao","20/05/2026"],
  ["2605003", "Obras Angola SARL",   "JCB",   "JS220",    "Encomenda",  "10/04/2026"],
];

// ── Process records ───────────────────────────────────────────────────────────
// IDs follow AAMMMNNN format. Replaced by GET /processos in Stage 5.
// fu field only present when status >= 9 (Enviado).
// price only present when status >= 9.
// carryover: true = carried over from previous month (April), still open.
// archived: true = older than 3 years, not shown in main list.
export const PROCESSOS = [
  // ── Current month (May 2026) ──────────────────────────────────────────────

  {
    id: "2605001", created: "02/05/2026", deadline: "05/05/2026", priority: "Normal",
    status: 1, // Entrada
    client: "Mauto – Garagem Oliveira",
    ref: "35112019", brand: "SMARTPOWER", model: "DC1065/B", vin: "",
    owner: "Adelina Rodrigues", comm: "João Morais", compra: "Carlos Andrade",
    comprador: "Evedson Figueiredo", price: null, emails: 1,
    note: "", archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "02/05 08:05", text: "Email recebido de Evedson Figueiredo — pedido de cotação SMARTPOWER DC1065/B" },
      { icon: "cpu",   color: "#c084fc", time: "02/05 08:06", text: "IA classificou: Pedido de Cotação · Cliente: Mauto · Equipamento: SMARTPOWER DC1065/B" },
      { icon: "user",  color: "#94a3b8", time: "02/05 08:07", text: "Processo atribuído a Adelina Rodrigues" },
    ],
  },

  {
    id: "2605002", created: "03/05/2026", deadline: "06/05/2026", priority: "Normal",
    status: 2, // Qualificacao
    client: "Sociedade Mineira do Puri, LDA",
    ref: "RJ382/M20", brand: "VOLVO", model: "EC750L", vin: "VOE123456",
    owner: "Vasco Lourenço", comm: "João Morais", compra: "Carlos Andrade",
    comprador: "Elmo Costa", price: null, emails: 2,
    note: "", archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "03/05 10:22", text: "Email recebido de Elmo Costa — pedido de cotação VOLVO EC750L" },
      { icon: "cpu",   color: "#c084fc", time: "03/05 10:23", text: "IA classificou: Pedido de Cotação · Cliente: Soc. Mineira do Puri · Equipamento: VOLVO EC750L" },
      { icon: "user",  color: "#94a3b8", time: "03/05 10:24", text: "Processo atribuído a Vasco Lourenço" },
      { icon: "check", color: "#4ade80", time: "04/05 09:00", text: "Processo qualificado — cliente confirmado" },
    ],
  },

  {
    id: "2605003", created: "05/05/2026", deadline: "10/05/2026", priority: "Alta",
    status: 5, // Consulta
    client: "Construtora Horizonte SA",
    ref: "CH/2026/05", brand: "CATERPILLAR", model: "320GC", vin: "CAT320GC001",
    owner: "Marta Costa", comm: "Ana Ferreira", compra: "Carlos Andrade",
    comprador: "Luísa Pinto", price: null, emails: 4,
    note: "Cliente aguarda resposta urgente",
    archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    // consulta checklist — only present when status === 5
    consulta: { pedidoFornecedor: false, pedidoTs: null, respostaFornecedor: false, respostaTs: null },
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "05/05 14:10", text: "Email recebido de Luísa Pinto — CATERPILLAR 320GC" },
      { icon: "cpu",   color: "#c084fc", time: "05/05 14:11", text: "IA classificou: Pedido de Cotação · Urgência: Alta" },
      { icon: "user",  color: "#94a3b8", time: "05/05 14:12", text: "Processo atribuído a Marta Costa" },
      { icon: "check", color: "#4ade80", time: "07/05 10:00", text: "Entrou em Consulta — a aguardar resposta de fornecedor" },
    ],
  },

  {
    id: "2605004", created: "06/05/2026", deadline: "12/05/2026", priority: "Normal",
    status: 6, // Para Fechar
    client: "Vendap II",
    ref: "", brand: "JCB", model: "JS220", vin: "",
    owner: "Adelina Rodrigues", comm: "João Morais", compra: "Carlos Andrade",
    comprador: "Sérgio Maia", price: null, emails: 6,
    note: "", archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "06/05 11:00", text: "Email recebido de Sérgio Maia — pedido de cotação JCB JS220" },
      { icon: "cpu",   color: "#c084fc", time: "06/05 11:01", text: "IA classificou: Pedido de Cotação · Cliente: Vendap II · Equipamento: JCB JS220" },
      { icon: "user",  color: "#94a3b8", time: "06/05 11:02", text: "Processo atribuído a Adelina Rodrigues" },
      { icon: "check", color: "#4ade80", time: "10/05 15:00", text: "Cotação enviada — a negociar fecho" },
    ],
  },

  {
    id: "2605005", created: "07/05/2026", deadline: "14/05/2026", priority: "Alta",
    status: 7, // Fechado
    client: "Planasul Engenharia e Construções",
    ref: "", brand: "VOLVO", model: "EC360BLC PRIME", vin: "VOE789012",
    owner: "Adelina Rodrigues", comm: "João Morais", compra: "Carlos Andrade",
    comprador: "Rui Barros", price: null, emails: 5,
    note: "", archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "07/05 08:30", text: "Email recebido de Rui Barros — pedido urgente VOLVO EC360BLC PRIME" },
      { icon: "cpu",   color: "#c084fc", time: "07/05 08:31", text: "IA classificou: Pedido de Cotação · Urgência: Alta" },
      { icon: "user",  color: "#94a3b8", time: "07/05 08:32", text: "Processo atribuído a Adelina Rodrigues (Alta Prioridade)" },
      { icon: "check", color: "#4ade80", time: "12/05 16:00", text: "Processo fechado" },
    ],
  },

  {
    id: "2605006", created: "08/05/2026", deadline: "13/05/2026", priority: "Normal",
    status: 3, // Pendente Cliente (optional stage)
    client: "Mencons Engenharia e Construção Civil",
    ref: "SMA0119/2026", brand: "VOLVO", model: "EC360BLC", vin: "",
    owner: "Adelina Rodrigues", comm: "João Morais", compra: "Carlos Andrade",
    comprador: "Andelson Chaves", price: null, emails: 3,
    note: "A aguardar documentação do cliente",
    archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail", color: "#60a5fa", time: "08/05 09:45", text: "Email recebido de Andelson Chaves — pedido de cotação VOLVO EC360BLC" },
      { icon: "cpu",  color: "#c084fc", time: "08/05 09:46", text: "IA classificou: Pedido de Cotação · Cliente: Mencons · Equipamento: VOLVO EC360BLC" },
      { icon: "user", color: "#94a3b8", time: "08/05 09:47", text: "Processo atribuído a Adelina Rodrigues" },
      { icon: "mail", color: "#60a5fa", time: "09/05 15:00", text: "Cliente enviou esclarecimento — a aguardar documentos" },
    ],
  },

  {
    id: "2605007", created: "10/05/2026", deadline: "17/05/2026", priority: "Normal",
    status: 4, // Pendente Master (optional stage)
    client: "BetãoCerto Construções",
    ref: "BC-291", brand: "LIEBHERR", model: "LTM 1100", vin: "",
    owner: "Vasco Lourenço", comm: "Ana Ferreira", compra: "Carlos Andrade",
    comprador: "Rui Cardoso", price: null, emails: 2,
    note: "A aguardar aprovação interna",
    archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail", color: "#60a5fa", time: "10/05 16:00", text: "Email recebido de Rui Cardoso — LIEBHERR LTM 1100" },
      { icon: "cpu",  color: "#c084fc", time: "10/05 16:01", text: "IA classificou: Pedido de Cotação · Equipamento: LIEBHERR LTM 1100" },
      { icon: "user", color: "#94a3b8", time: "10/05 16:02", text: "Processo atribuído a Vasco Lourenço" },
    ],
  },

  {
    id: "2605008", created: "11/05/2026", deadline: "18/05/2026", priority: "Normal",
    status: 9, // Enviado — fu and price now visible
    fu: "Confirmado",
    client: "TerraMovida Lda",
    ref: "TM-0088", brand: "VOLVO", model: "L90H", vin: "VOL90H2024",
    owner: "João Silva", comm: "Ricardo Neves", compra: "Carlos Andrade",
    comprador: "Carlos Menezes", price: 210000, emails: 8,
    note: "Enviado — a aguardar PO",
    archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "11/05 10:00", text: "Email recebido de Carlos Menezes — VOLVO L90H" },
      { icon: "cpu",   color: "#c084fc", time: "11/05 10:01", text: "IA classificou: Pedido de Cotação · Equipamento: VOLVO L90H" },
      { icon: "user",  color: "#94a3b8", time: "11/05 10:02", text: "Processo atribuído a João Silva" },
      { icon: "check", color: "#4ade80", time: "14/05 09:00", text: "Proposta enviada ao cliente — €210.000" },
    ],
  },

  {
    id: "2605009", created: "12/05/2026", deadline: "19/05/2026", priority: "Alta",
    status: 10, // Encomenda — counts as "Ganhos"
    fu: "Confirmado",
    client: "AMF – Agentes de Formação",
    ref: "E26091", brand: "CAT – LUBRIFICAÇÃO", model: "", vin: "",
    owner: "Tiago Pinto", comm: "João Morais", compra: "Carlos Andrade",
    comprador: "Teodósio Nzunda", price: 47500, emails: 7,
    note: "Encomenda confirmada",
    archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "12/05 09:12", text: "Email recebido de Teodósio Nzunda — pedido de cotação CAT – LUBRIFICAÇÃO" },
      { icon: "cpu",   color: "#c084fc", time: "12/05 09:13", text: "IA classificou: Pedido de Cotação · Cliente: AMF · Equipamento: CAT – LUBRIFICAÇÃO" },
      { icon: "user",  color: "#94a3b8", time: "12/05 09:14", text: "Processo atribuído a Tiago Pinto" },
      { icon: "check", color: "#4ade80", time: "15/05 11:30", text: "Encomenda confirmada — €47.500" },
    ],
  },

  {
    id: "2605010", created: "13/05/2026", deadline: "15/05/2026", priority: "Alta",
    status: 11, // Cancelado
    client: "Obras Nacionais SARL",
    ref: "ON-2026-33", brand: "JCB", model: "JS220", vin: "",
    owner: "Tiago Pinto", comm: "João Morais", compra: "Carlos Andrade",
    comprador: "Manuel Faria", price: null, emails: 4,
    note: "Cliente cancelou — escolheu concorrente",
    archived: false, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "13/05 11:00", text: "Email recebido de Manuel Faria — JCB JS220" },
      { icon: "cpu",   color: "#c084fc", time: "13/05 11:01", text: "IA classificou: Pedido de Cotação · Equipamento: JCB JS220" },
      { icon: "user",  color: "#94a3b8", time: "13/05 11:02", text: "Processo atribuído a Tiago Pinto" },
      { icon: "x",     color: "#f87171", time: "15/05 17:00", text: "Processo cancelado — cliente escolheu concorrente" },
    ],
  },

  // ── Carryover from April (previous month, still open) ─────────────────────

  {
    id: "2604001", created: "15/04/2026", deadline: "22/04/2026", priority: "Normal",
    status: 2, // Qualificacao — still open, carried over
    client: "Grupo Construções do Sul SARL",
    ref: "GCS-088", brand: "KOMATSU", model: "PC490LC", vin: "",
    owner: "João Silva", comm: "Ricardo Neves", compra: "Carlos Andrade",
    comprador: "Henrique Dias", price: null, emails: 5,
    note: "Transitado de Abril — a aguardar cotação final",
    archived: false, carryover: true,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "15/04 10:00", text: "Email recebido de Henrique Dias — KOMATSU PC490LC" },
      { icon: "cpu",   color: "#c084fc", time: "15/04 10:01", text: "IA classificou: Pedido de Cotação · Equipamento: KOMATSU PC490LC" },
      { icon: "user",  color: "#94a3b8", time: "15/04 10:02", text: "Processo atribuído a João Silva" },
    ],
  },

  {
    id: "2604002", created: "20/04/2026", deadline: "27/04/2026", priority: "Alta",
    status: 5, // Consulta — carried over, now overdue
    client: "Luso-Angola Peças Lda",
    ref: "LAP-2026-04", brand: "VOLVO", model: "EC480E", vin: "VOE555888",
    owner: "Marta Costa", comm: "Ana Ferreira", compra: "Carlos Andrade",
    comprador: "Fernando Lopes", price: null, emails: 9,
    note: "URGENTE — transitado de Abril, prazo ultrapassado",
    archived: false, carryover: true,
    excelLink: "Excel Modelo.xlsx",
    consulta: { pedidoFornecedor: true, pedidoTs: "20/04 14:30", respostaFornecedor: false, respostaTs: null },
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "20/04 09:00", text: "Email recebido de Fernando Lopes — VOLVO EC480E" },
      { icon: "cpu",   color: "#c084fc", time: "20/04 09:01", text: "IA classificou: Pedido de Cotação · Urgência: Alta" },
      { icon: "user",  color: "#94a3b8", time: "20/04 09:02", text: "Processo atribuído a Marta Costa" },
      { icon: "alert", color: "#f87171", time: "27/04 00:00", text: "Prazo atingido — processo transitado para Maio" },
    ],
  },

  // ── Archived processes (older than 3 years) ───────────────────────────────

  {
    id: "2301001", created: "10/01/2023", deadline: "17/01/2023", priority: "Normal",
    status: 10, // Encomenda
    fu: "Confirmado",
    client: "Metalúrgica do Kwanza SARL",
    ref: "MK-2023-01", brand: "CAT", model: "D6T", vin: "CAT123001",
    owner: "Tiago Pinto", comm: "João Morais", compra: "Carlos Andrade",
    comprador: "António Simões", price: 385000, emails: 14,
    note: "Processo arquivado — concluído em 2023",
    archived: true, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "10/01 09:00", text: "Email recebido de António Simões — CAT D6T" },
      { icon: "check", color: "#4ade80", time: "20/01 11:00", text: "Encomenda confirmada — €385.000" },
    ],
  },

  {
    id: "2212001", created: "05/12/2022", deadline: "12/12/2022", priority: "Normal",
    status: 11, // Cancelado
    client: "Construções Horizonte Norte Lda",
    ref: "CHN-2022-44", brand: "LIEBHERR", model: "LTM 1080", vin: "",
    owner: "Adelina Rodrigues", comm: "Ana Ferreira", compra: "Carlos Andrade",
    comprador: "José Ferreira", price: null, emails: 6,
    note: "Processo arquivado — cancelado em 2022",
    archived: true, carryover: false,
    excelLink: "Excel Modelo.xlsx",
    timeline: [
      { icon: "mail",  color: "#60a5fa", time: "05/12 08:00", text: "Email recebido de José Ferreira — LIEBHERR LTM 1080" },
      { icon: "x",     color: "#f87171", time: "15/12 17:00", text: "Processo cancelado pelo cliente" },
    ],
  },
];

// ── Tasks (Tarefas) ───────────────────────────────────────────────────────────
// TASK_TYPES: Contas Correntes, Status de Encomenda, Desconto, Cliente Novo, Diversos
// TASK_STATUSES: Pendente, Em Curso, Concluido
export const TAREFAS = [
  {
    id: "T001",
    type: "Contas Correntes",
    client: "TerraMovida Lda",
    comprador: "Carlos Menezes",
    assigned: "Adelina Rodrigues",
    status: "Pendente",
    created: "02/05/2026",
    due: "09/05/2026",
    priority: "Normal",
    description: "Verificar saldo em conta corrente e confirmar pagamento de facturas em atraso referentes a Q1 2026.",
    originEmail: {
      sender: "carlos.menezes@terramovida.pt",
      subject: "Conta corrente — facturas pendentes",
      preview: "Bom dia, venho por este meio solicitar esclarecimento sobre o estado das facturas…",
    },
    attachments: [],
  },
  {
    id: "T002",
    type: "Status de Encomenda",
    client: "AMF – Agentes de Formação",
    comprador: "Teodósio Nzunda",
    assigned: "Tiago Pinto",
    status: "Em Curso",
    created: "05/05/2026",
    due: "12/05/2026",
    priority: "Alta",
    description: "Confirmar junto do fornecedor o estado de entrega da encomenda CAT – LUBRIFICAÇÃO referente ao processo 2605009.",
    originEmail: {
      sender: "teodosio.nzunda@amf.co.ao",
      subject: "Re: Encomenda CAT — prazo de entrega",
      preview: "Boa tarde, necessito de confirmação urgente sobre a data de entrega prevista…",
    },
    attachments: [],
  },
  {
    id: "T003",
    type: "Desconto",
    client: "Construtora Horizonte SA",
    comprador: "Luísa Pinto",
    assigned: "Marta Costa",
    status: "Pendente",
    created: "07/05/2026",
    due: "14/05/2026",
    priority: "Normal",
    description: "Avaliar pedido de desconto adicional de 5% sobre proposta do processo 2605003. Aguarda aprovação do supervisor.",
    originEmail: {
      sender: "luisa.pinto@construtora-horizonte.co.ao",
      subject: "Pedido de desconto adicional",
      preview: "Após análise interna, gostaríamos de negociar um desconto adicional de 5%…",
    },
    attachments: [],
  },
  {
    id: "T004",
    type: "Cliente Novo",
    client: "Logística Atlântico Sul Lda",
    comprador: "Pedro Augusto",
    assigned: "Vasco Lourenço",
    status: "Em Curso",
    created: "10/05/2026",
    due: "17/05/2026",
    priority: "Normal",
    description: "Criar ficha de novo cliente e recolher documentação KYC necessária. Cliente contactou através do Inbox para pedido de cotação VOLVO.",
    originEmail: {
      sender: "pedro.augusto@logisticaatlantico.co.ao",
      subject: "Pedido de cotação e registo",
      preview: "Bom dia, somos uma empresa nova no sector e gostaríamos de obter cotação…",
    },
    attachments: [],
  },
  {
    id: "T005",
    type: "Diversos",
    client: "Vendap II",
    comprador: "Sérgio Maia",
    assigned: "João Silva",
    status: "Concluido",
    created: "03/05/2026",
    due: "08/05/2026",
    priority: "Normal",
    description: "Reencaminhar documentação técnica adicional solicitada pelo cliente para o processo 2605004.",
    originEmail: {
      sender: "sergio.maia@vendap.co.ao",
      subject: "Documentação técnica JCB JS220",
      preview: "Necessitamos de manual técnico e ficha de manutenção para o equipamento…",
    },
    attachments: [],
  },
  {
    id: "T006",
    type: "Status de Encomenda",
    client: "Grupo Construções do Sul SARL",
    comprador: "Henrique Dias",
    assigned: "João Silva",
    status: "Pendente",
    created: "14/05/2026",
    due: "21/05/2026",
    priority: "Alta",
    description: "Seguimento da proposta KOMATSU PC490LC — processo 2604001 transitado de Abril. Cliente aguarda resposta.",
    originEmail: {
      sender: "henrique.dias@gcs.co.ao",
      subject: "Seguimento proposta KOMATSU",
      preview: "Já passaram 3 semanas desde o nosso pedido inicial, necessitamos de actualização…",
    },
    attachments: [],
  },
];

// ── Inbox emails ──────────────────────────────────────────────────────────────
// isInternal: true → never shown in inbox, never generates processes/tasks
// isNewClient: true → show "cliente não reconhecido" banner with Criar Cliente button
// status: "pending" | "processed" | "diversos"
export const INBOX_EMAILS = [
  {
    id: "E001",
    sender: "pedro.augusto@logisticaatlantico.co.ao",
    senderName: "Pedro Augusto",
    subject: "Pedido urgente cotação VOLVO EC480E",
    preview: "Bom dia, somos a Logística Atlântico Sul Lda, empresa nova no sector. Necessitamos urgentemente de cotação para um VOLVO EC480E…",
    received: "15/05/2026 09:14",
    isInternal: false,
    isNewClient: true,
    aiSuggestion: { type: "Processo", category: "Pedido de Cotação", confidence: 0.94 },
    status: "pending",
  },
  {
    id: "E002",
    sender: "adelina@promaster.co",
    senderName: "Adelina Rodrigues",
    subject: "Re: Processo 2605003 — resposta fornecedor",
    preview: "Olá equipa, segue em anexo a resposta do fornecedor para o processo 2605003…",
    received: "15/05/2026 10:30",
    isInternal: true, // excluded from inbox display
    isNewClient: false,
    aiSuggestion: null,
    status: "pending",
  },
  {
    id: "E003",
    sender: "sergio.maia@vendap.co.ao",
    senderName: "Sérgio Maia",
    subject: "Peças sobressalentes JCB — pedido adicional",
    preview: "Boa tarde, para além da encomenda em curso gostaríamos de solicitar cotação para peças sobressalentes…",
    received: "15/05/2026 11:05",
    isInternal: false,
    isNewClient: false,
    aiSuggestion: { type: "Processo", category: "Pedido de Cotação", confidence: 0.87 },
    status: "pending",
  },
  {
    id: "E004",
    sender: "luisa.pinto@construtora-horizonte.co.ao",
    senderName: "Luísa Pinto",
    subject: "Conta corrente — saldo em dívida",
    preview: "Bom dia, venho questionar sobre o saldo em conta corrente referente a 2025. Existem facturas que não consigo identificar…",
    received: "15/05/2026 13:22",
    isInternal: false,
    isNewClient: false,
    aiSuggestion: { type: "Tarefa", category: "Contas Correntes", confidence: 0.91 },
    status: "pending",
  },
  {
    id: "E005",
    sender: "joao.m@promaster.co",
    senderName: "João Morais",
    subject: "Reunião interna — revisão pipeline Maio",
    preview: "Equipa, confirmo reunião amanhã às 14h para revisão do pipeline de Maio. Por favor confirmar disponibilidade…",
    received: "15/05/2026 14:00",
    isInternal: true, // excluded from inbox display
    isNewClient: false,
    aiSuggestion: null,
    status: "pending",
  },
  {
    id: "E006",
    sender: "henrique.dias@gcs.co.ao",
    senderName: "Henrique Dias",
    subject: "Seguimento proposta KOMATSU PC490LC",
    preview: "Boa tarde, já passaram 3 semanas desde o nosso pedido inicial de cotação para KOMATSU PC490LC. Necessitamos de actualização urgente…",
    received: "15/05/2026 15:47",
    isInternal: false,
    isNewClient: false,
    aiSuggestion: { type: "Processo", category: "Seguimento", confidence: 0.82 },
    status: "pending",
  },
  {
    id: "E007",
    sender: "noreply@spam-domain.com",
    senderName: "Marketing Updates",
    subject: "Exclusive offer for your business",
    preview: "Don't miss out on our exclusive B2B deals…",
    received: "15/05/2026 16:10",
    isInternal: false,
    isNewClient: false,
    aiSuggestion: { type: "Diversos", category: "Spam", confidence: 0.98 },
    status: "pending",
  },
];
