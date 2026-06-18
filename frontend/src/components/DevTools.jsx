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
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
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

  function toggleAISim() {
    const next = !aiSimOn;
    setAISimulationEnabled(next);
    setAiSimOn(next);
    // Force inbox to re-read AI suggestions on next render
    setThemeVersion(v => v + 1);
  }

  // ── Tool 2: Generate random inbox email ──────────────────────────────────
  // ~15-20% of the time produces an unclassifiable email (low confidence,
  // Não Classificado) using the same shape as the dedicated unclassifiable
  // generator. The rest of the time picks a confident classified subject.
  function handleGenerateEmail() {
    const sender = randomPick(RANDOM_SENDERS);
    const isUnclassifiable = Math.random() < 0.18;

    let newEmail;
    if (isUnclassifiable) {
      newEmail = {
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
        aiSuggestion: { type: "Não Classificado", category: "Desconhecido", confidence: Math.round((0.10 + Math.random() * 0.45) * 100) / 100 },
        status:       "pending",
      };
    } else {
      const subject = randomPick(RANDOM_SUBJECTS);
      newEmail = {
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
        aiSuggestion: { type: subject.type, category: subject.category, confidence: Math.round((0.75 + Math.random() * 0.24) * 100) / 100 },
        status:       "pending",
      };
    }
    const next = [...store.getInboxEmails(), newEmail];
    store.saveInboxEmails(next);
    setInboxEmails(next);
  }

  // ── Tool 2b: Generate unclassifiable inbox email ─────────────────────────
  function handleGenerateUnclassifiableEmail() {
    const sender = randomPick(RANDOM_SENDERS);
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
      aiSuggestion: { type: "Não Classificado", category: "Desconhecido", confidence: 0.15 },
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
    const status   = randomInt(1, 4); // Entrada → Proposta

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
      "crm_tarefas", "crm_inbox",
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

          {/* Tool — Simulate SLA breach */}
          <ToolButton label="Simular incumprimento SLA" icon="alert" color="#f87171" bg="#2d0a0a" onClick={() => {
            const allTarefas = store.getTarefas();
            const doneLabels = new Set(["Concluído", "Cancelado"].map(r => store.getLabelForSystemRole(r)).filter(Boolean));
            const active = allTarefas.filter(t => !doneLabels.has(t.status));
            if (active.length === 0) return;
            const target = active[Math.floor(Math.random() * active.length)];
            const updated = allTarefas.map(t => t.id === target.id ? { ...t, due: "01/04/2026" } : t);
            store.saveTarefas(updated);
            setTarefas(updated);
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
