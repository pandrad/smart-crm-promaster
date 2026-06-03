import { useState } from "react";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { useWindowSize } from "../utils.js";
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

// ── Validar e Criar Processo modal ────────────────────────────────────────────
function ValidarModal({ task, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const email = task.originEmail;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 460) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Validar e Criar Processo</span>
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
            Ao confirmar, um número de processo será gerado automaticamente e o processo criado com estado <strong style={{ color: THEME.text }}>Entrada</strong>. Esta tarefa de validação ficará marcada como Concluída e o histórico completo é preservado.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Validar e Criar Processo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

// ── Enviar Email ao Cliente modal (Validação de Processo only) ───────────────
function EnviarEmailClienteModal({ task, currentUser, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const email = task.originEmail;
  const [to,      setTo]      = useState(email?.sender || "");
  const [subject, setSubject] = useState(`Re: ${email?.subject || "Consulta de processo"}`);
  const [body,    setBody]    = useState(
    `Exmo(a) Sr(a) ${email?.senderName || task.client || ""},\n\nEm resposta ao seu pedido, ` +
    `informamos que a sua solicitação está a ser analisada pela nossa equipa.\n\n` +
    `Em caso de dúvidas, não hesite em contactar-nos.\n\nCom os melhores cumprimentos,\n${currentUser?.name || ""}`
  );
  const [sent, setSent] = useState(false);

  function handleSend() {
    onSave({ to, subject, body });
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
              <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Assunto</label>
              <input style={INPUT} value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Mensagem</label>
              <textarea
                value={body} onChange={e => setBody(e.target.value)}
                rows={7}
                style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
              <button
                onClick={handleSend}
                disabled={!to.trim() || !subject.trim()}
                style={{ background: to.trim() && subject.trim() ? THEME.accent : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: to.trim() && subject.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}
              >
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

// ── Resubmeter modal (after Devolvido) ────────────────────────────────────────
function ResubmeterModal({ onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const [note, setNote] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 440) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Resubmeter para Validação</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Nota de actualização <span style={{ color: THEME.danger }}>*</span>
            </label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              rows={3} placeholder="Descreva o que foi actualizado ou esclarecido…"
              style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button
              onClick={() => { if (note.trim()) { onSave(note.trim()); onClose(); } }}
              disabled={!note.trim()}
              style={{ background: note.trim() ? THEME.accent : THEME.border, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: note.trim() ? "pointer" : "default" }}
            >
              Resubmeter
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

// ── Abrir Processo modal (only for Pré-Entrada tasks) ─────────────────────────
function AbrirProcessoModal({ task, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const email = task.originEmail;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 440) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Abrir Processo</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, marginBottom: 4 }}>
              {email ? email.senderName : task.client}
            </div>
            {email && <div style={{ fontSize: 11, color: THEME.textDim }}>{email.subject}</div>}
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5 }}>
            Um número de processo será gerado automaticamente (formato 2605NNN) e o processo aparecerá na lista de Processos com estado <strong style={{ color: THEME.text }}>Entrada</strong>.
          </div>
          <div style={{ fontSize: 12, color: THEME.textDim, background: THEME.sidebar, borderRadius: 7, padding: "8px 12px", border: `1px solid ${THEME.border}` }}>
            A tarefa será marcada como Concluída e o processo ficará atribuído de acordo com as regras de atribuição configuradas.
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

// ── TaskDrawer ────────────────────────────────────────────────────────────────
export function TaskDrawer({ task: initialTask, users, currentUser, onClose, onUpdate, setProcessos, processos }) {
  const { isMobile } = useWindowSize();
  const [t,              setT]              = useState(initialTask);
  const [emailExpanded,  setEmailExpanded]  = useState(false);
  const [modal,          setModal]          = useState(null);

  const isAdmin      = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const isPrivileged = isAdmin || isSupervisor;
  const isOwner      = t.owner === currentUser?.name;
  const isDone       = t.status === "Concluído" || t.status === "Cancelado";
  const isEscalated  = t.status === "Escalado";
  const isCancelPending = t.status === "Cancelamento Pendente";
  const isPre        = t.type   === "Pré-Entrada";
  const isValidation = t.type   === "Validação de Processo";
  const isDevolvido  = t.status === "Devolvido";
  // For validation tasks: the validator is the one who can approve/return
  const isValidator  = isValidation && (t.validatorOwner === currentUser?.name || isPrivileged);
  // The triage author can resubmit after Devolvido
  const isTriagedBy  = isValidation && (t.triagedBy === currentUser?.name);

  const tc = getTypeColor(t.type);
  const sc = getStatusColor(t.status);

  function update(patch, historyEntry) {
    const updated = {
      ...t,
      ...patch,
      history: [...(t.history || []), { ...historyEntry, ts: nowTs() }],
    };
    setT(updated);
    onUpdate(updated);
  }

  // Action: Marcar como Concluído
  function handleConcluir(note) {
    update(
      { status: "Concluído" },
      { actor: currentUser?.name, action: "Concluído", note: note || "Tarefa concluída." }
    );
  }

  // Action: Abrir Processo (Pré-Entrada only)
  function handleAbrirProcesso() {
    // Generate next AAMMMNNN
    const existing = (processos || []).map(p => p.id).filter(id => id.startsWith("2605"));
    const max = existing.reduce((m, id) => Math.max(m, parseInt(id.slice(4)) || 0), 10);
    const newId = `2605${String(max + 1).padStart(3, "0")}`;

    const email = t.originEmail;
    const assignment = store.getAssignment();
    const storeUsers = store.getUsers();
    const ownerUser  = storeUsers.find(u => u.role === "cotacao" && u.active !== false);

    const newProcesso = {
      id:        newId,
      created:   "15/05/2026",
      deadline:  "22/05/2026",
      priority:  "Normal",
      status:    1, // Entrada
      client:    email?.senderName || t.client || "",
      ref:       "",
      brand:     "",
      model:     "",
      vin:       "",
      owner:     ownerUser?.name || "Adelina Rodrigues",
      comm:      storeUsers.find(u => u.role === "comercial" && u.active !== false)?.name || "João Morais",
      compra:    storeUsers.find(u => u.role === "compra"    && u.active !== false)?.name || "Carlos Andrade",
      comprador: email?.senderName || t.client || "",
      price:     null,
      emails:    1,
      note:      `Aberto via tarefa ${t.id}`,
      archived:  false,
      carryover: false,
      excelLink: "Excel Modelo.xlsx",
      timeline: [
        { icon: "mail",  color: "#60a5fa", time: "15/05 12:00", text: `Email original de ${email?.senderName || t.client}: ${email?.subject || ""}` },
        { icon: "check", color: "#4ade80", time: "15/05 12:00", text: `Processo aberto por ${currentUser?.name} via tarefa ${t.id}` },
      ],
    };

    if (setProcessos) setProcessos(prev => [...prev, newProcesso]);

    update(
      { status: "Concluído", originProcesso: newId },
      { actor: currentUser?.name, action: "Processo aberto", note: `Processo ${newId} criado com estado Entrada` }
    );
  }

  // Action: Passar a outro utilizador
  function handlePassar(targetName, note) {
    update(
      { owner: targetName },
      { actor: currentUser?.name, action: "Passada", note: `→ ${targetName}: ${note}` }
    );
  }

  // Action: Escalar
  function handleEscalar(targetName, note) {
    update(
      { owner: targetName, status: "Escalado", escalationNote: note },
      { actor: currentUser?.name, action: "Escalada", note: `→ ${targetName}: ${note}` }
    );
  }

  // Action: Retomar (supervisor/admin on escalated task)
  function handleRetomar() {
    update(
      { owner: currentUser?.name, status: "Em Curso", escalationNote: null },
      { actor: currentUser?.name, action: "Retomada", note: "Supervisor assumiu a tarefa." }
    );
  }

  // ── Validation task actions ────────────────────────────────────────────────

  // Action: Validar e Criar Processo (validator only)
  function handleValidar() {
    const existing = (processos || []).map(p => p.id).filter(id => id.startsWith("2605"));
    const max = existing.reduce((m, id) => Math.max(m, parseInt(id.slice(4)) || 0), 10);
    const newId = `2605${String(max + 1).padStart(3, "0")}`;
    const email = t.originEmail;
    const storeUsers = store.getUsers();
    const ownerUser = storeUsers.find(u => u.role === "cotacao" && u.active !== false);

    const newProcesso = {
      id: newId,
      created: "15/05/2026", deadline: "22/05/2026", priority: t.priority || "Normal",
      status: 1,
      client: t.client || email?.senderName || "",
      ref: "", brand: "", model: "", vin: "",
      owner: ownerUser?.name || "Adelina Rodrigues",
      comm: storeUsers.find(u => u.role === "comercial" && u.active !== false)?.name || "João Morais",
      compra: storeUsers.find(u => u.role === "compra"   && u.active !== false)?.name || "Carlos Andrade",
      comprador: t.client || email?.senderName || "",
      price: null, emails: 1,
      note: `Aberto após validação da tarefa ${t.id}`,
      archived: false, carryover: false, excelLink: "Excel Modelo.xlsx",
      timeline: [
        { icon: "mail",  color: "#60a5fa", time: "15/05 12:00", text: `Email original de ${email?.senderName || t.client}: ${email?.subject || ""}` },
        { icon: "check", color: "#4ade80", time: nowTs(),       text: `Processo validado e aberto por ${currentUser?.name} (tarefa ${t.id})` },
      ],
    };

    if (setProcessos) setProcessos(prev => [...prev, newProcesso]);
    update(
      { status: "Concluído", originProcesso: newId },
      { actor: currentUser?.name, action: "Validado", note: `Processo ${newId} criado com estado Entrada.` }
    );
  }

  // Action: Devolver com Notas (validator only)
  function handleDevolver(note) {
    update(
      { status: "Devolvido", owner: t.triagedBy || t.owner },
      { actor: currentUser?.name, action: "Devolvido", note }
    );
  }

  // Action: Resubmeter (triaged-by person after Devolvido)
  function handleResubmeter(note) {
    update(
      { status: "Por Fazer", owner: t.validatorOwner || t.owner },
      { actor: currentUser?.name, action: "Resubmetido", note }
    );
  }

  // Action: Cancelar Tarefa — puts task into Cancelamento Pendente for supervisor approval
  function handleCancelar(reason) {
    update(
      { status: "Cancelamento Pendente", cancelReason: reason },
      { actor: currentUser?.name, action: "Cancelamento Pedido", note: reason }
    );
  }

  // Action: Aprovar Cancelamento (supervisor/admin only, when Cancelamento Pendente)
  function handleAprovarCancelamento() {
    update(
      { status: "Cancelado" },
      { actor: currentUser?.name, action: "Cancelamento Aprovado", note: t.cancelReason || "" }
    );
  }

  // Action: Enviar Email ao Cliente (validator only on Validação de Processo)
  function handleEnviarEmailCliente({ to, subject, body }) {
    update(
      { status: t.status === "Por Fazer" ? "Em Curso" : t.status },
      {
        actor:  currentUser?.name,
        action: "Email enviado ao cliente",
        note:   `Para: ${to}\nAssunto: ${subject}\n\n${body}`,
      }
    );
  }

  // Action: Rejeitar Cancelamento (supervisor/admin only, when Cancelamento Pendente)
  function handleRejeitarCancelamento(note) {
    update(
      { status: "Em Curso", cancelReason: null },
      { actor: currentUser?.name, action: "Cancelamento Rejeitado", note }
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
                <Tag bg={tc.bg} color={tc.color}>{t.type}</Tag>
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
              ["Tipo",     t.type],
              ["Estado",   t.status],
              ["Criado",   t.created],
              ["Prazo",    t.due],
              ["Processo", t.originProcesso || "—"],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={LABEL}>{lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginTop: 2 }}>{val || "—"}</div>
              </div>
            ))}
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
                {t.history.map((h, i) => {
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

          {/* ── Action buttons ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 12 }}>

            {/* ── Validation task actions (shown instead of normal actions for this type) ── */}
            {isValidation && !isDone && (
              <>
                {/* Validar e Criar Processo — validator only, when Por Fazer or after resubmit */}
                {isValidator && !isDevolvido && (
                  <button
                    onClick={() => setModal("validar")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Icon name="check" size={14} color="white" /> Validar e Criar Processo
                  </button>
                )}

                {/* Devolver com Notas — validator only, when Por Fazer */}
                {isValidator && !isDevolvido && (
                  <button
                    onClick={() => setModal("devolver")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.warningBg, color: THEME.warning, border: `1px solid ${THEME.warning}44`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Icon name="edit" size={14} color={THEME.warning} /> Devolver com Notas
                  </button>
                )}

                {/* Enviar Email ao Cliente — validator only, any non-done state */}
                {isValidator && (
                  <button
                    onClick={() => setModal("enviarEmailCliente")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#0c1a2e", color: "#93c5fd", border: "1px solid #1e3a5f", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Icon name="mail" size={14} color="#93c5fd" /> Enviar Email ao Cliente
                  </button>
                )}

                {/* Resubmeter — triage author only, when Devolvido */}
                {isDevolvido && isTriagedBy && (
                  <button
                    onClick={() => setModal("resubmeter")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#1e3a5f", color: "#60a5fa", border: "1px solid #60a5fa44", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Icon name="plus" size={14} color="#60a5fa" /> Resubmeter para Validação
                  </button>
                )}

                {/* Cancelar — assigned person only */}
                {isOwner && (
                  <button
                    onClick={() => setModal("cancelar")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.dangerBg, color: THEME.danger, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    <Icon name="x" size={13} color={THEME.danger} /> Cancelar Tarefa
                  </button>
                )}
              </>
            )}

            {/* ── Standard task actions (hidden for Validação de Processo) ── */}
            {!isValidation && (
              <>
                {/* Primary action: Abrir Processo (Pré-Entrada) OR Marcar como Concluído */}
                {!isDone && (
                  isPre ? (
                    <button
                      onClick={() => setModal("abrirProcesso")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      <Icon name="plus" size={14} color="white" /> Abrir Processo
                    </button>
                  ) : (
                    <button
                      onClick={() => setModal("concluir")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.success, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      <Icon name="check" size={14} color="white" /> Marcar como Concluído
                    </button>
                  )
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

                {/* Secondary row */}
                {!isDone && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setModal("passar")}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                    >
                      <Icon name="edit" size={13} color={THEME.textMuted} /> Passar
                    </button>
                    {!isPrivileged && !isEscalated && (
                      <button
                        onClick={() => setModal("escalar")}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.dangerBg, color: THEME.danger, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                      >
                        <Icon name="escalate" size={13} color={THEME.danger} /> Escalar
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── Cancelamento Pendente — supervisor approval/rejection ── */}
            {isCancelPending && isPrivileged && (
              <>
                <div style={{ background: "#2d1505", border: "1px solid #fb923c44", borderRadius: 8, padding: "9px 13px", fontSize: 12, color: "#fb923c" }}>
                  <strong>Pedido de cancelamento</strong> — {t.cancelReason || "Sem motivo indicado"}
                </div>
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

            {/* Cancelamento Pendente — waiting label for non-privileged */}
            {isCancelPending && !isPrivileged && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#2d1505", color: "#fb923c", border: "1px solid #fb923c44", borderRadius: 8, padding: 10, fontSize: 13 }}>
                <Icon name="alert" size={14} color="#fb923c" /> A aguardar aprovação de cancelamento
              </div>
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
      {modal === "validar"               && <ValidarModal              task={t} onClose={() => setModal(null)} onSave={handleValidar} />}
      {modal === "devolver"              && <DevolverModal             onClose={() => setModal(null)} onSave={handleDevolver} />}
      {modal === "resubmeter"            && <ResubmeterModal           onClose={() => setModal(null)} onSave={handleResubmeter} />}
      {modal === "cancelar"              && <CancelarTarefaModal       onClose={() => setModal(null)} onSave={handleCancelar} />}
      {modal === "rejeitarCancelamento"  && <RejeitarCancelamentoModal onClose={() => setModal(null)} onSave={handleRejeitarCancelamento} />}
      {modal === "concluir"              && <ConcluirModal             onClose={() => setModal(null)} onSave={handleConcluir} />}
      {modal === "abrirProcesso"         && <AbrirProcessoModal        task={t} onClose={() => setModal(null)} onSave={handleAbrirProcesso} />}
      {modal === "passar"                && <PassarModal               users={users} onClose={() => setModal(null)} onSave={handlePassar} />}
      {modal === "escalar"               && <EscalarModal              users={users} onClose={() => setModal(null)} onSave={handleEscalar} />}
    </>
  );
}

// ── Tarefas page ──────────────────────────────────────────────────────────────
export function Tarefas({ tarefas, setTarefas, processos, setProcessos, users, currentUser, accent }) {
  const { isMobile } = useWindowSize();
  const [search,         setSearch]         = useState("");
  const [typeFilter,     setTypeFilter]     = useState("Todos");
  const [statusFilter,   setStatusFilter]   = useState("Todos");
  const [assignedFilter, setAssignedFilter] = useState("Todos");
  const [selected,       setSelected]       = useState(null);

  const isAdmin      = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const isPrivileged = isAdmin || isSupervisor;

  // Standard users see only their own tasks; admin/supervisor see all
  const scope = isPrivileged ? tarefas : tarefas.filter(t => t.owner === currentUser?.name || t.owner === null);

  const assignedUsers = [...new Set(tarefas.map(t => t.owner).filter(Boolean))].sort();

  const rows = scope.filter(t => {
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

  // Active count for subtitle — includes Devolvido (needs attention from triage author)
  const activeCount = scope.filter(t =>
    t.status === "Por Fazer" || t.status === "Em Curso" ||
    t.status === "Bloqueado" || t.status === "Escalado" || t.status === "Devolvido"
  ).length;

  function handleUpdate(updated) {
    const next = tarefas.map(t => t.id === updated.id ? updated : t);
    setTarefas(next);
    store.saveTarefas(next);
    setSelected(updated);
  }

  const SEL = { fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "6px 10px", background: THEME.card, color: THEME.textMuted, outline: "none", cursor: "pointer" };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      {/* Page header */}
      <div style={{ padding: "20px 24px 0" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Tarefas</h1>
        <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
          {activeCount} activas{isPrivileged ? " (todos os utilizadores)" : ""}
        </div>
      </div>

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

        {/* "Ver por pessoa" — only for admin/supervisor */}
        {isPrivileged && (
          <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)} style={SEL}>
            <option value="Todos">Todos os responsáveis</option>
            {assignedUsers.map(u => <option key={u}>{u}</option>)}
          </select>
        )}
      </div>

      {/* Mobile card list */}
      {isMobile ? (
        <div style={{ padding: "0 14px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "40px 0", fontSize: 13 }}>Nenhuma tarefa encontrada</p>}
          {rows.map(t => {
            const tc = getTypeColor(t.type);
            const sc = getStatusColor(t.status);
            const u  = users.find(usr => usr.name === t.owner);
            return (
              <div key={t.id} onClick={() => setSelected(t)} style={{ background: THEME.card, borderRadius: 10, border: `1px solid ${THEME.border}`, padding: "12px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <Tag bg={tc.bg} color={tc.color}>{t.type}</Tag>
                  <Tag bg={sc.bg} color={sc.color}>{t.status}</Tag>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text }}>{t.client || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar name={t.owner || "?"} size={22} photo={u?.photo} />
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>{t.owner ? t.owner.split(" ")[0] : "Sem resp."}</span>
                  </div>
                  <span style={{ fontSize: 11, color: THEME.textDim }}>{t.due}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop table */
        <div style={{ padding: "0 24px 32px" }}>
          <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                  {["Nº", "Tipo", "Cliente", "Processo", "Responsável", "Estado", "Prazo"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(t => {
                  const tc = getTypeColor(t.type);
                  const sc = getStatusColor(t.status);
                  const u  = users.find(usr => usr.name === t.owner);
                  const isBlocked   = t.status === "Bloqueado";
                  const isEscalated = t.status === "Escalado";
                  return (
                    <tr key={t.id}
                      onClick={() => setSelected(t)}
                      style={{ borderBottom: `1px solid ${THEME.borderLight}`, cursor: "pointer", background: isBlocked || isEscalated ? `${THEME.danger}08` : THEME.bg }}
                      onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isBlocked || isEscalated ? `${THEME.danger}08` : THEME.bg; }}
                    >
                      <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 11, color: THEME.textDim }}>{t.id}</td>
                      <td style={{ padding: "9px 12px" }}><Tag bg={tc.bg} color={tc.color}>{t.type}</Tag></td>
                      <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, color: THEME.text, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.client || "—"}</td>
                      <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 11, color: THEME.textDim }}>{t.originProcesso || "—"}</td>
                      <td style={{ padding: "9px 12px" }}>
                        {t.owner ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Avatar name={t.owner} size={22} photo={u?.photo} />
                            <span style={{ fontSize: 11, color: THEME.textMuted }}>{t.owner.split(" ")[0]}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: THEME.danger }}>Sem responsável</span>
                        )}
                      </td>
                      <td style={{ padding: "9px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Tag bg={sc.bg} color={sc.color}>{t.status}</Tag>
                          {isEscalated && <Icon name="escalate" size={12} color="#e879f9" />}
                          {isBlocked   && <Icon name="alert"    size={12} color={THEME.danger} />}
                        </div>
                      </td>
                      <td style={{ padding: "9px 12px", fontSize: 11, color: THEME.textMuted }}>{t.due}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p style={{ textAlign: "center", color: THEME.textDim, padding: "40px 0", fontSize: 13 }}>Nenhuma tarefa encontrada</p>
            )}
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
        />
      )}
    </div>
  );
}
