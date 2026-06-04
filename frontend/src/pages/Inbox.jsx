import { useState } from "react";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { useWindowSize } from "../utils.js";
import { getAISuggestion } from "../api/client.js";
import { getTypeColor } from "./Tarefas.jsx";
import { Tag } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

// System-only types not shown in the manual triage picker
const SYSTEM_TYPES = new Set(["Validação de Processo", "Não Classificado", "Escalação", "Abertura de Processo"]);
// Derived at call-time from store so admin additions are reflected immediately
function getInboxTaskTypes() {
  return store.getTaskTypes().map(t => t.label).filter(l => !SYSTEM_TYPES.has(l));
}

const LABEL = { fontSize: 10, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 };
const INPUT = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.sidebar, color: THEME.text };

// ── New client modal ──────────────────────────────────────────────────────────
function NewClientModal({ senderName, senderEmail, onClose, onSave }) {
  const [name,  setName]  = useState(senderName);
  const [email, setEmail] = useState(senderEmail);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 380, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Criar ficha de cliente</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Nome do cliente</label>
            <input style={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="Nome da empresa" />
          </div>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Email de contacto</label>
            <input style={INPUT} value={email} onChange={e => setEmail(e.target.value)} placeholder="email@empresa.co.ao" />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave({ name, email }); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Criar cliente</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Task type selector modal ──────────────────────────────────────────────────
function TaskTypeModal({ onClose, onSave }) {
  const types = getInboxTaskTypes();
  const [type, setType] = useState(types[0] ?? "Diversos");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 340, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Tipo de tarefa</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 5 }}>
          {types.map(t => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: type === t ? `${THEME.accent}22` : "transparent", cursor: "pointer", border: type === t ? `1px solid ${THEME.accent}55` : "1px solid transparent" }}>
              <input type="radio" name="task-type" checked={type === t} onChange={() => setType(t)} style={{ accentColor: THEME.accent }} />
              <span style={{ fontSize: 13, color: type === t ? THEME.text : THEME.textMuted }}>{t}</span>
            </label>
          ))}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(type); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Associate to process modal ────────────────────────────────────────────────
