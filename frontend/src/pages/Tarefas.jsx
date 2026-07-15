import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { daysLeft, useWindowSize } from "../utils.js";
import { PROCESSOS } from "../mock/data.js";
import { Avatar, Tag } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

function mobileModal(isMobile, desktopWidth = 460) {
  if (!isMobile) return { width: desktopWidth, maxWidth: "95vw", borderRadius: 14 };
  return { width: "100%", maxWidth: "100%", borderRadius: "16px 16px 0 0", position: "fixed", bottom: 0, left: 0, right: 0, maxHeight: "92dvh", overflowY: "auto" };
}

// These are read from store at runtime; exported for legacy imports only.
export const TASK_TYPES    = () => store.getTaskTypes().map(t => t.label);
export const TASK_STATUSES = () => store.getTaskStatuses().map(s => s.label);

// Helpers — look up colour from live store data, with a safe fallback.
const FALLBACK_TYPE   = { bg: "#1e293b", color: "#94a3b8" };
const FALLBACK_STATUS = { bg: "#1e293b", color: "#94a3b8" };

export function getTypeColor(label) {
  const t = store.getTaskTypes().find(x => x.label === label);
  return t ? { bg: t.bg, color: t.color } : FALLBACK_TYPE;
}
export function getStatusColor(label) {
  const s = store.getTaskStatuses().find(x => x.label === label);
  return s ? { bg: s.bg, color: s.color } : FALLBACK_STATUS;
}

// Keep legacy colour maps so any existing spread-import { TYPE_COLORS } still resolves.
// They are no longer used internally — all internal code calls getTypeColor/getStatusColor.
export const TYPE_COLORS   = {};
export const STATUS_COLORS = {};

const LABEL = { fontSize: 10, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 };
const INPUT = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.sidebar, color: THEME.text };

function nowTs() {
  return new Date("2026-05-15T12:00:00")
    .toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    .replace(",", "");
}

// ── Devolver com Notas modal ───────────────────────────────────────────────────
function DevolverModal({ onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const [note, setNote] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 440) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Devolver com Notas</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: THEME.warningBg, border: `1px solid ${THEME.warning}44`, borderRadius: 7, padding: "8px 12px", fontSize: 12, color: THEME.warning }}>
            A tarefa será devolvida ao responsável pela triagem. Indique exactamente o que falta ou precisa de esclarecimento.
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              O que falta ou precisa de esclarecimento <span style={{ color: THEME.danger }}>*</span>
            </label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              rows={4} placeholder="Descreva o que está em falta ou o que precisa de ser clarificado antes de criar o processo…"
              style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button
              onClick={() => { if (note.trim()) { onSave(note.trim()); onClose(); } }}
              disabled={!note.trim()}
              style={{ background: note.trim() ? THEME.warning : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: note.trim() ? "pointer" : "default" }}
            >
              Devolver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cancelar Tarefa modal ─────────────────────────────────────────────────────
function CancelarTarefaModal({ onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 420) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Cancelar Tarefa</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: THEME.dangerBg, border: `1px solid ${THEME.danger}44`, borderRadius: 7, padding: "8px 12px", fontSize: 12, color: THEME.danger }}>
            A tarefa será marcada como Cancelada. O histórico completo permanece visível — nada é eliminado.
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Motivo do cancelamento <span style={{ color: THEME.danger }}>*</span>
            </label>
            <textarea
              value={reason} onChange={e => setReason(e.target.value)}
              rows={3} placeholder="Indique o motivo do cancelamento…"
              style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Voltar</button>
            <button
              onClick={() => { if (reason.trim()) { onSave(reason.trim()); onClose(); } }}
              disabled={!reason.trim()}
              style={{ background: reason.trim() ? THEME.danger : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: reason.trim() ? "pointer" : "default" }}
            >
              Confirmar cancelamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Enviar Email ao Cliente modal ─────────────────────────────────────────────
