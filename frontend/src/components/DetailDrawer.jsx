import { useState, useRef } from "react";
import { daysLeft, useWindowSize } from "../utils.js";
import { store } from "../store.js";
import { THEME } from "../theme.js";
import { Avatar, StageBadge, FUBadge, Tag } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

const INPUT = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.sidebar, color: THEME.text };
const ICON_MAP = { mail: "#60a5fa", cpu: "#c084fc", user: THEME.textMuted, check: THEME.success, alert: THEME.danger, x: THEME.danger };

const LABEL = { fontSize: 10, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 };

function InfoCell({ label, value }) {
  return (
    <div>
      <div style={LABEL}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginTop: 2 }}>{value || "—"}</div>
    </div>
  );
}

function EditableInfoCell({ label, value, canEdit, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || "");

  if (!canEdit || !editing) {
    return (
      <div onClick={canEdit ? () => { setDraft(value || ""); setEditing(true); } : undefined} style={{ cursor: canEdit ? "pointer" : "default" }}>
        <div style={LABEL}>{label} {canEdit && <Icon name="edit" size={9} color={THEME.textDim} style={{ marginLeft: 4 }} />}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginTop: 2 }}>{value || "—"}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={LABEL}>{label}</div>
      <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { onSave(draft); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
          style={{ ...INPUT, fontSize: 12, padding: "4px 7px", flex: 1 }}
        />
        <button onClick={() => { onSave(draft); setEditing(false); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>✓</button>
        <button onClick={() => setEditing(false)} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 5, padding: "3px 8px", fontSize: 11, color: THEME.textMuted, cursor: "pointer" }}>✕</button>
      </div>
    </div>
  );
}

function TeamCard({ name, role, photo }) {
  return (
    <div style={{ flex: 1, background: THEME.sidebar, borderRadius: 8, padding: "8px 12px", display: "flex", gap: 8, alignItems: "center", minWidth: 130, border: `1px solid ${THEME.border}` }}>
      <Avatar name={name} photo={photo} />
      <div>
        <div style={{ fontSize: 10, color: THEME.textDim }}>{role}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{name}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ ...LABEL, marginBottom: 8 }}>{children}</div>;
}

function mobileModal(isMobile, desktopWidth = 500) {
  if (!isMobile) return { width: desktopWidth, maxWidth: "95vw", borderRadius: 14 };
  return { width: "100%", maxWidth: "100%", borderRadius: "16px 16px 0 0", position: "fixed", bottom: 0, left: 0, right: 0, maxHeight: "92dvh", overflowY: "auto" };
}