function AssociateModal({ processos, onClose, onSave }) {
  const [processId, setProcessId] = useState("");
  const [error,     setError]     = useState("");

  function handleSave() {
    const found = processos.find(p => p.id === processId.trim());
    if (!found) { setError(`Processo "${processId}" não encontrado.`); return; }
    onSave(processId.trim());
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 380, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Associar a processo</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Número do processo</label>
            <input style={INPUT} value={processId} onChange={e => { setProcessId(e.target.value); setError(""); }} placeholder="ex: 2605003" />
          </div>
          {error && <div style={{ fontSize: 12, color: THEME.danger }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={handleSave} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Associar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Email preview panel ───────────────────────────────────────────────────────
// Full right-side drawer showing the email body + all triage actions.
// This is the primary interaction surface — action buttons only appear here.
function EmailPreviewPanel({ email, processos, tarefas, currentUser, onClose, onAction, clientCreated, onCreateClient }) {
  const { isMobile } = useWindowSize();
  const [modal, setModal] = useState(null); // "tarefa" | "associate" | "newClient"

  const aiSuggestion = getAISuggestion(email);
  const aiC = aiSuggestion ? getTypeColor(aiSuggestion.type) : null;
  const showNewClientBanner = email.isNewClient && !clientCreated.has(email.id);

  // Format body text: replace \n with <br> equivalent by splitting
  const bodyParagraphs = (email.body || email.preview || "").split("\n");

  return (
    <>
      {/* Backdrop — z-index 48 so it sits below the panel (z-49) but above the inbox list */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 48 }} />

      {/* Panel */}
      <div style={isMobile
        ? { position: "fixed", bottom: 0, left: 0, right: 0, height: "92dvh", background: THEME.bg, zIndex: 49, display: "flex", flexDirection: "column", boxShadow: "0 -4px 40px rgba(0,0,0,0.5)", borderRadius: "16px 16px 0 0", borderTop: `1px solid ${THEME.border}` }
        : { position: "fixed", top: 0, right: 0, height: "100vh", width: 540, maxWidth: "96vw", background: THEME.bg, zIndex: 49, display: "flex", flexDirection: "column", boxShadow: "-4px 0 40px rgba(0,0,0,0.5)", borderLeft: `1px solid ${THEME.border}` }
      }>

        {/* Sticky header */}
        <div style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}`, padding: "14px 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email.senderName}
              </div>
              <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 2 }}>{email.sender}</div>
              <div style={{ fontSize: 11, color: THEME.textDim }}>Para: {email.to || "info@promaster.co"} · {email.received}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4, flexShrink: 0 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* New client banner */}
          {showNewClientBanner && (
            <div style={{ background: THEME.warningBg, border: `1px solid ${THEME.warning}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="alert" size={14} color={THEME.warning} />
              <span style={{ flex: 1, fontSize: 12, color: THEME.warning }}>Cliente não reconhecido — criar ficha de cliente?</span>
              <button
                onClick={() => setModal("newClient")}
                style={{ background: THEME.warning, color: "white", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
              >
                Criar Cliente
              </button>
              <button
                onClick={() => onCreateClient(email.id, null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textDim, padding: 2 }}
              >
                <Icon name="x" size={13} />
              </button>
            </div>
          )}

          {/* AI suggestion */}
          {aiSuggestion && aiC && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "8px 12px", background: THEME.sidebar, borderRadius: 8, border: `1px solid ${aiSuggestion.simulated ? "#7c3aed44" : THEME.border}` }}>
              <Icon name="cpu" size={13} color={aiSuggestion.simulated ? "#c084fc" : THEME.textDim} />
              <span style={{ fontSize: 12, color: THEME.textDim }}>IA sugere:</span>
              <Tag bg={aiC.bg} color={aiC.color}>{aiSuggestion.type}</Tag>
              {aiSuggestion.category && aiSuggestion.category !== aiSuggestion.type && (
                <span style={{ fontSize: 12, color: THEME.textDim }}>— {aiSuggestion.category}</span>
              )}
              <span style={{ fontSize: 11, color: THEME.textDim, marginLeft: "auto" }}>{Math.round(aiSuggestion.confidence * 100)}% confiança</span>
              {aiSuggestion.simulated && (
                <span style={{ fontSize: 9, fontWeight: 700, color: "#c084fc", background: "#2e1065", borderRadius: 4, padding: "1px 5px", letterSpacing: "0.05em" }}>SIM</span>
              )}
            </div>
          )}

          {/* Subject */}
          <div style={{ fontSize: 16, fontWeight: 700, color: THEME.text, marginBottom: 16, lineHeight: 1.3 }}>
            {email.subject}
          </div>

          {/* Body */}
          <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.7, background: THEME.card, borderRadius: 8, padding: "14px 16px", border: `1px solid ${THEME.border}`, marginBottom: 16 }}>
            {bodyParagraphs.map((line, i) => (
              line.trim() === ""
                ? <br key={i} />
                : <p key={i} style={{ margin: "0 0 6px" }}>{line}</p>
            ))}
          </div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...LABEL, marginBottom: 8 }}>Anexos</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {email.attachments.map((att, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 7 }}>
                    <Icon name="paperclip" size={13} color={THEME.textMuted} />
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>{att.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Triage action buttons */}
          <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 16 }}>
            <div style={{ ...LABEL, marginBottom: 10 }}>Triagem</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              {/* Confirmar como Processo → creates Validação de Processo task */}
              <button
                onClick={() => onAction("preEntrada", email.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, background: "#0c1a2e", color: "#93c5fd", border: "1px solid #60a5fa44", borderRadius: 9, cursor: "pointer", textAlign: "left" }}
              >
                <Icon name="plus" size={14} color="#93c5fd" />
                <div>
                  <div>Confirmar como Processo</div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: "#60a5fa", marginTop: 1 }}>Cria tarefa de validação · Resp. Cotação valida antes de abrir</div>
                </div>
              </button>

              {/* Confirmar como Tarefa */}
              <button
                onClick={() => setModal("tarefa")}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, background: THEME.warningBg, color: THEME.warning, border: `1px solid ${THEME.warning}44`, borderRadius: 9, cursor: "pointer", textAlign: "left" }}
              >
                <Icon name="tasks" size={14} color={THEME.warning} />
                <div>
                  <div>Confirmar como Tarefa</div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: THEME.textDim, marginTop: 1 }}>Seleccionar tipo de tarefa</div>
                </div>
              </button>

              {/* Associar a processo existente */}
              <button
                onClick={() => setModal("associate")}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 9, cursor: "pointer", textAlign: "left" }}
              >
                <Icon name="paperclip" size={14} color={THEME.textMuted} />
                <div>
                  <div>Associar a processo existente</div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: THEME.textDim, marginTop: 1 }}>Introduzir número do processo</div>
                </div>
              </button>

              {/* Marcar como Diversos */}
              <button
                onClick={() => onAction("diversos", email.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, background: THEME.sidebar, color: THEME.textDim, border: `1px solid ${THEME.border}`, borderRadius: 9, cursor: "pointer", textAlign: "left" }}
              >
                <Icon name="x" size={14} color={THEME.textDim} />
                <div>
                  <div>Marcar como Diversos</div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: THEME.textDim, marginTop: 1 }}>Remove da fila de triagem</div>
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals rendered above the panel */}
      {modal === "newClient" && (
        <NewClientModal
          senderName={email.senderName}
          senderEmail={email.sender}
          onClose={() => setModal(null)}
          onSave={client => { onCreateClient(email.id, client); setModal(null); }}
        />
      )}
      {modal === "tarefa" && (
        <TaskTypeModal
          onClose={() => setModal(null)}
          onSave={type => { onAction("tarefa", email.id, type); setModal(null); }}
        />
      )}
      {modal === "associate" && (
        <AssociateModal
          processos={processos}
          onClose={() => setModal(null)}
          onSave={pid => { onAction("associate", email.id, pid); setModal(null); }}
        />
      )}
    </>
  );
}

