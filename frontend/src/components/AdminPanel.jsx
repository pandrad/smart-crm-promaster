import { useState, useRef, useCallback } from "react";
import { store } from "../store.js";
import { Avatar, Tag } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
      {action && (
        <button onClick={onAction} style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Icon name="plus" size={13} color="white" /> {action}
        </button>
      )}
    </div>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{hint}</p>}
    </div>
  );
}

const INPUT  = { width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", boxSizing: "border-box", background: "white" };
const SELECT = { ...INPUT };

function Modal({ title, onClose, children, width = 460 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 14, width, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "white", zIndex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

function SaveRow({ onCancel, onSave, saveLabel = "Guardar" }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
      <button onClick={onCancel} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 16px", fontSize: 13, color: "#475569", cursor: "pointer" }}>Cancelar</button>
      <button onClick={onSave}   style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{saveLabel}</button>
    </div>
  );
}

// ── Colour swatch picker ──────────────────────────────────────────────────────

const PRESET_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#10b981",
  "#0ea5e9","#2563eb","#7c3aed","#ec4899","#64748b",
  "#1e293b","#dc2626","#b45309","#0369a1","#15803d",
];
const BG_PRESETS = {
  "#ef4444":"#fee2e2","#f97316":"#ffedd5","#eab308":"#fef9c3","#22c55e":"#dcfce7",
  "#10b981":"#d1fae5","#0ea5e9":"#e0f2fe","#2563eb":"#dbeafe","#7c3aed":"#f5f3ff",
  "#ec4899":"#fdf2f8","#64748b":"#f1f5f9","#1e293b":"#f1f5f9","#dc2626":"#fee2e2",
  "#b45309":"#fef3c7","#0369a1":"#e0f2fe","#15803d":"#f0fdf4",
};

function ColorSwatch({ label, value, onChange }) {
  const [showCustom, setShowCustom] = useState(false);
  return (
    <FieldRow label={label}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
        {PRESET_COLORS.map(c => (
          <button key={c} onClick={() => onChange(c)} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: value === c ? "3px solid #0f172a" : "2px solid transparent", cursor: "pointer", padding: 0 }} />
        ))}
        <button onClick={() => setShowCustom(s => !s)} title="Cor personalizada"
          style={{ width: 24, height: 24, borderRadius: 6, border: "1px dashed #cbd5e1", background: "white", cursor: "pointer", fontSize: 14, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
      {showCustom && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 32, height: 32, border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", padding: 2 }} />
          <input style={{ ...INPUT, flex: 1 }} value={value} onChange={e => onChange(e.target.value)} placeholder="#rrggbb" />
        </div>
      )}
      <div style={{ width: 48, height: 8, borderRadius: 4, background: value, marginTop: 2 }} />
    </FieldRow>
  );
}

// ── Users tab ─────────────────────────────────────────────────────────────────

