import { useState } from "react";
import { daysLeft } from "../utils.js";
import { store } from "../store.js";
import { Avatar, StageBadge, FUBadge, Tag } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

const INPUT = { width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", boxSizing: "border-box", background: "white" };
const ICON_MAP = { mail: "#3b82f6", cpu: "#7c3aed", user: "#64748b", check: "#10b981", alert: "#dc2626", x: "#dc2626" };

function InfoCell({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginTop: 2 }}>{value || "—"}</div>
    </div>
  );
}

function TeamCard({ name, role, photo }) {
  return (
    <div style={{ flex: 1, background: "#f8fafc", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 8, alignItems: "center", minWidth: 130 }}>
      <Avatar name={name} photo={photo} />
      <div>
        <div style={{ fontSize: 10, color: "#94a3b8" }}>{role}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{name}</div>
      </div>
    </div>
  );
}

// ── Email modal ───────────────────────────────────────────────────────────────
function EmailModal({ p, onClose }) {
  const [to,      setTo]      = useState(p.req);
  const [subject, setSubject] = useState(`Re: Cotação ${p.brand}${p.model ? " " + p.model : ""} — Proc. #${p.id}`);
  const [body,    setBody]    = useState(`Exmo(a) Sr(a) ${p.req},\n\nEm resposta ao seu pedido de cotação, ...\n\nCom os melhores cumprimentos,`);
  const [sent,    setSent]    = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 14, width: 500, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Enviar Email</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        {sent ? (
          <div style={{ padding: "36px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#15803d" }}>Email enviado</div>
          </div>
        ) : (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Para</label><input style={INPUT} value={to} onChange={e => setTo(e.target.value)} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Assunto</label><input style={INPUT} value={subject} onChange={e => setSubject(e.target.value)} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Mensagem</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} style={{ ...INPUT, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 16px", fontSize: 13, color: "#475569", cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => { setSent(true); setTimeout(onClose, 1400); }} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="mail" size={13} color="white" /> Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Change status modal — reads from store ────────────────────────────────────
function ChangeStatusModal({ p, onClose, onSave }) {
  const stages   = store.getStages();
  const fuList   = store.getFUStatuses();
  const [status, setStatus] = useState(p.status);
  const [fu,     setFu]     = useState(p.fu);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 14, width: 420, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Alterar Estado</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* stage picker */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Estado do processo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {stages.map(s => (
                <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: status === s.id ? s.bg : "transparent", cursor: "pointer", border: status === s.id ? `1px solid ${s.color}44` : "1px solid transparent" }}>
                  <input type="radio" name="stage" checked={status === s.id} onChange={() => setStatus(s.id)} style={{ accentColor: s.color }} />
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: status === s.id ? 600 : 400, color: status === s.id ? s.color : "#475569" }}>{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* FU picker */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Follow-up</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {fuList.map(s => (
                <button key={s.id ?? s.label} onClick={() => setFu(s.label)}
                  style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: fu === s.label ? `2px solid ${s.color}` : "2px solid transparent", background: s.bg, color: s.color }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 16px", fontSize: 13, color: "#475569", cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(status, fu); onClose(); }} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reassign modal (admin only) ───────────────────────────────────────────────
function ReassignModal({ p, users, onClose, onSave }) {
  const active = users.filter(u => u.active !== false);
  const byRole = role => active.filter(u => u.role === role || u.role === "admin");

  const [owner,  setOwner]  = useState(p.owner);
  const [comm,   setComm]   = useState(p.comm);
  const [compra, setCompra] = useState(p.compra);

  const SEL = { ...INPUT, marginTop: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 14, width: 400, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Reatribuir processo</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Resp. Cotação",   val: owner,  set: setOwner,  pool: byRole("cotacao")   },
            { label: "Resp. Comercial", val: comm,   set: setComm,   pool: byRole("comercial") },
            { label: "Resp. Compra",    val: compra, set: setCompra, pool: byRole("compra")    },
          ].map(({ label, val, set, pool }) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
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
            <button onClick={onClose} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 16px", fontSize: 13, color: "#475569", cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave({ owner, comm, compra }); onClose(); }} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export function DetailDrawer({ p: initialP, onClose, onUpdate, users = [], currentUser = {} }) {
  const [p,           setP]           = useState(initialP);
  const [emailOpen,   setEmailOpen]   = useState(false);
  const [statusOpen,  setStatusOpen]  = useState(false);
  const [reassignOpen,setReassignOpen]= useState(false);

  const stages = store.getStages();
  const d = daysLeft(p.deadline);
  const stage = stages.find(s => s.id === p.status);
  const isAdmin = currentUser.role === "admin";

  function photoOf(name) { return users.find(u => u.name === name)?.photo; }

  function handleStatusSave(newStatus, newFu) {
    const updated = { ...p, status: newStatus, fu: newFu };
    setP(updated); onUpdate?.(updated);
  }

  function handleReassignSave({ owner, comm, compra }) {
    const updated = { ...p, owner, comm, compra };
    setP(updated); onUpdate?.(updated);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 40 }} />

      <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 480, maxWidth: "95vw", background: "white", zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 30px rgba(0,0,0,0.12)" }}>

        {/* sticky header */}
        <div style={{ position: "sticky", top: 0, background: "white", borderBottom: "1px solid #f1f5f9", padding: "16px 24px", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>#{p.id}</span>
              <h2 style={{ margin: "2px 0 6px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{p.client}</h2>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <StageBadge id={p.status} />
                <FUBadge label={p.fu} />
                {p.priority === "Alta" && <Tag bg="#fee2e2" color="#dc2626">🔴 Alta Prioridade</Tag>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* overdue alert */}
          {d < 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="alert" size={15} color="#dc2626" />
              <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 500 }}>Processo com {Math.abs(d)} dia(s) de atraso</span>
            </div>
          )}

          {/* info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
            <InfoCell label="Cliente"        value={p.client} />
            <InfoCell label="Ref. Cliente"   value={p.ref} />
            <InfoCell label="Marca / Tipo"   value={p.brand} />
            <InfoCell label="Modelo"         value={p.model} />
            <InfoCell label="Nº Série / VIN" value={p.vin} />
            <InfoCell label="Data Limite"    value={p.deadline} />
            <InfoCell label="Prioridade"     value={p.priority} />
            <InfoCell label="Requerente"     value={p.req} />
            <InfoCell label="Sell Price"     value={p.price ? "€" + p.price.toLocaleString("pt-PT") : null} />
          </div>

          {/* team */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Equipa</div>
              {isAdmin && (
                <button onClick={() => setReassignOpen(true)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#475569", cursor: "pointer" }}>
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

          {/* pipeline bar */}
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>Pipeline</div>
            <div style={{ display: "flex", gap: 3 }}>
              {stages.filter(s => s.id <= 6).map(s => (
                <div key={s.id} style={{ flex: 1, height: 6, borderRadius: 9999, background: p.status >= s.id ? s.color : "#e2e8f0" }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{stage?.label}</div>
          </div>

          {/* attachments */}
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>Anexos</div>
            <div style={{ background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: 8, padding: "14px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>Sem anexos</div>
          </div>

          {/* note */}
          {p.note && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, color: "#92400e", fontWeight: 600, textTransform: "uppercase" }}>Nota</div>
              <div style={{ fontSize: 13, color: "#78350f", marginTop: 2 }}>{p.note}</div>
            </div>
          )}

          {/* timeline */}
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>Histórico</div>
            {p.timeline.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Icon name={t.icon} size={11} color={ICON_MAP[t.icon] ?? t.color ?? "#64748b"} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{t.time}</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.4 }}>{t.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* actions */}
          <div style={{ display: "flex", gap: 8, paddingTop: 4, paddingBottom: 8 }}>
            <button onClick={() => setEmailOpen(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Icon name="mail" size={14} color="white" /> Enviar Email
            </button>
            <button onClick={() => setStatusOpen(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8, padding: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Icon name="tag" size={14} color="#475569" /> Alterar Estado
            </button>
          </div>
        </div>
      </div>

      {emailOpen    && <EmailModal        p={p} onClose={() => setEmailOpen(false)} />}
      {statusOpen   && <ChangeStatusModal p={p} onClose={() => setStatusOpen(false)}   onSave={handleStatusSave} />}
      {reassignOpen && <ReassignModal     p={p} users={users} onClose={() => setReassignOpen(false)} onSave={handleReassignSave} />}
    </>
  );
}