// ── Inbox page ────────────────────────────────────────────────────────────────
export function Inbox({ inboxEmails, setInboxEmails, processos, setProcessos, tarefas, setTarefas, currentUser, accent }) {
  // No local copy — read inboxEmails from Main state directly so DevTools updates
  // are reflected immediately without leaving and re-entering the page.
  const [selectedEmail, setSelectedEmail] = useState(null);  // email object | null
  const [clientCreated, setClientCreated] = useState(new Set()); // email ids whose new-client banner was dismissed

  // Visible = non-internal, pending
  const visible = inboxEmails.filter(e => !e.isInternal && e.status === "pending");

  function syncEmails(next) {
    setInboxEmails(next);
    store.saveInboxEmails(next);
  }

  function markEmailProcessed(id, patch = {}) {
    const next = inboxEmails.map(e => e.id === id ? { ...e, status: "processed", ...patch } : e);
    syncEmails(next);
    // Close panel if the processed email was selected
    setSelectedEmail(prev => prev?.id === id ? null : prev);
  }

  function nowTs() {
    return new Date("2026-05-15T12:00:00")
      .toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
      .replace(",", "");
  }

  // Resolve default owner for a task type via mapeamento
  function ownerForType(type) {
    const tt = store.getTaskTypes().find(t => t.label === type);
    if (!tt) return null;
    return store.assignForTaskType(tt.id);
  }

  // ── Triage actions ────────────────────────────────────────────────────────

  // "Confirmar como Processo" → creates a Validação de Processo task.
  // The validator (Resp. Cotação) will review and either open the process or return it.
  // No process is created here. Email is marked "triaged" (not deleted, accessible in processed view).
  function handlePreEntrada(emailId) {
    const email = inboxEmails.find(e => e.id === emailId);
    if (!email) return;

    const validatorOwner = ownerForType("Validação de Processo");
    const seq = String(tarefas.length + 1).padStart(3, "0");
    const taskId = `T${seq}`;

    const newTarefa = {
      id:              taskId,
      type:            "Validação de Processo",
      status:          "Por Fazer",
      owner:           validatorOwner,        // Resp. Cotação validates first
      triagedBy:       currentUser?.name || "Sistema", // who triaged from inbox
      validatorOwner:  validatorOwner,        // stored separately so Devolver knows who to return to
      client:          email.senderName,
      originEmail: {
        sender:        email.sender,
        senderName:    email.senderName,
        subject:       email.subject,
        preview:       email.preview,
        body:          email.body || "",
        attachments:   email.attachments || [],
      },
      originProcesso:  null,
      description: (() => { const ai = getAISuggestion(email); return `Este email aguarda validação para abertura de processo.\n\nCliente: ${email.senderName} · Remetente: ${email.sender}\nAssunto: ${email.subject}${ai ? `\nSugestão IA${ai.simulated ? " (SIM)" : ""}: ${ai.type} · ${ai.category} (${Math.round(ai.confidence * 100)}%)` : ""}`; })(),
      escalationNote:  null,
      priority:        "Normal",
      created:         "15/05/2026",
      due:             "17/05/2026",
      history: [
        {
          actor:  currentUser?.name || "Sistema",
          action: "Criada via triagem",
          note:   `Email de ${email.senderName} confirmado para abertura de processo. Enviado para validação.`,
          ts:     nowTs(),
        },
      ],
    };

    const nextTarefas = [...tarefas, newTarefa];
    setTarefas(nextTarefas);
    store.saveTarefas(nextTarefas);
    // Mark email as "triaged" — remains accessible, never deleted
    const next = inboxEmails.map(e => e.id === emailId
      ? { ...e, status: "triaged", triagedTaskId: taskId }
      : e
    );
    syncEmails(next);
    setSelectedEmail(null);
  }

  // "Confirmar como Tarefa" → creates a task of the chosen type
  function handleConfirmTarefa(emailId, type) {
    const email = inboxEmails.find(e => e.id === emailId);
    if (!email) return;

    const owner = ownerForType(type);
    const seq   = String(tarefas.length + 1).padStart(3, "0");

    const newTarefa = {
      id:            `T${seq}`,
      type,
      status:        "Por Fazer",
      owner,
      client:        email.senderName,
      originEmail: {
        sender:      email.sender,
        senderName:  email.senderName,
        subject:     email.subject,
        preview:     email.preview,
        body:        email.body || "",
        attachments: email.attachments || [],
      },
      originProcesso: null,
      description:   `Email de ${email.senderName}: ${email.subject}`,
      escalationNote: null,
      priority:      "Normal",
      created:       "15/05/2026",
      due:           "17/05/2026",
      history: [
        { actor: currentUser?.name || "Sistema", action: "Criada via Inbox", note: `${type} — ${email.subject}`, ts: nowTs() },
      ],
    };

    const nextTarefas = [...tarefas, newTarefa];
    setTarefas(nextTarefas);
    store.saveTarefas(nextTarefas);
    markEmailProcessed(emailId);
  }

  function handleAssociate(emailId, processId) {
    markEmailProcessed(emailId, { associatedTo: processId });
  }

  function handleDiversos(emailId) {
    const next = inboxEmails.map(e => e.id === emailId ? { ...e, status: "diversos" } : e);
    syncEmails(next);
    setSelectedEmail(prev => prev?.id === emailId ? null : prev);
  }

  // Unified action dispatcher called from the preview panel
  function handleAction(type, emailId, extra) {
    if (type === "preEntrada") handlePreEntrada(emailId);
    if (type === "tarefa")     handleConfirmTarefa(emailId, extra);
    if (type === "associate")  handleAssociate(emailId, extra);
    if (type === "diversos")   handleDiversos(emailId);
  }

  function handleCreateClient(emailId, client) {
    setClientCreated(prev => new Set([...prev, emailId]));
  }

  const pendingCount = visible.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      {/* Page header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Inbox</h1>
        <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
          {pendingCount} {pendingCount === 1 ? "email pendente" : "emails pendentes"} de triagem · clique para abrir
        </div>
      </div>

      {/* Email list — each row is clickable, no inline action buttons */}
      <div style={{ padding: "0 24px 32px", display: "flex", flexDirection: "column", gap: 8 }}>

        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: THEME.textDim, fontSize: 14 }}>
            <Icon name="inbox" size={32} color={THEME.border} style={{ display: "block", margin: "0 auto 12px" }} />
            Inbox vazia — sem emails pendentes
          </div>
        )}

        {visible.map(email => {
          const aiSug  = getAISuggestion(email);
          const aiC    = aiSug ? getTypeColor(aiSug.type) : null;
          const isSelected = selectedEmail?.id === email.id;

          return (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              style={{
                background: isSelected ? THEME.cardHover : THEME.card,
                border: `1px solid ${isSelected ? THEME.accent + "66" : THEME.border}`,
                borderRadius: 10,
                padding: "13px 16px",
                cursor: "pointer",
                transition: "all 0.1s",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = THEME.accent + "44"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = THEME.border; }}
            >
              {/* New client indicator */}
              {email.isNewClient && !clientCreated.has(email.id) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: THEME.warning, background: THEME.warningBg, borderRadius: 4, padding: "1px 7px" }}>
                    CLIENTE NÃO RECONHECIDO
                  </span>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {/* Email icon */}
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: THEME.sidebar, border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Icon name="mail" size={15} color={THEME.textMuted} />
                </div>

                {/* Email info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {email.senderName}
                    </span>
                    <span style={{ fontSize: 11, color: THEME.textDim, flexShrink: 0 }}>{email.received}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                    {email.subject}
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email.preview}
                  </div>
                </div>

                {/* Right: AI suggestion badge + chevron */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {aiC && aiSug && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Tag bg={aiC.bg} color={aiC.color}>{aiSug.type}</Tag>
                      {aiSug.simulated && (
                        <span style={{ fontSize: 8, fontWeight: 700, color: "#c084fc", background: "#2e1065", borderRadius: 3, padding: "1px 4px", letterSpacing: "0.05em" }}>SIM</span>
                      )}
                    </div>
                  )}
                  <Icon name="chevron" size={14} color={THEME.textDim} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Email preview panel */}
      {selectedEmail && (
        <EmailPreviewPanel
          email={selectedEmail}
          processos={processos}
          tarefas={tarefas}
          currentUser={currentUser}
          onClose={() => setSelectedEmail(null)}
          onAction={handleAction}
          clientCreated={clientCreated}
          onCreateClient={handleCreateClient}
        />
      )}
    </div>
  );
}
