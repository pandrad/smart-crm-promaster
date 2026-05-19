/**
 * DEV ONLY — DevTools.jsx
 *
 * Five testing utilities for QA. Mounted by Main.jsx only when
 * import.meta.env.DEV === true. Remove this file (and its import in Main.jsx)
 * before any production deployment — it must never ship.
 *
 * Each tool requires a confirmation step to prevent accidental activation.
 * No tool touches any logic, routing, or component state outside what is
 * explicitly passed via props.
 */

import { useState } from "react";
import { store } from "../store.js";
import { PROCESSOS, TAREFAS, INBOX_EMAILS } from "../mock/data.js";
import { THEME } from "../theme.js";
import { Avatar } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

// ── Random email generator data ───────────────────────────────────────────────

const RANDOM_SENDERS = [
  { name: "Carlos Ferreira",    email: "carlos.ferreira@angola-build.co.ao",    company: "Angola Build Lda" },
  { name: "Maria Joaquina",     email: "mj@construtora-sul.co.ao",              company: "Construtora Sul SA" },
  { name: "António Domingos",   email: "adomingos@maquinaria-luanda.co.ao",     company: "Maquinaria Luanda" },
  { name: "Rosa Teixeira",      email: "rosa.teixeira@infra-angola.co.ao",       company: "Infra Angola Lda" },
  { name: "Bernardo Lopes",     email: "blopes@terraforte.co.ao",               company: "Terraforte SA" },
  { name: "Filomena Nascimento",email: "fnascimento@obras-kwanza.co.ao",        company: "Obras do Kwanza" },
  { name: "José Mateus",        email: "jose.mateus@equipamax.co.ao",           company: "Equipamax Angola" },
];

const RANDOM_SUBJECTS = [
  {
    text:     "Pedido de cotação — VOLVO EC480E",
    type:     "Pré-Entrada",
    category: "Pedido de Cotação",
    preview:  "Bom dia, necessitamos urgentemente de cotação para aquisição de equipamento VOLVO EC480E para obra em curso.",
  },
  {
    text:     "Pedido de cotação — CAT 320GC",
    type:     "Pré-Entrada",
    category: "Pedido de Cotação",
    preview:  "Venho solicitar proposta para 1 unidade CAT 320GC. Por favor indicar disponibilidade, prazo e condições de pagamento.",
  },
  {
    text:     "Pedido de cotação — KOMATSU PC490",
    type:     "Pré-Entrada",
    category: "Pedido de Cotação",
    preview:  "Precisamos de cotação para KOMATSU PC490 em estado usado ou recondicionado. Obra prevista para Setembro.",
  },
  {
    text:     "Status da encomenda — prazo de entrega",
    type:     "Status Encomenda",
    category: "Status de Encomenda",
    preview:  "Bom dia, venho questionar o estado da nossa encomenda e o prazo previsto de entrega. O cronograma da obra depende desta informação.",
  },
  {
    text:     "Pedido de desconto adicional",
    type:     "Desconto",
    category: "Pedido de Desconto",
    preview:  "Após análise interna, gostaríamos de renegociar o valor proposto. Temos um argumento de volume que justifica um desconto adicional.",
  },
  {
    text:     "Conta corrente — facturas por liquidar",
    type:     "Contas Correntes",
    category: "Contas Correntes",
    preview:  "Venho questionar sobre 2 facturas que constam dos vossos registos mas cujo pagamento não localizamos. Por favor enviar extracto.",
  },
  {
    text:     "Registo de nova empresa — pedido de cotação",
    type:     "Cliente Novo",
    category: "Cliente Novo",
    preview:  "Somos uma empresa nova no sector e gostaríamos de estabelecer relação comercial com a Promaster. Pedimos cotação inicial.",
  },
];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nowReceived() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

// Simple inline confirm prompt — replaces the button with a confirm/cancel pair
function WithConfirm({ label, icon, color, bg, message, onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <ToolButton label={label} icon={icon} color={color} bg={bg} onClick={() => setConfirming(true)} />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 10, color: "#f87171", textAlign: "center", lineHeight: 1.4 }}>{message}</div>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={() => { onConfirm(); setConfirming(false); }}
          style={{ ...BTN_BASE, flex: 1, background: "#dc2626", color: "white", fontSize: 10 }}
        >
          Sim, confirmar
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ ...BTN_BASE, flex: 1, background: "#1e293b", color: "#94a3b8", fontSize: 10 }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Tool 1 — User Switcher ────────────────────────────────────────────────────

