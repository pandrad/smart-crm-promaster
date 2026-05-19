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
  taskId:   "T006",
  type:     "Contas Correntes",
  client:   "TerraMovida Lda",
  assignedBy: "Supervisor",
  note:     "Verificar facturas pendentes Q1 2026 — total €74.700. Prazo: 30 de Maio.",
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
// TASK_TYPES:    Pré-Entrada, Desconto, Status Encomenda, Contas Correntes,
//                Cliente Novo, Diversos, Follow-up, Escalação
// TASK_STATUSES: Por Fazer, Em Curso, Bloqueado, Concluído, Escalado
//
// Each task has:
//   owner          — current responsible person (string name | null)
//   history        — array of { actor, action, note, ts }
//   originEmail    — { sender, senderName, subject, preview, body, attachments[] } | null
//   originProcesso — process id string | null
//   escalationNote — string | null (set when Escalado/Bloqueado)
export const TAREFAS = [

  // T001 — Pré-Entrada: email from Sérgio Maia waiting to become a process
  {
    id: "T001",
    type: "Pré-Entrada",
    status: "Por Fazer",
    owner: "Adelina Rodrigues",
    client: "Vendap II",
    originEmail: {
      sender: "sergio.maia@vendap.co.ao",
      senderName: "Sérgio Maia",
      subject: "Peças sobressalentes JCB — pedido adicional",
      preview: "Boa tarde, para além da encomenda em curso gostaríamos de solicitar cotação para peças sobressalentes…",
      body: "Boa tarde,\n\nPara além da encomenda em curso (processo 2605004), gostaríamos de solicitar cotação para as seguintes peças sobressalentes de JCB JS220:\n\n- 2 filtros de óleo hidráulico (ref. 32/925346)\n- 1 bomba de água completa (ref. 02/800200)\n- Correia de transmissão principal\n\nNecessitamos que a proposta inclua preço unitário, prazo de entrega e origem (original/compatível).\n\nA urgência é moderada — precisamos fechar esta encomenda antes do fim do mês.\n\nCom os melhores cumprimentos,\nSérgio Maia\nResponsável de Compras\nVendap II",
      attachments: [],
    },
    originProcesso: "2605004",
    description: "Email de Sérgio Maia (Vendap II) a pedir cotação para peças sobressalentes JCB JS220. Aguarda abertura de processo.",
    escalationNote: null,
    priority: "Normal",
    created: "15/05/2026",
    due: "17/05/2026",
    history: [
      { actor: "Adelina Rodrigues", action: "Criada via Inbox", note: "Peças sobressalentes JCB — pedido adicional", ts: "15/05 11:05" },
    ],
  },

  // T002 — Status Encomenda: checking delivery status with supplier
  {
    id: "T002",
    type: "Status Encomenda",
    status: "Em Curso",
    owner: "Tiago Pinto",
    client: "AMF – Agentes de Formação",
    originEmail: {
      sender: "teodosio.nzunda@amf.co.ao",
      senderName: "Teodósio Nzunda",
      subject: "Re: Encomenda CAT — prazo de entrega",
      preview: "Boa tarde, necessito de confirmação urgente sobre a data de entrega prevista…",
      body: "Boa tarde,\n\nVenho por este meio solicitar confirmação urgente sobre o prazo de entrega da encomenda de lubrificação CAT referente ao processo 2605009.\n\nTemos obra programada para 20 de Junho e precisamos que o material esteja disponível até 15 de Junho para preparação.\n\nCaso o prazo original não seja cumprível, por favor informar alternativas disponíveis em stock.\n\nÉ um fornecimento crítico para o nosso cronograma.\n\nAguardo resposta urgente.\n\nCom os melhores cumprimentos,\nTeodósio Nzunda\nDirector de Projecto\nAMF – Agentes de Formação",
      attachments: [{ name: "Cronograma_Obra_Junho2026.pdf" }],
    },
    originProcesso: "2605009",
    description: "Confirmar junto do fornecedor o estado de entrega da encomenda CAT – LUBRIFICAÇÃO. Cliente tem obra agendada para 20/06 e precisa do material até 15/06.",
    escalationNote: null,
    priority: "Alta",
    created: "05/05/2026",
    due: "12/05/2026",
    history: [
      { actor: "Tiago Pinto",       action: "Criada",    note: "Re: Encomenda CAT — prazo de entrega",         ts: "05/05 09:00" },
      { actor: "Tiago Pinto",       action: "Em Curso",  note: "Contactado fornecedor, aguardar confirmação",  ts: "07/05 14:30" },
    ],
  },

  // T003 — Desconto: escalated through two people to Supervisor
  {
    id: "T003",
    type: "Desconto",
    status: "Escalado",
    owner: "Supervisor",
    client: "Construtora Horizonte SA",
    originEmail: {
      sender: "luisa.pinto@construtora-horizonte.co.ao",
      senderName: "Luísa Pinto",
      subject: "Pedido de desconto adicional — processo 2605003",
      preview: "Após análise interna, gostaríamos de negociar um desconto adicional de 5%…",
      body: "Bom dia,\n\nApós análise interna do orçamento aprovado para o processo 2605003 (CATERPILLAR 320GC), a nossa administração solicitou que tentemos negociar um desconto adicional de 5% sobre o valor proposto de €165.000.\n\nO nosso argumento é o seguinte:\n1. Somos clientes há mais de 5 anos com histórico de pagamento pontual\n2. Temos previstas mais 2 aquisições de equipamento no próximo trimestre\n3. O nosso volume anual com a Promaster supera €400.000\n\nEsperamos que seja possível acomodar este pedido. Caso contrário, precisamos de uma resposta formal para apresentar à nossa administração.\n\nAguardamos resposta até sexta-feira.\n\nCom os melhores cumprimentos,\nLuísa Pinto\nDirectora Financeira\nConstrutora Horizonte SA",
      attachments: [],
    },
    originProcesso: "2605003",
    description: "Cliente Construtora Horizonte SA pede desconto adicional de 5% sobre proposta de €165.000 para CATERPILLAR 320GC. Escalado pois ultrapassa autoridade de cotação.",
    escalationNote: "Cliente exige 10% e cita volume anual de €400k. Ultrapassa o limite de 3% que posso aprovar. Preciso de decisão da direcção urgente — deadline sexta-feira.",
    priority: "Alta",
    created: "07/05/2026",
    due: "16/05/2026",
    history: [
      { actor: "Marta Costa",  action: "Criada",   note: "Pedido de desconto adicional — processo 2605003",                  ts: "07/05 10:00" },
      { actor: "Marta Costa",  action: "Passada",  note: "Passo para o Tiago — ele tem mais autoridade nestas negociações",  ts: "08/05 15:00" },
      { actor: "Tiago Pinto",  action: "Em Curso", note: "A analisar margens com o João Morais",                             ts: "09/05 09:30" },
      { actor: "Tiago Pinto",  action: "Escalada", note: "Cliente exige 10% e cita volume anual de €400k. Ultrapassa o limite de 3% que posso aprovar. Preciso de decisão da direcção.", ts: "10/05 11:45" },
    ],
  },

  // T004 — Cliente Novo: onboarding new client from Inbox
  {
    id: "T004",
    type: "Cliente Novo",
    status: "Em Curso",
    owner: "Vasco Lourenço",
    client: "Logística Atlântico Sul Lda",
    originEmail: {
      sender: "pedro.augusto@logisticaatlantico.co.ao",
      senderName: "Pedro Augusto",
      subject: "Pedido urgente cotação VOLVO EC480E",
      preview: "Bom dia, somos a Logística Atlântico Sul Lda, empresa nova no sector…",
      body: "Bom dia,\n\nSomos a Logística Atlântico Sul Lda, empresa recentemente constituída em Luanda a operar no sector de logística e construção civil.\n\nVenho por este meio solicitar cotação urgente para aquisição de 1 unidade VOLVO EC480E em estado usado ou recondicionado. O equipamento destina-se a obra de terraplanagem no Município do Cazenga com início previsto para Junho de 2026.\n\nAgradeço o envio de proposta com as seguintes informações:\n- Preço unitário (CIF Luanda)\n- Prazo de entrega\n- Condições de pagamento\n- Garantia e assistência técnica disponível em Angola\n\nSomos uma empresa nova a trabalhar com a Promaster mas temos perspectiva de volume significativo nos próximos 24 meses.\n\nFico disponível para reunião presencial se necessário.\n\nCom os melhores cumprimentos,\nPedro Augusto\nDirector Operacional\nLogística Atlântico Sul Lda\nTel: +244 923 456 789",
      attachments: [],
    },
    originProcesso: null,
    description: "Criar ficha de novo cliente (Logística Atlântico Sul Lda) e recolher documentação KYC. Cliente novo sem histórico — verificar capacidade financeira antes de avançar com cotação.",
    escalationNote: null,
    priority: "Normal",
    created: "15/05/2026",
    due: "20/05/2026",
    history: [
      { actor: "Adelina Rodrigues", action: "Criada via Inbox", note: "Pedido urgente cotação VOLVO EC480E — novo cliente", ts: "15/05 09:14" },
      { actor: "Adelina Rodrigues", action: "Passada",          note: "Reencaminhado para Vasco para gestão do cliente novo",  ts: "15/05 09:30" },
      { actor: "Vasco Lourenço",    action: "Em Curso",         note: "A recolher documentação KYC",                           ts: "15/05 10:00" },
    ],
  },

  // T005 — Diversos: completed task
  {
    id: "T005",
    type: "Diversos",
    status: "Concluído",
    owner: "João Silva",
    client: "Vendap II",
    originEmail: {
      sender: "sergio.maia@vendap.co.ao",
      senderName: "Sérgio Maia",
      subject: "Documentação técnica JCB JS220",
      preview: "Necessitamos de manual técnico e ficha de manutenção para o equipamento…",
      body: "Bom dia,\n\nJuntamente com a encomenda do JCB JS220 (processo 2605004), necessitamos de receber a seguinte documentação técnica:\n\n1. Manual do operador em português (ou inglês se não disponível)\n2. Ficha de manutenção preventiva\n3. Certificado CE ou equivalente\n4. Lista de peças sobressalentes recomendadas para 500h de operação\n\nEsta documentação é necessária para efeitos de seguros e para formação dos nossos operadores.\n\nPor favor confirmar se é possível incluir no envio ou enviar por email com antecedência.\n\nCom os melhores cumprimentos,\nSérgio Maia",
      attachments: [],
    },
    originProcesso: "2605004",
    description: "Enviar documentação técnica (manual, ficha de manutenção, certificado CE) para o JCB JS220 do processo 2605004.",
    escalationNote: null,
    priority: "Normal",
    created: "03/05/2026",
    due: "08/05/2026",
    history: [
      { actor: "João Silva", action: "Criada",   note: "Documentação técnica JCB JS220",                    ts: "03/05 11:00" },
      { actor: "João Silva", action: "Concluído", note: "Documentação enviada por email. PDF do manual e ficha de manutenção anexados.", ts: "06/05 16:30" },
    ],
  },

  // T006 — Contas Correntes: checking outstanding invoices
  {
    id: "T006",
    type: "Contas Correntes",
    status: "Por Fazer",
    owner: "Adelina Rodrigues",
    client: "TerraMovida Lda",
    originEmail: {
      sender: "carlos.menezes@terramovida.pt",
      senderName: "Carlos Menezes",
      subject: "Conta corrente — facturas pendentes Q1 2026",
      preview: "Bom dia, venho por este meio solicitar esclarecimento sobre o estado das facturas…",
      body: "Bom dia,\n\nVenho por este meio solicitar esclarecimento sobre o estado das seguintes facturas emitidas no Q1 2026 e que, segundo os nossos registos, ainda não foram liquidadas:\n\n- Factura 2026/0034 — €28.500 — vencimento 15/02/2026\n- Factura 2026/0071 — €14.200 — vencimento 28/02/2026\n- Factura 2026/0089 — €32.000 — vencimento 15/03/2026\n\nTotal em dívida: €74.700\n\nSe já efectuaram os pagamentos, por favor enviar comprovativo para reconciliação. Caso contrário, solicito confirmação de data prevista para regularização.\n\nNote que a manutenção do serviço poderá ser condicionada caso a dívida não seja regularizada até 30 de Maio.\n\nCom os melhores cumprimentos,\nCarlos Menezes\nDirector Financeiro\nTerraMovida Lda",
      attachments: [{ name: "Extracto_CC_TerraMovida_Q1_2026.pdf" }],
    },
    originProcesso: null,
    description: "Verificar saldo em conta corrente e confirmar pagamento de 3 facturas em atraso de Q1 2026 — total €74.700. Prazo de resposta: 30 de Maio.",
    escalationNote: null,
    priority: "Alta",
    created: "15/05/2026",
    due: "22/05/2026",
    history: [
      { actor: "Adelina Rodrigues", action: "Criada via Inbox", note: "Conta corrente — facturas pendentes Q1 2026", ts: "15/05 13:22" },
    ],
  },

  // T007 — Follow-up: blocked, no response from client
  {
    id: "T007",
    type: "Follow-up",
    status: "Bloqueado",
    owner: "João Silva",
    client: "Grupo Construções do Sul SARL",
    originEmail: {
      sender: "henrique.dias@gcs.co.ao",
      senderName: "Henrique Dias",
      subject: "Seguimento proposta KOMATSU PC490LC",
      preview: "Boa tarde, já passaram 3 semanas desde o nosso pedido inicial…",
      body: "Boa tarde,\n\nJá passaram 3 semanas desde o nosso pedido inicial de cotação para KOMATSU PC490LC (processo 2604001, transitado de Abril). Necessitamos de actualização urgente sobre o estado da proposta.\n\nO nosso projecto tem uma janela de adjudicação que fecha no fim de Maio. Se não tivermos proposta até lá, teremos de considerar fornecedores alternativos.\n\nPor favor confirmar:\n1. Se a proposta está em preparação\n2. Data prevista de envio\n3. Qualquer questão pendente da nossa parte\n\nAguardamos resposta com urgência.\n\nCom os melhores cumprimentos,\nHenrique Dias\nResponsável de Aquisições\nGrupo Construções do Sul SARL",
      attachments: [],
    },
    originProcesso: "2604001",
    description: "Follow-up ao processo 2604001 (KOMATSU PC490LC). Cliente em risco de ir para concorrente. Tentativas de contacto sem resposta há 2 semanas — aguardar.",
    escalationNote: "Cliente não responde há 2 semanas por telefone nem email. O processo está em Qualificacao há 30 dias. Aguardamos sinal de vida.",
    priority: "Alta",
    created: "14/05/2026",
    due: "21/05/2026",
    history: [
      { actor: "João Silva", action: "Criada",   note: "Seguimento proposta KOMATSU — 3 semanas sem resposta",  ts: "14/05 15:47" },
      { actor: "João Silva", action: "Em Curso", note: "Enviado email de seguimento + tentativa de chamada",     ts: "14/05 16:00" },
      { actor: "João Silva", action: "Bloqueado", note: "Cliente não responde há 2 semanas. Aguardando.", ts: "15/05 09:00" },
    ],
  },

  // T008 — Escalação: admin receives the escalation from T003
  {
    id: "T008",
    type: "Escalação",
    status: "Por Fazer",
    owner: "Admin",
    client: "Construtora Horizonte SA",
    originEmail: null,
    originProcesso: "2605003",
    description: "Decisão de direcção necessária: cliente Construtora Horizonte SA pede 10% de desconto sobre €165.000. Equipa comercial escalou pois ultrapassa autoridade de cotação (limite 3%). Ver T003 para contexto completo.",
    escalationNote: "Escalado por Tiago Pinto (10/05): cliente exige 10% e cita volume anual de €400k. Ultrapassa o limite de 3% que posso aprovar. Deadline sexta-feira.",
    priority: "Alta",
    created: "10/05/2026",
    due: "16/05/2026",
    history: [
      { actor: "Tiago Pinto", action: "Escalada", note: "Escalado para Admin — cliente exige 10% de desconto sobre €165.000. Ver T003 para histórico completo.", ts: "10/05 11:45" },
    ],
  },

  // T009 — Validação de Processo: Devolvido — shows a full back-and-forth exchange.
  // Originated from E003 (Sérgio Maia / Vendap II, already triaged in INBOX_EMAILS).
  // Triaged by Adelina; sent back by Marta (Resp. Cotação) because brand/model missing;
  // Adelina updated with details and resubmitted; still awaiting final validation.
  {
    id: "T009",
    type: "Validação de Processo",
    status: "Devolvido",
    owner: "Adelina Rodrigues",         // returned to the person who triaged it
    triagedBy: "Adelina Rodrigues",     // person who originally triaged the inbox email
    validatorOwner: "Marta Costa",      // Resp. Cotação assigned to validate
    client: "Vendap II",
    originEmail: {
      sender: "sergio.maia@vendap.co.ao",
      senderName: "Sérgio Maia",
      subject: "Peças sobressalentes JCB — pedido adicional",
      preview: "Boa tarde, para além da encomenda em curso gostaríamos de solicitar cotação para peças sobressalentes…",
      body: "Boa tarde,\n\nPara além da encomenda em curso (processo 2605004), gostaríamos de solicitar cotação para as seguintes peças sobressalentes de JCB JS220:\n\n- 2 filtros de óleo hidráulico (ref. 32/925346)\n- 1 bomba de água completa (ref. 02/800200)\n- Correia de transmissão principal\n\nNecessitamos que a proposta inclua preço unitário, prazo de entrega e origem (original/compatível).\n\nA urgência é moderada — precisamos fechar esta encomenda antes do fim do mês.\n\nCom os melhores cumprimentos,\nSérgio Maia\nResponsável de Compras\nVendap II",
      attachments: [],
    },
    originProcesso: null,
    description: "Este email aguarda validação para abertura de processo.\n\nCliente: Vendap II · Remetente: Sérgio Maia\nAssunto: Peças sobressalentes JCB — pedido adicional\nSugestão IA: Pré-Entrada · Pedido de Cotação (87%)",
    escalationNote: null,
    priority: "Normal",
    created: "15/05/2026",
    due: "17/05/2026",
    history: [
      {
        actor: "Adelina Rodrigues",
        action: "Criada via triagem",
        note: "Email de Sérgio Maia (Vendap II) confirmado para abertura de processo. Enviado para validação.",
        ts: "15/05 11:06",
      },
      {
        actor: "Marta Costa",
        action: "Devolvido",
        note: "Falta informação essencial para abrir o processo: marca e modelo do equipamento não estão especificados no email. O cliente menciona 'peças de JCB JS220' mas precisamos confirmar se é uma nova referência ou ligada ao processo 2605004. Por favor contactar o cliente e confirmar antes de prosseguir.",
        ts: "15/05 14:22",
      },
      {
        actor: "Adelina Rodrigues",
        action: "Actualizado",
        note: "Contactei o Sérgio Maia por telefone. Confirmou que as peças são para o JCB JS220 já existente (processo 2605004) — não é equipamento novo. Trata-se de um pedido de peças sobressalentes adicional à encomenda em curso. Actualizei a descrição. Resubmeto para validação.",
        ts: "15/05 16:45",
      },
    ],
  },

  // T010 — Validação de Processo: Por Fazer — awaiting validation by Resp. Cotação.
  // Originated from E006 (Henrique Dias / Grupo Construções do Sul, already triaged).
  // Triaged by João Silva; assigned to Adelina for validation.
  {
    id: "T010",
    type: "Validação de Processo",
    status: "Por Fazer",
    owner: "Adelina Rodrigues",         // Resp. Cotação assigned to validate
    triagedBy: "João Silva",            // person who triaged the inbox email
    validatorOwner: "Adelina Rodrigues",
    client: "Grupo Construções do Sul SARL",
    originEmail: {
      sender: "henrique.dias@gcs.co.ao",
      senderName: "Henrique Dias",
      subject: "Seguimento proposta KOMATSU PC490LC",
      preview: "Boa tarde, já passaram 3 semanas desde o nosso pedido inicial de cotação para KOMATSU PC490LC…",
      body: "Boa tarde,\n\nJá passaram 3 semanas desde o nosso pedido inicial de cotação para KOMATSU PC490LC (processo 2604001, transitado de Abril). Necessitamos de actualização urgente sobre o estado da proposta.\n\nO nosso projecto tem uma janela de adjudicação que fecha no fim de Maio. Se não tivermos proposta até lá, teremos de considerar fornecedores alternativos.\n\nPor favor confirmar:\n1. Se a proposta está em preparação\n2. Data prevista de envio\n3. Qualquer questão pendente da nossa parte\n\nAguardamos resposta com urgência.\n\nCom os melhores cumprimentos,\nHenrique Dias\nResponsável de Aquisições\nGrupo Construções do Sul SARL",
      attachments: [],
    },
    originProcesso: null,
    description: "Este email aguarda validação para abertura de processo.\n\nCliente: Grupo Construções do Sul SARL · Remetente: Henrique Dias\nAssunto: Seguimento proposta KOMATSU PC490LC\nSugestão IA: Pré-Entrada · Seguimento (82%)",
    escalationNote: null,
    priority: "Alta",
    created: "15/05/2026",
    due: "17/05/2026",
    history: [
      {
        actor: "João Silva",
        action: "Criada via triagem",
        note: "Email de Henrique Dias (GCS) confirmado para abertura de processo — seguimento urgente KOMATSU PC490LC. Enviado para validação por Adelina.",
        ts: "15/05 15:48",
      },
    ],
  },
];

