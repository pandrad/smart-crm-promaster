import { useState, useRef, useEffect } from "react";
import { store, SYSTEM_ROLES } from "../store.js";
import { MOCK_IMPORT_PREVIEW } from "../mock/data.js";
import { Avatar, Tag } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";
import { THEME } from "../theme.js";
import { useWindowSize } from "../utils.js";

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: THEME.text }}>{title}</h2>
      {action && (
        <button onClick={onAction} style={{ display: "flex", alignItems: "center", gap: 6, background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Icon name="plus" size={13} color="white" /> {action}
        </button>
      )}
    </div>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>{hint}</p>}
    </div>
  );
}

const INPUT  = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.sidebar, color: THEME.text };
const SELECT = { ...INPUT };

function Modal({ title, onClose, children, width = 460 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${THEME.border}`, position: "sticky", top: 0, background: THEME.card, zIndex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

function SaveRow({ onCancel, onSave, saveLabel = "Guardar" }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
      <button onClick={onCancel} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
      <button onClick={onSave}   style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{saveLabel}</button>
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
          style={{ width: 24, height: 24, borderRadius: 6, border: "1px dashed #cbd5e1", background: THEME.card, cursor: "pointer", fontSize: 14, color: THEME.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
      {showCustom && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 32, height: 32, border: `1px solid ${THEME.border}`, borderRadius: 6, cursor: "pointer", padding: 2 }} />
          <input style={{ ...INPUT, flex: 1 }} value={value} onChange={e => onChange(e.target.value)} placeholder="#rrggbb" />
        </div>
      )}
      <div style={{ width: 48, height: 8, borderRadius: 4, background: value, marginTop: 2 }} />
    </FieldRow>
  );
}

// ── Tab 1: Utilizadores ───────────────────────────────────────────────────────

function UserModal({ user, onClose, onSave }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState(user
    ? { name: user.name, email: user.email, active: user.active, photo: user.photo ?? "", password: "" }
    : { name: "", email: "", active: true, photo: "", password: "" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={user ? "Editar utilizador" : "Novo utilizador"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FieldRow label="Foto">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 60, height: 60, borderRadius: "50%", background: THEME.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0, border: "2px dashed #cbd5e1" }}>
              {form.photo ? <img src={form.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="user" size={22} color="#94a3b8" />}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 12, color: THEME.textMuted, cursor: "pointer", marginBottom: 4 }}>
                <Icon name="upload" size={12} /> {form.photo ? "Alterar foto" : "Carregar foto"}
              </button>
              {form.photo && <button onClick={() => set("photo", "")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", padding: 0 }}>Remover</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => set("photo", ev.target.result); r.readAsDataURL(f); }}} />
          </div>
        </FieldRow>
        <FieldRow label="Nome completo">
          <input style={INPUT} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nome Apelido" />
        </FieldRow>
        <FieldRow label="Email">
          <input style={INPUT} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="utilizador@promaster.co" />
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
  const [users,   setUsers]   = useState(() => store.getUsers());
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  function commit(next) { setUsers(next); store.saveUsers(next); onUsersChange?.(next); }

  function saveUser(form) {
    const next = editing === "new"
      ? [...users, { ...form, id: Date.now() }]
      : users.map(u => u.id === editing.id ? { ...u, ...form } : u);
    commit(next);
  }

  function confirmDelete(u) {
    commit(users.filter(x => x.id !== u.id));
    // Also clean up user-role assignments
    const mapping = store.getUserRoles();
    delete mapping[u.id];
    store.saveUserRoles(mapping);
    setDeleting(null);
  }

  return (
    <div>
      <SectionHeader title="Utilizadores" action="Novo utilizador" onAction={() => setEditing("new")} />
      <p style={{ fontSize: 13, color: THEME.textDim, marginTop: 0, marginBottom: 16 }}>
        Gerir utilizadores. Atribuição de funções na tab <strong style={{ color: THEME.text }}>Atribuição</strong>.
      </p>
      <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
              {["Utilizador","Email","Estado",""].map((h, i) => (
                <th key={i} style={{ padding: "9px 14px", fontSize: 11, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${THEME.borderLight}` }}>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Avatar name={u.name} photo={u.photo} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: THEME.textDim }}>{u.email}</td>
                <td style={{ padding: "11px 14px" }}>
                  <Tag bg={u.active ? THEME.successBg : THEME.sidebar} color={u.active ? THEME.success : THEME.textDim}>
                    {u.active ? "Ativo" : "Inativo"}
                  </Tag>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setEditing(u)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: THEME.textMuted, cursor: "pointer" }}>
                      <Icon name="edit" size={12} /> Editar
                    </button>
                    <button onClick={() => setDeleting(u)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: THEME.danger, cursor: "pointer" }}>
                      <Icon name="x" size={12} /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing !== null && <UserModal user={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSave={saveUser} />}
      {deleting && (
        <Modal title="Eliminar utilizador" onClose={() => setDeleting(null)} width={380}>
          <p style={{ color: THEME.textMuted, fontSize: 13 }}>Tem a certeza que pretende eliminar <strong style={{ color: THEME.text }}>{deleting.name}</strong>? A atribuição de funções deste utilizador também será removida.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setDeleting(null)} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => confirmDelete(deleting)} style={{ background: THEME.danger, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab 2: Funções ────────────────────────────────────────────────────────────

function RoleModal({ role, onClose, onSave }) {
  const [label, setLabel] = useState(role?.label ?? "");
  return (
    <Modal title={role ? "Editar função" : "Nova função"} onClose={onClose} width={360}>
      <FieldRow label="Nome da função">
        <input style={INPUT} value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Resp. Cotação" />
      </FieldRow>
      <SaveRow onCancel={onClose} onSave={() => { if (label.trim()) { onSave(label.trim()); onClose(); } }} />
    </Modal>
  );
}

function RolesTab() {
  const [roles,   setRoles]   = useState(() => store.getRoles());
  const [editing, setEditing] = useState(null);
  const [error,   setError]   = useState(null);

  function commit(next) { setRoles(next); store.saveRoles(next); }

  function saveRole(label) {
    if (editing === "new") {
      commit([...roles, { id: String(Date.now()), label }]);
    } else {
      commit(roles.map(r => r.id === editing.id ? { ...r, label } : r));
    }
  }

  function tryDelete(role) {
    // Block if the role is still assigned to any user — must remove from Atribuição first.
    const userRoles = store.getUserRoles();
    const usedByUser = Object.values(userRoles).some(ids => ids.includes(role.id));
    if (usedByUser) { setError(`A função "${role.label}" está atribuída a utilizadores. Remova a atribuição primeiro na tab Atribuição.`); return; }

    // Auto-clean any Mapeamento entries that reference this role ID before deleting.
    const m = store.getMapeamento();
    function cleanSection(section) {
      if (!section) return {};
      return Object.fromEntries(Object.entries(section).filter(([, v]) => v !== role.id));
    }
    const cleaned = {
      ...m,
      processoStatus:      cleanSection(m.processoStatus),
      taskType:            cleanSection(m.taskType),
      taskStatus:          cleanSection(m.taskStatus),
    };
    store.saveMapeamento(cleaned);

    commit(roles.filter(r => r.id !== role.id));
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <SectionHeader title="Funções" action="Nova função" onAction={() => setEditing("new")} />
      <p style={{ fontSize: 13, color: THEME.textDim, marginTop: 0, marginBottom: 16 }}>
        Define as funções disponíveis. As funções são atribuídas a utilizadores na tab <strong style={{ color: THEME.text }}>Atribuição</strong> e mapeadas a estados e tipos na tab <strong style={{ color: THEME.text }}>Mapeamento</strong>.
      </p>
      {error && (
        <div style={{ background: THEME.dangerBg, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: "9px 14px", fontSize: 12, color: THEME.danger, marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon name="alert" size={14} color={THEME.danger} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 0 }}><Icon name="x" size={13} /></button>
        </div>
      )}
      <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
        {roles.map((r, i) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: i < roles.length - 1 ? `1px solid ${THEME.borderLight}` : "none" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text, flex: 1 }}>{r.label}</span>
            <button onClick={() => setEditing(r)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="edit" size={13} /></button>
            <button onClick={() => tryDelete(r)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 4 }}><Icon name="x" size={13} /></button>
          </div>
        ))}
        {roles.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "24px 0", fontSize: 13 }}>Nenhuma função definida</p>}
      </div>
      {editing !== null && <RoleModal role={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSave={saveRole} />}
    </div>
  );
}