function EnviarEmailClienteModal({ task, currentUser, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const fileRef = useRef(null);
  const email = task.originEmail;
  const [to,          setTo]          = useState(email?.sender || "");
  const [cc,          setCc]          = useState("");
  const [subject,     setSubject]     = useState(`Re: ${email?.subject || "Consulta de processo"}`);
  const [body,        setBody]        = useState(
    `Exmo(a) Sr(a) ${email?.senderName || task.client || ""},\n\nEm resposta ao seu pedido, ` +
    `informamos que a sua solicitação está a ser analisada pela nossa equipa.\n\n` +
    `Em caso de dúvidas, não hesite em contactar-nos.\n\nCom os melhores cumprimentos,\n${currentUser?.name || ""}`
  );
  const [attachments, setAttachments] = useState([]); // [{ name, file }]
  const [sent,        setSent]        = useState(false);

  function addFiles(files) {
    setAttachments(prev => [...prev, ...Array.from(files).map(f => ({ name: f.name, file: f }))]);
  }
  function removeAttachment(name) {
    setAttachments(prev => prev.filter(a => a.name !== name));
  }

  function handleSend() {
    onSave({ to, cc, subject, body, attachments });
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 500) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Enviar Email ao Cliente</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        {sent ? (
          <div style={{ padding: "36px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: THEME.success }}>Email enviado</div>
          </div>
        ) : (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#0c1a2e", border: "1px solid #1e3a5f", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#93c5fd" }}>
              Este email vai directamente para o cliente externo. Não confundir com "Devolver com Notas" que é uma acção interna.
            </div>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Para</label>
              <input style={INPUT} value={to} onChange={e => setTo(e.target.value)} placeholder="email@cliente.com" />
            </div>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>CC</label>
              <input style={INPUT} value={cc} onChange={e => setCc(e.target.value)} placeholder="email@empresa.com (opcional)" />
            </div>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Assunto</label>
              <input style={INPUT} value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Mensagem</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={7}
                style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
            </div>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>Anexos</label>
              {attachments.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {attachments.map(a => (
                    <span key={a.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 9999, padding: "2px 8px", fontSize: 11, color: THEME.textMuted }}>
                      <Icon name="paperclip" size={10} color={THEME.textDim} />{a.name}
                      <button onClick={() => removeAttachment(a.name)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 12, color: THEME.textMuted, cursor: "pointer" }}>
                <Icon name="paperclip" size={12} color={THEME.textDim} /> Adicionar anexo
              </button>
              <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleSend} disabled={!to.trim() || !subject.trim()}
                style={{ background: to.trim() && subject.trim() ? THEME.accent : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: to.trim() && subject.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="mail" size={13} color="white" /> Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Rejeitar Cancelamento modal ───────────────────────────────────────────────
function RejeitarCancelamentoModal({ onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const [note, setNote] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 440) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Rejeitar Cancelamento</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: THEME.warningBg, border: `1px solid ${THEME.warning}44`, borderRadius: 7, padding: "8px 12px", fontSize: 12, color: THEME.warning }}>
            A tarefa voltará a <strong>Em Curso</strong>. Indique o motivo da rejeição ao responsável.
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Motivo da rejeição <span style={{ color: THEME.danger }}>*</span>
            </label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              rows={3} placeholder="Indique por que o cancelamento não pode ser aprovado…"
              style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button
              onClick={() => { if (note.trim()) { onSave(note.trim()); onClose(); } }}
              disabled={!note.trim()}
              style={{ background: note.trim() ? THEME.warning : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: note.trim() ? "pointer" : "default" }}
            >
              Rejeitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const INPUT_STYLE = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.sidebar, color: THEME.text };

// ── Concluir modal ────────────────────────────────────────────────────────────
function ConcluirModal({ onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const [note, setNote] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 400) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Marcar como Concluído</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Nota de conclusão (opcional)</label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              rows={3} placeholder="O que foi feito?"
              style={{ ...INPUT, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(note); onClose(); }} style={{ background: THEME.success, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Validar Pré-Entrada modal (creates Abertura de Processo task) ────────────
function ValidarPreEntradaModal({ task, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const email = task.originEmail;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 440) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Validar Pré-Entrada</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, marginBottom: 4 }}>
              {email ? email.senderName : task.client}
            </div>
            {email && <div style={{ fontSize: 11, color: THEME.textDim }}>{email.subject}</div>}
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6 }}>
            Ao confirmar, esta tarefa é reatribuída ao responsável pela <strong style={{ color: THEME.text }}>Abertura de Processo</strong> e muda de tipo. A tarefa permanece aberta até que essa pessoa abra o processo.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Validar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Abrir Processo modal (Abertura de Processo → creates a new process) ──────
function AbrirProcessoModal({ task, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const email = task.originEmail;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 460) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Abrir Processo</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, marginBottom: 4 }}>
              {task.client || email?.senderName}
            </div>
            {email && <div style={{ fontSize: 11, color: THEME.textDim }}>{email.subject}</div>}
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6 }}>
            Ao confirmar, um número de processo será gerado automaticamente e o processo criado com estado <strong style={{ color: THEME.text }}>Entrada</strong>. O Resp. Cotação será definido automaticamente. Esta tarefa ficará marcada como Concluída.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Abrir Processo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Passar modal ──────────────────────────────────────────────────────────────
function PassarModal({ users, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const active = users.filter(u => u.active !== false);
  const [target, setTarget] = useState(active[0]?.name ?? "");
  const [note,   setNote]   = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 400) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Passar a outro utilizador</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Passar para</label>
            <select value={target} onChange={e => setTarget(e.target.value)} style={INPUT}>
              {active.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Nota de passagem <span style={{ color: THEME.danger }}>*</span></label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              rows={3} placeholder="Motivo da passagem / contexto para o próximo responsável"
              style={{ ...INPUT, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button
              onClick={() => { if (note.trim()) { onSave(target, note); onClose(); } }}
              disabled={!note.trim()}
              style={{ background: note.trim() ? THEME.accent : THEME.border, color: note.trim() ? "white" : THEME.textDim, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: note.trim() ? "pointer" : "default" }}
            >
              Passar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Escalar modal ─────────────────────────────────────────────────────────────
function EscalarModal({ users, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const supervisors = users.filter(u => u.active !== false && (u.role === "supervisor" || u.role === "admin"));
  const [target, setTarget] = useState(supervisors[0]?.name ?? "");
  const [note,   setNote]   = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 420) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Escalar tarefa</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: THEME.dangerBg, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: "9px 13px", fontSize: 12, color: THEME.danger }}>
            A tarefa ficará marcada como <strong>Escalada</strong> e atribuída ao supervisor seleccionado.
          </div>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Escalar para</label>
            <select value={target} onChange={e => setTarget(e.target.value)} style={INPUT}>
              {supervisors.map(u => <option key={u.id} value={u.name}>{u.name} — {u.role}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Motivo da escalação <span style={{ color: THEME.danger }}>*</span></label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              rows={3} placeholder="Descreva o bloqueio ou razão pela qual precisa de aprovação superior"
              style={{ ...INPUT, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button
              onClick={() => { if (note.trim()) { onSave(target, note); onClose(); } }}
              disabled={!note.trim()}
              style={{ background: note.trim() ? THEME.danger : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: note.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Icon name="escalate" size={13} color="white" /> Escalar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reclassificar modal (Não Classificado → existing or new type) ────────────
const SYSTEM_TYPES_SET = new Set(["Não Classificado", "Escalação", "Abertura de Processo"]);

const CATEGORY_PRESET_COLORS = [
  "#60a5fa","#4ade80","#fb923c","#fbbf24","#c084fc",
  "#f87171","#38bdf8","#a78bfa","#34d399","#94a3b8",
];
const CATEGORY_BG_MAP = {
  "#60a5fa":"#1e3a5f","#4ade80":"#052e16","#fb923c":"#1c1005","#fbbf24":"#1c1005",
  "#c084fc":"#2e1065","#f87171":"#2d0a0a","#38bdf8":"#0c2231","#a78bfa":"#2e1065",
  "#34d399":"#022c22","#94a3b8":"#1e293b",
};

function ReclassificarModal({ currentType, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const types = store.getTaskTypes().map(t => t.label).filter(l => !SYSTEM_TYPES_SET.has(l));
  const [mode,     setMode]     = useState("existing"); // "existing" | "new"
  // Preselect the task's current type when it's a real, reclassifiable type
  // (i.e. not unclassified/system) so Alterar Tipo opens showing what the
  // user is actually changing from, instead of always defaulting to the
  // first type in the list. Falls back to types[0] for Classificar Tarefa
  // on a genuinely unclassified task, where there is no current type to show.
  const [selected, setSelected] = useState(types.includes(currentType) ? currentType : (types[0] ?? ""));
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#60a5fa");

  function handleSave() {
    if (mode === "existing" && selected) {
      onSave({ mode: "existing", type: selected });
      onClose();
    } else if (mode === "new" && newLabel.trim()) {
      const bg = CATEGORY_BG_MAP[newColor] || "#1e293b";
      onSave({ mode: "new", label: newLabel.trim(), color: newColor, bg });
      onClose();
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 440) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Classificar Tarefa</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {[{ id: "existing", label: "Tipo existente" }, { id: "new", label: "Criar novo tipo" }].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{ flex: 1, padding: "6px 10px", fontSize: 12, fontWeight: 600, borderRadius: 7, border: `1px solid ${mode === m.id ? THEME.accent : THEME.border}`, background: mode === m.id ? `${THEME.accent}22` : "transparent", color: mode === m.id ? THEME.accent : THEME.textMuted, cursor: "pointer" }}>
                {m.label}
              </button>
            ))}
          </div>

          {mode === "existing" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 220, overflowY: "auto" }}>
              {types.map(t => {
                const tc = getTypeColor(t);
                return (
                  <label key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: selected === t ? `${tc.color}22` : "transparent", cursor: "pointer", border: selected === t ? `1px solid ${tc.color}55` : "1px solid transparent" }}>
                    <input type="radio" name="reclass-type" checked={selected === t} onChange={() => setSelected(t)} style={{ accentColor: tc.color }} />
                    <Tag bg={tc.bg} color={tc.color}>{t}</Tag>
                  </label>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Nome da categoria <span style={{ color: THEME.danger }}>*</span></label>
                <input style={INPUT} value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="ex: Pedido de Documentação" autoFocus />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Cor</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CATEGORY_PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: newColor === c ? "3px solid white" : "2px solid transparent", cursor: "pointer", padding: 0, outline: newColor === c ? `2px solid ${c}` : "none" }} />
                  ))}
                </div>
                {newLabel.trim() && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: THEME.textDim }}>Pré-visualização:</span>
                    <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: CATEGORY_BG_MAP[newColor] || "#1e293b", color: newColor }}>{newLabel.trim()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button
              onClick={handleSave}
              disabled={mode === "existing" ? !selected : !newLabel.trim()}
              style={{ background: (mode === "existing" ? selected : newLabel.trim()) ? THEME.accent : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: (mode === "existing" ? selected : newLabel.trim()) ? "pointer" : "default" }}
            >
              Classificar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Alterar Estado Manualmente modal (Admin/Supervisor only) ─────────────────
function AlterarEstadoModal({ currentStatus, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const statuses = store.getTaskStatuses();
  const [selected, setSelected] = useState(currentStatus);
  const [reason,   setReason]   = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 440) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Alterar Estado Manualmente</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#1c1005", border: "1px solid #f59e0b44", borderRadius: 8, padding: "9px 13px", fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>
            <strong>Alteração manual de estado.</strong> Esta acção é excepcional e fica registada de forma distinta no histórico. Utilize os botões de acção normais sempre que possível.
          </div>
          <div>
            <div style={{ ...LABEL, marginBottom: 8 }}>Novo estado</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {statuses.map(s => (
                <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: selected === s.label ? `${s.color}22` : "transparent", cursor: "pointer", border: selected === s.label ? `1px solid ${s.color}55` : "1px solid transparent" }}>
                  <input type="radio" name="manual-status" checked={selected === s.label} onChange={() => setSelected(s.label)} style={{ accentColor: s.color }} />
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: selected === s.label ? 600 : 400, color: selected === s.label ? s.color : THEME.textMuted }}>{s.label}</span>
                  {s.systemRole && s.systemRole !== "Nenhum" && (
                    <span style={{ fontSize: 9, color: THEME.textDim, background: THEME.sidebar, borderRadius: 9999, padding: "1px 6px", marginLeft: "auto" }}>{s.systemRole}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Motivo da alteração <span style={{ color: THEME.danger }}>*</span>
            </label>
            <textarea
              value={reason} onChange={e => setReason(e.target.value)}
              rows={3} placeholder="Indique o motivo desta alteração manual de estado…"
              style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button
              onClick={() => { if (reason.trim() && selected !== currentStatus) { onSave(selected, reason.trim()); onClose(); } }}
              disabled={!reason.trim() || selected === currentStatus}
              style={{ background: reason.trim() && selected !== currentStatus ? "#b45309" : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: reason.trim() && selected !== currentStatus ? "pointer" : "default" }}
            >
              Confirmar alteração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Associar a Processo modal — searchable autocomplete by process number or client ──
function AssociarProcessoModal({ processos, currentId, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const [query, setQuery] = useState("");

  const active = (processos || []).filter(p => !p.archived);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? active.filter(p => p.id.toLowerCase().includes(q) || (p.client || "").toLowerCase().includes(q))
    : active;

  function pick(id) { onSave(id); onClose(); }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 440) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Associar a Processo Existente</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: THEME.textDim, pointerEvents: "none" }}>
              <Icon name="search" size={13} />
            </span>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Pesquisar por nº de processo ou cliente…"
              style={{ ...INPUT, paddingLeft: 28 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 300, overflowY: "auto" }}>
            <button
              onClick={() => pick(null)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: !currentId ? `${THEME.accent}22` : "transparent", border: !currentId ? `1px solid ${THEME.accent}55` : "1px solid transparent", cursor: "pointer", textAlign: "left", fontSize: 13, color: !currentId ? THEME.accent : THEME.textMuted }}
            >
              — Nenhum —
            </button>
            {filtered.length === 0 && (
              <div style={{ fontSize: 12, color: THEME.textDim, padding: "10px 4px", textAlign: "center" }}>Nenhum processo encontrado</div>
            )}
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => pick(p.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: currentId === p.id ? `${THEME.accent}22` : "transparent", border: currentId === p.id ? `1px solid ${THEME.accent}55` : "1px solid transparent", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: THEME.textMuted, flexShrink: 0 }}>{p.id}</span>
                <span style={{ fontSize: 13, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.client || "—"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TaskDrawer ────────────────────────────────────────────────────────────────
export function TaskDrawer({ task: initialTask, users, currentUser, onClose, onUpdate, setProcessos, processos, setTarefas, tarefas }) {
  const { isMobile } = useWindowSize();
  const [t,              setT]              = useState(initialTask);
  const [emailExpanded,  setEmailExpanded]  = useState(false);
  const [modal,          setModal]          = useState(null);
  const [reassignedTo,   setReassignedTo]   = useState(null);

  // Resolve status label from systemRole dynamically — never hardcode status strings
  const sysStatus = role => store.getLabelForSystemRole(role) ?? role;

  const isAdmin      = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const isPrivileged = isAdmin || isSupervisor;
  const isOwner      = t.owner === currentUser?.name;
  const isDone       = t.status === sysStatus("Concluído") || t.status === sysStatus("Cancelado");
  const isEscalated  = t.status === sysStatus("Escalado") || !!t.escalationNote;
  const isCancelPending = t.status === sysStatus("Cancelamento Pendente");
  const isPre        = t.type   === "Pré-Entrada";
  const isAbertura   = t.type   === "Abertura de Processo";
  const isDevolvido  = t.status === sysStatus("Devolvido") || t.devolvido === true;

  const tc = getTypeColor(t.type);
  const sc = getStatusColor(t.status);

  // Any action that reassigns the task away from the current user (Passar,
  // Escalar, a reclassification that triggers reassignment, or a status change
  // that reassigns via applyReatribui) must close the drawer — the current user
  // no longer owns this task and shouldn't keep looking at it. Retomar and any
  // other action that leaves the current user as owner (or doesn't touch
  // ownership at all) leaves the drawer open as before.
  function update(patch, historyEntry) {
    const reassignedAway = "owner" in patch && patch.owner !== t.owner && patch.owner !== currentUser?.name;
    // If applyReatribui resolved this reassignment under a specific role,
    // tag the history entry with that roleId + the resulting assignee so a
    // later status change can find this exact past assignment again (see
    // findPastRoleAssignee in store.js). patch.roleId itself is never
    // persisted onto the task object — only onto the history entry.
    const { roleId: assignedRoleId, ...taskPatch } = patch;
    const roleAttribution = assignedRoleId && "owner" in patch
      ? { roleId: assignedRoleId, assignee: patch.owner }
      : {};
    const updated = {
      ...t,
      ...taskPatch,
      history: [...(t.history || []), { ...historyEntry, ...roleAttribution, ts: nowTs() }],
    };
    setT(updated);
    onUpdate(updated);
    // Confirm the handoff before closing — same visual pattern as the
    // "Email enviado" confirmation — so the user always sees explicitly who
    // the task went to, regardless of which action triggered the handoff
    // (manual like Passar/Escalar, or auto-resolved like Validar, Devolver,
    // a mapping-driven status change, etc).
    if (reassignedAway) setReassignedTo(patch.owner);
  }

  // If the mapeamento has reatribuiResponsavel ON for the target status and
  // the patch doesn't already set an explicit owner, run the mapeamento lookup.
  // Continuity rule: client-specific role assignment takes priority first. If
  // that names someone other than the current owner, use them. Otherwise,
  // scan this specific task's own history for a prior assignment made under
  // this exact role — anywhere in its history, regardless of who owns the
  // task now or who has held it under a different role since — and reuse
  // that same person. Round-robin only runs when this role has genuinely
  // never been resolved for this task before. This only applies to this
  // in-place reassignment path — task creation (Inbox triage, Abrir
  // Processo) never calls applyReatribui and is unaffected.
  function applyReatribui(newStatus, patch) {
    if ("owner" in patch) return patch; // explicit owner wins
    const statusObj = store.getTaskStatuses().find(s => s.label === newStatus);
    if (!statusObj) return patch;
    const reatribui = store.getMapeamento().taskStatusReatribui ?? {};
    if (!reatribui[statusObj.id]) return patch;
    const typeObj = store.getTaskTypes().find(x => x.label === t.type);
    if (!typeObj) return patch;

    const mapeamento = store.getMapeamento();
    const roleId = mapeamento.taskType?.[typeObj.id] ?? null;
    const clientAssignee = store.resolveClientRoleAssignment(t.client || null, roleId);
    if (clientAssignee && clientAssignee !== t.owner) return { ...patch, owner: clientAssignee, roleId };

    const roleHistory = (t.history || [])
      .filter(entry => entry.roleId && entry.assignee)
      .map(entry => ({ roleId: entry.roleId, assignee: entry.assignee }));
    const newOwner = clientAssignee || store.assignForTaskType(typeObj.id, t.client || null, roleHistory);
    if (!newOwner) return patch;
    return { ...patch, owner: newOwner, roleId };
  }

  // Action: Marcar como Concluído
  function handleConcluir(note) {
    const newStatus = sysStatus("Concluído");
    const resolvedPatch = applyReatribui(newStatus, { status: newStatus });
    const reassigned = resolvedPatch.owner && resolvedPatch.owner !== t.owner;
    const baseNote = note || "Tarefa concluída.";
    update(
      resolvedPatch,
      { actor: currentUser?.name, action: "Concluído", note: reassigned ? `${baseNote}\n\nReatribuída a ${resolvedPatch.owner}.` : baseNote }
    );
  }

  // Action: Validar Pré-Entrada — patches existing task in-place to Abertura de Processo
  function handleValidarPreEntrada() {
    const aberturaTypeObj = store.getTaskTypes().find(x => x.label === "Abertura de Processo");
    const aberturaLabel = aberturaTypeObj?.label ?? t.type;
    const mapeamento = store.getMapeamento();
    const roleId = aberturaTypeObj ? (mapeamento.taskType?.[aberturaTypeObj.id] ?? null) : null;
    const roleHistory = (t.history || [])
      .filter(entry => entry.roleId && entry.assignee)
      .map(entry => ({ roleId: entry.roleId, assignee: entry.assignee }));
    const aberturaOwner = aberturaTypeObj
      ? (store.assignForTaskType(aberturaTypeObj.id, t.client || null, roleHistory) || t.owner)
      : t.owner;

    update(
      {
        type: aberturaLabel,
        owner: aberturaOwner,
        roleId,
        cotacaoOwner: currentUser?.name,
        status: sysStatus("Por Fazer"),
        devolvido: false,
      },
      { actor: currentUser?.name, action: "Validada", note: `Pré-Entrada validada. Tipo alterado para ${aberturaLabel}. Atribuída a ${aberturaOwner} para abertura de processo.` }
    );
  }

  // Action: Passar a outro utilizador — resets to Por Fazer so it appears
  // in the new assignee's Por Fazer section as fresh work on their plate.
  function handlePassar(targetName, note) {
    update(
      { owner: targetName, status: sysStatus("Por Fazer") },
      { actor: currentUser?.name, action: "Passada", note: `→ ${targetName}: ${note}` }
    );
  }

  // Action: Escalar — resets to Por Fazer so it appears in the escalation
  // target's Por Fazer section as new work requiring their attention.
  function handleEscalar(targetName, note) {
    update(
      { owner: targetName, status: sysStatus("Por Fazer"), escalationNote: note },
      { actor: currentUser?.name, action: "Escalada", note: `→ ${targetName}: ${note}` }
    );
  }

  // Action: Retomar (supervisor/admin on escalated task) — goes to Em Curso
  // because the supervisor is actively choosing to work on it, not receiving new work.
  function handleRetomar() {
    update(
      { owner: currentUser?.name, status: sysStatus("Em Curso"), escalationNote: null, devolvido: false },
      { actor: currentUser?.name, action: "Retomada", note: `Assumida por ${currentUser?.name}.` }
    );
  }

  // Action: Abrir Processo (Abertura de Processo task → creates a new process)
  function handleAbrirProcesso() {
    const now = new Date();
    const prefix = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, "0");
    const existing = (processos || []).map(p => p.id).filter(id => id.startsWith(prefix));
    const max = existing.reduce((m, id) => Math.max(m, parseInt(id.slice(4)) || 0), 0);
    const newId = `${prefix}${String(max + 1).padStart(3, "0")}`;
    const email = t.originEmail;

    // Lands at Em Abertura (id 45), with Resp. Abertura set to whoever opened
    // it — Reatribui is off for this status so it stays with them while they
    // populate the required files (including the composed quotation
    // spreadsheet). Resp. Cotação is intentionally left unset: the real
    // Resp. Cotação person is only determined once the process advances to
    // Entrada, where the existing owner-resolution logic in
    // handleStatusSave (DetailDrawer.jsx) resolves a real person via
    // client assignment / mapping / round-robin. Filling owner with the
    // opener's name here would make it look like Resp. Cotação is already
    // assigned when nobody has actually been assigned that role yet.
    const abridoPor = currentUser?.name;

    const pad = n => String(n).padStart(2, "0");
    const createdStr  = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
    const dlDate = new Date(now); dlDate.setDate(dlDate.getDate() + 7);
    const deadlineStr = `${pad(dlDate.getDate())}/${pad(dlDate.getMonth()+1)}/${dlDate.getFullYear()}`;

    // Resp. Comercial has no competing automatic assignment logic anywhere
    // else, so it's set directly from the client's role-aware assignment (if
    // any) at process creation — not deferred like owner/Resp. Cotação.
    const commAssignee = store.resolveClientRoleAssignment(t.client || "", "resp-comercial") || "";

    const newProcesso = {
      id: newId,
      created: createdStr, deadline: deadlineStr, priority: t.priority || "Normal",
      status: 45,
      client: t.client || "",
      ref: "", brand: "", model: "", vin: "",
      owner: "",
      comm:  commAssignee,
      compra: "",
      respAbertura: abridoPor,
      // The person who originally validated this journey's Pré-Entrada task
      // (t.cotacaoOwner, set in handleValidarPreEntrada) — carried onto the
      // process so the Em Abertura → Entrada transition can give them
      // priority for Resp. Cotação if they still hold that role, ahead of
      // the general role-history continuity/round-robin fallback. See
      // DetailDrawer.jsx handleStatusSave.
      origPreEntradaOwner: t.cotacaoOwner || null,
      comprador: email?.senderName || "",
      price: null, emails: 1,
      note: `Aberto via tarefa de Abertura ${t.id}`,
      archived: false, carryover: false, excelLink: "Excel Modelo.xlsx",
      originEmail: email ? { sender: email.sender, senderName: email.senderName, subject: email.subject, preview: email.preview, body: email.body || "", attachments: email.attachments || [] } : null,
      timeline: [
        { icon: "mail",  color: "#60a5fa", time: nowTs(), text: `Email original de ${email?.senderName || t.client}: ${email?.subject || ""}` },
        { icon: "check", color: "#4ade80", time: nowTs(), text: `Processo aberto por ${currentUser?.name} (tarefa ${t.id}). Estado: Em Abertura. Resp. Abertura: ${abridoPor}` },
      ],
    };

    if (setProcessos) setProcessos(prev => [...prev, newProcesso]);
    const concluido = sysStatus("Concluído");
    const resolvedPatch = applyReatribui(concluido, { status: concluido, originProcesso: newId });
    const taskReassigned = resolvedPatch.owner && resolvedPatch.owner !== t.owner;
    update(
      resolvedPatch,
      {
        actor: currentUser?.name,
        action: "Processo Aberto",
        note: `Processo ${newId} criado com estado Em Abertura. Resp. Abertura: ${abridoPor}.${taskReassigned ? ` Tarefa reatribuída a ${resolvedPatch.owner}.` : ""}`,
      }
    );
  }

  // Action: Devolver com Notas — patches existing task in-place, returns to previous owner
  function handleDevolver(note) {
    const returnToCotacao = !!t.cotacaoOwner;
    const prevOwner = t.cotacaoOwner
      || t.history?.slice().reverse().find(h => h.actor !== currentUser?.name)?.actor
      || t.owner;
    const patch = { status: sysStatus("Por Fazer"), owner: prevOwner, devolvido: true };
    if (returnToCotacao) {
      const preEntradaType = store.getTaskTypes().find(tt => tt.label === "Pré-Entrada");
      if (preEntradaType) patch.type = preEntradaType.label;
    }
    const actionNote = returnToCotacao && patch.type
      ? `${note}\n\n[Tipo revertido para ${patch.type}]\n\nDevolvida a ${prevOwner}.`
      : `${note}\n\nDevolvida a ${prevOwner}.`;
    update(patch, { actor: currentUser?.name, action: "Devolvido", note: actionNote });
  }

  // Action: Cancelar Tarefa — puts task into Cancelamento Pendente for approval.
  // "Cancelamento Pendente" has no entry in taskStatusReatribui, so
  // applyReatribui alone never reassigns owner for this transition — the task
  // stayed with whoever cancelled it and never surfaced in anyone's Por
  // Fazer. Resolved here the exact same way every other status/type
  // transition resolves a responsible person: client-based assignment first,
  // then the role the admin has assigned to this status in the Mapeamento
  // tab (mapeamento.taskStatus, via the new store.assignForTaskStatus — mirrors
  // assignForTaskType/assignForProcessStatus), then round-robin among holders
  // of that role, then role-history continuity on this task's own past
  // assignments. Nothing about which role is responsible is hardcoded here.
  function handleCancelar(reason) {
    const newStatus = sysStatus("Cancelamento Pendente");
    const statusObj = store.getTaskStatuses().find(s => s.label === newStatus);
    const mapeamento = store.getMapeamento();
    const roleId = statusObj ? (mapeamento.taskStatus?.[statusObj.id] ?? null) : null;
    const roleHistory = (t.history || [])
      .filter(entry => entry.roleId && entry.assignee)
      .map(entry => ({ roleId: entry.roleId, assignee: entry.assignee }));
    const approver = statusObj
      ? (store.assignForTaskStatus(statusObj.id, t.client || null, roleHistory) || t.owner)
      : t.owner;
    update(
      { status: newStatus, cancelReason: reason, owner: approver, roleId, cancelRequestedBy: t.owner },
      { actor: currentUser?.name, action: "Cancelamento Pedido", note: `${reason}${approver !== t.owner ? `\n\nEncaminhado a ${approver} para aprovação.` : ""}` }
    );
  }

  // Action: Aprovar Cancelamento (supervisor/admin only, when Cancelamento Pendente)
  // Restores ownership to whoever requested the cancellation (cancelRequestedBy,
  // set in handleCancelar) rather than leaving it on the approver. Otherwise the
  // task's owner permanently became the approving supervisor, and since the
  // Tarefas page scopes non-privileged/non-showAll users to tasks they own
  // (myTasks = tarefas.filter(owner === currentUser)), the original requester
  // would never see their own cancelled task again — it would silently drop out
  // of scope before the Canceladas section filter ever ran.
  function handleAprovarCancelamento() {
    const newStatus = sysStatus("Cancelado");
    const restoredOwner = t.cancelRequestedBy || t.owner;
    update(
      { ...applyReatribui(newStatus, { status: newStatus }), owner: restoredOwner },
      {
        actor: currentUser?.name,
        action: "Cancelamento Aprovado",
        note: `Cancelamento aprovado por ${currentUser?.name || "—"}. Motivo original: ${t.cancelReason || "Sem motivo indicado"}. Devolvida a ${restoredOwner}.`,
      }
    );
  }

  // Action: Enviar Email ao Cliente — all task types
  // Any file attached to the outbound email is also saved as a genuine task
  // attachment (base64 data URL in localStorage — same interim mechanism
  // DetailDrawer.jsx uses for manually attached process files; see the
  // Stage 4 Dependencies note in CLAUDE.md). If this task is associated
  // with an existing process via originProcesso, the same attachment is
  // also pushed onto that process's own attachments list, so it's visible
  // from both places.
  async function handleEnviarEmailCliente({ to, cc, subject, body, attachments }) {
    const files = attachments || []; // [{ name, file }]
    const ts = nowTs();
    const savedAttachments = await Promise.all(
      files.map(a => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: a.name, url: reader.result, uploadedBy: currentUser?.name, uploadedAt: ts });
        reader.readAsDataURL(a.file);
      }))
    );
    const attachmentNames = files.map(a => a.name);

    const statusPorFazer = sysStatus("Por Fazer");
    const newStatus = t.status === statusPorFazer ? sysStatus("Em Curso") : t.status;
    const resolvedPatch = applyReatribui(newStatus, {
      status: newStatus,
      ...(savedAttachments.length ? { attachments: [...(t.attachments || []), ...savedAttachments] } : {}),
    });
    const reassigned = resolvedPatch.owner && resolvedPatch.owner !== t.owner;
    update(
      resolvedPatch,
      {
        actor:  currentUser?.name,
        action: "Email enviado ao cliente",
        note:   `Para: ${to}${cc ? `\nCC: ${cc}` : ""}\nAssunto: ${subject}\n\n${body}${attachmentNames.length ? `\n\nAnexos: ${attachmentNames.join(", ")}` : ""}${reassigned ? `\n\nReatribuída a ${resolvedPatch.owner}.` : ""}`,
        email:  { direction: "outbound", from: currentUser?.name, to, cc: cc || null, subject, body, attachments: attachmentNames },
      }
    );

    if (savedAttachments.length && t.originProcesso && setProcessos) {
      setProcessos(prev => prev.map(p =>
        p.id === t.originProcesso ? { ...p, attachments: [...(p.attachments || []), ...savedAttachments] } : p
      ));
    }
  }

  // Action: Rejeitar Cancelamento (supervisor/admin only, when Cancelamento Pendente)
  function handleRejeitarCancelamento(note) {
    const newStatus = sysStatus("Em Curso");
    const resolvedPatch = applyReatribui(newStatus, { status: newStatus, cancelReason: null });
    const reassigned = resolvedPatch.owner && resolvedPatch.owner !== t.owner;
    update(
      resolvedPatch,
      { actor: currentUser?.name, action: "Cancelamento Rejeitado", note: reassigned ? `${note}\n\nReatribuída a ${resolvedPatch.owner}.` : note }
    );
  }

  // Action: Alterar Estado Manualmente (Admin/Supervisor override)
  function handleAlterarEstado(newStatusLabel, reason) {
    const oldStatus = t.status;
    const resolvedPatch = applyReatribui(newStatusLabel, { status: newStatusLabel });
    const reassigned = resolvedPatch.owner && resolvedPatch.owner !== t.owner;
    update(
      resolvedPatch,
      { actor: currentUser?.name, action: "⚠ Alteração manual", note: `Estado alterado manualmente de "${oldStatus}" para "${newStatusLabel}" por ${currentUser?.name} — motivo: ${reason}${reassigned ? `\n\nReatribuída a ${resolvedPatch.owner}.` : ""}` }
    );
  }

  // Action: Classificar / Reclassificar (unclassified tasks, or Sup/Admin changing
  // an already-typed task at any time). Either way this runs the same assignment
  // logic as a first-time classification — client-based assignment first, then
  // mapping, then round-robin as last resort — so the new type gets a fresh
  // ownership decision instead of blindly keeping whoever owned the old type.
  function handleReclassificar(result) {
    let newType;
    if (result.mode === "new") {
      const existing = store.getTaskTypes();
      const newTypeObj = { id: Date.now(), label: result.label, color: result.color, bg: result.bg };
      store.saveTaskTypes([...existing, newTypeObj]);
      newType = result.label;
    } else {
      newType = result.type;
    }
    const tt = store.getTaskTypes().find(x => x.label === newType);
    const newOwner = tt ? (store.assignForTaskType(tt.id, t.client || null) || t.owner) : t.owner;
    const wasUnclassified = isUnclassified;
    update(
      { type: newType, owner: newOwner },
      {
        actor: currentUser?.name,
        action: wasUnclassified ? "Classificado" : "Tipo alterado",
        note: wasUnclassified
          ? `Tipo atribuído: "${newType}". Responsável: ${newOwner}.`
          : `Tipo alterado de "${t.type}" para "${newType}" por ${currentUser?.name}. Responsável: ${newOwner}.`,
      }
    );
  }

  const isUnclassified = t.type === null || t.type === "Não Classificado";
  const [processoPickerOpen, setProcessoPickerOpen] = useState(false);

  // No type-specific action group applies to this task/user combination — e.g.
  // an unclassified task viewed by a non-privileged user (who can't Classificar).
  // The drawer must never render an empty action panel, so a baseline set of
  // actions is always available as a fallback.
  const hasTypeSpecificActions =
    (isPre && !isDone) ||
    (isAbertura && !isDone) ||
    (isUnclassified && isPrivileged && !isDone) ||
    (!isPre && !isAbertura && !isUnclassified);
  const showBaseline = !hasTypeSpecificActions && !isDone;

  // Action: Associar a Processo Existente — sets/clears originProcesso on the
  // task. The existing process is authoritative and must never be altered by
  // this action: the task instead inherits the process's own client (and any
  // other relevant shared detail) so the task drawer reflects what the
  // process already is, not the other way around.
  function handleAssociarProcesso(processoId) {
    const proc = processoId ? (processos || []).find(p => p.id === processoId) : null;
    const inheritedPatch = proc ? { client: proc.client || t.client } : {};
    update(
      { originProcesso: processoId || null, ...inheritedPatch },
      { actor: currentUser?.name, action: "Processo associado", note: processoId ? `Tarefa associada ao processo ${processoId}.` : "Associação a processo removida." }
    );
  }

  const user = users.find(u => u.name === t.owner);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      <div style={isMobile
        ? { position: "fixed", bottom: 0, left: 0, right: 0, height: "92dvh", background: THEME.bg, zIndex: 50, overflowY: "auto", boxShadow: "0 -4px 40px rgba(0,0,0,0.5)", borderRadius: "16px 16px 0 0", borderTop: `1px solid ${THEME.border}` }
        : { position: "fixed", top: 0, right: 0, height: "100vh", width: 480, maxWidth: "96vw", background: THEME.bg, zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 40px rgba(0,0,0,0.5)", borderLeft: `1px solid ${THEME.border}` }
      }>

        {/* Drag handle — mobile only */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: THEME.border }} />
          </div>
        )}

        {/* Header */}
        <div style={{ position: "sticky", top: 0, background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}`, padding: isMobile ? "12px 16px" : "16px 20px", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: THEME.textDim, marginBottom: 4 }}>{t.id}</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: THEME.text }}>
                {t.client || "(sem cliente)"}
              </h2>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {isUnclassified
                  ? <Tag bg="#2d0a0a" color="#f87171">Sem Classificação</Tag>
                  : <Tag bg={tc.bg} color={tc.color}>{t.type}</Tag>
                }
                <Tag bg={sc.bg} color={sc.color}>{t.status}</Tag>
                {isEscalated && <Tag bg="#2d0a2d" color="#e879f9">⚠ Escalada</Tag>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={18} /></button>
          </div>
        </div>

        <div style={{ padding: isMobile ? "12px 16px" : "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Escalation note banner */}
          {t.escalationNote && (
            <div style={{ background: "#2d0a2d", border: "1px solid #e879f944", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#e879f9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Nota de escalação</div>
              <div style={{ fontSize: 13, color: "#f0abfc", lineHeight: 1.5 }}>{t.escalationNote}</div>
            </div>
          )}

          {/* Owner */}
          <div style={{ background: THEME.sidebar, borderRadius: 10, padding: "10px 14px", border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={t.owner || "?"} size={30} photo={user?.photo} />
            <div>
              <div style={LABEL}>Responsável actual</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text, marginTop: 2 }}>{t.owner || "Sem responsável"}</div>
            </div>
          </div>

          {/* Fields grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
            {[
              ["Tipo",     t.type || "Sem Classificação"],
              ["Estado",   t.status],
              ["Criado",   t.created],
              ["Prazo",    t.due],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={LABEL}>{lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginTop: 2 }}>{val || "—"}</div>
              </div>
            ))}
            <div>
              <div style={LABEL}>Processo</div>
              {(isPrivileged || isOwner) && !isDone ? (
                <button
                  onClick={() => setProcessoPickerOpen(true)}
                  style={{ ...INPUT, fontSize: 12, padding: "4px 7px", marginTop: 2, textAlign: "left", cursor: "pointer", color: t.originProcesso ? THEME.text : THEME.textDim }}
                >
                  {t.originProcesso || "— Nenhum —"}
                </button>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginTop: 2 }}>{t.originProcesso || "—"}</div>
              )}
            </div>
          </div>

          {/* Description */}
          {t.description && (
            <div>
              <div style={{ ...LABEL, marginBottom: 6 }}>Descrição</div>
              <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6, background: THEME.sidebar, borderRadius: 8, padding: "10px 12px", border: `1px solid ${THEME.border}` }}>
                {t.description}
              </div>
            </div>
          )}

          {/* History timeline */}
          {t.history && t.history.length > 0 && (
            <div>
              <div style={{ ...LABEL, marginBottom: 10 }}>Histórico</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...t.history].reverse().map((h, i) => {
                  const u = users.find(usr => usr.name === h.actor);
                  return (
                    <div key={i} style={{ display: "flex", gap: 10 }}>
                      <Avatar name={h.actor || "?"} size={24} photo={u?.photo} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{h.actor}</span>
                          <Tag bg={THEME.sidebar} color={THEME.textDim} style={{ fontSize: 10 }}>{h.action}</Tag>
                          <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: "auto" }}>{h.ts}</span>
                        </div>
                        {h.note && (
                          <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.5 }}>{h.note}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Origin email — collapsible */}
          {t.originEmail && (
            <div>
              <button
                onClick={() => setEmailExpanded(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", color: THEME.textMuted, fontSize: 12, fontWeight: 500 }}
              >
                <Icon name="mail" size={13} color={THEME.textMuted} />
                <span style={{ flex: 1, textAlign: "left" }}>Email de origem — {t.originEmail.senderName || t.originEmail.sender}</span>
                <Icon name={emailExpanded ? "chevron-up" : "chevron-down"} size={13} color={THEME.textDim} />
              </button>
              {emailExpanded && (
                <div style={{ background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "12px" }}>
                  <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 4 }}>
                    De: <strong style={{ color: THEME.textMuted }}>{t.originEmail.sender}</strong>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, marginBottom: 8 }}>{t.originEmail.subject}</div>
                  {t.originEmail.body ? (
                    <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.6 }}>
                      {t.originEmail.body.split("\n").map((line, i) =>
                        line.trim() === "" ? <br key={i} /> : <p key={i} style={{ margin: "0 0 4px" }}>{line}</p>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: THEME.textMuted }}>{t.originEmail.preview}</div>
                  )}
                  {t.originEmail.attachments?.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {t.originEmail.attachments.map((att, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: THEME.textDim }}>
                          <Icon name="paperclip" size={11} color={THEME.textDim} /> {att.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Attachments — files saved via Enviar Email ao Cliente (or any
              other action that saves a real attachment onto the task) ── */}
          {t.attachments?.length > 0 && (
            <div>
              <div style={{ ...LABEL, marginBottom: 8 }}>Anexos</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {t.attachments.map((att, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, fontSize: 12, color: THEME.textMuted }}>
                    <Icon name="paperclip" size={13} color={THEME.textDim} />
                    {att.url ? (
                      <a href={att.url} download={att.name} style={{ flex: 1, color: THEME.accent, textDecoration: "none" }}>{att.name}</a>
                    ) : (
                      <span style={{ flex: 1 }}>{att.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 12 }}>

            {/* ── Pré-Entrada actions: Validar, Enviar Email, Escalar(std) ──
                 Passar and Cancelar Tarefa are universal actions, rendered once
                 below regardless of task type — see that section. ── */}
            {isPre && !isDone && (
              <>
                <button onClick={() => setModal("validarPreEntrada")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Icon name="check" size={14} color="white" /> Validar
                </button>
                <button onClick={() => setModal("enviarEmailCliente")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#0c1a2e", color: "#93c5fd", border: "1px solid #1e3a5f", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Icon name="mail" size={14} color="#93c5fd" /> Enviar Email ao Cliente
                </button>
                {!isPrivileged && (
                  <button onClick={() => setModal("escalar")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.dangerBg, color: THEME.danger, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    <Icon name="escalate" size={13} color={THEME.danger} /> Escalar
                  </button>
                )}
              </>
            )}

            {/* ── Abertura de Processo actions ── */}
            {isAbertura && !isDone && (
              <>
                <button onClick={() => setModal("abrirProcesso")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Icon name="plus" size={14} color="white" /> Abrir Processo
                </button>
                <button onClick={() => setModal("devolver")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.warningBg, color: THEME.warning, border: `1px solid ${THEME.warning}44`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Icon name="edit" size={14} color={THEME.warning} /> Devolver com Notas
                </button>
                {!isPrivileged && (
                  <button onClick={() => setModal("escalar")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.dangerBg, color: THEME.danger, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    <Icon name="escalate" size={13} color={THEME.danger} /> Escalar
                  </button>
                )}
              </>
            )}

            {/* ── Classificar — unclassified tasks (type null), Admin/Supervisor only.
                 Also carries the same baseline action set (Enviar Email, Escalar,
                 Marcar como Concluído, Associar a Processo) as a classified task
                 would get from the baseline fallback below — an unclassified task
                 still needs to be actionable (e.g. replying to the client) before
                 anyone gets around to classifying it. This block satisfies
                 hasTypeSpecificActions on its own, so the baseline fallback never
                 fires here; those actions must be included explicitly. ── */}
            {isUnclassified && isPrivileged && !isDone && (
              <>
                <button
                  onClick={() => setModal("reclassificar")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#2d0a0a", color: "#f87171", border: "1px solid #f8717144", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <Icon name="tag" size={14} color="#f87171" /> Classificar Tarefa
                </button>
                <button
                  onClick={() => setModal("concluir")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.success, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <Icon name="check" size={14} color="white" /> Marcar como Concluído
                </button>
                <button
                  onClick={() => setModal("enviarEmailCliente")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#0c1a2e", color: "#93c5fd", border: "1px solid #1e3a5f", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <Icon name="mail" size={14} color="#93c5fd" /> Enviar Email ao Cliente
                </button>
                {!isPrivileged && (
                  <button
                    onClick={() => setModal("escalar")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.dangerBg, color: THEME.danger, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    <Icon name="escalate" size={13} color={THEME.danger} /> Escalar
                  </button>
                )}
                <button
                  onClick={() => setProcessoPickerOpen(true)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                >
                  <Icon name="paperclip" size={13} color={THEME.textMuted} /> Associar a Processo
                </button>
              </>
            )}

            {/* ── Alterar Tipo — Sup/Admin can reclassify an already-typed task at
                 any time, whether the type came from AI or manual classification.
                 Reuses the same ReclassificarModal + handleReclassificar flow. ── */}
            {!isUnclassified && isPrivileged && !isDone && (
              <button
                onClick={() => setModal("reclassificar")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                <Icon name="tag" size={13} color={THEME.textMuted} /> Alterar Tipo
              </button>
            )}

            {/* ── Standard task actions (hidden for Pré-Entrada, Abertura de Processo, and unclassified) ── */}
            {!isPre && !isAbertura && !isUnclassified && (
              <>
                {/* Primary action: Marcar como Concluído */}
                {!isDone && (
                  <button
                    onClick={() => setModal("concluir")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.success, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Icon name="check" size={14} color="white" /> Marcar como Concluído
                  </button>
                )}

                {/* Retomar — supervisor/admin on escalated task */}
                {isEscalated && isPrivileged && (
                  <button
                    onClick={handleRetomar}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#2d0a2d", color: "#e879f9", border: "1px solid #e879f944", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Icon name="check" size={14} color="#e879f9" /> Retomar
                  </button>
                )}

                {/* Escalar — Passar is now a universal action, rendered once below */}
                {!isDone && !isPrivileged && !isEscalated && (
                  <button
                    onClick={() => setModal("escalar")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.dangerBg, color: THEME.danger, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    <Icon name="escalate" size={13} color={THEME.danger} /> Escalar
                  </button>
                )}
              </>
            )}

            {/* ── Enviar Email ao Cliente — standard task types only ── */}
            {!isDone && !isPre && !isAbertura && !isUnclassified && (
              <button
                onClick={() => setModal("enviarEmailCliente")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#0c1a2e", color: "#93c5fd", border: "1px solid #1e3a5f", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                <Icon name="mail" size={14} color="#93c5fd" /> Enviar Email ao Cliente
              </button>
            )}

            {/* ── Associar a Processo Existente — standard task types, available to
                 whoever the task is currently assigned to (not just Sup/Admin) ── */}
            {!isDone && !isPre && !isAbertura && !isUnclassified && (isPrivileged || isOwner) && (
              <button
                onClick={() => setProcessoPickerOpen(true)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                <Icon name="paperclip" size={13} color={THEME.textMuted} /> Associar a Processo
              </button>
            )}

            {/* ── Baseline actions — always shown when no type-specific group applies,
                 so the drawer is never left with an empty action panel. ── */}
            {showBaseline && (
              <>
                <button
                  onClick={() => setModal("concluir")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.success, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <Icon name="check" size={14} color="white" /> Marcar como Concluído
                </button>
                <button
                  onClick={() => setModal("enviarEmailCliente")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#0c1a2e", color: "#93c5fd", border: "1px solid #1e3a5f", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <Icon name="mail" size={14} color="#93c5fd" /> Enviar Email ao Cliente
                </button>
                <button
                  onClick={() => setModal("escalar")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.dangerBg, color: THEME.danger, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                >
                  <Icon name="escalate" size={13} color={THEME.danger} /> Escalar
                </button>
                {(isPrivileged || isOwner) && (
                  <button
                    onClick={() => setProcessoPickerOpen(true)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    <Icon name="paperclip" size={13} color={THEME.textMuted} /> Associar a Processo
                  </button>
                )}
              </>
            )}

            {/* ── Passar / Cancelar Tarefa — Passar is a universal action, available
                 on every task type for any user. Cancelar Tarefa is universal for
                 standard users only (requires a mandatory reason, results in
                 Cancelamento Pendente for approval) — hidden for Supervisor/Admin,
                 who already have direct authority to set any status, including
                 Cancelado, via Alterar Estado Manualmente. Neither is shown once
                 the task is done or already awaiting cancellation approval. ── */}
            {!isDone && !isCancelPending && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setModal("passar")}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                >
                  <Icon name="edit" size={13} color={THEME.textMuted} /> Passar
                </button>
                {!isPrivileged && (
                  <button
                    onClick={() => setModal("cancelar")}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.dangerBg, color: THEME.danger, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    <Icon name="x" size={13} color={THEME.danger} /> Cancelar Tarefa
                  </button>
                )}
              </div>
            )}

            {/* ── Alterar Estado Manualmente — Admin/Supervisor override (any status) ── */}
            {isPrivileged && (
              <button
                onClick={() => setModal("alterarEstado")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#1c1005", color: "#fbbf24", border: "1px solid #f59e0b33", borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                <Icon name="settings" size={13} color="#fbbf24" /> Alterar Estado Manualmente
              </button>
            )}

            {/* ── Cancelamento Pendente — supervisor approval/rejection ── */}
            {isCancelPending && isPrivileged && (
              <>
                <button
                  onClick={handleAprovarCancelamento}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.successBg, color: THEME.success, border: `1px solid ${THEME.success}44`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <Icon name="check" size={14} color={THEME.success} /> Aprovar cancelamento
                </button>
                <button
                  onClick={() => setModal("rejeitarCancelamento")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.warningBg, color: THEME.warning, border: `1px solid ${THEME.warning}44`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <Icon name="x" size={14} color={THEME.warning} /> Rejeitar e devolver
                </button>
              </>
            )}

            {/* Completed / Cancelled state label */}
            {isDone && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textDim, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 10, fontSize: 13 }}>
                <Icon name="check" size={14} color={THEME.textDim} />
                {t.status === "Cancelado" ? "Cancelado — histórico preservado" : "Concluído"}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal === "enviarEmailCliente"    && <EnviarEmailClienteModal   task={t} currentUser={currentUser} onClose={() => setModal(null)} onSave={handleEnviarEmailCliente} />}
      {modal === "validarPreEntrada"      && <ValidarPreEntradaModal    task={t} onClose={() => setModal(null)} onSave={handleValidarPreEntrada} />}
      {modal === "abrirProcesso"         && <AbrirProcessoModal        task={t} onClose={() => setModal(null)} onSave={handleAbrirProcesso} />}
      {modal === "devolver"              && <DevolverModal             onClose={() => setModal(null)} onSave={handleDevolver} />}
      {modal === "cancelar"              && <CancelarTarefaModal       onClose={() => setModal(null)} onSave={handleCancelar} />}
      {modal === "rejeitarCancelamento"  && <RejeitarCancelamentoModal onClose={() => setModal(null)} onSave={handleRejeitarCancelamento} />}
      {modal === "concluir"              && <ConcluirModal             onClose={() => setModal(null)} onSave={handleConcluir} />}
      {modal === "passar"                && <PassarModal               users={users} onClose={() => setModal(null)} onSave={handlePassar} />}
      {modal === "escalar"               && <EscalarModal              users={users} onClose={() => setModal(null)} onSave={handleEscalar} />}
      {modal === "alterarEstado"         && <AlterarEstadoModal        currentStatus={t.status} onClose={() => setModal(null)} onSave={handleAlterarEstado} />}
      {modal === "reclassificar"         && <ReclassificarModal        currentType={t.type} onClose={() => setModal(null)} onSave={handleReclassificar} />}
      {processoPickerOpen && <AssociarProcessoModal processos={processos} currentId={t.originProcesso || null} onClose={() => setProcessoPickerOpen(false)} onSave={handleAssociarProcesso} />}
      {reassignedTo && <ReassignedConfirm ownerName={reassignedTo} onDone={onClose} />}
    </>
  );
}

// ── Reassignment confirmation — shown whenever an action hands the task to
// someone else, right before the drawer closes. Same visual pattern as the
// "Email enviado" confirmation in EnviarEmailClienteModal: a centred
// checkmark over a short success message, auto-dismissing. Applies uniformly
// regardless of which action triggered the handoff. ──────────────────────
function ReassignedConfirm({ ownerName, onDone }) {
  const { isMobile } = useWindowSize();
  useEffect(() => {
    const timer = setTimeout(onDone, 1400);
    return () => clearTimeout(timer);
  }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 380) }}>
        <div style={{ padding: "36px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: THEME.success }}>Tarefa reatribuída</div>
          <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 6 }}>Atribuída a <strong style={{ color: THEME.text }}>{ownerName}</strong></div>
        </div>
      </div>
    </div>
  );
}

// ── Acknowledgment card — appears in Por Fazer when a task or process landed
// with the current user purely through someone else's action (status change,
// reassignment, mapeamento hand-off) with no click from them. Not a real task:
// visually distinct (dashed border, muted background, no click-through to a
// drawer) and dismissible. Dismissal is persisted per-user so it never
// reappears once seen. ─────────────────────────────────────────────────────
const ACK_DISMISSED_KEY = "crm_ack_dismissed";

function loadDismissed(userName) {
  try {
    const raw = localStorage.getItem(ACK_DISMISSED_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return new Set(all[userName] ?? []);
  } catch { return new Set(); }
}

function saveDismissed(userName, idsSet) {
  try {
    const raw = localStorage.getItem(ACK_DISMISSED_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[userName] = [...idsSet];
    localStorage.setItem(ACK_DISMISSED_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

// A process landed passively if it's owned by the user but the most recent
// owner-changing timeline entry either came from the mapeamento hand-off
// (system-driven, no actor to click anything) or was performed "por" someone
// other than the user themself via the manual Reatribuir modal. Tasks never
// trigger this notification — only a process changing owner does, since
// task-level notifications were confirmed as redundant and unwanted.
function processPassiveHandoff(proc, userName) {
  // Mapping-driven reassignment now updates respActual only (owner/Resp.
  // Cotação is a frozen historical field once set), while manual Reatribuir
  // still writes to owner directly. Check whichever field this user actually
  // ended up in so both notification paths keep working.
  if (proc.respActual !== userName && proc.owner !== userName) return null;
  const entries = proc.timeline || [];
  for (let i = entries.length - 1; i >= 0; i--) {
    const text = entries[i].text || "";
    const mapMatch = text.match(/^Reatribuído a (.+) \(via mapeamento de estado\)$/);
    if (mapMatch && mapMatch[1] === userName) {
      return { id: `proc-${proc.id}-${entries[i].time || i}`, kind: "processo", refId: proc.id, client: proc.client, action: "Reatribuído via mapeamento", actor: null, ts: entries[i].time };
    }
    const manualMatch = text.match(/^Resp\. Cotação alterado de .+ para (.+) por (.+)$/);
    if (manualMatch && manualMatch[1] === userName) {
      if (manualMatch[2] === userName) return null; // self-reassignment — not passive
      return { id: `proc-${proc.id}-${entries[i].time || i}`, kind: "processo", refId: proc.id, client: proc.client, action: "Reatribuído", actor: manualMatch[2], ts: entries[i].time };
    }
  }
  return null;
}

// Shared helper — computes the current user's unacknowledged process-handoff
// notifications, reused by the Tarefas page itself and by Main.jsx's sidebar
// badge count so both stay in sync with the exact same eligibility rule.
export function getUnacknowledgedAckCount(processos, userName) {
  if (!userName) return 0;
  const dismissed = loadDismissed(userName);
  return (processos || [])
    .filter(p => !p.archived)
    .map(p => processPassiveHandoff(p, userName))
    .filter(Boolean)
    .filter(it => !dismissed.has(it.id))
    .length;
}

function AckCard({ item, onDismiss }) {
  const desc = `Processo ${item.refId}${item.client ? ` — ${item.client}` : ""} foi-lhe atribuído${item.actor ? ` por ${item.actor}` : ""} (${item.action}).`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `1px solid ${THEME.warning}66`, background: `${THEME.warning}11` }}>
      <Icon name="alert" size={14} color={THEME.warning} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.warning, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Recebido automaticamente</div>
        <div style={{ fontSize: 12, color: THEME.textMuted }}>{desc}</div>
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        title="Marcar como visto"
        style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "4px 9px", fontSize: 11, color: THEME.textMuted, cursor: "pointer", flexShrink: 0 }}
      >
        Visto
      </button>
    </div>
  );
}

// ── Summary strip — pooled Por Fazer / Activas / SLA Excedido across tasks and
// processes, compact entry point into Dashboard's detailed breakdown. ────────
function SummaryStrip({ porFazer, activas, slaExcedido, onClick }) {
  const items = [
    { label: "Por fazer",    value: porFazer,    color: "#94a3b8" },
    { label: "Activas",      value: activas,      color: THEME.warning },
    { label: "SLA excedido", value: slaExcedido, color: THEME.danger },
  ];
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 18, padding: "8px 24px", cursor: "pointer", borderBottom: `1px solid ${THEME.border}`, background: THEME.sidebar }}
      title="Ver detalhe no Dashboard"
    >
      {items.map((it, i) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: it.value > 0 ? it.color : THEME.textMuted }}>{it.value}</span>
          <span style={{ fontSize: 11, color: THEME.textDim }}>{it.label}</span>
          {i < items.length - 1 && <span style={{ width: 1, height: 12, background: THEME.border, marginLeft: 12 }} />}
        </div>
      ))}
      <Icon name="chevron" size={11} color={THEME.textDim} style={{ marginLeft: "auto" }} />
    </div>
  );
}

// ── SLA breach check for active tasks ─────────────────────────────────────────
function isSlaBreach(task) {
  if (!task.due) return false;
  try {
    const [d, m, y] = task.due.split("/").map(Number);
    const due = new Date(y, m - 1, d);
    const now = new Date("2026-05-15T12:00:00");
    return now > due;
  } catch { return false; }
}

// ── Tarefas page ──────────────────────────────────────────────────────────────
export function Tarefas({ tarefas, setTarefas, processos, setProcessos, users, currentUser, accent }) {
  const { isMobile } = useWindowSize();
  const location = useLocation();
  const navigate = useNavigate();
  const [search,         setSearch]         = useState("");
  const [typeFilter,     setTypeFilter]     = useState("Todos");
  const [statusFilter,   setStatusFilter]   = useState("Todos");
  const [assignedFilter, setAssignedFilter] = useState("Todos");
  const [selected,       setSelected]       = useState(null);
  const [showAll,        setShowAll]        = useState(false);
  const [dismissedAcks,  setDismissedAcks]  = useState(() => loadDismissed(currentUser?.name ?? ""));

  function dismissAck(id) {
    setDismissedAcks(prev => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(currentUser?.name ?? "", next);
      return next;
    });
  }

  const isAdmin      = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const isPrivileged = isAdmin || isSupervisor;

  const myTasks = tarefas.filter(t => t.owner === currentUser?.name);
  const scope = (isPrivileged && showAll) ? tarefas : myTasks;

  const assignedUsers = [...new Set(tarefas.map(t => t.owner).filter(Boolean))].sort();

  // Status grouping via System Roles
  const concluidoLabel = store.getLabelForSystemRole("Concluído");
  const canceladoLabel = store.getLabelForSystemRole("Cancelado");
  const doneLabels = new Set([concluidoLabel, canceladoLabel].filter(Boolean));
  const porFazerLabel = store.getLabelForSystemRole("Por Fazer");

  // Apply filters to full scope
  const filtered = scope.filter(t => {
    if (typeFilter     !== "Todos" && t.type    !== typeFilter)     return false;
    if (statusFilter   !== "Todos" && t.status  !== statusFilter)   return false;
    if (assignedFilter !== "Todos" && t.owner   !== assignedFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![t.client, t.type, t.owner, t.description, t.originProcesso]
        .some(v => v?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Four-way split: Por Fazer / Em Curso (actioned but not done) / Concluídas / Canceladas.
  // Cancelled tasks get their own section (rather than being merged into
  // Concluídas, as before) so they remain visible and findable instead of
  // disappearing from view once cancelled.
  const porFazerTasks  = filtered.filter(t => t.status === porFazerLabel);
  const emCursoTasks   = filtered.filter(t => t.status !== porFazerLabel && !doneLabels.has(t.status));
  const doneTasks      = filtered.filter(t => t.status === concluidoLabel);
  const cancelledTasks = filtered.filter(t => t.status === canceladoLabel);

  const activeCount = scope.filter(t => !doneLabels.has(t.status)).length;

  // ── Pooled summary strip — combines tasks and processes for the current user.
  // Mirrors Dashboard's own per-entity definitions (myActive/myPorFazer/
  // mySlaBreach for tasks; myOpen/myOverdue for processes) just summed together,
  // since Dashboard already provides the detailed split — this is only a
  // compact entry point, not a new breakdown.
  const userName          = currentUser?.name ?? "";
  const myTasksAll        = tarefas.filter(t => t.owner === userName);
  const myActiveTasks     = myTasksAll.filter(t => !doneLabels.has(t.status));
  const myPorFazerTasks   = myTasksAll.filter(t => t.status === porFazerLabel);
  const myTaskSlaBreach   = myActiveTasks.filter(isSlaBreach);
  // "Mine" is based on respActual (who currently has the process), not owner
  // (Resp. Cotação), since owner is now a frozen historical field that no
  // longer necessarily reflects who is actively working the process today —
  // consistent with the same change already applied in Processos.jsx.
  const myProcessosAll    = (processos || []).filter(p => !p.archived && (p.respActual === userName || p.comm === userName || p.compra === userName));
  const myOpenProcessos   = myProcessosAll.filter(p => p.status < 8);
  const myOverdueProcessos = myProcessosAll.filter(p => daysLeft(p.deadline) < 0 && p.status < 8);

  const pooledPorFazer    = myPorFazerTasks.length;
  const pooledActivas     = myActiveTasks.length + myOpenProcessos.length;
  const pooledSlaExcedido = myTaskSlaBreach.length + myOverdueProcessos.length;

  // ── Passive handoff acknowledgment cards — processes that landed with this
  // user via someone else's action (mapeamento hand-off or a manual
  // Reatribuir performed by someone else), not their own click. Tasks never
  // trigger this notification — only a process changing owner does. Self-
  // reassignment is excluded inside processPassiveHandoff. Dismissed ones are
  // filtered out.
  const ackItems = myProcessosAll
    .map(p => processPassiveHandoff(p, userName))
    .filter(Boolean)
    .filter(it => !dismissedAcks.has(it.id));

  function handleUpdate(updated) {
    const next = tarefas.map(t => t.id === updated.id ? updated : t);
    setTarefas(next);
    store.saveTarefas(next);
    setSelected(updated);
  }

  const SEL = { fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "6px 10px", background: THEME.card, color: THEME.textMuted, outline: "none", cursor: "pointer" };

  function TaskCard({ t: task }) {
    const tc = getTypeColor(task.type);
    const sc = getStatusColor(task.status);
    const u  = users.find(usr => usr.name === task.owner);
    const breach = !doneLabels.has(task.status) && isSlaBreach(task);
    const wasRedirected = !!task.escalationNote || task.devolvido === true || task.history?.some(h => h.action === "Passada");
    return (
      <div key={task.id} onClick={() => setSelected(task)} style={{ background: THEME.card, borderRadius: 10, border: `1px solid ${breach ? THEME.danger + "66" : THEME.border}`, padding: "12px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Tag bg={task.type ? tc.bg : "#2d0a0a"} color={task.type ? tc.color : "#f87171"}>{task.type || "Sem Classificação"}</Tag>
            {wasRedirected && task.status === porFazerLabel && (
              <span title="Redireccionada / Devolvida" style={{ fontSize: 10, color: "#fb923c", display: "inline-flex", alignItems: "center" }}>↩</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {breach && <Icon name="alert" size={12} color={THEME.danger} />}
            <Tag bg={sc.bg} color={sc.color}>{task.status}</Tag>
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text }}>{task.client || "—"}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Avatar name={task.owner || "?"} size={22} photo={u?.photo} />
            <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: showAll ? 600 : 400 }}>{task.owner ? (showAll ? task.owner : task.owner.split(" ")[0]) : "Sem resp."}</span>
          </div>
          <span style={{ fontSize: 11, color: breach ? THEME.danger : THEME.textDim, fontWeight: breach ? 700 : 400 }}>{task.due}{breach ? " ⚠" : ""}</span>
        </div>
      </div>
    );
  }

  function TaskRow({ t: task }) {
    const tc = getTypeColor(task.type);
    const sc = getStatusColor(task.status);
    const u  = users.find(usr => usr.name === task.owner);
    const isBlocked   = task.status === "Bloqueado";
    const isEscalatedRow = task.status === "Escalado" || !!task.escalationNote;
    const breach = !doneLabels.has(task.status) && isSlaBreach(task);
    const wasRedirected = !!task.escalationNote || task.devolvido === true || task.history?.some(h => h.action === "Passada");
    const rowBg = breach ? `${THEME.danger}0c` : (isBlocked || isEscalatedRow ? `${THEME.danger}08` : THEME.bg);
    return (
      <tr
        onClick={() => setSelected(task)}
        style={{ borderBottom: `1px solid ${THEME.borderLight}`, cursor: "pointer", background: rowBg }}
        onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
      >
        <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 11, color: THEME.textDim }}>
          {task.id}
          {wasRedirected && task.status === porFazerLabel && <span title="Redireccionada" style={{ color: "#fb923c", marginLeft: 4 }}>↩</span>}
        </td>
        <td style={{ padding: "9px 12px" }}><Tag bg={task.type ? tc.bg : "#2d0a0a"} color={task.type ? tc.color : "#f87171"}>{task.type || "Sem Classificação"}</Tag></td>
        <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, color: THEME.text, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.client || "—"}</td>
        <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 11, color: THEME.textDim }}>{task.originProcesso || "—"}</td>
        <td style={{ padding: "9px 12px" }}>
          {task.owner ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Avatar name={task.owner} size={22} photo={u?.photo} />
              <span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: showAll ? 600 : 400 }}>{showAll ? task.owner : task.owner.split(" ")[0]}</span>
            </div>
          ) : (
            <span style={{ fontSize: 11, color: THEME.danger }}>Sem responsável</span>
          )}
        </td>
        <td style={{ padding: "9px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Tag bg={sc.bg} color={sc.color}>{task.status}</Tag>
            {isEscalatedRow && <Icon name="escalate" size={12} color="#e879f9" />}
            {isBlocked      && <Icon name="alert"    size={12} color={THEME.danger} />}
            {breach         && <Icon name="alert"    size={12} color={THEME.danger} />}
          </div>
        </td>
        <td style={{ padding: "9px 12px", fontSize: 11, color: breach ? THEME.danger : THEME.textMuted, fontWeight: breach ? 700 : 400 }}>{task.due}{breach ? " ⚠" : ""}</td>
      </tr>
    );
  }

  const SECTION_LABEL = { fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em" };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      {/* Page header */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>
            {isPrivileged && showAll ? "Todas as Tarefas" : "Tarefas"}
          </h1>
          <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
            {activeCount} activas{isPrivileged && showAll ? " (todos os utilizadores)" : ""}
          </div>
        </div>
        {isPrivileged && (
          <button
            onClick={() => setShowAll(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: showAll ? THEME.accent + "22" : THEME.sidebar, border: `1px solid ${showAll ? THEME.accent + "66" : THEME.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: showAll ? THEME.accent : THEME.textMuted, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <Icon name="layers" size={13} color={showAll ? THEME.accent : THEME.textMuted} />
            {showAll ? "Ver as minhas" : "Ver todas as tarefas"}
          </button>
        )}
      </div>

      <SummaryStrip porFazer={pooledPorFazer} activas={pooledActivas} slaExcedido={pooledSlaExcedido} onClick={() => navigate("/dashboard")} />

      {/* Toolbar */}
      <div style={{ padding: isMobile ? "10px 14px" : "12px 24px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: THEME.textDim, pointerEvents: "none" }}>
            <Icon name="search" size={13} />
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar…"
            style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", width: 190, background: THEME.card, color: THEME.text }} />
        </div>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={SEL}>
          <option value="Todos">Todos os tipos</option>
          {store.getTaskTypes().map(t => <option key={t.label}>{t.label}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SEL}>
          <option value="Todos">Todos os estados</option>
          {store.getTaskStatuses().map(s => <option key={s.label}>{s.label}</option>)}
        </select>

        {isPrivileged && (
          <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)} style={SEL}>
            <option value="Todos">Todos os responsáveis</option>
            {assignedUsers.map(u => <option key={u}>{u}</option>)}
          </select>
        )}
      </div>

      {/* ── Acknowledgment cards — passive process handoffs, not real tasks.
           Sits above the Por Fazer section and below the search/toolbar. ── */}
      {ackItems.length > 0 && (
        <div style={{ padding: isMobile ? "8px 14px 0" : "8px 24px 0", display: "flex", flexDirection: "column", gap: 6 }}>
          {ackItems.map(item => <AckCard key={item.id} item={item} onDismiss={dismissAck} />)}
        </div>
      )}

      {/* ── Section: Por Fazer ── */}
      <div style={{ padding: isMobile ? "4px 14px" : "4px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 8px" }}>
          <span style={SECTION_LABEL}>Por Fazer</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "1px 7px" }}>{porFazerTasks.length}</span>
          <div style={{ flex: 1, height: 1, background: THEME.border }} />
        </div>
      </div>

      {isMobile ? (
        <div style={{ padding: "0 14px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
          {porFazerTasks.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "16px 0", fontSize: 13 }}>Sem tarefas por fazer</p>}
          {porFazerTasks.map(t => <TaskCard key={t.id} t={t} />)}
        </div>
      ) : (
        <div style={{ padding: "0 24px 8px" }}>
          <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                  {["Nº", "Tipo", "Cliente", "Processo", "Responsável", "Estado", "Prazo"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{porFazerTasks.map(t => <TaskRow key={t.id} t={t} />)}</tbody>
            </table>
            {porFazerTasks.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "16px 0", fontSize: 13 }}>Sem tarefas por fazer</p>}
          </div>
        </div>
      )}

      {/* ── Section: Em Curso ── */}
      <div style={{ padding: isMobile ? "4px 14px" : "4px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 8px" }}>
          <span style={SECTION_LABEL}>Em Curso</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "1px 7px" }}>{emCursoTasks.length}</span>
          <div style={{ flex: 1, height: 1, background: THEME.border }} />
        </div>
      </div>
      {isMobile ? (
        <div style={{ padding: "0 14px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
          {emCursoTasks.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "16px 0", fontSize: 13 }}>Sem tarefas em curso</p>}
          {emCursoTasks.map(t => <TaskCard key={t.id} t={t} />)}
        </div>
      ) : (
        <div style={{ padding: "0 24px 8px" }}>
          <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                  {["Nº", "Tipo", "Cliente", "Processo", "Responsável", "Estado", "Prazo"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{emCursoTasks.map(t => <TaskRow key={t.id} t={t} />)}</tbody>
            </table>
            {emCursoTasks.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "16px 0", fontSize: 13 }}>Sem tarefas em curso</p>}
          </div>
        </div>
      )}

      {/* ── Section: Concluídas ── */}
      <div style={{ padding: isMobile ? "4px 14px" : "4px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 8px" }}>
          <span style={SECTION_LABEL}>Concluídas</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "1px 7px" }}>{doneTasks.length}</span>
          <div style={{ flex: 1, height: 1, background: THEME.border }} />
        </div>
      </div>
      {isMobile ? (
        <div style={{ padding: "0 14px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
          {doneTasks.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "16px 0", fontSize: 13 }}>Sem tarefas concluídas</p>}
          {doneTasks.map(t => <TaskCard key={t.id} t={t} />)}
        </div>
      ) : (
        <div style={{ padding: "0 24px 8px" }}>
          <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto", opacity: 0.7 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                  {["Nº", "Tipo", "Cliente", "Processo", "Responsável", "Estado", "Prazo"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{doneTasks.map(t => <TaskRow key={t.id} t={t} />)}</tbody>
            </table>
            {doneTasks.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "16px 0", fontSize: 13 }}>Sem tarefas concluídas</p>}
          </div>
        </div>
      )}

      {/* ── Section: Canceladas — any task whose current status resolves to the
          Cancelado system role. Kept as its own section (not merged into
          Concluídas) so cancelled tasks remain visible and findable rather
          than disappearing from view once cancelled. ── */}
      <div style={{ padding: isMobile ? "4px 14px" : "4px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 8px" }}>
          <span style={SECTION_LABEL}>Canceladas</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "1px 7px" }}>{cancelledTasks.length}</span>
          <div style={{ flex: 1, height: 1, background: THEME.border }} />
        </div>
      </div>
      {isMobile ? (
        <div style={{ padding: "0 14px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
          {cancelledTasks.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "16px 0", fontSize: 13 }}>Sem tarefas canceladas</p>}
          {cancelledTasks.map(t => <TaskCard key={t.id} t={t} />)}
        </div>
      ) : (
        <div style={{ padding: "0 24px 32px" }}>
          <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto", opacity: 0.7 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                  {["Nº", "Tipo", "Cliente", "Processo", "Responsável", "Estado", "Prazo"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{cancelledTasks.map(t => <TaskRow key={t.id} t={t} />)}</tbody>
            </table>
            {cancelledTasks.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "16px 0", fontSize: 13 }}>Sem tarefas canceladas</p>}
          </div>
        </div>
      )}

      {selected && (
        <TaskDrawer
          task={selected}
          users={users}
          currentUser={currentUser}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          setProcessos={setProcessos}
          processos={processos}
          setTarefas={setTarefas}
          tarefas={tarefas}
        />
      )}
    </div>
  );
}
