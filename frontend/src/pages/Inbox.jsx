import { useState } from "react";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { Tag } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";
import { TAREFAS } from "../mock/data.js";

const TASK_TYPES = ["Contas Correntes", "Status de Encomenda", "Desconto", "Cliente Novo", "Diversos"];

const AI_TYPE_COLORS = {
  "Processo": { bg: "#1e3a5f", color: "#60a5fa" },
  "Tarefa":   { bg: THEME.warningBg, color: THEME.warning },
  "Diversos": { bg: THEME.sidebar, color: THEME.textMuted },
  "Spam":     { bg: THEME.dangerBg, color: THEME.danger },
};

const LABEL = { fontSize: 10, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 };
const INPUT = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.sidebar, color: THEME.text };

// ── New client modal ──────────────────────────────────────────────────────────
function NewClientModal({ senderName, senderEmail, onClose, onSave }) {
  const [name,  setName]  = useState(senderName);
  const [email, setEmail] = useState(senderEmail);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 380, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
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
  const [type, setType] = useState(TASK_TYPES[0]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 340, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Tipo de tarefa</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          {TASK_TYPES.map(t => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: type === t ? `${THEME.accent}22` : "transparent", cursor: "pointer", border: type === t ? `1px solid ${THEME.accent}55` : "1px solid transparent" }}>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 380, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
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

// ── Inbox page ────────────────────────────────────────────────────────────────
export function Inbox({ inboxEmails, setInboxEmails, processos, setProcessos, tarefas, setTarefas, currentUser, accent }) {
  const [emails,          setEmails]          = useState(inboxEmails);
  // Active modal state: { type, emailId } or null
  const [modal,           setModal]           = useState(null);
  // Track which emails have had their new-client banner dismissed
  const [clientCreated,   setClientCreated]   = useState(new Set());
  // Counter for generating new process IDs
  const [nextSeq,         setNextSeq]         = useState(() => {
    const ids = processos.map(p => p.id).filter(id => id.startsWith("2605"));
    const max  = ids.reduce((m, id) => Math.max(m, parseInt(id.slice(4)) || 0), 10);
    return max + 1;
  });

  // Only show non-internal, pending emails
  const visible = emails.filter(e => !e.isInternal && e.status === "pending");

  function updateEmail(id, patch) {
    const next = emails.map(e => e.id === id ? { ...e, ...patch } : e);
    setEmails(next);
    setInboxEmails(next);
    store.saveInboxEmails(next);
  }

  function handleConfirmProcesso(emailId) {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;
    // Generate AAMMMNNN ID
    const seq    = String(nextSeq).padStart(3, "0");
    const newId  = `2605${seq}`;
    setNextSeq(n => n + 1);

    const newProcesso = {
      id:        newId,
      created:   "15/05/2026",
      deadline:  "22/05/2026",
      priority:  "Normal",
      status:    1,
      client:    email.senderName,
      ref:       "",
      brand:     "",
      model:     "",
      vin:       "",
      owner:     "Adelina Rodrigues",
      comm:      "João Morais",
      compra:    "Carlos Andrade",
      comprador: email.senderName,
      price:     null,
      emails:    1,
      note:      `Criado via Inbox — ${email.subject}`,
      archived:  false,
      carryover: false,
      excelLink: "Excel Modelo.xlsx",
      timeline: [
        { icon: "mail",  color: "#60a5fa", time: "15/05 " + email.received.split(" ")[1], text: `Email recebido de ${email.sender} — ${email.subject}` },
        { icon: "cpu",   color: "#c084fc", time: "15/05 " + email.received.split(" ")[1], text: `IA classificou: ${email.aiSuggestion?.category ?? "Pedido de Cotação"}` },
        { icon: "user",  color: "#94a3b8", time: "15/05 " + email.received.split(" ")[1], text: "Processo criado via triagem de Inbox" },
      ],
    };

    setProcessos(prev => [...prev, newProcesso]);
    updateEmail(emailId, { status: "processed", generatedId: newId });
    setModal(null);
  }

  function handleConfirmTarefa(emailId, type) {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;
    const seq = String(tarefas.length + 1).padStart(3, "0");
    const newTarefa = {
      id:          `T${seq}`,
      type,
      client:      email.senderName,
      comprador:   email.senderName,
      assigned:    "Adelina Rodrigues",
      status:      "Pendente",
      created:     "15/05/2026",
      due:         "22/05/2026",
      priority:    "Normal",
      description: email.subject,
      originEmail: { sender: email.sender, subject: email.subject, preview: email.preview },
      attachments: [],
    };
    const nextTarefas = [...tarefas, newTarefa];
    setTarefas(nextTarefas);
    store.saveTarefas(nextTarefas);
    updateEmail(emailId, { status: "processed" });
    setModal(null);
  }

  function handleAssociate(emailId, processId) {
    updateEmail(emailId, { status: "processed", associatedTo: processId });
    setModal(null);
  }

  function handleDiversos(emailId) {
    updateEmail(emailId, { status: "diversos" });
  }

  const pendingCount = visible.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      {/* Page header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Inbox</h1>
        <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
          {pendingCount} {pendingCount === 1 ? "email pendente" : "emails pendentes"} de triagem
        </div>
      </div>

      {/* Email list */}
      <div style={{ padding: "0 24px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: THEME.textDim, fontSize: 14 }}>
            <Icon name="inbox" size={32} color={THEME.border} style={{ display: "block", margin: "0 auto 12px" }} />
            Inbox vazia — sem emails pendentes
          </div>
        )}

        {visible.map(email => {
          const aiC = email.aiSuggestion ? (AI_TYPE_COLORS[email.aiSuggestion.type] || AI_TYPE_COLORS["Diversos"]) : null;
          const showNewClientBanner = email.isNewClient && !clientCreated.has(email.id);

          return (
            <div key={email.id} style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, overflow: "hidden" }}>

              {/* New client banner */}
              {showNewClientBanner && (
                <div style={{ background: THEME.warningBg, borderBottom: `1px solid ${THEME.warning}44`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="alert" size={14} color={THEME.warning} />
                  <span style={{ flex: 1, fontSize: 12, color: THEME.warning }}>Cliente não reconhecido — criar ficha de cliente?</span>
                  <button
                    onClick={() => setModal({ type: "newClient", emailId: email.id, sender: email.senderName, senderEmail: email.sender })}
                    style={{ background: THEME.warning, color: "white", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                  >
                    Criar Cliente
                  </button>
                  <button
                    onClick={() => setClientCreated(prev => new Set([...prev, email.id]))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textDim, padding: 2 }}
                  >
                    <Icon name="x" size={13} />
                  </button>
                </div>
              )}

              {/* Email row */}
              <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                {/* Left — email info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.senderName}</span>
                    <span style={{ fontSize: 11, color: THEME.textDim, flexShrink: 0 }}>{email.received}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject}</div>
                  <div style={{ fontSize: 12, color: THEME.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.preview}</div>

                  {/* AI suggestion */}
                  {email.aiSuggestion && aiC && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="cpu" size={12} color={THEME.textDim} />
                      <span style={{ fontSize: 11, color: THEME.textDim }}>IA sugere:</span>
                      <Tag bg={aiC.bg} color={aiC.color}>{email.aiSuggestion.type}</Tag>
                      {email.aiSuggestion.category && (
                        <span style={{ fontSize: 11, color: THEME.textDim }}>— {email.aiSuggestion.category}</span>
                      )}
                      <span style={{ fontSize: 10, color: THEME.textDim }}>{Math.round(email.aiSuggestion.confidence * 100)}%</span>
                    </div>
                  )}
                </div>

                {/* Right — action buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                  <button
                    onClick={() => handleConfirmProcesso(email.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, background: "#1e3a5f", color: "#60a5fa", border: `1px solid #60a5fa44`, borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    <Icon name="plus" size={11} color="#60a5fa" /> Novo Processo
                  </button>
                  <button
                    onClick={() => setModal({ type: "tarefa", emailId: email.id })}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, background: THEME.warningBg, color: THEME.warning, border: `1px solid ${THEME.warning}44`, borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    <Icon name="tasks" size={11} color={THEME.warning} /> Nova Tarefa
                  </button>
                  <button
                    onClick={() => setModal({ type: "associate", emailId: email.id })}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    <Icon name="paperclip" size={11} color={THEME.textMuted} /> Associar
                  </button>
                  <button
                    onClick={() => handleDiversos(email.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, background: THEME.sidebar, color: THEME.textDim, border: `1px solid ${THEME.border}`, borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    <Icon name="x" size={11} color={THEME.textDim} /> Diversos
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {modal?.type === "newClient" && (
        <NewClientModal
          senderName={modal.sender}
          senderEmail={modal.senderEmail}
          onClose={() => setModal(null)}
          onSave={() => setClientCreated(prev => new Set([...prev, modal.emailId]))}
        />
      )}
      {modal?.type === "tarefa" && (
        <TaskTypeModal
          onClose={() => setModal(null)}
          onSave={type => handleConfirmTarefa(modal.emailId, type)}
        />
      )}
      {modal?.type === "associate" && (
        <AssociateModal
          processos={processos}
          onClose={() => setModal(null)}
          onSave={pid => handleAssociate(modal.emailId, pid)}
        />
      )}
    </div>
  );
}
