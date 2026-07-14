/**
 * DEV ONLY — DevTools.jsx
 *
 * Testing utilities for QA. Mounted by Main.jsx only when
 * import.meta.env.DEV === true. Remove this file (and its import in Main.jsx)
 * before any production deployment — it must never ship.
 */

import { useState } from "react";
import { store } from "../store.js";
import { useWindowSize } from "../utils.js";
import { getAISimulationEnabled, setAISimulationEnabled } from "../api/client.js";
import { PROCESSOS, TAREFAS, INBOX_EMAILS } from "../mock/data.js";
import { THEME } from "../theme.js";
import { Avatar } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

// ── Random email data ─────────────────────────────────────────────────────────

const RANDOM_SENDERS = [
  { name: "Carlos Ferreira",     email: "carlos.ferreira@angola-build.co.ao",  company: "Angola Build Lda" },
  { name: "Maria Joaquina",      email: "mj@construtora-sul.co.ao",             company: "Construtora Sul SA" },
  { name: "António Domingos",    email: "adomingos@maquinaria-luanda.co.ao",    company: "Maquinaria Luanda" },
  { name: "Rosa Teixeira",       email: "rosa.teixeira@infra-angola.co.ao",     company: "Infra Angola Lda" },
  { name: "Bernardo Lopes",      email: "blopes@terraforte.co.ao",              company: "Terraforte SA" },
  { name: "Filomena Nascimento", email: "fnascimento@obras-kwanza.co.ao",       company: "Obras do Kwanza" },
  { name: "José Mateus",         email: "jose.mateus@equipamax.co.ao",          company: "Equipamax Angola" },
];

const RANDOM_SUBJECTS = [
  { text: "Pedido de cotação — VOLVO EC480E",          type: "Pré-Entrada",     category: "Pedido de Cotação",    preview: "Bom dia, necessitamos urgentemente de cotação para aquisição de equipamento VOLVO EC480E para obra em curso." },
  { text: "Pedido de cotação — CAT 320GC",             type: "Pré-Entrada",     category: "Pedido de Cotação",    preview: "Venho solicitar proposta para 1 unidade CAT 320GC. Por favor indicar disponibilidade, prazo e condições de pagamento." },
  { text: "Pedido de cotação — KOMATSU PC490",         type: "Pré-Entrada",     category: "Pedido de Cotação",    preview: "Precisamos de cotação para KOMATSU PC490 em estado usado ou recondicionado. Obra prevista para Setembro." },
  { text: "Status da encomenda — prazo de entrega",    type: "Status Encomenda", category: "Status de Encomenda", preview: "Bom dia, venho questionar o estado da nossa encomenda e o prazo previsto de entrega. O cronograma da obra depende desta informação." },
  { text: "Pedido de desconto adicional",              type: "Desconto",        category: "Pedido de Desconto",   preview: "Após análise interna, gostaríamos de renegociar o valor proposto. Temos um argumento de volume que justifica um desconto adicional." },
  { text: "Conta corrente — facturas por liquidar",    type: "Contas Correntes", category: "Contas Correntes",   preview: "Venho questionar sobre 2 facturas que constam dos vossos registos mas cujo pagamento não localizamos. Por favor enviar extracto." },
  { text: "Registo de nova empresa — pedido de cotação", type: "Cliente Novo",  category: "Cliente Novo",        preview: "Somos uma empresa nova no sector e gostaríamos de estabelecer relação comercial com a Promaster. Pedimos cotação inicial." },
];

