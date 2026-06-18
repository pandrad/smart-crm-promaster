import { useState, useEffect, useRef } from "react";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { useWindowSize } from "../utils.js";
import { getAISuggestion, getAISimulationEnabled } from "../api/client.js";
import { getTypeColor } from "./Tarefas.jsx";
import { Tag } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

const LABEL = { fontSize: 10, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 };

// ── Email preview panel — read-only view ─────────────────────────────────────
function EmailPreviewPanel({ email, onClose }) {
  const { isMobile } = useWindowSize();

  const aiSuggestion = getAISuggestion(email);
  const aiC = aiSuggestion ? getTypeColor(aiSuggestion.type) : null;

  const bodyParagraphs = (email.body || email.preview || "").split("\n");

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 48 }} />

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

        {/* Scrollable body — read-only, no action buttons */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* AI suggestion (informational only) */}
          {aiSuggestion && aiC && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "8px 12px", background: THEME.sidebar, borderRadius: 8, border: `1px solid ${THEME.border}` }}>
              <Icon name="cpu" size={13} color={THEME.textDim} />
              <span style={{ fontSize: 12, color: THEME.textDim }}>IA sugere:</span>
              <Tag bg={aiC.bg} color={aiC.color}>{aiSuggestion.type}</Tag>
              {aiSuggestion.category && aiSuggestion.category !== aiSuggestion.type && (
                <span style={{ fontSize: 12, color: THEME.textDim }}>— {aiSuggestion.category}</span>
              )}
              <span style={{ fontSize: 11, color: THEME.textDim, marginLeft: "auto" }}>{Math.round(aiSuggestion.confidence * 100)}% confiança</span>
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
            <div>
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
        </div>
      </div>
    </>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionDivider({ label, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 4px" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "1px 7px" }}>
          {count}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: THEME.border }} />
    </div>
  );
}

