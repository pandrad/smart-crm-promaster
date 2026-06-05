import { useState } from "react";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { useWindowSize } from "../utils.js";
import { StageBadge } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

// ── Client detail panel ───────────────────────────────────────────────────────
function ClienteDrawer({ cliente, responsavel, onClose, onSelectProcesso }) {
  const { isMobile } = useWindowSize();
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      <div style={isMobile
        ? { position: "fixed", bottom: 0, left: 0, right: 0, height: "92dvh", background: THEME.bg, zIndex: 50, overflowY: "auto", boxShadow: "0 -4px 40px rgba(0,0,0,0.5)", borderRadius: "16px 16px 0 0", borderTop: `1px solid ${THEME.border}` }
        : { position: "fixed", top: 0, right: 0, height: "100vh", width: 480, maxWidth: "96vw", background: THEME.bg, zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 40px rgba(0,0,0,0.5)", borderLeft: `1px solid ${THEME.border}` }
      }>

        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: THEME.border }} />
          </div>
        )}

        {/* Header */}
        <div style={{ position: "sticky", top: 0, background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}`, padding: isMobile ? "12px 16px" : "16px 24px", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: THEME.text, lineHeight: 1.2 }}>{cliente.name}</h2>
              {cliente.comprador && (
                <div style={{ fontSize: 12, color: THEME.textDim }}>Contacto: {cliente.comprador}</div>
              )}
              {responsavel && (
                <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
                  Responsável: <strong style={{ color: THEME.text }}>{responsavel}</strong>
                </div>
              )}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4, flexShrink: 0 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: isMobile ? "12px 16px" : "16px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Processos",    value: cliente.processos.length },
              { label: "Em aberto",    value: cliente.processos.filter(p => p.status < 7 && !p.archived).length },
              { label: "Valor total",  value: cliente.totalValue ? "€" + cliente.totalValue.toLocaleString("pt-PT") : "—" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", background: THEME.sidebar, borderRadius: 8, padding: "10px 8px", border: `1px solid ${THEME.border}` }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: THEME.text, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Process list */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Histórico de processos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cliente.processos.map(p => (
                <div
                  key={p.id}
                  onClick={() => { onSelectProcesso(p); onClose(); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 9, cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = THEME.sidebar; }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: THEME.textMuted, flexShrink: 0 }}>{p.id}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {[p.brand, p.model].filter(Boolean).join(" ") || "—"}
                    </div>
                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>{p.created}</div>
                  </div>
                  <StageBadge id={p.status} />
                  <Icon name="chevron" size={13} color={THEME.textDim} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Clientes page ─────────────────────────────────────────────────────────────
export function Clientes({ processos, onSelectProcesso, currentUser }) {
  const { isMobile } = useWindowSize();
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState(null);
  const [assignments, setAssignments] = useState(() => store.getClientAssignments());

  const isAdmin      = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const canAssign    = isAdmin || isSupervisor;

  // Eligible users for client responsibility: users with client-facing roles
  // (Resp. Cotação, Resp. Comercial) — identified by matching role labels
  const allUsers  = store.getUsers().filter(u => u.active !== false);
  const allRoles  = store.getRoles();
  const userRoles = store.getUserRoles();
  const clientFacingRoleIds = allRoles
    .filter(r => /cotação|comercial|abertura|fecho/i.test(r.label))
    .map(r => r.id);
  const eligibleUsers = allUsers.filter(u => {
    const ids = userRoles[u.id] ?? [];
    // include if they hold a client-facing role, or if no roles defined yet (show all active)
    return clientFacingRoleIds.length === 0 || ids.some(id => clientFacingRoleIds.includes(id));
  });
  // Fallback: if no role-filtered users found, show all active users
  const responsavelOptions = eligibleUsers.length > 0 ? eligibleUsers : allUsers;

  function setClientResponsavel(clientName, userName) {
    const updated = { ...assignments, [clientName]: userName || null };
    // Remove null entries to keep store clean
    if (!userName) delete updated[clientName];
    setAssignments(updated);
    store.saveClientAssignments(updated);
  }

  const stages = store.getStages();

  const clientMap = {};
  processos.forEach(p => {
    const key = p.client;
    if (!clientMap[key]) {
      clientMap[key] = { name: p.client, comprador: p.comprador || null, processos: [], totalValue: 0, lastDate: p.created };
    }
    clientMap[key].processos.push(p);
    if (p.price) clientMap[key].totalValue += p.price;
    if (p.created > clientMap[key].lastDate) {
      clientMap[key].lastDate  = p.created;
      clientMap[key].comprador = p.comprador || clientMap[key].comprador;
    }
  });

  let rows = Object.values(clientMap).sort((a, b) => b.processos.length - a.processos.length);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(c => c.name.toLowerCase().includes(q) || (c.comprador || "").toLowerCase().includes(q));
  }

  const total = Object.keys(clientMap).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      <div style={{ padding: isMobile ? "16px 14px 0" : "20px 24px 0" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Clientes</h1>
        <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>{total} clientes · derivado dos processos activos e arquivo</div>
      </div>

      <div style={{ padding: isMobile ? "10px 14px" : "12px 24px" }}>
        <div style={{ position: "relative", width: isMobile ? "100%" : 280 }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: THEME.textDim, pointerEvents: "none" }}><Icon name="search" size={13} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar clientes…"
            style={{ paddingLeft: 28, paddingRight: 10, paddingTop: isMobile ? 10 : 6, paddingBottom: isMobile ? 10 : 6, fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", width: "100%", background: THEME.card, color: THEME.text, boxSizing: "border-box" }}
          />
        </div>
      </div>

      {isMobile ? (
        /* Mobile card list */
        <div style={{ padding: "0 14px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "40px 0", fontSize: 13 }}>{search ? "Nenhum cliente encontrado" : "Sem clientes"}</p>}
          {rows.map(c => {
            const open = c.processos.filter(p => p.status < 7 && !p.archived).length;
            const latest = [...c.processos].sort((a, b) => b.created.localeCompare(a.created))[0];
            const resp = assignments[c.name];
            return (
              <div key={c.name} style={{ background: THEME.card, borderRadius: 10, border: `1px solid ${THEME.border}`, padding: "12px 14px" }}>
                <div onClick={() => setSelected(c)} style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text, marginBottom: 4 }}>{c.name}</div>
                  {c.comprador && <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>{c.comprador}</div>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: resp || canAssign ? 8 : 0 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 12, color: THEME.textDim }}>{c.processos.length} proc.</span>
                      {open > 0 && <span style={{ background: "#1e3a5f", color: "#60a5fa", borderRadius: 9999, fontSize: 11, fontWeight: 700, padding: "1px 8px" }}>{open} abertos</span>}
                    </div>
                    {latest && <StageBadge id={latest.status} />}
                  </div>
                </div>
                {/* Responsável row — shown to all, editable by admin/supervisor */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${THEME.border}`, paddingTop: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>Responsável</span>
                  {canAssign ? (
                    <select
                      value={resp || ""}
                      onChange={e => setClientResponsavel(c.name, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ flex: 1, fontSize: 11, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "3px 7px", background: THEME.sidebar, color: resp ? THEME.text : THEME.textDim, outline: "none", cursor: "pointer" }}
                    >
                      <option value="">— Sem responsável —</option>
                      {responsavelOptions.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  ) : (
                    <span style={{ fontSize: 12, color: resp ? THEME.text : THEME.textDim }}>{resp || "—"}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop table */
        <div style={{ padding: "0 24px 32px" }}>
          <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                  {["Cliente", "Contacto", "Responsável", "Processos", "Em aberto", "Valor total", "Último processo"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(c => {
                  const open   = c.processos.filter(p => p.status < 7 && !p.archived).length;
                  const latest = [...c.processos].sort((a, b) => b.created.localeCompare(a.created))[0];
                  const resp   = assignments[c.name];
                  return (
                    <tr key={c.name} onClick={() => setSelected(c)}
                      style={{ borderBottom: `1px solid ${THEME.borderLight}`, cursor: "pointer", background: THEME.bg }}
                      onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = THEME.bg; }}
                    >
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: THEME.text }}>{c.name}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: THEME.textMuted }}>{c.comprador || "—"}</td>
                      {/* Responsável — dropdown for admin/supervisor, read-only text for others */}
                      <td style={{ padding: "6px 14px" }} onClick={e => canAssign && e.stopPropagation()}>
                        {canAssign ? (
                          <select
                            value={resp || ""}
                            onChange={e => setClientResponsavel(c.name, e.target.value)}
                            style={{ fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "4px 8px", background: THEME.sidebar, color: resp ? THEME.text : THEME.textDim, outline: "none", cursor: "pointer", maxWidth: 160 }}
                          >
                            <option value="">— Sem responsável —</option>
                            {responsavelOptions.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                          </select>
                        ) : (
                          <span style={{ fontSize: 12, color: resp ? THEME.text : THEME.textDim }}>{resp || "—"}</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: THEME.text, textAlign: "center" }}>{c.processos.length}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        {open > 0
                          ? <span style={{ display: "inline-block", background: "#1e3a5f", color: "#60a5fa", borderRadius: 9999, fontSize: 11, fontWeight: 700, padding: "1px 10px" }}>{open}</span>
                          : <span style={{ fontSize: 11, color: THEME.textDim }}>—</span>
                        }
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: c.totalValue ? 600 : 400, color: c.totalValue ? THEME.text : THEME.textDim }}>
                        {c.totalValue ? "€" + c.totalValue.toLocaleString("pt-PT") : "—"}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {latest && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "monospace", fontSize: 11, color: THEME.textDim }}>{latest.id}</span>
                            <StageBadge id={latest.status} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p style={{ textAlign: "center", color: THEME.textDim, padding: "40px 0", fontSize: 13 }}>
                {search ? "Nenhum cliente encontrado" : "Sem clientes"}
              </p>
            )}
          </div>
        </div>
      )}

      {selected && (
        <ClienteDrawer
          cliente={selected}
          responsavel={assignments[selected.name] ?? null}
          onClose={() => setSelected(null)}
          onSelectProcesso={onSelectProcesso}
        />
      )}
    </div>
  );
}
