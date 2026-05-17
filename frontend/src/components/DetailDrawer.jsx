import { useState } from "react";
import { daysLeft } from "../utils.js";
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

// ── Email modal (all logic preserved, dark theme) ─────────────────────────────
function EmailModal({ p, onClose }) {
  const [to,      setTo]      = useState(p.comprador || p.req || "");
  const [subject, setSubject] = useState(`Re: Cotação ${p.brand}${p.model ? " " + p.model : ""} — Proc. ${p.id}`);
  const [body,    setBody]    = useState(`Exmo(a) Sr(a) ${p.comprador || p.req || ""},\n\nEm resposta ao seu pedido de cotação, ...\n\nCom os melhores cumprimentos,`);
  const [sent,    setSent]    = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 500, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Enviar Email</span>
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
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => { setSent(true); setTimeout(onClose, 1400); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="mail" size={13} color="white" /> Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Change status modal — reads from store, FU only when target status >= 9 ──
function ChangeStatusModal({ p, onClose, onSave }) {
  const stages  = store.getStages();
  const fuList  = store.getFUStatuses();
  const [status, setStatus] = useState(p.status);
  const [fu,     setFu]     = useState(p.fu ?? "");

  const showFU = status >= 9;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 420, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
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
          {/* FU picker — only shown when target status >= 9 */}
          {showFU && (
            <div>
              <div style={{ ...LABEL, marginBottom: 8 }}>Follow-up</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
            <button onClick={() => { onSave(status, showFU ? fu : undefined); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reassign modal — admin, supervisor, or own-process owner ─────────────────
function ReassignModal({ p, users, onClose, onSave }) {
  const active = users.filter(u => u.active !== false);
  // Supervisor can also reassign — include supervisor role in eligible pools
  const byRole = role => active.filter(u => u.role === role || u.role === "admin" || u.role === "supervisor");

  const [owner,  setOwner]  = useState(p.owner);
  const [comm,   setComm]   = useState(p.comm);
  const [compra, setCompra] = useState(p.compra);

  const SEL = { ...INPUT, marginTop: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 400, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
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
  // SLA: 48h for pedido, 72h for resposta (mock)
  const SLA_PEDIDO   = 48;
  const SLA_RESPOSTA = 72;

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
  const [p,            setP]            = useState(initialP);
  const [emailOpen,    setEmailOpen]    = useState(false);
  const [statusOpen,   setStatusOpen]   = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);

  const stages = store.getStages();
  const d      = daysLeft(p.deadline);
  const stage  = stages.find(s => s.id === p.status);

  const isAdmin      = currentUser.role === "admin";
  const isSupervisor = currentUser.role === "supervisor";
  const isOwned      = p.owner === currentUser.name || p.comm === currentUser.name || p.compra === currentUser.name;
  const canReassign  = isAdmin || isSupervisor || isOwned;

  function photoOf(name) { return users.find(u => u.name === name)?.photo; }

  function handleStatusSave(newStatus, newFu) {
    const updated = { ...p, status: newStatus, ...(newFu !== undefined ? { fu: newFu } : {}) };
    setP(updated); onUpdate?.(updated);
  }

  function handleReassignSave({ owner, comm, compra }) {
    const updated = { ...p, owner, comm, compra };
    setP(updated); onUpdate?.(updated);
  }

  function handleConsultaChange(newConsulta) {
    const updated = { ...p, consulta: newConsulta };
    setP(updated); onUpdate?.(updated);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />

      <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 500, maxWidth: "96vw", background: THEME.bg, zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 40px rgba(0,0,0,0.5)", borderLeft: `1px solid ${THEME.border}` }}>

        {/* ── Sticky header ── */}
        <div style={{ position: "sticky", top: 0, background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}`, padding: "16px 24px", zIndex: 1 }}>
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

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

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
            <InfoCell label="Marca / Tipo"   value={p.brand} />
            <InfoCell label="Modelo"         value={p.model} />
            <InfoCell label="Nº Série / VIN" value={p.vin} />
            <InfoCell label="Data Limite"    value={p.deadline} />
            <InfoCell label="Prioridade"     value={p.priority} />
            <InfoCell label="Sell Price"     value={p.price ? "€" + p.price.toLocaleString("pt-PT") : null} />
            {/* FU field only when status >= 9 */}
            {p.status >= 9 && p.fu && <InfoCell label="Follow-up" value={p.fu} />}
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

          {/* ── Attachments — Excel link always present first ── */}
          <div>
            <SectionLabel>Anexos</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Excel template link — always present */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, textDecoration: "none", color: THEME.accent, fontSize: 12, fontWeight: 500 }}
              >
                <Icon name="paperclip" size={13} color={THEME.accent} />
                {p.client.replace(/[^a-zA-Z0-9]/g, "_")}_{p.id}.xlsx
              </a>
              {/* Placeholder when no other attachments */}
              <div style={{ fontSize: 11, color: THEME.textDim, paddingLeft: 2 }}>Sem outros anexos</div>
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
              <Icon name="mail" size={14} color="white" /> Enviar Email
            </button>
            <button onClick={() => setStatusOpen(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Icon name="tag" size={14} color={THEME.textMuted} /> Alterar Estado
            </button>
          </div>

        </div>
      </div>

      {emailOpen    && <EmailModal        p={p} onClose={() => setEmailOpen(false)} />}
      {statusOpen   && <ChangeStatusModal p={p} onClose={() => setStatusOpen(false)} onSave={handleStatusSave} />}
      {reassignOpen && <ReassignModal     p={p} users={users} onClose={() => setReassignOpen(false)} onSave={handleReassignSave} />}
    </>
  );
}