function UserModal({ user, roles, onClose, onSave }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState(user
    ? { name: user.name, email: user.email, role: user.role, active: user.active, photo: user.photo ?? "", password: "" }
    : { name: "", email: "", role: roles[0]?.id ?? "cotacao", active: true, photo: "", password: "" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={user ? "Editar utilizador" : "Novo utilizador"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* photo */}
        <FieldRow label="Foto">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 60, height: 60, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0, border: "2px dashed #cbd5e1" }}>
              {form.photo ? <img src={form.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="user" size={22} color="#94a3b8" />}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: "5px 12px", fontSize: 12, color: "#475569", cursor: "pointer", marginBottom: 4 }}>
                <Icon name="upload" size={12} /> {form.photo ? "Alterar foto" : "Carregar foto"}
              </button>
              {form.photo && (
                <button onClick={() => set("photo", "")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", padding: 0 }}>Remover</button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const f = e.target.files[0]; if (f) { const url = URL.createObjectURL(f); set("photo", url); }}} />
          </div>
        </FieldRow>

        <FieldRow label="Nome completo">
          <input style={INPUT} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nome Apelido" />
        </FieldRow>
        <FieldRow label="Email">
          <input style={INPUT} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="utilizador@promaster.co" />
        </FieldRow>
        <FieldRow label="Função">
          <select style={SELECT} value={form.role} onChange={e => set("role", e.target.value)}>
            {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Estado">
          <select style={SELECT} value={form.active ? "1" : "0"} onChange={e => set("active", e.target.value === "1")}>
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </FieldRow>
        <FieldRow label={user ? "Nova palavra-passe (opcional)" : "Palavra-passe inicial"} hint="O utilizador pode alterar a palavra-passe no próximo acesso.">
          <input style={INPUT} type="password" value={form.password} onChange={e => set("password", e.target.value)}
            placeholder={user ? "Deixar em branco para não alterar" : "Palavra-passe de primeiro acesso"} />
        </FieldRow>
      </div>
      <SaveRow onCancel={onClose} onSave={() => { onSave(form); onClose(); }} />
    </Modal>
  );
}

function UsersTab({ onUsersChange }) {
  const roles = store.getRoles();
  const roleLabel = id => roles.find(r => r.id === id)?.label ?? id;

  const [users,   setUsers]   = useState(() => store.getUsers());
  const [editing, setEditing] = useState(null);

  function commit(next) { setUsers(next); store.saveUsers(next); onUsersChange?.(next); }

  function toggleActive(id) { commit(users.map(u => u.id === id ? { ...u, active: !u.active } : u)); }

  function saveUser(form) {
    const next = editing === "new"
      ? [...users, { ...form, id: Date.now() }]
      : users.map(u => u.id === editing.id ? { ...u, ...form } : u);
    commit(next);
  }

  return (
    <div>
      <SectionHeader title="Utilizadores" action="Novo utilizador" onAction={() => setEditing("new")} />
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
              {["Utilizador","Email","Função","Estado",""].map((h, i) => (
                <th key={i} style={{ padding: "9px 14px", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Avatar name={u.name} photo={u.photo} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{u.email}</td>
                <td style={{ padding: "11px 14px" }}><Tag bg="#f1f5f9" color="#475569">{roleLabel(u.role)}</Tag></td>
                <td style={{ padding: "11px 14px" }}>
                  <Tag bg={u.active ? "#dcfce7" : "#f1f5f9"} color={u.active ? "#15803d" : "#94a3b8"}>
                    {u.active ? "Ativo" : "Inativo"}
                  </Tag>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setEditing(u)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#475569", cursor: "pointer" }}>
                      <Icon name="edit" size={12} /> Editar
                    </button>
                    <button onClick={() => toggleActive(u.id)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: u.active ? "#dc2626" : "#15803d", cursor: "pointer" }}>
                      {u.active ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing !== null && <UserModal user={editing === "new" ? null : editing} roles={roles} onClose={() => setEditing(null)} onSave={saveUser} />}
    </div>
  );
}

// ── Status list ───────────────────────────────────────────────────────────────

function StatusModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item ? { label: item.label, color: item.color, bg: item.bg ?? "#f1f5f9" }
         : { label: "", color: "#2563eb", bg: "#dbeafe" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  function pickColor(c) { set("color", c); if (BG_PRESETS[c]) set("bg", BG_PRESETS[c]); }

  return (
    <Modal title={item ? "Editar estado" : "Novo estado"} onClose={onClose} width={400}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FieldRow label="Etiqueta">
          <input style={INPUT} value={form.label} onChange={e => set("label", e.target.value)} placeholder="Nome do estado" />
        </FieldRow>
        <ColorSwatch label="Cor" value={form.color} onChange={pickColor} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Pré-visualização</div>
          <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: form.bg, color: form.color }}>
            {form.label || "Amostra"}
          </span>
        </div>
      </div>
      <SaveRow onCancel={onClose} onSave={() => { onSave(form); onClose(); }} />
    </Modal>
  );
}

function StatusList({ title, items, getItems, saveItems, dotShape }) {
  const [list,    setList]    = useState(() => getItems());
  const [editing, setEditing] = useState(null);
  const dragIdx = useRef(null);

  function commit(next) { setList(next); saveItems(next); }

  function save(form) {
    commit(editing === "new"
      ? [...list, { ...form, id: Date.now() }]
      : list.map(s => s.id === editing.id ? { ...s, ...form } : s)
    );
  }

  function onDragStart(i) { dragIdx.current = i; }
  function onDragOver(e, i) {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...list];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    commit(next);
  }

  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <SectionHeader title={title} action="Novo estado" onAction={() => setEditing("new")} />
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        {list.map((s, i) => (
          <div key={s.id} draggable onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e, i)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < list.length - 1 ? "1px solid #f8fafc" : "none", cursor: "grab" }}>
            <Icon name="chevron" size={12} color="#cbd5e1" style={{ transform: "rotate(90deg)", flexShrink: 0 }} />
            <div style={{ width: 11, height: 11, borderRadius: dotShape === "circle" ? "50%" : 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1 }}>{s.label}</span>
            <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>Amostra</span>
            <button onClick={() => setEditing(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
              <Icon name="edit" size={13} />
            </button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, marginBottom: 0 }}>Arraste para reordenar</p>
      {editing !== null && <StatusModal item={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function StatusesTab() {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
      <StatusList title="Estados do Processo"  getItems={store.getStages}      saveItems={store.saveStages}      dotShape="square" />
      <StatusList title="Estados de Follow-Up" getItems={store.getFUStatuses}   saveItems={store.saveFUStatuses}  dotShape="circle" />
    </div>
  );
}

// ── Priorities tab ────────────────────────────────────────────────────────────

function PriorityModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item ? { label: item.label, color: item.color, bg: item.bg } : { label: "", color: "#dc2626", bg: "#fee2e2" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  function pickColor(c) { set("color", c); if (BG_PRESETS[c]) set("bg", BG_PRESETS[c]); }

  return (
    <Modal title={item ? "Editar prioridade" : "Nova prioridade"} onClose={onClose} width={380}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FieldRow label="Etiqueta">
          <input style={INPUT} value={form.label} onChange={e => set("label", e.target.value)} placeholder="Ex: Urgente" />
        </FieldRow>
        <ColorSwatch label="Cor" value={form.color} onChange={pickColor} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Pré-visualização</div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: form.bg, color: form.color }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: form.color, display: "inline-block" }} />
            {form.label || "Amostra"}
          </span>
        </div>
      </div>
      <SaveRow onCancel={onClose} onSave={() => { onSave(form); onClose(); }} />
    </Modal>
  );
}

function PrioritiesTab() {
  const [list,    setList]    = useState(() => store.getPriorities());
  const [editing, setEditing] = useState(null);

  function commit(next) { setList(next); store.savePriorities(next); }
  function save(form) {
    commit(editing === "new"
      ? [...list, { ...form, id: Date.now() }]
      : list.map(p => p.id === editing.id ? { ...p, ...form } : p)
    );
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <SectionHeader title="Prioridades" action="Nova prioridade" onAction={() => setEditing("new")} />
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        {list.map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < list.length - 1 ? "1px solid #f8fafc" : "none" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1 }}>{p.label}</span>
            <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: p.bg, color: p.color }}>Amostra</span>
            <button onClick={() => setEditing(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
              <Icon name="edit" size={13} />
            </button>
          </div>
        ))}
      </div>
      {editing !== null && <PriorityModal item={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

// ── Roles tab ─────────────────────────────────────────────────────────────────

function RoleModal({ role, onClose, onSave }) {
  const [form, setForm] = useState(role ? { id: role.id, label: role.label } : { id: "", label: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal title={role ? "Editar função" : "Nova função"} onClose={onClose} width={360}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FieldRow label="Identificador (interno)" hint="Letras minúsculas sem espaços. Ex: supervisor">
          <input style={INPUT} value={form.id} onChange={e => set("id", e.target.value.toLowerCase().replace(/\s+/g,""))} placeholder="cotacao" disabled={!!role} />
        </FieldRow>
        <FieldRow label="Etiqueta visível">
          <input style={INPUT} value={form.label} onChange={e => set("label", e.target.value)} placeholder="Resp. Cotação" />
        </FieldRow>
      </div>
      <SaveRow onCancel={onClose} onSave={() => { if (form.id && form.label) { onSave(form); onClose(); } }} />
    </Modal>
  );
}

function RolesTab() {
  const [roles,   setRoles]   = useState(() => store.getRoles());
  const [editing, setEditing] = useState(null);

  function commit(next) { setRoles(next); store.saveRoles(next); }
  function save(form) {
    commit(editing === "new"
      ? [...roles, form]
      : roles.map(r => r.id === editing.id ? { ...r, ...form } : r)
    );
  }
  function remove(id) { commit(roles.filter(r => r.id !== id)); }

  return (
    <div style={{ maxWidth: 480 }}>
      <SectionHeader title="Funções" action="Nova função" onAction={() => setEditing("new")} />
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 0, marginBottom: 16 }}>
        As funções definidas aqui ficam disponíveis para atribuição aos utilizadores.
      </p>
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        {roles.map((r, i) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: i < roles.length - 1 ? "1px solid #f8fafc" : "none" }}>
            <Tag bg="#f1f5f9" color="#475569" style={{ fontFamily: "monospace", fontSize: 11 }}>{r.id}</Tag>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1 }}>{r.label}</span>
            <button onClick={() => setEditing(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><Icon name="edit" size={13} /></button>
            <button onClick={() => remove(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}><Icon name="x" size={13} /></button>
          </div>
        ))}
      </div>
      {editing !== null && <RoleModal role={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

// ── Task Assignment tab ───────────────────────────────────────────────────────

function AssignmentTab() {
  const allUsers = store.getUsers().filter(u => u.active !== false);
  // rules: { cotacao: userId|""|"rr", comercial: ..., compra: ... }
  const [rules, setRules] = useState(() => store.getAssignment());
  const [saved, setSaved] = useState(false);

  function set(k, v) { setRules(r => ({ ...r, [k]: v })); }

  function handleSave() {
    store.saveAssignment(rules);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const SLOTS = [
    { key: "cotacao",   label: "Resp. Cotação",   roleFilter: "cotacao",   hint: "Responsável pela cotação dos processos recebidos" },
    { key: "comercial", label: "Resp. Comercial",  roleFilter: "comercial", hint: "Responsável comercial dos processos recebidos"    },
    { key: "compra",    label: "Resp. Compra",     roleFilter: "compra",    hint: "Responsável de compras dos processos recebidos"   },
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionHeader title="Atribuição de Tarefas" />
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 0, marginBottom: 20 }}>
        Defina quem a IA deve atribuir para cada função quando chega um novo email/processo.
        Se atribuir mais do que uma pessoa à mesma função, a IA faz rotação (round-robin) entre elas.
        Se só houver uma pessoa, é sempre essa.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SLOTS.map(slot => {
          const eligible = allUsers.filter(u => u.role === slot.roleFilter || u.role === "admin");
          const assigned = Array.isArray(rules[slot.key]) ? rules[slot.key] : (rules[slot.key] ? [rules[slot.key]] : []);

          function toggleUser(uid) {
            const next = assigned.includes(uid) ? assigned.filter(x => x !== uid) : [...assigned, uid];
            set(slot.key, next);
          }

          return (
            <div key={slot.key} style={{ background: "white", borderRadius: 10, border: "1px solid #f1f5f9", padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{slot.label}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>{slot.hint}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {eligible.length === 0 && <span style={{ fontSize: 12, color: "#94a3b8" }}>Nenhum utilizador com esta função.</span>}
                {eligible.map(u => {
                  const checked = assigned.includes(String(u.id)) || assigned.includes(u.id);
                  return (
                    <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 8, background: checked ? "#eff6ff" : "#f8fafc", cursor: "pointer", border: checked ? "1px solid #bfdbfe" : "1px solid transparent" }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleUser(u.id)} style={{ accentColor: "#2563eb" }} />
                      <Avatar name={u.name} size={24} photo={u.photo} />
                      <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? "#1d4ed8" : "#475569" }}>{u.name}</span>
                      {assigned.length > 1 && checked && <span style={{ marginLeft: "auto", fontSize: 10, color: "#64748b", background: "#e0f2fe", borderRadius: 9999, padding: "1px 7px" }}>round-robin</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 20 }}>
        <button onClick={handleSave} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Guardar regras
        </button>
        {saved && <span style={{ fontSize: 12, color: "#15803d", fontWeight: 500 }}>✓ Guardado</span>}
      </div>
    </div>
  );
}

// ── Branding tab ──────────────────────────────────────────────────────────────

function LogoUploader({ logoUrl, accent, onLogoChange }) {
  const fileRef   = useRef(null);
  const canvasRef = useRef(null);
  // imgSrc is the raw base64 loaded via FileReader — always base64, never a blob URL
  const [imgSrc,    setImgSrc]    = useState(null);
  const [zoom,      setZoom]      = useState(1);
  const [offsetX,   setOffsetX]   = useState(0);
  const [offsetY,   setOffsetY]   = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastPos     = useRef(null);
  const [prevSize,  setPrevSize]  = useState(64);
  // natural image dimensions, needed for correct canvas rendering
  const imgNatural  = useRef({ w: 1, h: 1 });

  function loadFile(f) {
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target.result;
      // Read natural dimensions before showing editor
      const tmp = new Image();
      tmp.onload = () => {
        imgNatural.current = { w: tmp.naturalWidth, h: tmp.naturalHeight };
        setImgSrc(src);
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
      };
      tmp.src = src;
    };
    reader.readAsDataURL(f);
  }

  const CROP = 160; // px of the visible crop window

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;
    const ctx = canvas.getContext("2d");
    const size = 256;
    canvas.width  = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    const img = new Image();
    img.onload = () => {
      // Scale from the 160px crop window to the 256px output canvas
      const ratio = size / CROP;
      const renderedW = img.naturalWidth  * zoom * ratio;
      const renderedH = img.naturalHeight * zoom * ratio;
      const cx = (size - renderedW) / 2 + offsetX * zoom * ratio;
      const cy = (size - renderedH) / 2 + offsetY * zoom * ratio;
      ctx.drawImage(img, cx, cy, renderedW, renderedH);
      onLogoChange(canvas.toDataURL("image/png"));
      setImgSrc(null);
    };
    img.src = imgSrc;
  }

  function onMD(e) { setIsDragging(true); lastPos.current = { x: e.clientX, y: e.clientY }; }
  function onMM(e) {
    if (!isDragging || !lastPos.current) return;
    setOffsetX(ox => ox + (e.clientX - lastPos.current.x));
    setOffsetY(oy => oy + (e.clientY - lastPos.current.y));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }
  function onMU() { setIsDragging(false); lastPos.current = null; }

  // CSS-driven preview: image centred, scaled by zoom, panned by offset
  const imgStyle = {
    position: "absolute",
    left: "50%", top: "50%",
    transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${zoom})`,
    transformOrigin: "center center",
    maxWidth: "none",
    userSelect: "none",
    pointerEvents: "none",
  };

  return (
    <div>
      {!imgSrc ? (
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {/* current logo preview at adjustable size */}
          <div onClick={() => fileRef.current?.click()} style={{ width: prevSize, height: prevSize, background: accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0, border: "2px dashed #cbd5e1" }}>
            {logoUrl
              ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <Icon name="bar" size={Math.round(prevSize * 0.38)} color="white" />
            }
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#475569", cursor: "pointer" }}>
              <Icon name="upload" size={13} /> {logoUrl ? "Alterar imagem" : "Carregar imagem"}
            </button>
            {logoUrl && (
              <button onClick={() => onLogoChange("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", padding: 0, textAlign: "left" }}>
                Remover logótipo
              </button>
            )}
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>PNG, SVG ou JPG</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Pré-vis:</span>
              <input type="range" min={24} max={96} value={prevSize} onChange={e => setPrevSize(Number(e.target.value))} style={{ width: 80 }} />
              <span style={{ fontSize: 11, color: "#64748b" }}>{prevSize}px</span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 0, marginBottom: 10 }}>
            Arraste para reposicionar · Deslize o zoom para ajustar o tamanho
          </p>
          {/* crop window */}
          <div
            style={{ width: CROP, height: CROP, overflow: "hidden", borderRadius: 12, border: "2px solid #e2e8f0", cursor: isDragging ? "grabbing" : "grab", position: "relative", background: "#f1f5f9", flexShrink: 0 }}
            onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
          >
            <img src={imgSrc} alt="preview" draggable={false} style={imgStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>−</span>
            <input type="range" min={0.1} max={3} step={0.02} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: 140 }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>+</span>
            <span style={{ fontSize: 12, color: "#64748b", minWidth: 36 }}>{Math.round(zoom * 100)}%</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setImgSrc(null)} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 14px", fontSize: 12, color: "#475569", cursor: "pointer" }}>Cancelar</button>
            <button onClick={handleConfirm} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
          </div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => loadFile(e.target.files[0])} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

function loadBranding() {
  try { return JSON.parse(localStorage.getItem("crm_branding") || "{}"); } catch { return {}; }
}

function BrandingTab({ onBrandingChange }) {
  const saved0 = loadBranding();
  const [appName,  setAppName]  = useState(saved0.appName  || "Processo Comercial");
  const [subtitle, setSubtitle] = useState(saved0.subtitle || "Gestão de cotações e follow-up");
  const [logoUrl,  setLogoUrl]  = useState(saved0.logoUrl  || "");
  const [accent,   setAccent]   = useState(saved0.accent   || "#2563eb");
  const [saved,    setSaved]    = useState(false);

  function handleSave() {
    const b = { appName, subtitle, logoUrl, accent };
    localStorage.setItem("crm_branding", JSON.stringify(b));
    onBrandingChange?.(b);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ maxWidth: 540 }}>
      <SectionHeader title="Marca / Logótipo" />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <FieldRow label="Logótipo">
          <LogoUploader logoUrl={logoUrl} accent={accent} onLogoChange={setLogoUrl} />
        </FieldRow>
        <FieldRow label="Nome da aplicação">
          <input style={INPUT} value={appName} onChange={e => setAppName(e.target.value)} />
        </FieldRow>
        <FieldRow label="Subtítulo">
          <input style={INPUT} value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        </FieldRow>
        <ColorSwatch label="Cor de destaque" value={accent} onChange={setAccent} />

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Pré-visualização</div>
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="bar" size={14} color="white" />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{appName || "Nome da aplicação"}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{subtitle || "Subtítulo"}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={handleSave} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Guardar alterações
          </button>
          {saved && <span style={{ fontSize: 12, color: "#15803d", fontWeight: 500 }}>✓ Guardado — reflectido na barra de navegação</span>}
        </div>
      </div>
    </div>
  );
}

// ── Import tab ────────────────────────────────────────────────────────────────

function ImportTab() {
  const [dragging,  setDragging]  = useState(false);
  const [file,      setFile]      = useState(null);
  const [importing, setImporting] = useState(false);
  const [done,      setDone]      = useState(false);

  function handleFile(f) {
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
      setFile(f); setDone(false);
    } else alert("Por favor selecione um ficheiro CSV ou Excel.");
  }
  function handleReset() { setFile(null); setDone(false); }

  return (
    <div style={{ maxWidth: 600 }}>
      <SectionHeader title="Importar Processos" />
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 0, marginBottom: 20 }}>
        Carregue um ficheiro CSV ou Excel exportado do SharePoint. O sistema irá mapear as colunas, pré-visualizar e importar os registos em bloco.
      </p>
      {!done ? (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById("admin-file-input").click()}
            style={{ border: `2px dashed ${dragging ? "#2563eb" : "#e2e8f0"}`, borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer", background: dragging ? "#eff6ff" : "#f8fafc", transition: "all 0.15s" }}
          >
            <Icon name="upload" size={30} color={dragging ? "#2563eb" : "#94a3b8"} style={{ display: "block", margin: "0 auto 10px" }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{file ? file.name : "Arraste o ficheiro aqui ou clique para selecionar"}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>CSV, XLS ou XLSX · até 10 MB</div>
            <input id="admin-file-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
          {file && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>Pré-visualização (primeiras linhas)</div>
              <div style={{ background: "white", borderRadius: 10, border: "1px solid #f1f5f9", overflowX: "auto", marginBottom: 14 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                      {["Nº Processo","Cliente","Marca","Modelo","Estado","Data Limite"].map(h => (
                        <th key={h} style={{ padding: "7px 12px", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[["2003001","Cliente Exemplo Lda","VOLVO","EC360BLC","Entrada","15/05/2026"],
                      ["2003002","Construtora Demo SA","CAT","320GC","Em Análise","20/05/2026"],
                      ["2003003","Obras Angola SARL","JCB","JS220","Ganho","10/04/2026"]
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                        {row.map((cell, j) => <td key={j} style={{ padding: "7px 12px", fontSize: 12, color: "#475569" }}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "9px 14px", fontSize: 12, color: "#92400e", marginBottom: 14 }}>
                <strong>Atenção:</strong> Verifique o mapeamento de colunas antes de confirmar.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleReset} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#64748b", cursor: "pointer" }}>Remover ficheiro</button>
                <button onClick={() => { setImporting(true); setTimeout(() => { setImporting(false); setDone(true); }, 1800); }} disabled={importing}
                  style={{ background: importing ? "#93c5fd" : "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: importing ? "default" : "pointer" }}>
                  {importing ? "A importar…" : "Confirmar importação"}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>Importação concluída</div>
          <div style={{ fontSize: 13, color: "#166534", marginBottom: 16 }}>{file?.name} · 3 registos importados (simulado)</div>
          <button onClick={handleReset} style={{ background: "white", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 18px", fontSize: 13, color: "#15803d", fontWeight: 600, cursor: "pointer" }}>Importar outro ficheiro</button>
        </div>
      )}
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "users",      label: "Utilizadores", icon: "users"    },
  { id: "statuses",   label: "Estados",      icon: "tag"      },
  { id: "priorities", label: "Prioridades",  icon: "alert"    },
  { id: "roles",      label: "Funções",      icon: "user"     },
  { id: "assignment", label: "Atribuição de Tarefas", icon: "cpu" },
  { id: "branding",   label: "Marca",        icon: "settings" },
  { id: "import",     label: "Importar",     icon: "upload"   },
];

export function AdminPanel({ onClose, onBrandingChange, onUsersChange }) {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 100 }} />
      <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 800, maxWidth: "96vw", background: "#f8fafc", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-6px 0 40px rgba(0,0,0,0.14)" }}>

        {/* header */}
        <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "#2563eb", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="settings" size={14} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Administração</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Configurações do sistema</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* tab bar — scrollable so all 7 tabs fit */}
        <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", flexShrink: 0, overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontSize: 13, fontWeight: 500, border: "none", borderBottom: activeTab === t.id ? "2px solid #2563eb" : "2px solid transparent", background: "none", color: activeTab === t.id ? "#2563eb" : "#64748b", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              <Icon name={t.icon} size={13} color={activeTab === t.id ? "#2563eb" : "#64748b"} />
              {t.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {activeTab === "users"      && <UsersTab onUsersChange={onUsersChange} />}
          {activeTab === "statuses"   && <StatusesTab />}
          {activeTab === "priorities" && <PrioritiesTab />}
          {activeTab === "roles"      && <RolesTab />}
          {activeTab === "assignment" && <AssignmentTab />}
          {activeTab === "branding"   && <BrandingTab onBrandingChange={onBrandingChange} />}
          {activeTab === "import"     && <ImportTab />}
        </div>
      </div>
    </>
  );
}