const TYPED_EMAIL_TEMPLATES = {
  "Pré-Entrada":           { subject: "Pedido de cotação — VOLVO EC360BLC",             body: "Bom dia,\n\nVenho por este meio solicitar cotação para aquisição de 1 unidade VOLVO EC360BLC para obra de construção civil.\n\nNecessitamos de preço CIF Luanda, prazo de entrega e condições de pagamento.\n\nAguardamos proposta com urgência." },
  "Abertura de Processo":  { subject: "Abertura de processo — equipamento CAT 336 GC",  body: "Bom dia,\n\nSolicitamos a abertura de processo para aquisição de 1 unidade CAT 336 GC.\n\nToda a documentação necessária segue em anexo. Por favor confirmar recepção e indicar prazo de abertura." },
  "Contas Correntes":      { subject: "Conta corrente — facturas pendentes Q2 2026",    body: "Bom dia,\n\nVenho solicitar esclarecimento sobre o estado das facturas pendentes do Q2 2026.\n\nSegundo os nossos registos, existem 3 facturas por liquidar num total de €58.200.\n\nSolicito envio de extracto actualizado." },
  "Status de Encomenda":   { subject: "Status da encomenda — confirmação de prazo",      body: "Bom dia,\n\nNecessito de confirmação urgente sobre o prazo de entrega da encomenda em curso.\n\nA obra está programada e o fornecimento atempado é crítico para o cronograma.\n\nAguardo resposta." },
  "Desconto":              { subject: "Pedido de desconto — volume anual significativo", body: "Bom dia,\n\nApós análise do nosso volume de compras anual com a Promaster, gostaríamos de negociar um desconto adicional sobre a proposta em curso.\n\nO nosso histórico de pagamento é exemplar e temos mais aquisições previstas." },
  "Cliente Novo":          { subject: "Novo cliente — pedido de registo e cotação",      body: "Bom dia,\n\nSomos uma empresa recentemente constituída no sector de construção civil e gostaríamos de estabelecer relação comercial com a Promaster.\n\nSolicitamos registo como cliente e envio de catálogo de equipamentos disponíveis." },
  "Follow-Up":             { subject: "Seguimento — proposta pendente há 3 semanas",     body: "Bom dia,\n\nJá passaram 3 semanas desde o nosso pedido de cotação inicial e ainda não recebemos proposta.\n\nO prazo de adjudicação da obra está a fechar. Por favor confirmar se a proposta está em preparação." },
  "Escalação":             { subject: "Urgente — decisão de direcção necessária",        body: "Bom dia,\n\nEste assunto requer decisão urgente da direcção. O prazo de resposta ao cliente expira amanhã e a autoridade de aprovação está acima do nível actual.\n\nSolicito escalação imediata." },
  "Análise Técnica":       { subject: "Pedido de análise técnica — compatibilidade",     body: "Bom dia,\n\nSolicitamos análise técnica de compatibilidade para o equipamento proposto.\n\nPrecisamos confirmar que as especificações técnicas são adequadas para as condições de operação no terreno.\n\nAguardamos parecer técnico." },
};

// ── Random processo data ──────────────────────────────────────────────────────

const RANDOM_CLIENTS = [
  { client: "Infra-Luanda Construções SA",  comprador: "Mário Ferreira" },
  { client: "Kuando Obras Lda",             comprador: "Fátima Gonçalves" },
  { client: "Benguela Mining Corp",         comprador: "Paulo Simões" },
  { client: "Cabinda Build Group",          comprador: "Rita Nunes" },
  { client: "Lobito Industrial Lda",        comprador: "Sandro Costa" },
  { client: "Zaire Construções SARL",       comprador: "Teresa Alves" },
  { client: "Huambo Tech Equipamentos",     comprador: "Nelson Baptista" },
];

const RANDOM_EQUIPMENT = [
  { brand: "VOLVO",    model: "EC360BLC" },
  { brand: "CAT",      model: "336 GC" },
  { brand: "KOMATSU",  model: "PC490LC-11" },
  { brand: "HITACHI",  model: "ZX350LC-7" },
  { brand: "JCB",      model: "JS300" },
  { brand: "LIEBHERR", model: "R 946" },
  { brand: "DOOSAN",   model: "DX380LC-7" },
];

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function nowReceived() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function todayDDMMYYYY() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function deadlineDDMMYYYY(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

const BTN_BASE = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600,
  border: "none", cursor: "pointer", width: "100%", justifyContent: "center",
};

function ToolButton({ label, icon, color, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ ...BTN_BASE, background: bg, color }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {icon && <Icon name={icon} size={12} color={color} />}
      {label}
    </button>
  );
}

