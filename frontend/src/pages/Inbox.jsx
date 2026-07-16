import { useState, useEffect, useRef } from "react";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { useWindowSize } from "../utils.js";
import { getAISuggestion, getAISimulationEnabled } from "../api/client.js";
import { getTypeColor } from "./Tarefas.jsx";
import { Tag } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

const LABEL = { fontSize: 10, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 };

// ── Email preview panel — read-only view (sender, subject, body, attachments only) ──
function EmailPreviewPanel({ email, onClose }) {
  const { isMobile } = useWindowSize();
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

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

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

// ── Resolve the Supervisor user name from crm_user_roles ─────────────────────
function getSupervisorName() {
  const userRoles = store.getUserRoles();
  const users = store.getUsers().filter(u => u.active !== false);
  for (const u of users) {
    const roleIds = userRoles[u.id] ?? [];
    if (roleIds.includes("supervisor")) return u.name;
  }
  return users.find(u => u.role === "supervisor")?.name ?? "Supervisor";
}

function triageNowTs() {
  return new Date("2026-05-15T12:00:00")
    .toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    .replace(",", "");
}

// ── Email→task triage — classifies pending inbox emails into tasks. Must run
// at the app shell level (Main.jsx), not inside the Inbox page component,
// since the page only mounts when the user actually visits /inbox — emails
// generated elsewhere (e.g. DevTools) would otherwise sit untriaged, with no
// task created, until someone happens to open Inbox. ─────────────────────────
export function useEmailTriage({ inboxEmails, setInboxEmails, tarefas, setTarefas }) {
  const processedRef = useRef(new Set());

  useEffect(() => {
    const simOn = getAISimulationEnabled();

    const unprocessed = inboxEmails.filter(
      e => !e.isInternal && e.status === "pending" && !processedRef.current.has(e.id)
    );
    if (unprocessed.length === 0) return;

    let changed = false;
    let updatedEmails = [...inboxEmails];
    const newTasks = [];

    for (const email of unprocessed) {
      processedRef.current.add(email.id);

      let outcome; // "A" (auto-triaged) or "B" (requires-attention)
      let taskType = null;
      let taskTypeObj = null;
      let owner = null;

      if (!simOn) {
        // AI Simulation OFF → everything to Supervisor, no classification
        outcome = "B";
        owner = getSupervisorName();
      } else {
        const suggestion = getAISuggestion(email);
        const taskTypes = store.getTaskTypes();

        if (
          suggestion &&
          suggestion.confidence >= 0.6 &&
          suggestion.type !== null &&
          (taskTypeObj = taskTypes.find(t => t.label === suggestion.type))
        ) {
          // OUTCOME A — confident, valid type
          outcome = "A";
          taskType = suggestion.type;
          owner = store.assignForTaskType(taskTypeObj.id, email.senderName) || getSupervisorName();
        } else {
          // OUTCOME B — no suggestion, low confidence, null type, or type not in store
          outcome = "B";
          owner = getSupervisorName();
        }
      }

      // B outcomes: unclassified — type stays null, assigned to Supervisor
      if (outcome === "B") {
        taskType = null;
        taskTypeObj = null;
      }

      const porFazerLabel = store.getLabelForSystemRole("Por Fazer") ?? "Por Fazer";
      const seq = String((tarefas.length + newTasks.length + 1)).padStart(3, "0");
      const taskId = `T${seq}`;

      newTasks.push({
        id:             taskId,
        type:           taskType,
        status:         porFazerLabel,
        owner,
        client:         email.senderName,
        originEmail: {
          sender:       email.sender,
          senderName:   email.senderName,
          subject:      email.subject,
          preview:      email.preview,
          body:         email.body || "",
          attachments:  email.attachments || [],
        },
        originProcesso: null,
        description:    outcome === "A"
          ? `[IA] Email de ${email.senderName}: ${email.subject}`
          : `Email requer triagem manual — atribuído ao Supervisor.`,
        escalationNote: null,
        priority:       "Normal",
        created:        "15/05/2026",
        due:            "17/05/2026",
        history: [
          {
            actor: outcome === "A" ? "IA (Simulado)" : "Sistema",
            action: outcome === "A" ? "Criada automaticamente" : "Requer triagem",
            note: outcome === "A"
              ? `${taskType} · ${Math.round((getAISuggestion(email)?.confidence ?? 0) * 100)}% confiança`
              : "Sem classificação — atribuído ao Supervisor para triagem manual.",
            ts: triageNowTs(),
          },
        ],
      });

      if (outcome === "A") {
        updatedEmails = updatedEmails.map(e =>
          e.id === email.id
            ? { ...e, status: "auto-triaged", autoTaskType: taskType, autoOwner: owner, autoTaskId: taskId, autoConfidence: getAISuggestion(email)?.confidence ?? 0 }
            : e
        );
      } else {
        updatedEmails = updatedEmails.map(e =>
          e.id === email.id
            ? { ...e, status: "requires-attention", autoOwner: owner, autoTaskId: taskId }
            : e
        );
      }
      changed = true;
    }

    if (changed) {
      const nextTarefas = [...tarefas, ...newTasks];
      setTarefas(nextTarefas);
      store.saveTarefas(nextTarefas);
      setInboxEmails(updatedEmails);
      store.saveInboxEmails(updatedEmails);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxEmails]);
}

// ── Inbox page ────────────────────────────────────────────────────────────────
export function Inbox({ inboxEmails, setInboxEmails, processos, setProcessos, tarefas, setTarefas, currentUser, accent }) {
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Triage itself now runs at the shell level (Main.jsx via useEmailTriage)
  // so it fires regardless of which page is active — not here.

  // ── Section splits ─────────────────────────────────────────────────────────
  const simOn = getAISimulationEnabled();
  const autoTriaged    = inboxEmails.filter(e => !e.isInternal && e.status === "auto-triaged");
  const requiresAttn   = inboxEmails.filter(e => !e.isInternal && (e.status === "requires-attention" || (!simOn && e.status === "pending")));

  const totalVisible = autoTriaged.length + requiresAttn.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      {/* Page header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Inbox</h1>
        <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
          {requiresAttn.length > 0
            ? `${requiresAttn.length} ${requiresAttn.length === 1 ? "email requer" : "emails requerem"} atenção manual`
            : totalVisible > 0
            ? "Todos os emails foram processados automaticamente"
            : "Inbox vazia"
          }
          {autoTriaged.length > 0 && requiresAttn.length > 0 && ` · ${autoTriaged.length} processados automaticamente`}
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

        {/* ── Section 1: Processados automaticamente (only when AI Simulation ON) ── */}
        {simOn && autoTriaged.length > 0 && (
          <>
            <SectionDivider label="Processados automaticamente" count={autoTriaged.length} />
            {autoTriaged.map(email => {
              const aiC = email.autoTaskType ? getTypeColor(email.autoTaskType) : null;
              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  style={{
                    background: THEME.card,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 10,
                    padding: "12px 16px",
                    opacity: 0.65,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: THEME.sidebar, border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Icon name="cpu" size={14} color="#c084fc" />
                    </div>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {aiC && <Tag bg={aiC.bg} color={aiC.color}>{email.autoTaskType}</Tag>}
                        {email.autoOwner && (
                          <span style={{ fontSize: 11, color: THEME.textDim }}>→ {email.autoOwner}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── Section 2: Requerem atenção manual (always visible) ── */}
        <SectionDivider
          label="Requerem atenção manual"
          count={requiresAttn.length > 0 ? requiresAttn.length : undefined}
        />

        {requiresAttn.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: THEME.textDim, fontSize: 13 }}>
            Sem emails a aguardar triagem manual
          </div>
        )}

        {requiresAttn.map(email => (
          <div
            key={email.id}
            onClick={() => setSelectedEmail(email)}
            style={{
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 10,
              padding: "13px 16px",
              cursor: "pointer",
              transition: "all 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.accent + "44"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.border; }}
          >
            {email.isNewClient && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: THEME.warning, background: THEME.warningBg, borderRadius: 4, padding: "1px 7px" }}>
                  CLIENTE NÃO RECONHECIDO
                </span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: THEME.sidebar, border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Icon name="mail" size={15} color={THEME.textMuted} />
              </div>
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
              <Icon name="chevron" size={14} color={THEME.textDim} style={{ flexShrink: 0 }} />
            </div>
          </div>
        ))}
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