// ── Email modal (with attachment support) ─────────────────────────────────────
function EmailModal({ p, onClose, onSent }) {
  const { isMobile } = useWindowSize();
  const fileRef = useRef(null);
  const [to,          setTo]          = useState(p.comprador || p.req || "");
  const [subject,     setSubject]     = useState(`Re: Cotação ${p.brand}${p.model ? " " + p.model : ""} — Proc. ${p.id}`);
  const [body,        setBody]        = useState(`Exmo(a) Sr(a) ${p.comprador || p.req || ""},\n\nEm resposta ao seu pedido de cotação, ...\n\nCom os melhores cumprimentos,`);
  const [attachments, setAttachments] = useState([]);
  const [sent,        setSent]        = useState(false);

  function addFiles(files) { setAttachments(prev => [...prev, ...Array.from(files).map(f => f.name)]); }
  function removeAttachment(name) { setAttachments(prev => prev.filter(n => n !== name)); }

  function handleSend() {
    onSent?.({ to, subject, body, attachments });
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
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
            {[["Para", to, setTo], ["Assunto", subject, setSubject]].map(([lbl, val, setter]) => (
              <div key={lbl}>
                <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>{lbl}</label>
                <input style={INPUT} value={val} onChange={e => setter(e.target.value)} />
              </div>
            ))}
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 4 }}>Mensagem</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} style={{ ...INPUT, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
            </div>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>Anexos</label>
              {attachments.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {attachments.map(name => (
                    <span key={name} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 9999, padding: "2px 8px", fontSize: 11, color: THEME.textMuted }}>
                      <Icon name="paperclip" size={10} color={THEME.textDim} />{name}
                      <button onClick={() => removeAttachment(name)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 0, lineHeight: 1 }}>×</button>
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
              <button onClick={handleSend} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="mail" size={13} color="white" /> Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Read-only origin email modal ──────────────────────────────────────────────
function OriginEmailModal({ email, onClose }) {
  const { isMobile } = useWindowSize();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 520) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Email de Origem</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 12px", alignItems: "start" }}>
            {[["De", email.senderName ? `${email.senderName} <${email.sender}>` : email.sender], ["Assunto", email.subject]].map(([lbl, val]) => (
              <>
                <div key={lbl + "-l"} style={{ ...LABEL, paddingTop: 3, whiteSpace: "nowrap" }}>{lbl}</div>
                <div key={lbl + "-v"} style={{ fontSize: 13, color: THEME.text, wordBreak: "break-word" }}>{val}</div>
              </>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 12 }}>
            <div style={{ ...LABEL, marginBottom: 8 }}>Mensagem</div>
            <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6, whiteSpace: "pre-wrap", background: THEME.sidebar, borderRadius: 8, padding: "12px 14px", border: `1px solid ${THEME.border}`, maxHeight: 320, overflowY: "auto" }}>
              {email.body}
            </div>
          </div>
          {email.attachments?.length > 0 && (
            <div>
              <div style={{ ...LABEL, marginBottom: 6 }}>Anexos</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {email.attachments.map((att, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 9999, padding: "2px 10px", fontSize: 11, color: THEME.textMuted }}>
                    <Icon name="paperclip" size={10} color={THEME.textDim} />{typeof att === "string" ? att : att.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 18px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Change status modal — reads from store, FU only when target status >= 9 ──
function ChangeStatusModal({ p, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const stages  = store.getStages();
  const fuList  = store.getFUStatuses();
  const [status, setStatus] = useState(p.status);
  const [fu,     setFu]     = useState(p.fu ?? "");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", ...mobileModal(isMobile, 420) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Alterar Estado</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* stage picker */}
          <div>
            <div style={{ ...LABEL, marginBottom: 8 }}>Estado do processo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {stages.map(s => (
                <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: status === s.id ? `${s.color}22` : "transparent", cursor: "pointer", border: status === s.id ? `1px solid ${s.color}55` : `1px solid transparent` }}>
                  <input type="radio" name="stage" checked={status === s.id} onChange={() => setStatus(s.id)} style={{ accentColor: s.color }} />
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: status === s.id ? 600 : 400, color: status === s.id ? s.color : THEME.textMuted }}>{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* FU picker — always visible */}
          {fuList.length > 0 && (
            <div>
              <div style={{ ...LABEL, marginBottom: 8 }}>Follow-up</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => setFu("")}
                  style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: !fu ? `2px solid ${THEME.textMuted}` : `2px solid ${THEME.border}`, background: !fu ? `${THEME.textMuted}22` : "transparent", color: THEME.textMuted }}>
                  — Nenhum —
                </button>
                {fuList.map(s => (
                  <button key={s.id ?? s.label} onClick={() => setFu(s.label)}
                    style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: fu === s.label ? `2px solid ${s.color}` : `2px solid ${THEME.border}`, background: fu === s.label ? s.bg : "transparent", color: s.color }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(status, fu || undefined); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reassign modal — admin, supervisor, or own-process owner ─────────────────
function ReassignModal({ p, users, onClose, onSave }) {
  const { isMobile } = useWindowSize();
  const active = users.filter(u => u.active !== false);
  // Supervisor can also reassign — include supervisor role in eligible pools
  const byRole = role => active.filter(u => u.role === role || u.role === "admin" || u.role === "supervisor");

  const [owner,  setOwner]  = useState(p.owner);
  const [comm,   setComm]   = useState(p.comm);
  const [compra, setCompra] = useState(p.compra);

  const SEL = { ...INPUT, marginTop: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", ...mobileModal(isMobile, 400) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Reatribuir processo</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Resp. Cotação",   val: owner,  set: setOwner,  pool: byRole("cotacao")   },
            { label: "Resp. Comercial", val: comm,   set: setComm,   pool: byRole("comercial") },
            { label: "Resp. Compra",    val: compra, set: setCompra, pool: byRole("compra")    },
          ].map(({ label, val, set, pool }) => (
            <div key={label}>
              <div style={LABEL}>{label}</div>
              <select value={val} onChange={e => set(e.target.value)} style={SEL}>
                {pool.length === 0
                  ? <option value={val}>{val}</option>
                  : pool.map(u => <option key={u.id} value={u.name}>{u.name}</option>)
                }
                {pool.length > 0 && !pool.find(u => u.name === val) && <option value={val}>{val}</option>}
              </select>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave({ owner, comm, compra }); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Consulta checklist — only when status === 5 ───────────────────────────────
function ConsultaChecklist({ consulta, onChange }) {
  const sla = store.getSLASettings();
  const SLA_PEDIDO   = sla.tasks["Em Curso"]  ?? 48;
  const SLA_RESPOSTA = sla.tasks["Por Fazer"] ?? 72;

  function hoursAgo(ts) {
    if (!ts) return null;
    // ts format: "DD/MM HH:MM"
    try {
      const [datePart, timePart] = ts.split(" ");
      const [day, month] = datePart.split("/").map(Number);
      const [hour, min]  = timePart.split(":").map(Number);
      const now   = new Date("2026-05-15T12:00:00"); // mock now
      const then  = new Date(2026, month - 1, day, hour, min);
      return Math.floor((now - then) / 3600000);
    } catch { return null; }
  }

  function tick(field, tsField) {
    const already = consulta[field];
    onChange({
      ...consulta,
      [field]:   !already,
      [tsField]: !already ? new Date().toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "") : null,
    });
  }

  const pedidoHours   = hoursAgo(consulta.pedidoTs);
  const respostaHours = hoursAgo(consulta.respostaTs);
  const pedidoOverdue   = consulta.pedidoFornecedor   && pedidoHours   !== null && pedidoHours   > SLA_PEDIDO;
  const respostaOverdue = consulta.respostaFornecedor && respostaHours !== null && respostaHours > SLA_RESPOSTA;

  const Row = ({ label, checked, ts, overdue, onTick }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: checked ? `${THEME.success}11` : THEME.sidebar, border: `1px solid ${checked ? THEME.success + "44" : THEME.border}` }}>
      <input type="checkbox" checked={checked} onChange={onTick} style={{ accentColor: THEME.success, width: 16, height: 16, cursor: "pointer" }} />
      <span style={{ flex: 1, fontSize: 13, color: checked ? THEME.text : THEME.textMuted, fontWeight: checked ? 500 : 400 }}>{label}</span>
      {checked && ts && (
        <span style={{ fontSize: 10, color: overdue ? THEME.danger : THEME.textDim, fontWeight: overdue ? 700 : 400 }}>
          {overdue ? "⚠ SLA excedido" : ts}
        </span>
      )}
    </div>
  );

  return (
    <div>
      <SectionLabel>Consulta — passos obrigatórios</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Row
          label="Pedido ao fornecedor"
          checked={consulta.pedidoFornecedor}
          ts={consulta.pedidoTs}
          overdue={pedidoOverdue}
          onTick={() => tick("pedidoFornecedor", "pedidoTs")}
        />
        <Row
          label="Resposta do fornecedor"
          checked={consulta.respostaFornecedor}
          ts={consulta.respostaTs}
          overdue={respostaOverdue}
          onTick={() => tick("respostaFornecedor", "respostaTs")}
        />
      </div>
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export function DetailDrawer({ p: initialP, onClose, onUpdate, users = [], currentUser = {} }) {
  const { isMobile } = useWindowSize();
  const [p,            setP]            = useState(initialP);
  const [emailOpen,       setEmailOpen]       = useState(false);
  const [originEmailOpen, setOriginEmailOpen] = useState(false);
  const [statusOpen,      setStatusOpen]      = useState(false);
  const [reassignOpen,    setReassignOpen]    = useState(false);
  const attachRef = useRef(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  function handleEmailSent({ to, subject, body, attachments }) {
    const entry = {
      icon: "mail", color: "#60a5fa",
      time: new Date().toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", ""),
      text: `Email enviado por ${currentUser.name || "—"} para ${to} — ${subject}${attachments?.length ? ` (${attachments.join(", ")})` : ""}`,
    };
    const updated = { ...p, timeline: [...(p.timeline || []), entry] };
    setP(updated);
    onUpdate?.(updated);
  }

  const stages = store.getStages();
  const d      = daysLeft(p.deadline);
  const stage  = stages.find(s => s.id === p.status);

  const isAdmin      = currentUser.role === "admin";
  const isSupervisor = currentUser.role === "supervisor";
  const isOwned      = p.owner === currentUser.name || p.comm === currentUser.name || p.compra === currentUser.name;
  const canReassign  = isAdmin || isSupervisor || isOwned;
  const canEdit      = isAdmin || isSupervisor || isOwned;

  function photoOf(name) { return users.find(u => u.name === name)?.photo; }

  function updateField(field, value) {
    const fieldLabels = { brand: "Marca / Tipo", model: "Modelo", price: "Sell Price" };
    const label = fieldLabels[field] || field;
    const oldVal = p[field] ?? "—";
    const displayNew = field === "price" && value ? `€${value}` : (value || "—");
    const displayOld = field === "price" && oldVal && oldVal !== "—" ? `€${oldVal}` : (oldVal || "—");
    const ts = nowTs();
    const entry = { icon: "edit", color: THEME.textMuted, time: ts, text: `${label} alterado de "${displayOld}" para "${displayNew}" por ${currentUser.name || "—"}` };
    const updated = { ...p, [field]: value, timeline: [...(p.timeline || []), entry] };
    setP(updated);
    onUpdate?.(updated);
  }

  function nowTs() {
    return new Date().toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "");
  }

  function handleStatusSave(newStatus, newFu) {
    const mapeamento   = store.getMapeamento();
    const reatribuiMap = mapeamento.processoStatusReatribui ?? {};
    let patch = { status: newStatus, ...(newFu !== undefined ? { fu: newFu } : {}) };

    if (reatribuiMap[newStatus]) {
      const newOwner = store.assignForProcessStatus(newStatus, p.client || null);
      if (newOwner) patch = { ...patch, owner: newOwner };
    }

    const oldStage = stages.find(s => s.id === p.status);
    const newStage = stages.find(s => s.id === newStatus);
    const ts = nowTs();
    const entries = [];
    entries.push({ icon: "tag", color: newStage?.color || THEME.textMuted, time: ts, text: `Estado alterado de "${oldStage?.label || p.status}" para "${newStage?.label || newStatus}" por ${currentUser.name || "—"}` });
    if (patch.owner && patch.owner !== p.owner) {
      entries.push({ icon: "user", color: THEME.textMuted, time: ts, text: `Reatribuído a ${patch.owner} (via mapeamento de estado)` });
    }
    if (newFu !== undefined && newFu !== p.fu) {
      entries.push({ icon: "check", color: "#38bdf8", time: ts, text: `Follow-up alterado para "${newFu || "—"}" por ${currentUser.name || "—"}` });
    }

    const updated = { ...p, ...patch, timeline: [...(p.timeline || []), ...entries] };
    setP(updated); onUpdate?.(updated);
  }

  function handleReassignSave({ owner, comm, compra }) {
    const ts = nowTs();
    const entries = [];
    if (owner !== p.owner) entries.push({ icon: "user", color: THEME.textMuted, time: ts, text: `Resp. Cotação alterado de ${p.owner} para ${owner} por ${currentUser.name || "—"}` });
    if (comm !== p.comm) entries.push({ icon: "user", color: THEME.textMuted, time: ts, text: `Resp. Comercial alterado de ${p.comm} para ${comm} por ${currentUser.name || "—"}` });
    if (compra !== p.compra) entries.push({ icon: "user", color: THEME.textMuted, time: ts, text: `Resp. Compra alterado de ${p.compra} para ${compra} por ${currentUser.name || "—"}` });
    const updated = { ...p, owner, comm, compra, timeline: [...(p.timeline || []), ...entries] };
    setP(updated); onUpdate?.(updated);
  }

  function handleConsultaChange(newConsulta) {
    const updated = { ...p, consulta: newConsulta };
    setP(updated); onUpdate?.(updated);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />

      <div style={isMobile
        ? { position: "fixed", bottom: 0, left: 0, right: 0, height: "92dvh", background: THEME.bg, zIndex: 50, overflowY: "auto", boxShadow: "0 -4px 40px rgba(0,0,0,0.5)", borderRadius: "16px 16px 0 0", borderTop: `1px solid ${THEME.border}` }
        : { position: "fixed", top: 0, right: 0, height: "100vh", width: 500, maxWidth: "96vw", background: THEME.bg, zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 40px rgba(0,0,0,0.5)", borderLeft: `1px solid ${THEME.border}` }
      }>

        {/* Drag handle — mobile only */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: THEME.border }} />
          </div>
        )}

        {/* ── Sticky header ── */}
        <div style={{ position: "sticky", top: 0, background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}`, padding: isMobile ? "12px 16px" : "16px 24px", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              {/* Process number — large, monospace, prominent */}
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: THEME.textMuted, letterSpacing: "0.05em", lineHeight: 1, marginBottom: 4 }}>
                {p.id}
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: THEME.text, lineHeight: 1.2 }}>{p.client}</h2>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <StageBadge id={p.status} />
                {/* FU badge only shown when status >= 9 */}
                {p.status >= 9 && p.fu && <FUBadge label={p.fu} />}
                {p.priority === "Alta" && <Tag bg={THEME.dangerBg} color={THEME.danger}>🔴 Alta Prioridade</Tag>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4, flexShrink: 0 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: isMobile ? "12px 16px" : "16px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* ── Overdue alert ── */}
          {d < 0 && (
            <div style={{ background: THEME.dangerBg, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="alert" size={15} color={THEME.danger} />
              <span style={{ fontSize: 13, color: THEME.danger, fontWeight: 500 }}>Processo com {Math.abs(d)} dia(s) de atraso</span>
            </div>
          )}

          {/* ── Comprador — prominent, always first ── */}
          <div style={{ background: THEME.sidebar, borderRadius: 10, padding: "12px 14px", border: `1px solid ${THEME.border}` }}>
            <div style={LABEL}>Comprador</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: THEME.text, marginTop: 3 }}>{p.comprador || p.req || "—"}</div>
          </div>

          {/* ── Info grid ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
            <InfoCell label="Cliente"        value={p.client} />
            <InfoCell label="Ref. Cliente"   value={p.ref} />
            <EditableInfoCell label="Marca / Tipo"   value={p.brand}  canEdit={canEdit} onSave={v => updateField("brand", v)} />
            <EditableInfoCell label="Modelo"         value={p.model}  canEdit={canEdit} onSave={v => updateField("model", v)} />
            <InfoCell label="Nº Série / VIN" value={p.vin} />
            <InfoCell label="Data Limite"    value={p.deadline} />
            <InfoCell label="Prioridade"     value={p.priority} />
            <EditableInfoCell label="Sell Price"     value={p.price ? "€" + p.price.toLocaleString("pt-PT") : ""}  canEdit={canEdit} onSave={v => { const n = parseFloat(v.replace(/[^\d.,]/g, "").replace(",", ".")); updateField("price", isNaN(n) ? null : n); }} />
            {p.status >= 9 && (
              <InfoCell label="Follow-up" value={p.fu || "—"} />
            )}
          </div>

          {/* ── Consulta checklist — only when status === 5 ── */}
          {p.status === 5 && p.consulta && (
            <ConsultaChecklist consulta={p.consulta} onChange={handleConsultaChange} />
          )}

          {/* ── Team ── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <SectionLabel>Equipa</SectionLabel>
              {canReassign && (
                <button onClick={() => setReassignOpen(true)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "3px 9px", fontSize: 11, color: THEME.textMuted, cursor: "pointer" }}>
                  <Icon name="edit" size={11} /> Reatribuir
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <TeamCard name={p.owner}  role="Resp. Cotação"   photo={photoOf(p.owner)} />
              <TeamCard name={p.comm}   role="Resp. Comercial" photo={photoOf(p.comm)} />
              <TeamCard name={p.compra} role="Resp. Compra"    photo={photoOf(p.compra)} />
            </div>
          </div>

          {/* ── Pipeline bar ── */}
          <div>
            <SectionLabel>Pipeline</SectionLabel>
            <div style={{ display: "flex", gap: 3 }}>
              {stages.filter(s => !s.optional && s.id <= 10).map(s => (
                <div key={s.id} style={{ flex: 1, height: 6, borderRadius: 9999, background: p.status >= s.id ? s.color : THEME.border }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 5 }}>{stage?.label}</div>
          </div>

          {/* ── Attachments — always two pinned items first ── */}
          <div>
            <SectionLabel>Anexos</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Pinned 1 — Email de Origem */}
              <div
                onClick={p.originEmail ? () => setOriginEmailOpen(true) : undefined}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, cursor: p.originEmail ? "pointer" : "default" }}
                onMouseEnter={p.originEmail ? e => { e.currentTarget.style.background = THEME.sidebarHover; } : undefined}
                onMouseLeave={p.originEmail ? e => { e.currentTarget.style.background = THEME.sidebar; } : undefined}
              >
                <Icon name="mail" size={13} color={p.originEmail ? THEME.accent : THEME.textDim} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: p.originEmail ? THEME.accent : THEME.text }}>Email de Origem</div>
                  {p.originEmail && (
                    <div style={{ fontSize: 10, color: THEME.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.originEmail.senderName ?? p.originEmail.sender} — {p.originEmail.subject}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, color: THEME.textDim, background: THEME.card, borderRadius: 9999, padding: "2px 6px" }}>fixo</span>
              </div>
              {/* Pinned 2 — Modelo de Proposta (supersedable) */}
              {!p.modeloSuperseded && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8 }}>
                  <a
                    href="https://promasterlda.sharepoint.com/:x:/r/sites/Intranet/_layouts/15/guestaccess.aspx?e=DLVapo&share=IQCrlmqVEA1tQ5fRdQpoTnz1ATDQ8uLZXGdhQHDKqkEKpDE"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, textDecoration: "none", color: THEME.accent, fontSize: 12, fontWeight: 500 }}
                  >
                    <Icon name="paperclip" size={13} color={THEME.accent} />
                    <span style={{ flex: 1 }}>Modelo de Proposta.xlsx</span>
                  </a>
                  {canEdit && confirmRemove !== "modelo" && (
                    <button onClick={() => setConfirmRemove("modelo")} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textDim, fontSize: 10, padding: "2px 4px" }} title="Remover">
                      <Icon name="x" size={11} color={THEME.textDim} />
                    </button>
                  )}
                  {confirmRemove === "modelo" && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => {
                        const ts = new Date().toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "");
                        const entry = { icon: "x", color: THEME.textDim, time: ts, text: `Modelo de Proposta.xlsx substituído por ${currentUser.name || "—"}` };
                        const updated = { ...p, modeloSuperseded: true, timeline: [...(p.timeline || []), entry] };
                        setP(updated); onUpdate?.(updated); setConfirmRemove(null);
                      }} style={{ background: THEME.danger, color: "white", border: "none", borderRadius: 5, padding: "2px 8px", fontSize: 10, cursor: "pointer" }}>Confirmar</button>
                      <button onClick={() => setConfirmRemove(null)} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 5, padding: "2px 8px", fontSize: 10, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  )}
                  <span style={{ fontSize: 10, color: THEME.textDim, background: THEME.card, borderRadius: 9999, padding: "2px 6px" }}>fixo</span>
                </div>
              )}
              {/* Other attachments — only show non-superseded */}
              {(p.attachments || []).filter(att => !att.superseded).length === 0 && p.modeloSuperseded && (
                <div style={{ fontSize: 11, color: THEME.textDim, paddingLeft: 2 }}>Sem anexos activos</div>
              )}
              {(p.attachments || []).filter(att => !att.superseded).length === 0 && !p.modeloSuperseded && (!p.attachments || p.attachments.length === 0) && (
                <div style={{ fontSize: 11, color: THEME.textDim, paddingLeft: 2 }}>Sem outros anexos</div>
              )}
              {p.attachments?.filter(att => !att.superseded).map((att, i) => {
                const attKey = `att-${i}`;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, fontSize: 12, color: THEME.textMuted }}>
                    <Icon name="paperclip" size={13} color={THEME.textDim} />
                    <span style={{ flex: 1 }}>{typeof att === "string" ? att : att.name}</span>
                    {canEdit && confirmRemove !== attKey && (
                      <button onClick={() => setConfirmRemove(attKey)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textDim, fontSize: 10, padding: "2px 4px" }} title="Remover">
                        <Icon name="x" size={11} color={THEME.textDim} />
                      </button>
                    )}
                    {confirmRemove === attKey && (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => {
                          const ts = new Date().toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "");
                          const attName = typeof att === "string" ? att : att.name;
                          const entry = { icon: "x", color: THEME.textDim, time: ts, text: `Ficheiro "${attName}" removido por ${currentUser.name || "—"}` };
                          const nextAtts = p.attachments.map(a =>
                            a === att ? { ...(typeof a === "string" ? { name: a } : a), superseded: true, supersededBy: currentUser.name, supersededAt: ts } : a
                          );
                          const updated = { ...p, attachments: nextAtts, timeline: [...(p.timeline || []), entry] };
                          setP(updated); onUpdate?.(updated); setConfirmRemove(null);
                        }} style={{ background: THEME.danger, color: "white", border: "none", borderRadius: 5, padding: "2px 8px", fontSize: 10, cursor: "pointer" }}>Confirmar</button>
                        <button onClick={() => setConfirmRemove(null)} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 5, padding: "2px 8px", fontSize: 10, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Upload quotation file */}
              {canEdit && (
                <>
                  <button
                    onClick={() => attachRef.current?.click()}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "none", border: `1px dashed ${THEME.border}`, borderRadius: 8, fontSize: 12, color: THEME.textMuted, cursor: "pointer" }}
                  >
                    <Icon name="upload" size={12} color={THEME.textDim} /> Anexar ficheiro
                  </button>
                  <input ref={attachRef} type="file" style={{ display: "none" }} onChange={e => {
                    const f = e.target.files[0];
                    if (!f) return;
                    const ts = new Date().toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "");
                    const newAtt = { name: f.name, uploadedBy: currentUser.name, uploadedAt: ts };
                    const entry = { icon: "paperclip", color: THEME.textMuted, time: ts, text: `Ficheiro "${f.name}" anexado por ${currentUser.name || "—"}` };
                    const updated = { ...p, attachments: [...(p.attachments || []), newAtt], timeline: [...(p.timeline || []), entry] };
                    setP(updated);
                    onUpdate?.(updated);
                    e.target.value = "";
                  }} />
                </>
              )}
            </div>
          </div>

          {/* ── Note ── */}
          {p.note && (
            <div style={{ background: THEME.warningBg, border: `1px solid ${THEME.warning}44`, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, color: THEME.warning, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Nota</div>
              <div style={{ fontSize: 13, color: THEME.text }}>{p.note}</div>
            </div>
          )}

          {/* ── Timeline ── */}
          <div>
            <SectionLabel>Histórico</SectionLabel>
            {p.timeline.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: THEME.sidebar, border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Icon name={t.icon} size={11} color={ICON_MAP[t.icon] ?? t.color ?? THEME.textMuted} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: THEME.textDim }}>{t.time}</div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.4 }}>{t.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: 8, paddingTop: 4, paddingBottom: 12 }}>
            <button onClick={() => setEmailOpen(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Icon name="mail" size={14} color="white" /> Enviar Email ao Cliente
            </button>
            <button onClick={() => setStatusOpen(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Icon name="tag" size={14} color={THEME.textMuted} /> Alterar Estado
            </button>
          </div>

        </div>
      </div>

      {emailOpen       && <EmailModal        p={p} onClose={() => setEmailOpen(false)} onSent={handleEmailSent} />}
      {originEmailOpen && p.originEmail && <OriginEmailModal email={p.originEmail} onClose={() => setOriginEmailOpen(false)} />}
      {statusOpen      && <ChangeStatusModal p={p} onClose={() => setStatusOpen(false)} onSave={handleStatusSave} />}
      {reassignOpen    && <ReassignModal     p={p} users={users} onClose={() => setReassignOpen(false)} onSave={handleReassignSave} />}
    </>
  );
}
