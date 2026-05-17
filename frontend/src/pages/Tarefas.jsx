import { useState } from "react";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { Avatar, Tag } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

const TASK_TYPES    = ["Contas Correntes", "Status de Encomenda", "Desconto", "Cliente Novo", "Diversos"];
const TASK_STATUSES = ["Pendente", "Em Curso", "Concluido"];

const TYPE_COLORS = {
  "Contas Correntes":   { bg: "#1e3a5f", color: "#60a5fa" },
  "Status de Encomenda":{ bg: THEME.successBg, color: THEME.success },
  "Desconto":           { bg: THEME.warningBg, color: THEME.warning },
  "Cliente Novo":       { bg: "#2e1065", color: "#c084fc" },
  "Diversos":           { bg: THEME.sidebar, color: THEME.textMuted },
};

const STATUS_COLORS = {
  "Pendente":  { bg: THEME.warningBg, color: THEME.warning },
  "Em Curso":  { bg: "#1e3a5f",        color: "#60a5fa"     },
  "Concluido": { bg: THEME.successBg,  color: THEME.success },
};

const LABEL = { fontSize: 10, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 };
const INPUT = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.sidebar, color: THEME.text };

// ── Task status change modal ───────────────────────────────────────────────────
function TaskStatusModal({ task, onClose, onSave }) {
  const [status, setStatus] = useState(task.status);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 340, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Alterar Estado</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          {TASK_STATUSES.map(s => {
            const c = STATUS_COLORS[s];
            return (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: status === s ? `${c.color}22` : "transparent", cursor: "pointer", border: status === s ? `1px solid ${c.color}55` : "1px solid transparent" }}>
                <input type="radio" name="task-status" checked={status === s} onChange={() => setStatus(s)} style={{ accentColor: c.color }} />
                <Tag bg={c.bg} color={c.color}>{s}</Tag>
              </label>
            );
          })}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(status); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Task reassign modal ────────────────────────────────────────────────────────