function UserSwitcher({ currentUser, onSwitchUser }) {
  const users = store.getUsers().filter(u => u.active !== false);
  const [open, setOpen] = useState(false);

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
            return (
              <button
                key={u.id}
                onClick={() => {
                  onSwitchUser({ email: u.email, role: u.role, name: u.name, photo: u.photo });
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
                <span style={{ fontSize: 9, opacity: 0.7 }}>{u.role}</span>
                {isActive && <span style={{ fontSize: 9, color: "#4ade80" }}>●</span>}
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
  setProcessos,
  setTarefas,
  setInboxEmails,
  setThemeVersion,
}) {
  const [collapsed, setCollapsed] = useState(false);

  // ── Tool 2: Generate random inbox email ──────────────────────────────────
  function handleGenerateEmail() {
    const sender  = randomPick(RANDOM_SENDERS);
    const subject = randomPick(RANDOM_SUBJECTS);
    const newEmail = {
      id:          `E_dev_${Date.now()}`,
      sender:      sender.email,
      senderName:  sender.name,
      to:          "info@promaster.co",
      subject:     subject.text,
      preview:     subject.preview,
      body:        `${subject.preview}\n\nEsta é uma mensagem de teste gerada automaticamente pelas ferramentas de desenvolvimento.\n\nCom os melhores cumprimentos,\n${sender.name}\n${sender.company}`,
      attachments: [],
      received:    nowReceived(),
      isInternal:  false,
      isNewClient: false,
      aiSuggestion: { type: subject.type, category: subject.category, confidence: Math.round((0.75 + Math.random() * 0.24) * 100) / 100 },
      status:      "pending",
    };
    const current = store.getInboxEmails();
    const next    = [...current, newEmail];
    store.saveInboxEmails(next);
    setInboxEmails(next);
  }

  // ── Tool 3: Clear inbox and tasks ────────────────────────────────────────
  function handleClearInboxAndTasks() {
    store.saveInboxEmails([]);
    store.saveTarefas([]);
    setInboxEmails([]);
    setTarefas([]);
    setThemeVersion(v => v + 1);
  }

  // ── Tool 4: Clear admin data ──────────────────────────────────────────────
  function handleClearAdminData() {
    // Keep only the currently logged-in user
    const me = store.getUsers().find(u => u.email === currentUser?.email);
    store.saveUsers(me ? [me] : []);
    store.saveStages([]);
    store.saveFUStatuses([]);
    store.savePriorities([]);
    store.saveRoles([]);
    store.saveAssignment({ cotacao: null, comercial: null, compra: null });
    store.saveTaskAssignment({});
    setThemeVersion(v => v + 1);
  }

  // ── Tool 5: Restore all mock data ────────────────────────────────────────
  function handleRestoreMockData() {
    const keys = [
      "crm_users", "crm_stages", "crm_fu", "crm_priorities", "crm_roles",
      "crm_assignment", "crm_task_assignment", "crm_tarefas", "crm_inbox",
      "crm_col_prefs", "crm_sort_prefs", "crm_branding", "crm_theme",
    ];
    keys.forEach(k => localStorage.removeItem(k));
    setProcessos([...PROCESSOS]);
    setTarefas([...TAREFAS]);
    setInboxEmails([...INBOX_EMAILS]);
    setThemeVersion(v => v + 1);
  }

  return (
    <div style={{
      position: "fixed", bottom: 16, right: 16, zIndex: 9999,
      width: collapsed ? "auto" : 220,
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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#f87171", letterSpacing: "0.1em" }}>
            ⚠ DEV ONLY
          </span>
        </div>
        <Icon name={collapsed ? "chevron-up" : "chevron-down"} size={12} color="#f87171" />
      </div>

      {/* Tools */}
      {!collapsed && (
        <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>

          {/* Tool 1 — User switcher */}
          <UserSwitcher currentUser={currentUser} onSwitchUser={onSwitchUser} />

          <div style={{ borderTop: "1px solid #1e293b", margin: "2px 0" }} />

          {/* Tool 2 — Generate random inbox email */}
          <ToolButton
            label="Gerar email aleatório"
            icon="mail"
            color="#a3e635"
            bg="#14330a"
            onClick={handleGenerateEmail}
          />

          {/* Tool 3 — Clear inbox and tasks */}
          <WithConfirm
            label="Limpar Inbox e Tarefas"
            icon="x"
            color="#fb923c"
            bg="#1c1005"
            message="Remove todos os emails e tarefas. Continuar?"
            onConfirm={handleClearInboxAndTasks}
          />

          {/* Tool 4 — Clear admin data */}
          <WithConfirm
            label="Limpar dados admin"
            icon="settings"
            color="#e879f9"
            bg="#1a0a1a"
            message="Remove utilizadores (excepto o actual), estados, prioridades e funções. Continuar?"
            onConfirm={handleClearAdminData}
          />

          {/* Tool 5 — Restore mock data */}
          <WithConfirm
            label="Repor todos os dados mock"
            icon="check"
            color="#f87171"
            bg="#2d0a0a"
            message="Repõe TUDO ao estado original dos dados mock. Continuar?"
            onConfirm={handleRestoreMockData}
          />
        </div>
      )}
    </div>
  );
}