// ── Inbox page ────────────────────────────────────────────────────────────────
export function Inbox({ inboxEmails, setInboxEmails, processos, setProcessos, tarefas, setTarefas, currentUser, accent }) {
  const [selectedEmail, setSelectedEmail] = useState(null);

  const autoProcessedRef = useRef(new Set());

  function syncEmails(next) {
    setInboxEmails(next);
    store.saveInboxEmails(next);
  }

  function nowTs() {
    return new Date("2026-05-15T12:00:00")
      .toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
      .replace(",", "");
  }

  // ── AI auto-triage ────────────────────────────────────────────────────────
  // All emails with an aiSuggestion are auto-routed to tasks.
  // Classified emails (confidence >= 0.6) only process when AI sim is ON.
  // Não Classificado emails ALWAYS auto-route to Supervisor regardless of toggle.
  useEffect(() => {
    const simOn = getAISimulationEnabled();

    const pendingEmails = inboxEmails.filter(
      e => !e.isInternal && e.status === "pending" && !autoProcessedRef.current.has(e.id)
    );
    if (pendingEmails.length === 0) return;

    let emailsChanged = false;
    let updatedEmails = [...inboxEmails];
    const newTasks = [];

    for (const email of pendingEmails) {
      const suggestion = getAISuggestion(email);
      if (!suggestion) { autoProcessedRef.current.add(email.id); continue; }

      const isUnclassified = suggestion.confidence < 0.6 || suggestion.type === "Não Classificado";

      if (!isUnclassified && !simOn) { continue; }

      autoProcessedRef.current.add(email.id);
      const taskType = isUnclassified ? "Não Classificado" : suggestion.type;

      const taskTypes  = store.getTaskTypes();
      const taskTypeObj = taskTypes.find(t => t.label === taskType);
      if (!taskTypeObj) continue;

      const owner = isUnclassified
        ? (store.getUsers().find(u => u.role === "supervisor" && u.active !== false)?.name ?? "Supervisor")
        : store.assignForTaskType(taskTypeObj.id, email.senderName);
      const seq   = String((tarefas.length + newTasks.length + 1)).padStart(3, "0");
      const taskId = `T${seq}`;

      newTasks.push({
        id:            taskId,
        type:          taskType,
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
        description:   isUnclassified
          ? `Email não classificado pela IA — remetente e assunto não correspondem a nenhuma categoria conhecida. Atribuído ao Supervisor para triagem manual.`
          : `[IA] Email de ${email.senderName}: ${email.subject}`,
        escalationNote: null,
        priority:      "Normal",
        created:       "15/05/2026",
        due:           "17/05/2026",
        history: [
          { actor: isUnclassified ? "Sistema" : "IA (Simulado)", action: isUnclassified ? "Não Classificado" : "Criada automaticamente", note: `${taskType} · ${Math.round(suggestion.confidence * 100)}% confiança`, ts: nowTs() },
        ],
      });

      updatedEmails = updatedEmails.map(e =>
        e.id === email.id
          ? { ...e, status: "auto-triaged", autoTaskType: taskType, autoOwner: owner, autoTaskId: taskId, autoConfidence: suggestion.confidence }
          : e
      );
      emailsChanged = true;
    }

    if (emailsChanged) {
      const nextTarefas = [...tarefas, ...newTasks];
      setTarefas(nextTarefas);
      store.saveTarefas(nextTarefas);
      syncEmails(updatedEmails);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxEmails]);

  // Split: auto-triaged vs pending (shown read-only)
  const autoTriaged = inboxEmails.filter(e => !e.isInternal && e.status === "auto-triaged");
  const pending     = inboxEmails.filter(e => !e.isInternal && e.status === "pending");

  const totalVisible = autoTriaged.length + pending.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      {/* Page header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Inbox</h1>
        <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
          {pending.length > 0
            ? `${pending.length} ${pending.length === 1 ? "email pendente" : "emails pendentes"} de triagem manual`
            : totalVisible > 0
            ? "Todos os emails foram processados automaticamente"
            : "Inbox vazia"
          }
          {autoTriaged.length > 0 && pending.length > 0 && ` · ${autoTriaged.length} processados automaticamente`}
        </div>
      </div>

      {/* Email list */}
      <div style={{ padding: "0 24px 32px", display: "flex", flexDirection: "column", gap: 8 }}>

        {totalVisible === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: THEME.textDim, fontSize: 14 }}>
            <Icon name="inbox" size={32} color={THEME.border} style={{ display: "block", margin: "0 auto 12px" }} />
            Inbox vazia — sem emails pendentes
          </div>
        )}

        {/* ── Section 1: Processados automaticamente ── */}
        {autoTriaged.length > 0 && (
          <>
            <SectionDivider label="Processados automaticamente" count={autoTriaged.length} />
            {autoTriaged.map(email => {
              const aiC = email.autoTaskType ? getTypeColor(email.autoTaskType) : null;
              return (
                <div
                  key={email.id}
                  style={{
                    background: THEME.card,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 10,
                    padding: "12px 16px",
                    opacity: 0.65,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    {/* Email icon */}
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: THEME.sidebar, border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Icon name="cpu" size={14} color="#c084fc" />
                    </div>

                    {/* Email info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {email.senderName}
                        </span>
                        <span style={{ fontSize: 11, color: THEME.textDim, flexShrink: 0 }}>{email.received}</span>
                      </div>
                      <div style={{ fontSize: 12, color: THEME.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                        {email.subject}
                      </div>
                      {/* Task type + owner */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {aiC && (
                          <Tag bg={aiC.bg} color={aiC.color}>{email.autoTaskType}</Tag>
                        )}
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#c084fc", background: "#2e1065", borderRadius: 3, padding: "1px 5px", letterSpacing: "0.05em" }}>SIM</span>
                        {email.autoOwner && (
                          <span style={{ fontSize: 11, color: THEME.textDim }}>→ {email.autoOwner}</span>
                        )}
                        {email.autoConfidence && (
                          <span style={{ fontSize: 10, color: THEME.textDim }}>{Math.round(email.autoConfidence * 100)}% confiança</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── Section 2: Requerem atenção manual ── */}
        {(pending.length > 0 || (autoTriaged.length > 0 && pending.length === 0)) && (
          <SectionDivider
            label="Requerem atenção manual"
            count={pending.length > 0 ? pending.length : undefined}
          />
        )}

        {pending.length === 0 && autoTriaged.length > 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: THEME.textDim, fontSize: 13 }}>
            Sem emails a aguardar triagem manual
          </div>
        )}

        {pending.map(email => {
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
              {/* New client indicator (informational only) */}
              {email.isNewClient && (
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

      {/* Email preview panel — read-only */}
      {selectedEmail && (
        <EmailPreviewPanel
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
}