function TaskReassignModal({ task, users, onClose, onSave }) {
  const active = users.filter(u => u.active !== false);
  const [assigned, setAssigned] = useState(task.assigned);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 360, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Reatribuir tarefa</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={LABEL}>Atribuído a</div>
          <select value={assigned} onChange={e => setAssigned(e.target.value)} style={INPUT}>
            {active.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            {!active.find(u => u.name === assigned) && <option value={assigned}>{assigned}</option>}
          </select>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { onSave(assigned); onClose(); }} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Task drawer ────────────────────────────────────────────────────────────────
function TaskDrawer({ task, users, currentUser, onClose, onUpdate }) {
  const [t,            setT]            = useState(task);
  const [emailExpanded,setEmailExpanded]= useState(false);
  const [statusOpen,   setStatusOpen]   = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);

  const isAdmin      = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const isOwner      = t.assigned === currentUser?.name;
  const canReassign  = isAdmin || isSupervisor || isOwner;
  const isDone       = t.status === "Concluido";

  const tc = TYPE_COLORS[t.type]   || TYPE_COLORS["Diversos"];
  const sc = STATUS_COLORS[t.status] || STATUS_COLORS["Pendente"];

  function handleStatusSave(newStatus) {
    const updated = { ...t, status: newStatus };
    setT(updated); onUpdate(updated);
  }

  function handleReassignSave(newAssigned) {
    const updated = { ...t, assigned: newAssigned };
    setT(updated); onUpdate(updated);
  }

  function handleConcluir() {
    const updated = { ...t, status: "Concluido" };
    setT(updated); onUpdate(updated);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 460, maxWidth: "96vw", background: THEME.bg, zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 40px rgba(0,0,0,0.5)", borderLeft: `1px solid ${THEME.border}` }}>

        {/* Header */}
        <div style={{ position: "sticky", top: 0, background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}`, padding: "16px 20px", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: THEME.textDim, marginBottom: 4 }}>{t.id}</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: THEME.text }}>{t.client}</h2>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Tag bg={tc.bg} color={tc.color}>{t.type}</Tag>
                <Tag bg={sc.bg} color={sc.color}>{t.status}</Tag>
                {t.priority === "Alta" && <Tag bg={THEME.dangerBg} color={THEME.danger}>🔴 Alta</Tag>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={18} /></button>
          </div>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Comprador */}
          <div style={{ background: THEME.sidebar, borderRadius: 10, padding: "10px 14px", border: `1px solid ${THEME.border}` }}>
            <div style={LABEL}>Comprador</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text, marginTop: 3 }}>{t.comprador}</div>
          </div>

          {/* Fields grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
            {[
              ["Tipo",         t.type],
              ["Atribuído a",  t.assigned],
              ["Criado",       t.created],
              ["Prazo",        t.due],
              ["Prioridade",   t.priority],
              ["Estado",       t.status],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={LABEL}>{lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginTop: 2 }}>{val || "—"}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <div style={{ ...LABEL, marginBottom: 6 }}>Descrição</div>
            <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6, background: THEME.sidebar, borderRadius: 8, padding: "10px 12px", border: `1px solid ${THEME.border}` }}>
              {t.description}
            </div>
          </div>

          {/* Origin email — collapsible */}
          {t.originEmail && (
            <div>
              <button
                onClick={() => setEmailExpanded(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", color: THEME.textMuted, fontSize: 12, fontWeight: 500 }}
              >
                <Icon name="mail" size={13} color={THEME.textMuted} />
                <span style={{ flex: 1, textAlign: "left" }}>Email de origem — {t.originEmail.sender}</span>
                <Icon name={emailExpanded ? "chevron-up" : "chevron-down"} size={13} color={THEME.textDim} />
              </button>
              {emailExpanded && (
                <div style={{ background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "12px" }}>
                  <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 4 }}>
                    De: <strong style={{ color: THEME.textMuted }}>{t.originEmail.sender}</strong>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, marginBottom: 6 }}>{t.originEmail.subject}</div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.5 }}>{t.originEmail.preview}</div>
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          <div>
            <div style={{ ...LABEL, marginBottom: 6 }}>Anexos</div>
            <div style={{ fontSize: 11, color: THEME.textDim, background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "10px 12px" }}>
              Sem anexos
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 12 }}>
            <button
              onClick={handleConcluir}
              disabled={isDone}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: isDone ? THEME.sidebar : THEME.success, color: isDone ? THEME.textDim : "white", border: isDone ? `1px solid ${THEME.border}` : "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: isDone ? "default" : "pointer" }}
            >
              <Icon name="check" size={14} color={isDone ? THEME.textDim : "white"} />
              {isDone ? "Concluído" : "Marcar como Concluído"}
            </button>
            <button
              onClick={() => setStatusOpen(true)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: THEME.sidebar, color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <Icon name="tag" size={14} color={THEME.textMuted} /> Alterar Estado
            </button>
          </div>

          {canReassign && (
            <button
              onClick={() => setReassignOpen(true)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px", fontSize: 12, color: THEME.textMuted, cursor: "pointer", marginBottom: 8 }}
            >
              <Icon name="edit" size={12} /> Reatribuir tarefa
            </button>
          )}
        </div>
      </div>

      {statusOpen   && <TaskStatusModal   task={t} onClose={() => setStatusOpen(false)}   onSave={handleStatusSave}   />}
      {reassignOpen && <TaskReassignModal task={t} users={users} onClose={() => setReassignOpen(false)} onSave={handleReassignSave} />}
    </>
  );
}

// ── Tarefas page ───────────────────────────────────────────────────────────────
export function Tarefas({ tarefas, setTarefas, users, currentUser, accent }) {
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState("Todos");
  const [statusFilter,  setStatusFilter]  = useState("Todos");
  const [assignedFilter,setAssignedFilter]= useState("Todos");
  const [selected,      setSelected]      = useState(null);

  const accentColor = accent || THEME.accent;

  const assignedUsers = [...new Set(tarefas.map(t => t.assigned))].sort();

  const rows = tarefas.filter(t => {
    if (typeFilter    !== "Todos" && t.type    !== typeFilter)    return false;
    if (statusFilter  !== "Todos" && t.status  !== statusFilter)  return false;
    if (assignedFilter!== "Todos" && t.assigned!== assignedFilter)return false;
    if (search) {
      const q = search.toLowerCase();
      if (![t.client, t.type, t.assigned, t.comprador, t.description].some(v => v?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

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
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Tarefas</h1>
          <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
            {tarefas.filter(t => t.status === "Pendente").length} pendentes · {tarefas.filter(t => t.status === "Em Curso").length} em curso
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "12px 24px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: THEME.textDim, pointerEvents: "none" }}>
            <Icon name="search" size={13} />
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar…"
            style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", width: 190, background: THEME.card, color: THEME.text }} />
        </div>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={SEL}>
          <option value="Todos">Todos os tipos</option>
          {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SEL}>
          <option value="Todos">Todos os estados</option>
          {TASK_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)} style={SEL}>
          <option value="Todos">Todos os responsáveis</option>
          {assignedUsers.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                {["Nº", "Tipo", "Cliente", "Comprador", "Atribuído a", "Estado", "Prazo", "Prio"].map(h => (
                  <th key={h} style={{ padding: "9px 12px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(t => {
                const tc = TYPE_COLORS[t.type]    || TYPE_COLORS["Diversos"];
                const sc = STATUS_COLORS[t.status] || STATUS_COLORS["Pendente"];
                const user = users.find(u => u.name === t.assigned);
                return (
                  <tr key={t.id}
                    onClick={() => setSelected(t)}
                    style={{ borderBottom: `1px solid ${THEME.borderLight}`, cursor: "pointer", background: THEME.bg }}
                    onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = THEME.bg; }}
                  >
                    <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 11, color: THEME.textDim }}>{t.id}</td>
                    <td style={{ padding: "9px 12px" }}><Tag bg={tc.bg} color={tc.color}>{t.type}</Tag></td>
                    <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, color: THEME.text }}>{t.client}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: THEME.textMuted }}>{t.comprador}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Avatar name={t.assigned} size={22} photo={user?.photo} />
                        <span style={{ fontSize: 11, color: THEME.textMuted }}>{t.assigned.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 12px" }}><Tag bg={sc.bg} color={sc.color}>{t.status}</Tag></td>
                    <td style={{ padding: "9px 12px", fontSize: 11, color: THEME.textMuted }}>{t.due}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: t.priority === "Alta" ? THEME.danger : THEME.border }} />
                    </td>
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

      {selected && (
        <TaskDrawer
          task={selected}
          users={users}
          currentUser={currentUser}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