function WithConfirm({ label, icon, color, bg, message, onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return <ToolButton label={label} icon={icon} color={color} bg={bg} onClick={() => setConfirming(true)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 10, color: "#f87171", textAlign: "center", lineHeight: 1.4 }}>{message}</div>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => { onConfirm(); setConfirming(false); }} style={{ ...BTN_BASE, flex: 1, background: "#dc2626", color: "white", fontSize: 10 }}>
          Sim, confirmar
        </button>
        <button onClick={() => setConfirming(false)} style={{ ...BTN_BASE, flex: 1, background: "#1e293b", color: "#94a3b8", fontSize: 10 }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Tool 1 — User Switcher ────────────────────────────────────────────────────

function UserSwitcher({ currentUser, onSwitchUser }) {
  const [open, setOpen] = useState(false);

  // Read fresh from store every render so roles are never stale
  const users      = store.getUsers().filter(u => u.active !== false);
  const allRoles   = store.getRoles();
  const userRoles  = store.getUserRoles();

  function roleLabels(userId) {
    const ids = userRoles[userId] ?? [];
    if (ids.length === 0) return u => u.role || "—";  // fallback to legacy field
    return ids.map(id => allRoles.find(r => r.id === id)?.label ?? id).join(", ");
  }

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ ...BTN_BASE, background: "#1e3a5f", color: "#60a5fa", marginBottom: open ? 6 : 0 }}
      >
        <Icon name="user" size={12} color="#60a5fa" />
        Trocar utilizador
        <Icon name={open ? "chevron-up" : "chevron-down"} size={11} color="#60a5fa" />
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 180, overflowY: "auto" }}>
          {users.map(u => {
            const isActive = u.email === currentUser?.email;
            const ids      = userRoles[u.id] ?? [];
            const labels   = ids.length > 0
              ? ids.map(id => allRoles.find(r => r.id === id)?.label ?? id).join(", ")
              : (u.role || "—");
            return (
              <button
                key={u.id}
                onClick={() => {
                  // Resolve primary role from crm_user_roles; fall back to legacy u.role
                  const assignedIds = userRoles[u.id] ?? [];
                  const primaryRole = assignedIds.length > 0
                    ? (allRoles.find(r => r.id === assignedIds[0])?.id ?? u.role)
                    : u.role;
                  onSwitchUser({ email: u.email, role: primaryRole, name: u.name, photo: u.photo });
                  setOpen(false);
                }}
                style={{
                  ...BTN_BASE, justifyContent: "flex-start", gap: 8,
                  background: isActive ? "#1e3a5f" : "#0f172a",
                  color: isActive ? "#60a5fa" : "#94a3b8",
                  border: isActive ? "1px solid #60a5fa44" : "1px solid #1e293b",
                  fontSize: 11,
                }}
              >
                <Avatar name={u.name} size={18} photo={u.photo} />
                <span style={{ flex: 1, textAlign: "left" }}>{u.name}</span>
                <span style={{ fontSize: 9, opacity: 0.85, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{labels}</span>
                {isActive && <span style={{ fontSize: 9, color: "#4ade80", flexShrink: 0 }}>●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── DevTools panel ────────────────────────────────────────────────────────────

export function DevTools({
  currentUser,
  onSwitchUser,
  processos,
  setProcessos,
  setTarefas,
  setInboxEmails,
  setThemeVersion,
}) {
  const { isMobile } = useWindowSize();
  const [collapsed, setCollapsed] = useState(false);
  const [aiSimOn, setAiSimOn] = useState(() => getAISimulationEnabled());
  const [typedEmailType, setTypedEmailType] = useState("");
  const [clientEmailTarget, setClientEmailTarget] = useState("");

  // Existing clients — same derivation Clientes.jsx uses to build its own
  // list (grouped by p.client across all non-archived processos), so this
  // dropdown only ever offers clients that genuinely exist in the mock data.
  const existingClients = [...new Set(processos.filter(p => !p.archived && p.client).map(p => p.client))].sort();

  function toggleAISim() {
    const next = !aiSimOn;
    setAISimulationEnabled(next);
    setAiSimOn(next);
    // Force inbox to re-read AI suggestions on next render
    setThemeVersion(v => v + 1);
  }

  // ── Tool 2: Generate random inbox email ──────────────────────────────────
  function handleGenerateEmail() {
    const sender = randomPick(RANDOM_SENDERS);
    const subject = randomPick(RANDOM_SUBJECTS);

    let aiSuggestion;
    if (aiSimOn && Math.random() < 0.78) {
      const types = store.getTaskTypes();
      const picked = types.length > 0 ? randomPick(types) : null;
      aiSuggestion = picked
        ? { type: picked.label, category: picked.label, confidence: Math.round((0.75 + Math.random() * 0.24) * 100) / 100 }
        : { type: null, category: null, confidence: 0 };
    } else {
      aiSuggestion = { type: null, category: null, confidence: 0 };
    }

    const newEmail = {
      id:           `E_dev_${Date.now()}`,
      sender:       sender.email,
      senderName:   sender.name,
      to:           "info@promaster.co",
      subject:      subject.text,
      preview:      subject.preview,
      body:         `${subject.preview}\n\nEsta é uma mensagem de teste gerada automaticamente pelas ferramentas de desenvolvimento.\n\nCom os melhores cumprimentos,\n${sender.name}\n${sender.company}`,
      attachments:  [],
      received:     nowReceived(),
      isInternal:   false,
      isNewClient:  false,
      aiSuggestion,
      status:       "pending",
    };
    const next = [...store.getInboxEmails(), newEmail];
    store.saveInboxEmails(next);
    setInboxEmails(next);
  }

  // ── Tool 2b: Generate unclassifiable inbox email (always null/0) ────────
  function handleGenerateUnclassifiableEmail() {
    const newEmail = {
      id:           `E_dev_${Date.now()}`,
      sender:       "noreply@sistema-desconhecido.co.ao",
      senderName:   "Sistema Desconhecido",
      to:           "info@promaster.co",
      subject:      `REF: ${randomInt(1000,9999)}-X / Assunto não identificável`,
      preview:      "Na sequência da comunicação anterior, informamos que o processo referenciado foi actualizado no nosso sistema interno.",
      body:         "Prezados,\n\nNa sequência da comunicação anterior, informamos que o processo referenciado foi actualizado no nosso sistema interno de gestão documental.\n\nPara mais informações consultar a plataforma.\n\nAtenciosamente,\nDepartamento de Sistemas",
      attachments:  [],
      received:     nowReceived(),
      isInternal:   false,
      isNewClient:  false,
      aiSuggestion: { type: null, category: null, confidence: 0 },
      status:       "pending",
    };
    const next = [...store.getInboxEmails(), newEmail];
    store.saveInboxEmails(next);
    setInboxEmails(next);
  }

  // ── Tool 2c: Generate typed inbox email (specific task type) ──────────
  function handleGenerateTypedEmail(typeLabel) {
    if (!typeLabel) return;
    const sender = randomPick(RANDOM_SENDERS);
    const template = TYPED_EMAIL_TEMPLATES[typeLabel] || {
      subject: `${typeLabel} — pedido via ${sender.company}`,
      body: `Bom dia,\n\nEste email refere-se a: ${typeLabel}.\n\nSolicitamos atenção a este assunto com a maior brevidade.\n\nCom os melhores cumprimentos,\n${sender.name}\n${sender.company}`,
    };

    const aiSuggestion = aiSimOn
      ? { type: typeLabel, category: typeLabel, confidence: Math.round((0.85 + Math.random() * 0.14) * 100) / 100 }
      : { type: null, category: null, confidence: 0 };

    const newEmail = {
      id:           `E_dev_${Date.now()}`,
      sender:       sender.email,
      senderName:   sender.name,
      to:           "info@promaster.co",
      subject:      template.subject,
      preview:      template.body.split("\n").find(l => l.trim()) || template.subject,
      body:         `${template.body}\n\nCom os melhores cumprimentos,\n${sender.name}\n${sender.company}`,
      attachments:  [],
      received:     nowReceived(),
      isInternal:   false,
      isNewClient:  false,
      aiSuggestion,
      status:       "pending",
    };
    const next = [...store.getInboxEmails(), newEmail];
    store.saveInboxEmails(next);
    setInboxEmails(next);
  }

  // ── Tool 2d: Generate inbox email from an existing client ───────────────
  // Inbox.jsx's triage useEffect uses email.senderName directly as the
  // clientName passed into store.assignForTaskType(...) (for role-aware
  // client-based routing via store.resolveClientRoleAssignment), and copies
  // email.senderName verbatim onto the resulting task's `client` field. So
  // for a generated email to actually match a crm_client_assignments entry
  // configured in the Clientes tab, senderName here must be the exact client
  // (company) name as it appears in processos' p.client — not a contact
  // person's name, which is what every other generator in this file uses.
  // The most recent comprador on that client's processos is still used for
  // the email's From address and signature so the message reads naturally.
  // Otherwise behaves exactly like the other generators: same AI simulation
  // toggle, same confidence range, same classification path in Inbox.jsx.
  function handleGenerateClientEmail(clientName) {
    if (!clientName) return;
    const clientProcessos = processos
      .filter(p => p.client === clientName)
      .sort((a, b) => (a.created || "").localeCompare(b.created || ""));
    const latest = clientProcessos[clientProcessos.length - 1];
    const comprador = latest?.comprador || clientName;
    const eq = randomPick(RANDOM_EQUIPMENT);
    const subject = `Pedido de cotação — ${eq.brand} ${eq.model}`;
    const body = `Bom dia,\n\nVenho por este meio, em nome da ${clientName}, solicitar cotação para ${eq.brand} ${eq.model}.\n\nAguardamos proposta com preço, prazo de entrega e condições de pagamento.\n\nCom os melhores cumprimentos,\n${comprador}\n${clientName}`;

    let aiSuggestion;
    if (aiSimOn && Math.random() < 0.78) {
      const types = store.getTaskTypes();
      const picked = types.length > 0 ? randomPick(types) : null;
      aiSuggestion = picked
        ? { type: picked.label, category: picked.label, confidence: Math.round((0.75 + Math.random() * 0.24) * 100) / 100 }
        : { type: null, category: null, confidence: 0 };
    } else {
      aiSuggestion = { type: null, category: null, confidence: 0 };
    }

    const newEmail = {
      id:           `E_dev_${Date.now()}`,
      sender:       `${comprador.toLowerCase().replace(/ /g, ".")}@${clientName.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}.co.ao`,
      senderName:   clientName,
      to:           "info@promaster.co",
      subject,
      preview:      `Bom dia, venho solicitar cotação para ${eq.brand} ${eq.model}.`,
      body,
      attachments:  [],
      received:     nowReceived(),
      isInternal:   false,
      isNewClient:  false,
      aiSuggestion,
      status:       "pending",
    };
    const next = [...store.getInboxEmails(), newEmail];
    store.saveInboxEmails(next);
    setInboxEmails(next);
  }

  // ── Tool 3: Generate random processo ─────────────────────────────────────
  function handleGenerateProcesso() {
    const cl   = randomPick(RANDOM_CLIENTS);
    const eq   = randomPick(RANDOM_EQUIPMENT);
    const storeUsers = store.getUsers().filter(u => u.active !== false);
    const byRole = role => storeUsers.find(u => u.role === role)?.name || "Adelina Rodrigues";

    // Next ID: find max existing 2605NNN, increment
    const existing = processos.map(p => p.id).filter(id => /^2605\d{3}$/.test(id));
    const max = existing.reduce((m, id) => Math.max(m, parseInt(id.slice(4)) || 0), 0);
    const newId = `2605${String(max + 1).padStart(3, "0")}`;

    const created  = todayDDMMYYYY();
    const deadline = deadlineDDMMYYYY(randomInt(3, 10));
    const status   = randomInt(1, 7); // Pré-Entrada → Para Fechar

    const newProcesso = {
      id:        newId,
      created,
      deadline,
      priority:  Math.random() > 0.7 ? "Alta" : "Normal",
      status,
      client:    cl.client,
      ref:       "",
      brand:     eq.brand,
      model:     eq.model,
      vin:       "",
      owner:     byRole("cotacao"),
      comm:      byRole("comercial"),
      compra:    byRole("compra"),
      comprador: cl.comprador,
      price:     null,
      emails:    1,
      note:      "",
      archived:  false,
      carryover: false,
      excelLink: "Excel Modelo.xlsx",
      originEmail: {
        sender: `${cl.comprador.toLowerCase().replace(/ /g, ".")}@${cl.client.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}.co.ao`,
        senderName: cl.comprador,
        subject: `Pedido de cotação — ${eq.brand} ${eq.model}`,
        preview: `Bom dia, venho solicitar cotação para ${eq.brand} ${eq.model}.`,
        body: `Bom dia,\n\nVenho por este meio solicitar cotação para ${eq.brand} ${eq.model}.\n\nEsta é uma mensagem gerada automaticamente pelas ferramentas de desenvolvimento.\n\nCom os melhores cumprimentos,\n${cl.comprador}\n${cl.client}`,
        attachments: [],
      },
      timeline: [
        { icon: "cpu",  color: "#c084fc", time: created.slice(0, 5), text: `Processo gerado via DEV tools — ${eq.brand} ${eq.model}` },
        { icon: "user", color: "#94a3b8", time: created.slice(0, 5), text: `Atribuído a ${byRole("cotacao")}` },
      ],
    };

    const next = [...processos, newProcesso];
    setProcessos(next);
  }

  // ── Tool 4: Clear inbox and tasks ────────────────────────────────────────
  function handleClearInboxAndTasks() {
    store.saveInboxEmails([]);
    store.saveTarefas([]);
    setInboxEmails([]);
    setTarefas([]);
    setThemeVersion(v => v + 1);
  }

  // ── Tool 5: Clear processos ───────────────────────────────────────────────
  function handleClearProcessos() {
    setProcessos([]);
    store.saveProcessos([]);
    setThemeVersion(v => v + 1);
  }

  // ── Tool 6: Clear admin data ──────────────────────────────────────────────
  // Clears all admin-configured data structures.
  // The current user, their role assignments, and the Admin role are all
  // preserved so the admin can continue configuring from scratch without
  // losing access.
  function handleClearAdminData() {
    const me = store.getUsers().find(u => u.email === currentUser?.email);

    // Preserve current user
    store.saveUsers(me ? [me] : []);

    // Preserve Admin role so the current user retains admin access
    const allRoles    = store.getRoles();
    const currentRoles = store.getUserRoles();
    const myRoleIds   = me ? (currentRoles[me.id] ?? []) : [];
    const rolesToKeep = allRoles.filter(r => myRoleIds.includes(r.id));
    store.saveRoles(rolesToKeep);

    // Preserve the current user's role assignments; wipe everyone else's
    const myRoleMapping = me ? { [me.id]: myRoleIds } : {};
    store.saveUserRoles(myRoleMapping);

    // Wipe all other admin-configured data
    store.saveStages([]);
    store.saveFUStatuses([]);
    store.saveTaskTypes([]);
    store.saveTaskStatuses([]);
    store.saveMapeamento({ processoStatus: {}, taskType: {}, taskStatus: {} });
    store.saveSLASettings({});
    store.savePriorities([]);
    localStorage.removeItem("crm_rr_counters");
    setThemeVersion(v => v + 1);
  }

  // ── Tool 7: Restore all mock data ────────────────────────────────────────
  // Clears all runtime keys so store.get*() returns default seed values,
  // then resets React state to mock data baseline.
  function handleRestoreMockData() {
    const keys = [
      "crm_users", "crm_roles", "crm_user_roles",
      "crm_stages", "crm_fu",
      "crm_task_types", "crm_task_statuses",
      "crm_mapeamento", "crm_sla",
      "crm_priorities",
      "crm_processos", "crm_tarefas", "crm_inbox",
      "crm_col_prefs", "crm_sort_prefs",
      "crm_branding", "crm_theme",
      "crm_rr_counters",
    ];
    keys.forEach(k => localStorage.removeItem(k));
    setProcessos([...PROCESSOS]);
    setTarefas([...TAREFAS]);
    setInboxEmails([...INBOX_EMAILS]);
    setThemeVersion(v => v + 1);
  }

  return (
    <div style={{
      position: "fixed",
      bottom: isMobile ? "auto" : 16,
      top:    isMobile ? 72    : "auto",
      right:  isMobile ? 8    : 16,
      zIndex: 9999,
      width: collapsed ? "auto" : 224,
      background: "#020617",
      border: "1px solid #dc2626",
      borderRadius: 10,
      boxShadow: "0 4px 24px rgba(220,38,38,0.3)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden",
    }}>

      {/* Header */}
      <div
        onClick={() => setCollapsed(v => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "7px 10px", cursor: "pointer",
          background: "#1a0000", borderBottom: collapsed ? "none" : "1px solid #dc262633",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 800, color: "#f87171", letterSpacing: "0.1em" }}>⚠ DEV ONLY</span>
        <Icon name={collapsed ? "chevron-up" : "chevron-down"} size={12} color="#f87171" />
      </div>

      {/* Tools */}
      {!collapsed && (
        <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>

          {/* Tool 1 — User switcher */}
          <UserSwitcher currentUser={currentUser} onSwitchUser={onSwitchUser} />

          <div style={{ borderTop: "1px solid #1e293b", margin: "2px 0" }} />

          {/* Tool 2 — Generate random inbox email */}
          <ToolButton label="Gerar email aleatório" icon="mail"  color="#a3e635" bg="#14330a" onClick={handleGenerateEmail} />

          {/* Tool 2b — Generate unclassifiable inbox email */}
          <ToolButton label="Gerar email não classificável" icon="alert" color="#fb923c" bg="#1c1005" onClick={handleGenerateUnclassifiableEmail} />

          {/* Tool 2c — Generate typed email */}
          <div style={{ display: "flex", gap: 3 }}>
            <select
              value={typedEmailType}
              onChange={e => setTypedEmailType(e.target.value)}
              style={{ flex: 1, fontSize: 10, padding: "5px 6px", background: "#0f172a", color: "#94a3b8", border: "1px solid #1e293b", borderRadius: 5, outline: "none" }}
            >
              <option value="">Tipo de tarefa…</option>
              {store.getTaskTypes().map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
            </select>
            <button
              onClick={() => { handleGenerateTypedEmail(typedEmailType); }}
              disabled={!typedEmailType}
              style={{ ...BTN_BASE, width: "auto", padding: "5px 10px", background: typedEmailType ? "#14330a" : "#0f172a", color: typedEmailType ? "#a3e635" : "#475569", fontSize: 10, opacity: typedEmailType ? 1 : 0.5 }}
            >
              Gerar
            </button>
          </div>

          {/* Tool 2d — Generate email from an existing client */}
          <div style={{ display: "flex", gap: 3 }}>
            <select
              value={clientEmailTarget}
              onChange={e => setClientEmailTarget(e.target.value)}
              disabled={existingClients.length === 0}
              style={{ flex: 1, fontSize: 10, padding: "5px 6px", background: "#0f172a", color: "#94a3b8", border: "1px solid #1e293b", borderRadius: 5, outline: "none" }}
            >
              <option value="">{existingClients.length === 0 ? "Sem clientes…" : "Cliente existente…"}</option>
              {existingClients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => { handleGenerateClientEmail(clientEmailTarget); }}
              disabled={!clientEmailTarget}
              style={{ ...BTN_BASE, width: "auto", padding: "5px 10px", background: clientEmailTarget ? "#14330a" : "#0f172a", color: clientEmailTarget ? "#a3e635" : "#475569", fontSize: 10, opacity: clientEmailTarget ? 1 : 0.5 }}
            >
              Gerar
            </button>
          </div>

          {/* Tool 3 — Generate random processo */}
          <ToolButton label="Gerar processo aleatório" icon="plus" color="#38bdf8" bg="#0c2231" onClick={handleGenerateProcesso} />

          <div style={{ borderTop: "1px solid #1e293b", margin: "2px 0" }} />

          {/* AI Classification toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#c084fc" }}>Simulação IA</div>
              <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>Badges marcados "SIM"</div>
            </div>
            <button
              onClick={toggleAISim}
              style={{
                width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                background: aiSimOn ? "#7c3aed" : "#1e293b",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute", top: 2, left: aiSimOn ? 18 : 2,
                width: 16, height: 16, borderRadius: "50%",
                background: aiSimOn ? "#c084fc" : "#475569",
                transition: "left 0.2s",
              }} />
            </button>
          </div>

          {/* Tool — Simulate SLA breach (tasks + processes) */}
          <ToolButton label="Simular incumprimento SLA" icon="alert" color="#f87171" bg="#2d0a0a" onClick={() => {
            const allTarefas = store.getTarefas();
            const doneLabels = new Set(["Concluído", "Cancelado"].map(r => store.getLabelForSystemRole(r)).filter(Boolean));
            const activeTasks = allTarefas.filter(t => !doneLabels.has(t.status));
            if (activeTasks.length > 0) {
              const target = activeTasks[Math.floor(Math.random() * activeTasks.length)];
              const updated = allTarefas.map(t => t.id === target.id ? { ...t, due: "01/04/2026" } : t);
              store.saveTarefas(updated);
              setTarefas(updated);
            }
            const sla = store.getSLASettings();
            if (!sla.processoStatus) sla.processoStatus = {};
            for (const s of store.getStages()) {
              if (!sla.processoStatus[s.id]) sla.processoStatus[s.id] = { value: 7, unit: "dias" };
            }
            store.saveSLASettings(sla);
            const activeProcs = processos.filter(p => !p.archived && p.status < 8);
            const picks = new Set();
            const copy = [...activeProcs];
            for (let i = 0; i < 2 && copy.length > 0; i++) {
              const idx = Math.floor(Math.random() * copy.length);
              picks.add(copy.splice(idx, 1)[0].id);
            }
            setProcessos(prev => picks.size > 0
              ? prev.map(p => picks.has(p.id) ? { ...p, created: "01/01/2025", deadline: "08/01/2025" } : p)
              : [...prev]
            );
            setThemeVersion(v => v + 1);
          }} />

          <div style={{ borderTop: "1px solid #1e293b", margin: "2px 0" }} />

          {/* Tool 4 — Clear inbox and tasks */}
          <WithConfirm label="Limpar Inbox e Tarefas" icon="x"        color="#fb923c" bg="#1c1005" message="Remove todos os emails e tarefas. Continuar?"           onConfirm={handleClearInboxAndTasks} />

          {/* Tool 5 — Clear processos */}
          <WithConfirm label="Limpar Processos"        icon="x"        color="#f472b6" bg="#1a0a14" message="Remove todos os processos da lista. Continuar?"          onConfirm={handleClearProcessos} />

          {/* Tool 6 — Clear admin data */}
          <WithConfirm label="Limpar dados admin"      icon="settings" color="#e879f9" bg="#1a0a1a" message="Remove utilizadores (excepto o actual), estados, prioridades e funções. Continuar?" onConfirm={handleClearAdminData} />

          <div style={{ borderTop: "1px solid #1e293b", margin: "2px 0" }} />

          {/* Tool 7 — Restore mock data */}
          <WithConfirm label="Repor todos os dados mock" icon="check"  color="#f87171" bg="#2d0a0a" message="Repõe TUDO ao estado original dos dados mock. Continuar?" onConfirm={handleRestoreMockData} />
        </div>
      )}
    </div>
  );
}