// ── Inbox emails ──────────────────────────────────────────────────────────────
// isInternal: true → never shown in inbox, never generates processes/tasks
// isNewClient: true → show "cliente não reconhecido" banner
// status: "pending" | "processed" | "diversos"
// body: full email body text (shown in preview panel)
// attachments: array of { name } objects
export const INBOX_EMAILS = [
  {
    id: "E001",
    sender: "pedro.augusto@logisticaatlantico.co.ao",
    senderName: "Pedro Augusto",
    to: "info@promaster.co",
    subject: "Pedido urgente cotação VOLVO EC480E",
    preview: "Bom dia, somos a Logística Atlântico Sul Lda, empresa nova no sector. Necessitamos urgentemente de cotação para um VOLVO EC480E…",
    body: "Bom dia,\n\nSomos a Logística Atlântico Sul Lda, empresa recentemente constituída em Luanda a operar no sector de logística e construção civil.\n\nVenho por este meio solicitar cotação urgente para aquisição de 1 unidade VOLVO EC480E em estado usado ou recondicionado. O equipamento destina-se a obra de terraplanagem no Município do Cazenga com início previsto para Junho de 2026.\n\nAgradeço o envio de proposta com as seguintes informações:\n- Preço unitário (CIF Luanda)\n- Prazo de entrega\n- Condições de pagamento\n- Garantia e assistência técnica disponível em Angola\n\nSomos uma empresa nova a trabalhar com a Promaster mas temos perspectiva de volume significativo nos próximos 24 meses.\n\nFico disponível para reunião presencial se necessário.\n\nCom os melhores cumprimentos,\nPedro Augusto\nDirector Operacional\nLogística Atlântico Sul Lda\nTel: +244 923 456 789",
    attachments: [],
    received: "15/05/2026 09:14",
    isInternal: false,
    isNewClient: true,
    aiSuggestion: { type: "Pré-Entrada", category: "Pedido de Cotação", confidence: 0.94 },
    status: "pending",
  },
  {
    id: "E002",
    sender: "adelina@promaster.co",
    senderName: "Adelina Rodrigues",
    to: "equipa@promaster.co",
    subject: "Re: Processo 2605003 — resposta fornecedor",
    preview: "Olá equipa, segue em anexo a resposta do fornecedor para o processo 2605003…",
    body: "Olá equipa,\n\nSegue em anexo a resposta do fornecedor para o processo 2605003 (CATERPILLAR 320GC — Construtora Horizonte SA).\n\nResumo da resposta:\n- Prazo de entrega: 45 dias úteis\n- Disponibilidade confirmada\n- Preço FOB: €148.000\n\nPrecisamos de responder ao cliente até amanhã de manhã com a proposta final.\n\nCum. Adelina",
    attachments: [{ name: "Resposta_Fornecedor_CAT_320GC.pdf" }],
    received: "15/05/2026 10:30",
    isInternal: true,
    isNewClient: false,
    aiSuggestion: null,
    status: "pending",
  },
  {
    id: "E003",
    sender: "sergio.maia@vendap.co.ao",
    senderName: "Sérgio Maia",
    to: "info@promaster.co",
    subject: "Peças sobressalentes JCB — pedido adicional",
    preview: "Boa tarde, para além da encomenda em curso gostaríamos de solicitar cotação para peças sobressalentes…",
    body: "Boa tarde,\n\nPara além da encomenda em curso (processo 2605004), gostaríamos de solicitar cotação para as seguintes peças sobressalentes de JCB JS220:\n\n- 2 filtros de óleo hidráulico (ref. 32/925346)\n- 1 bomba de água completa (ref. 02/800200)\n- Correia de transmissão principal\n\nNecessitamos que a proposta inclua preço unitário, prazo de entrega e origem (original/compatível).\n\nA urgência é moderada — precisamos fechar esta encomenda antes do fim do mês.\n\nCom os melhores cumprimentos,\nSérgio Maia\nResponsável de Compras\nVendap II",
    attachments: [],
    received: "15/05/2026 11:05",
    isInternal: false,
    isNewClient: false,
    aiSuggestion: { type: "Pré-Entrada", category: "Pedido de Cotação", confidence: 0.87 },
    status: "triaged",     // triaged → validation task T009 created
    triagedTaskId: "T009", // link to the validation task
  },
  {
    id: "E004",
    sender: "luisa.pinto@construtora-horizonte.co.ao",
    senderName: "Luísa Pinto",
    to: "info@promaster.co",
    subject: "Conta corrente — saldo em dívida referente a 2025",
    preview: "Bom dia, venho questionar sobre o saldo em conta corrente referente a 2025. Existem facturas que não consigo identificar…",
    body: "Bom dia,\n\nVenho questionar sobre o saldo em conta corrente referente ao exercício de 2025. Na nossa reconciliação interna identificámos 3 facturas que constam dos vossos registos mas cujos pagamentos não conseguimos localizar:\n\n- Factura PRO-2025-0441 — €12.300\n- Factura PRO-2025-0502 — €8.750\n- Factura PRO-2025-0611 — €21.000\n\nPor favor enviar extracto de conta corrente actualizado e, caso os pagamentos estejam pendentes, indicar IBAN para transferência.\n\nNecessitamos resolver isto antes do fecho de contas de Maio.\n\nCom os melhores cumprimentos,\nLuísa Pinto\nDirectora Financeira\nConstrutora Horizonte SA",
    attachments: [{ name: "Reconciliacao_CC_2025.xlsx" }],
    received: "15/05/2026 13:22",
    isInternal: false,
    isNewClient: false,
    aiSuggestion: { type: "Contas Correntes", category: "Contas Correntes", confidence: 0.91 },
    status: "pending",
  },
  {
    id: "E005",
    sender: "joao.m@promaster.co",
    senderName: "João Morais",
    to: "equipa@promaster.co",
    subject: "Reunião interna — revisão pipeline Maio",
    preview: "Equipa, confirmo reunião amanhã às 14h para revisão do pipeline de Maio. Por favor confirmar disponibilidade…",
    body: "Equipa,\n\nConfirmo reunião amanhã às 14h00 na sala de reuniões para revisão do pipeline de Maio.\n\nAgenda:\n1. Processos em atraso — acções correctivas\n2. Follow-ups pendentes\n3. Previsão de fecho para Junho\n\nPor favor confirmar disponibilidade respondendo a este email.\n\nCum. João Morais",
    attachments: [],
    received: "15/05/2026 14:00",
    isInternal: true,
    isNewClient: false,
    aiSuggestion: null,
    status: "pending",
  },
  {
    id: "E006",
    sender: "henrique.dias@gcs.co.ao",
    senderName: "Henrique Dias",
    to: "info@promaster.co",
    subject: "Seguimento proposta KOMATSU PC490LC",
    preview: "Boa tarde, já passaram 3 semanas desde o nosso pedido inicial de cotação para KOMATSU PC490LC. Necessitamos de actualização urgente…",
    body: "Boa tarde,\n\nJá passaram 3 semanas desde o nosso pedido inicial de cotação para KOMATSU PC490LC (processo 2604001, transitado de Abril). Necessitamos de actualização urgente sobre o estado da proposta.\n\nO nosso projecto tem uma janela de adjudicação que fecha no fim de Maio. Se não tivermos proposta até lá, teremos de considerar fornecedores alternativos.\n\nPor favor confirmar:\n1. Se a proposta está em preparação\n2. Data prevista de envio\n3. Qualquer questão pendente da nossa parte\n\nAguardamos resposta com urgência.\n\nCom os melhores cumprimentos,\nHenrique Dias\nResponsável de Aquisições\nGrupo Construções do Sul SARL",
    attachments: [],
    received: "15/05/2026 15:47",
    isInternal: false,
    isNewClient: false,
    aiSuggestion: { type: "Pré-Entrada", category: "Seguimento", confidence: 0.82 },
    status: "triaged",     // triaged → validation task T010 created
    triagedTaskId: "T010", // link to the validation task
  },
  {
    id: "E007",
    sender: "noreply@marketing-updates.com",
    senderName: "Marketing Updates",
    to: "info@promaster.co",
    subject: "Exclusive B2B equipment deals — May 2026",
    preview: "Don't miss out on our exclusive B2B deals for heavy machinery…",
    body: "Dear Business Owner,\n\nWe have exclusive deals on heavy machinery and construction equipment this month.\n\nDon't miss out — limited stock available!\n\nClick here to learn more.\n\nBest regards,\nMarketing Team",
    attachments: [],
    received: "15/05/2026 16:10",
    isInternal: false,
    isNewClient: false,
    aiSuggestion: { type: "Diversos", category: "Spam", confidence: 0.98 },
    status: "pending",
  },
];