// ── Tab 3: Atribuição de Utilizadores ─────────────────────────────────────────

function AtribuicaoTab({ onSwitchTab }) {
  const roles = store.getRoles();
  const users = store.getUsers().filter(u => u.active !== false);
  const [mapping, setMapping] = useState(() => store.getUserRoles());

  if (roles.length === 0) {
    return (
      <div>
        <SectionHeader title="Atribuição de Utilizadores" />
        <div style={{ background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "20px 24px", textAlign: "center" }}>
          <p style={{ color: THEME.textMuted, fontSize: 13, marginBottom: 12 }}>Ainda não definiu nenhuma função. Crie funções primeiro na tab Funções.</p>
          <button onClick={() => onSwitchTab("roles")} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Ir para Funções
          </button>
        </div>
      </div>
    );
  }

  function toggleRole(userId, roleId) {
    setMapping(prev => {
      const current = prev[userId] ?? [];
      const next    = current.includes(roleId) ? current.filter(id => id !== roleId) : [...current, roleId];
      const updated = { ...prev, [userId]: next };
      store.saveUserRoles(updated);  // auto-save on every toggle

      // Keep crm_users in sync: set user.role to their primary role (first in array)
      // so the session-based privilege system (currentUser.role) stays consistent.
      const primaryRoleId = next[0] ?? null;
      const primaryRole   = primaryRoleId ? store.getRoles().find(r => r.id === primaryRoleId) : null;
      const storeUsers    = store.getUsers();
      const syncedUsers   = storeUsers.map(u =>
        u.id === userId ? { ...u, role: primaryRole?.id ?? null } : u
      );
      store.saveUsers(syncedUsers);

      return updated;
    });
  }

  return (
    <div>
      <SectionHeader title="Atribuição de Utilizadores" />
      <p style={{ fontSize: 13, color: THEME.textDim, marginTop: 0, marginBottom: 16 }}>
        Atribua uma ou mais funções a cada utilizador. Quando vários utilizadores partilham a mesma função, a atribuição é feita em rotação (round-robin).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map(u => {
          const assigned = mapping[u.id] ?? [];
          return (
            <div key={u.id} style={{ background: THEME.sidebar, borderRadius: 10, border: `1px solid ${THEME.border}`, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar name={u.name} photo={u.photo} size={28} />
                <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>{u.name}</span>
                {assigned.length === 0 && <span style={{ fontSize: 11, color: THEME.textDim, marginLeft: "auto" }}>Sem função</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {roles.map(r => {
                  const on = assigned.includes(r.id);
                  return (
                    <button key={r.id} onClick={() => toggleRole(u.id, r.id)}
                      style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: on ? 700 : 400, cursor: "pointer", border: `1px solid ${on ? THEME.accent : THEME.border}`, background: on ? `${THEME.accent}22` : "transparent", color: on ? THEME.accent : THEME.textMuted, transition: "all 0.1s" }}>
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared: Status/Type list with drag-to-reorder ─────────────────────────────

function StatusModal({ item, extraFields, onClose, onSave }) {
  const [form, setForm] = useState(
    item
      ? { label: item.label, color: item.color, bg: item.bg ?? "#f1f5f9", ...extraFields?.reduce((acc, f) => ({ ...acc, [f.key]: item[f.key] ?? f.default }), {}) }
      : { label: "", color: "#2563eb", bg: "#dbeafe", ...extraFields?.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {}) }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  function pickColor(c) { set("color", c); if (BG_PRESETS[c]) set("bg", BG_PRESETS[c]); }

  return (
    <Modal title={item ? "Editar" : "Novo"} onClose={onClose} width={400}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FieldRow label="Etiqueta">
          <input style={INPUT} value={form.label} onChange={e => set("label", e.target.value)} placeholder="Nome" />
        </FieldRow>
        <ColorSwatch label="Cor" value={form.color} onChange={pickColor} />
        {extraFields?.map(f => (
          <FieldRow key={f.key} label={f.label} hint={f.hint}>
            <select style={SELECT} value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </FieldRow>
        ))}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Pré-visualização</div>
          <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: form.bg, color: form.color }}>
            {form.label || "Amostra"}
          </span>
        </div>
      </div>
      <SaveRow onCancel={onClose} onSave={() => { onSave(form); onClose(); }} />
    </Modal>
  );
}

function StatusList({ title, getItems, saveItems, dotShape, extraFields, canDelete }) {
  const [list,    setList]    = useState(() => getItems());
  const [editing, setEditing] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const dragIdx     = useRef(null);
  const scrollRef   = useRef(null);    // ref on the admin panel content pane
  const scrollPosRef = useRef(0);      // saves scroll position before commit

  function findScrollPane() {
    let el = scrollRef.current?.parentElement;
    while (el) {
      const ov = window.getComputedStyle(el).overflowY;
      if (ov === "auto" || ov === "scroll") return el;
      el = el.parentElement;
    }
    return null;
  }

  function commit(next) {
    const pane = findScrollPane();
    if (pane) scrollPosRef.current = pane.scrollTop;
    setList(next);
    saveItems(next);
  }

  useEffect(() => {
    if (scrollPosRef.current > 0) {
      const pane = findScrollPane();
      if (pane) {
        pane.scrollTop = scrollPosRef.current;
        scrollPosRef.current = 0;
      }
    }
  });

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

  function tryDelete(item) {
    if (canDelete) {
      const err = canDelete(item);
      if (err) { setDeleteError(err); return; }
    }
    commit(list.filter(s => s.id !== item.id));
  }

  return (
    <div ref={scrollRef} style={{ flex: 1, minWidth: 280 }}>
      <SectionHeader title={title} action="Novo" onAction={() => setEditing("new")} />
      {deleteError && (
        <div style={{ background: THEME.dangerBg, border: `1px solid ${THEME.danger}44`, borderRadius: 8, padding: "9px 14px", fontSize: 12, color: THEME.danger, marginBottom: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon name="alert" size={14} color={THEME.danger} />
          <span style={{ flex: 1 }}>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 0 }}><Icon name="x" size={13} /></button>
        </div>
      )}
      <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
        {list.map((s, i) => (
          <div key={s.id} draggable onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e, i)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < list.length - 1 ? `1px solid ${THEME.borderLight}` : "none", cursor: "grab" }}>
            <Icon name="chevron" size={12} color="#cbd5e1" style={{ transform: "rotate(90deg)", flexShrink: 0 }} />
            <div style={{ width: 11, height: 11, borderRadius: dotShape === "circle" ? "50%" : 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text, flex: 1 }}>{s.label}</span>
            {s.systemRole && s.systemRole !== "Nenhum" && (
              <span style={{ fontSize: 10, color: THEME.textDim, background: THEME.sidebar, borderRadius: 9999, padding: "2px 8px", flexShrink: 0 }}>{s.systemRole}</span>
            )}
            <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>Amostra</span>
            <button onClick={() => setEditing(s)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}>
              <Icon name="edit" size={13} />
            </button>
            <button onClick={() => tryDelete(s)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 4 }}>
              <Icon name="x" size={13} />
            </button>
          </div>
        ))}
        {list.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "24px 0", fontSize: 13 }}>Nenhum item</p>}
      </div>
      <p style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6, marginBottom: 0 }}>Arraste para reordenar</p>
      {editing !== null && <StatusModal item={editing === "new" ? null : editing} extraFields={extraFields} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

// ── Tab 4: Estados de Processo ────────────────────────────────────────────────

// ── Tab: Processos (Estados de Processo + Estados de Follow-Up) ───────────────

function ProcessosTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Estados de Processo</div>
        <StatusList title="" getItems={store.getStages} saveItems={store.saveStages} dotShape="square" />
      </div>
      <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Estados de Follow-Up</div>
        <StatusList title="" getItems={store.getFUStatuses} saveItems={store.saveFUStatuses} dotShape="circle" />
      </div>
    </div>
  );
}

// ── Tab: Tarefas (Tipos de Tarefa + Estados de Tarefa) ────────────────────────

function TarefasTab() {
  function canDeleteTaskStatus(item) {
    if (item.systemRole && item.systemRole !== "Nenhum") {
      return `O estado "${item.label}" tem a função de sistema "${item.systemRole}" e não pode ser eliminado. Pode alterar o nome e a cor mas não a função de sistema.`;
    }
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Tipos de Tarefa</div>
        <StatusList title="" getItems={store.getTaskTypes} saveItems={store.saveTaskTypes} dotShape="circle" />
      </div>
      <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Estados de Tarefa</div>
        <p style={{ fontSize: 13, color: THEME.textDim, marginTop: 0, marginBottom: 16 }}>
          Estados com uma <strong style={{ color: THEME.text }}>Função de Sistema</strong> diferente de "Nenhum" são definidos automaticamente pelas acções do sistema e não aparecem no selector manual de estado. O nome e cor podem ser alterados livremente.
        </p>
        <StatusList title="" getItems={store.getTaskStatuses} saveItems={store.saveTaskStatuses} dotShape="circle"
          canDelete={canDeleteTaskStatus}
          extraFields={[{
            key: "systemRole",
            label: "Função de sistema",
            hint: "Nenhum = aparece no selector manual. Qualquer outra = definido automaticamente pelo sistema.",
            default: "Nenhum",
            options: SYSTEM_ROLES,
          }]}
        />
      </div>
    </div>
  );
}

// ── Tab 8: Mapeamento de Responsabilidades ────────────────────────────────────

function MapeamentoTab({ onSwitchTab }) {
  const roles   = store.getRoles();
  const stages  = store.getStages();
  const types   = store.getTaskTypes();
  const statuses = store.getTaskStatuses();
  const [mapping,    setMapping]    = useState(() => store.getMapeamento());
  // noUsersBanner: { roleId, roleLabel } — set when a saved entry has no assigned users
  const [noUsersBanner, setNoUsersBanner] = useState(null);

  // Preserve scroll position across re-renders caused by dropdown changes
  const containerRef   = useRef(null);
  const savedScrollRef = useRef(null);

  function findScrollPane() {
    let el = containerRef.current?.parentElement;
    while (el) {
      const style = window.getComputedStyle(el);
      if (style.overflowY === "auto" || style.overflowY === "scroll") return el;
      el = el.parentElement;
    }
    return null;
  }

  function saveScroll() {
    const pane = findScrollPane();
    if (pane) savedScrollRef.current = pane.scrollTop;
  }

  useEffect(() => {
    if (savedScrollRef.current !== null) {
      const pane = findScrollPane();
      if (pane) {
        pane.scrollTop = savedScrollRef.current;
        savedScrollRef.current = null;
      }
    }
  });

  // Returns true when the given roleId has at least one user assigned in crm_user_roles
  function roleHasUsers(roleId) {
    if (!roleId) return true; // empty = no mapping, no warning needed
    return store.resolveRoleUsers(roleId).length > 0;
  }

  const missing = [];
  if (roles.length === 0)   missing.push({ label: "Funções",            tab: "roles"         });
  if (stages.length === 0)  missing.push({ label: "Estados de Processo", tab: "processos" });
  if (types.length === 0)   missing.push({ label: "Tipos de Tarefa",    tab: "tarefas"   });
  if (statuses.length === 0) missing.push({ label: "Estados de Tarefa", tab: "tarefas"   });

  if (missing.length > 0) {
    return (
      <div>
        <SectionHeader title="Mapeamento de Responsabilidades" />
        <div style={{ background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <p style={{ color: THEME.textMuted, fontSize: 13, marginBottom: 12 }}>Defina as funções, estados e tipos primeiro antes de fazer o mapeamento.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {missing.map(m => (
              <button key={m.tab} onClick={() => onSwitchTab(m.tab)}
                style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Ir para {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function setMap(section, key, roleId) {
    saveScroll();  // capture before the re-render
    setMapping(prev => {
      const updated = { ...prev, [section]: { ...(prev[section] ?? {}), [key]: roleId || null } };
      store.saveMapeamento(updated);
      return updated;
    });
    // Fix 4: show inline guidance if the selected role has no assigned users
    if (roleId && !roleHasUsers(roleId)) {
      const role = roles.find(r => r.id === roleId);
      setNoUsersBanner({ roleId, roleLabel: role?.label ?? roleId });
    } else {
      setNoUsersBanner(null);
    }
  }

  function toggleReatribui(statusId) {
    saveScroll();
    setMapping(prev => {
      const current = prev.taskStatusReatribui ?? {};
      const updated = { ...prev, taskStatusReatribui: { ...current, [statusId]: !current[statusId] } };
      store.saveMapeamento(updated);
      return updated;
    });
  }

  function toggleProcessoReatribui(statusId) {
    saveScroll();
    setMapping(prev => {
      const current = prev.processoStatusReatribui ?? {};
      const updated = { ...prev, processoStatusReatribui: { ...current, [statusId]: !current[statusId] } };
      store.saveMapeamento(updated);
      return updated;
    });
  }

  const roleOptions = [{ id: "", label: "— Sem função atribuída —" }, ...roles];

  // Fix 3: warning icon shown next to any dropdown whose selected role has no users
  const WarnIcon = ({ roleId }) => {
    if (!roleId || roleHasUsers(roleId)) return null;
    return (
      <span
        title="Esta função não tem utilizadores atribuídos"
        style={{ display: "inline-flex", alignItems: "center", color: "#f59e0b", flexShrink: 0 }}
      >
        <Icon name="alert" size={14} color="#f59e0b" />
      </span>
    );
  };

  const Section = ({ title, hint, items, section, keyField }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{title}</div>
      {hint && <p style={{ fontSize: 12, color: THEME.textDim, marginTop: 0, marginBottom: 12 }}>{hint}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => {
          const selectedRole = mapping[section]?.[item[keyField]] ?? "";
          return (
            <div key={item.id} style={{ background: THEME.sidebar, borderRadius: 9, border: `1px solid ${THEME.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text, flex: 1 }}>{item.label}</span>
              <WarnIcon roleId={selectedRole} />
              <select
                value={selectedRole}
                onChange={e => setMap(section, item[keyField], e.target.value)}
                style={{ fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "6px 10px", background: THEME.bg, color: THEME.text, outline: "none", minWidth: 180 }}
              >
                {roleOptions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={containerRef}>
      <SectionHeader title="Mapeamento de Responsabilidades" />
      <p style={{ fontSize: 13, color: THEME.textDim, marginTop: 0, marginBottom: 20 }}>
        Define qual função é responsável por cada estado de processo, tipo de tarefa, e estado de tarefa. Quando vários utilizadores têm a mesma função, a atribuição roda (round-robin).
      </p>

      {/* Fix 4 — inline guidance banner when a saved entry has no users */}
      {noUsersBanner && (
        <div style={{ background: "#1c1505", border: "1px solid #f59e0b44", borderRadius: 9, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <Icon name="alert" size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "#fbbf24", flex: 1 }}>
            Atenção: a função <strong style={{ color: "#fde68a" }}>{noUsersBanner.roleLabel}</strong> não tem utilizadores atribuídos.{" "}
            <button onClick={() => onSwitchTab("assignment")} style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", textDecoration: "underline", fontSize: 12, padding: 0 }}>
              Vá ao separador Atribuição
            </button>{" "}
            para atribuir utilizadores a esta função.
          </span>
          <button onClick={() => setNoUsersBanner(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", padding: 0 }}>
            <Icon name="x" size={12} color="#f59e0b" />
          </button>
        </div>
      )}

      {/* Por Estado de Processo — with Reatribui toggle (Enhancement) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Por Estado de Processo</div>
        <p style={{ fontSize: 12, color: THEME.textDim, marginTop: 0, marginBottom: 12 }}>
          Quem recebe o processo quando atinge este estado. O toggle <strong style={{ color: THEME.text }}>Reatribui</strong> controla se a mudança de estado desencadeia uma nova atribuição.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stages.map(item => {
            const reatribui   = (mapping.processoStatusReatribui ?? {})[item.id] ?? false;
            const selectedRole = mapping.processoStatus?.[item.id] ?? "";
            return (
              <div key={item.id} style={{ background: THEME.sidebar, borderRadius: 9, border: `1px solid ${THEME.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text, flex: 1 }}>{item.label}</span>
                {reatribui && <WarnIcon roleId={selectedRole} />}
                {reatribui && (
                  <select
                    value={selectedRole}
                    onChange={e => setMap("processoStatus", item.id, e.target.value)}
                    style={{ fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "6px 10px", background: THEME.bg, color: THEME.text, outline: "none", minWidth: 160 }}
                  >
                    {roleOptions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                )}
                <button
                  onClick={() => toggleProcessoReatribui(item.id)}
                  title={reatribui ? "Reatribuição activa — clique para desactivar" : "Reatribuição inactiva — clique para activar"}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                >
                  <div style={{ width: 32, height: 18, borderRadius: 9, background: reatribui ? THEME.accent : THEME.border, position: "relative", transition: "background 0.15s" }}>
                    <div style={{ position: "absolute", top: 2, left: reatribui ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: reatribui ? THEME.text : THEME.textDim, minWidth: 58 }}>Reatribui</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Por Tipo de Tarefa</div>
        <p style={{ fontSize: 12, color: THEME.textDim, marginTop: 0, marginBottom: 12 }}>Quem recebe a tarefa quando este tipo é criado. O toggle <strong style={{ color: THEME.text }}>Reatribui</strong> controla se a criação de uma tarefa deste tipo desencadeia uma nova atribuição.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {types.map(item => {
            const reatribui    = (mapping.taskTypeReatribui ?? {})[item.id] ?? false;
            const selectedRole = mapping.taskType?.[item.id] ?? "";
            return (
              <div key={item.id} style={{ background: THEME.sidebar, borderRadius: 9, border: `1px solid ${THEME.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text, flex: 1 }}>{item.label}</span>
                {reatribui && <WarnIcon roleId={selectedRole} />}
                {reatribui && (
                  <select
                    value={selectedRole}
                    onChange={e => setMap("taskType", item.id, e.target.value)}
                    style={{ fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "6px 10px", background: THEME.bg, color: THEME.text, outline: "none", minWidth: 160 }}
                  >
                    {roleOptions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                )}
                <button
                  onClick={() => {
                    saveScroll();
                    setMapping(prev => {
                      const current = prev.taskTypeReatribui ?? {};
                      const updated = { ...prev, taskTypeReatribui: { ...current, [item.id]: !current[item.id] } };
                      store.saveMapeamento(updated);
                      return updated;
                    });
                  }}
                  title={reatribui ? "Reatribuição activa — clique para desactivar" : "Reatribuição inactiva — clique para activar"}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                >
                  <div style={{ width: 32, height: 18, borderRadius: 9, background: reatribui ? THEME.accent : THEME.border, position: "relative", transition: "background 0.15s" }}>
                    <div style={{ position: "absolute", top: 2, left: reatribui ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: reatribui ? THEME.text : THEME.textDim, minWidth: 58 }}>Reatribui</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Por Estado de Tarefa</div>
        <p style={{ fontSize: 12, color: THEME.textDim, marginTop: 0, marginBottom: 12 }}>Quem recebe a tarefa quando atinge este estado. O toggle <strong style={{ color: THEME.text }}>Reatribui</strong> controla se a mudança de estado desencadeia uma nova atribuição.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {statuses.map(item => {
            const reatribui    = (mapping.taskStatusReatribui ?? {})[item.id] ?? false;
            const selectedRole = mapping.taskStatus?.[item.id] ?? "";
            return (
              <div key={item.id} style={{ background: THEME.sidebar, borderRadius: 9, border: `1px solid ${THEME.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text, flex: 1 }}>{item.label}</span>
                {reatribui && <WarnIcon roleId={selectedRole} />}
                {reatribui && (
                  <select
                    value={selectedRole}
                    onChange={e => setMap("taskStatus", item.id, e.target.value)}
                    style={{ fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "6px 10px", background: THEME.bg, color: THEME.text, outline: "none", minWidth: 160 }}
                  >
                    {roleOptions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                )}
                <button
                  onClick={() => toggleReatribui(item.id)}
                  title={reatribui ? "Reatribuição activa — clique para desactivar" : "Reatribuição inactiva — clique para activar"}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                >
                  <div style={{ width: 32, height: 18, borderRadius: 9, background: reatribui ? THEME.accent : THEME.border, position: "relative", transition: "background 0.15s" }}>
                    <div style={{ position: "absolute", top: 2, left: reatribui ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: reatribui ? THEME.text : THEME.textDim, minWidth: 58 }}>Reatribui</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab 9: SLA ────────────────────────────────────────────────────────────────

function SLATab() {
  const stages   = store.getStages();
  const types    = store.getTaskTypes();
  const statuses = store.getTaskStatuses();
  const [settings, setSettings] = useState(() => store.getSLASettings());

  function set(section, key, value, unit) {
    setSettings(prev => {
      const updated = {
        ...prev,
        [section]: {
          ...(prev[section] ?? {}),
          [key]: { value: parseInt(value, 10) || 0, unit: unit ?? prev[section]?.[key]?.unit ?? "horas" },
        },
      };
      store.saveSLASettings(updated);  // auto-save on every change
      return updated;
    });
  }

  const Row = ({ item, section }) => {
    const entry = settings[section]?.[item.id] ?? { value: "", unit: "horas" };
    return (
      <div style={{ background: THEME.sidebar, borderRadius: 9, border: `1px solid ${THEME.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text, flex: 1 }}>{item.label}</span>
        <input type="number" min="0" max="9999" value={entry.value}
          onChange={e => set(section, item.id, e.target.value, entry.unit)}
          style={{ width: 64, padding: "5px 8px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, background: THEME.bg, color: THEME.text, outline: "none", textAlign: "right" }}
        />
        <select value={entry.unit} onChange={e => set(section, item.id, entry.value, e.target.value)}
          style={{ fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "5px 8px", background: THEME.bg, color: THEME.text, outline: "none" }}>
          <option value="horas">horas</option>
          <option value="dias">dias</option>
        </select>
      </div>
    );
  };

  const Group = ({ title, items, section }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => <Row key={item.id} item={item} section={section} />)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 580 }}>
      <SectionHeader title="SLA — Limites de Tempo" />
      <p style={{ fontSize: 13, color: THEME.textDim, marginTop: 0, marginBottom: 24 }}>
        Quando um novo estado ou tipo é adicionado nas tabs correspondentes, uma linha SLA aparece aqui automaticamente.
      </p>
      <Group title="Estados do Processo"  items={stages}   section="processoStatus" />
      <Group title="Tipos de Tarefa"       items={types}    section="taskType"       />
      <Group title="Estados de Tarefa"     items={statuses} section="taskStatus"     />
    </div>
  );
}

// ── Branding tab (unchanged) ──────────────────────────────────────────────────

function LogoUploader({ logoUrl, accent, onLogoChange }) {
  const fileRef   = useRef(null);
  const canvasRef = useRef(null);
  const [imgSrc,    setImgSrc]    = useState(null);
  const [zoom,      setZoom]      = useState(1);
  const [offsetX,   setOffsetX]   = useState(0);
  const [offsetY,   setOffsetY]   = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastPos    = useRef(null);
  const [prevSize, setPrevSize]   = useState(64);

  function loadFile(f) {
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const tmp = new Image();
      tmp.onload = () => { setImgSrc(ev.target.result); setZoom(1); setOffsetX(0); setOffsetY(0); };
      tmp.src = ev.target.result;
    };
    reader.readAsDataURL(f);
  }

  const CROP = 160;

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;
    const ctx = canvas.getContext("2d");
    const size = 256;
    canvas.width = size; canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    const img = new Image();
    img.onload = () => {
      const ratio = size / CROP;
      ctx.drawImage(img, (size - img.naturalWidth * zoom * ratio) / 2 + offsetX * zoom * ratio, (size - img.naturalHeight * zoom * ratio) / 2 + offsetY * zoom * ratio, img.naturalWidth * zoom * ratio, img.naturalHeight * zoom * ratio);
      onLogoChange(canvas.toDataURL("image/png"));
      setImgSrc(null);
    };
    img.src = imgSrc;
  }

  const imgStyle = { position: "absolute", left: "50%", top: "50%", transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${zoom})`, transformOrigin: "center center", maxWidth: "none", userSelect: "none", pointerEvents: "none" };

  return (
    <div>
      {!imgSrc ? (
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div onClick={() => fileRef.current?.click()} style={{ width: prevSize, height: prevSize, background: accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0, border: "2px dashed #cbd5e1" }}>
            {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <Icon name="bar" size={Math.round(prevSize * 0.38)} color="white" />}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>
              <Icon name="upload" size={13} /> {logoUrl ? "Alterar imagem" : "Carregar imagem"}
            </button>
            {logoUrl && <button onClick={() => onLogoChange("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", padding: 0, textAlign: "left" }}>Remover logótipo</button>}
            <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>PNG, SVG ou JPG</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 11, color: THEME.textDim }}>Pré-vis:</span>
              <input type="range" min={24} max={96} value={prevSize} onChange={e => setPrevSize(Number(e.target.value))} style={{ width: 80 }} />
              <span style={{ fontSize: 11, color: THEME.textDim }}>{prevSize}px</span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: THEME.textDim, marginTop: 0, marginBottom: 10 }}>Arraste para reposicionar · Deslize o zoom para ajustar o tamanho</p>
          <div style={{ width: CROP, height: CROP, overflow: "hidden", borderRadius: 12, border: "2px solid #e2e8f0", cursor: isDragging ? "grabbing" : "grab", position: "relative", background: THEME.bg, flexShrink: 0 }}
            onMouseDown={e => { setIsDragging(true); lastPos.current = { x: e.clientX, y: e.clientY }; }}
            onMouseMove={e => { if (!isDragging || !lastPos.current) return; setOffsetX(ox => ox + e.clientX - lastPos.current.x); setOffsetY(oy => oy + e.clientY - lastPos.current.y); lastPos.current = { x: e.clientX, y: e.clientY }; }}
            onMouseUp={() => { setIsDragging(false); lastPos.current = null; }}
            onMouseLeave={() => { setIsDragging(false); lastPos.current = null; }}
          >
            <img src={imgSrc} alt="preview" draggable={false} style={imgStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: THEME.textDim }}>−</span>
            <input type="range" min={0.1} max={3} step={0.02} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: 140 }} />
            <span style={{ fontSize: 11, color: THEME.textDim }}>+</span>
            <span style={{ fontSize: 12, color: THEME.textDim, minWidth: 36 }}>{Math.round(zoom * 100)}%</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setImgSrc(null)} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "6px 14px", fontSize: 12, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
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

  // Persist and propagate a branding snapshot immediately on every change
  function applyBranding(patch) {
    const b = { appName, subtitle, logoUrl, accent, ...patch };
    localStorage.setItem("crm_branding", JSON.stringify(b));
    onBrandingChange?.(b);
  }

  function handleNameChange(v)     { setAppName(v);  applyBranding({ appName: v }); }
  function handleSubtitleChange(v) { setSubtitle(v); applyBranding({ subtitle: v }); }
  function handleAccentChange(v)   { setAccent(v);   applyBranding({ accent: v }); }
  function handleLogoChange(v)     { setLogoUrl(v);  applyBranding({ logoUrl: v }); }

  return (
    <div style={{ maxWidth: 540 }}>
      <SectionHeader title="Marca / Logótipo" />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <FieldRow label="Logótipo"><LogoUploader logoUrl={logoUrl} accent={accent} onLogoChange={handleLogoChange} /></FieldRow>
        <FieldRow label="Nome da aplicação">
          <input style={INPUT} value={appName} onChange={e => handleNameChange(e.target.value)} />
        </FieldRow>
        <FieldRow label="Subtítulo">
          <input style={INPUT} value={subtitle} onChange={e => handleSubtitleChange(e.target.value)} />
        </FieldRow>
        <ColorSwatch label="Cor de destaque" value={accent} onChange={handleAccentChange} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Pré-visualização</div>
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="bar" size={14} color="white" />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: THEME.text }}>{appName || "Nome da aplicação"}</div>
              <div style={{ fontSize: 10, color: THEME.textMuted }}>{subtitle || "Subtítulo"}</div>
            </div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: THEME.textDim }}>As alterações são aplicadas imediatamente na barra lateral e no título do browser.</p>
      </div>
    </div>
  );
}

// ── Import tab (unchanged) ────────────────────────────────────────────────────

function ImportTab() {
  const [dragging,  setDragging]  = useState(false);
  const [file,      setFile]      = useState(null);
  const [importing, setImporting] = useState(false);
  const [done,      setDone]      = useState(false);

  function handleFile(f) {
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) { setFile(f); setDone(false); }
    else alert("Por favor selecione um ficheiro CSV ou Excel.");
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <SectionHeader title="Importar Processos" />
      <p style={{ fontSize: 13, color: THEME.textDim, marginTop: 0, marginBottom: 20 }}>
        Carregue um ficheiro CSV ou Excel exportado do SharePoint. O sistema irá mapear as colunas, pré-visualizar e importar os registos em bloco.
      </p>
      {!done ? (
        <>
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById("admin-file-input").click()}
            style={{ border: `2px dashed ${dragging ? "#2563eb" : "#e2e8f0"}`, borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer", background: dragging ? "#eff6ff" : "#f8fafc", transition: "all 0.15s" }}>
            <Icon name="upload" size={30} color={dragging ? "#2563eb" : "#94a3b8"} style={{ display: "block", margin: "0 auto 10px" }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: THEME.textMuted, marginBottom: 4 }}>{file ? file.name : "Arraste o ficheiro aqui ou clique para selecionar"}</div>
            <div style={{ fontSize: 12, color: THEME.textMuted }}>CSV, XLS ou XLSX · até 10 MB</div>
            <input id="admin-file-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
          {file && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 10 }}>Pré-visualização (primeiras linhas)</div>
              <div style={{ background: THEME.card, borderRadius: 10, border: "1px solid #f1f5f9", overflowX: "auto", marginBottom: 14 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                  <thead>
                    <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                      {["Nº Processo","Cliente","Marca","Modelo","Estado","Data Limite"].map(h => (
                        <th key={h} style={{ padding: "7px 12px", fontSize: 11, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_IMPORT_PREVIEW.map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${THEME.borderLight}` }}>
                        {row.map((cell, j) => <td key={j} style={{ padding: "7px 12px", fontSize: 12, color: THEME.textMuted }}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "9px 14px", fontSize: 12, color: "#92400e", marginBottom: 14 }}>
                <strong>Atenção:</strong> Verifique o mapeamento de colunas antes de confirmar.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setFile(null); setDone(false); }} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, color: THEME.textDim, cursor: "pointer" }}>Remover ficheiro</button>
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
          <button onClick={() => { setFile(null); setDone(false); }} style={{ background: THEME.card, border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 18px", fontSize: 13, color: "#15803d", fontWeight: 600, cursor: "pointer" }}>Importar outro ficheiro</button>
        </div>
      )}
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "users",         label: "Utilizadores",              icon: "users"    },
  { id: "roles",         label: "Funções",                   icon: "user"     },
  { id: "assignment",    label: "Atribuição",                icon: "cpu"      },
  { id: "processos",     label: "Processos",                 icon: "tag"      },
  { id: "tarefas",       label: "Tarefas",                   icon: "tasks"    },
  { id: "mapeamento",    label: "Mapeamento",                icon: "list"     },
  { id: "sla",           label: "SLA",                       icon: "clock"    },
  { id: "branding",      label: "Marca",                     icon: "settings" },
  { id: "import",        label: "Importar",                  icon: "upload"   },
];

export function AdminPanel({ onClose, onBrandingChange, onUsersChange }) {
  const { isMobile } = useWindowSize();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
      <div style={isMobile
        ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: THEME.sidebar, zIndex: 101, display: "flex", flexDirection: "column" }
        : { position: "fixed", top: 0, right: 0, height: "100vh", width: 820, maxWidth: "96vw", background: THEME.sidebar, zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-6px 0 40px rgba(0,0,0,0.14)" }
      }>
        {/* header */}
        <div style={{ background: THEME.card, borderBottom: `1px solid ${THEME.border}`, padding: isMobile ? "12px 16px" : "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "#2563eb", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="settings" size={14} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Administração</div>
              {!isMobile && <div style={{ fontSize: 11, color: THEME.textMuted }}>Configurações do sistema</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* tab bar */}
        <div style={{ background: THEME.card, borderBottom: `1px solid ${THEME.border}`, display: "flex", flexShrink: 0, overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              title={isMobile ? t.label : undefined}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 0 : 6, padding: isMobile ? "10px 12px" : "10px 14px", fontSize: 13, fontWeight: 500, border: "none", borderBottom: activeTab === t.id ? `2px solid ${THEME.accent}` : "2px solid transparent", background: "none", color: activeTab === t.id ? THEME.accent : THEME.textDim, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, minWidth: isMobile ? 44 : "auto", minHeight: 44 }}>
              <Icon name={t.icon} size={isMobile ? 18 : 13} color={activeTab === t.id ? THEME.accent : THEME.textDim} />
              {!isMobile && t.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px" }}>
          {activeTab === "users"      && <UsersTab onUsersChange={onUsersChange} />}
          {activeTab === "roles"      && <RolesTab />}
          {activeTab === "assignment" && <AtribuicaoTab onSwitchTab={setActiveTab} />}
          {activeTab === "processos"  && <ProcessosTab />}
          {activeTab === "tarefas"    && <TarefasTab />}
          {activeTab === "mapeamento" && <MapeamentoTab onSwitchTab={setActiveTab} />}
          {activeTab === "sla"        && <SLATab />}
          {activeTab === "branding"   && <BrandingTab onBrandingChange={onBrandingChange} />}
          {activeTab === "import"     && <ImportTab />}
        </div>
      </div>
    </>
  );
}
