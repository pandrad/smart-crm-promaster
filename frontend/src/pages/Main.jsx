import { useState, useRef } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { PROCESSOS, TAREFAS, INBOX_EMAILS } from "../mock/data.js";
import { store } from "../store.js";
import { THEME, applyTheme, getStoredTheme, saveTheme } from "../theme.js";
import { Sidebar } from "../components/Sidebar.jsx";
import { DetailDrawer } from "../components/DetailDrawer.jsx";
import { AdminPanel } from "../components/AdminPanel.jsx";
import { Toast } from "../components/Toast.jsx";
import { Avatar } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

import { Processos } from "./Processos.jsx";
import { Tarefas, TaskDrawer } from "./Tarefas.jsx";
import { Inbox } from "./Inbox.jsx";
import { Arquivo } from "./Arquivo.jsx";

const INPUT = () => ({ width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.card, color: THEME.text });

// ── Profile modal ─────────────────────────────────────────────────────────────
function ProfileModal({ currentUser, onClose, onSave }) {
  const fileRef = useRef(null);
  const [name,     setName]     = useState(currentUser.name   || "");
  const [photo,    setPhoto]    = useState(currentUser.photo  || "");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [err,      setErr]      = useState("");

  function handleSave() {
    if (password && password !== confirm) { setErr("As palavras-passe não coincidem."); return; }
    onSave({ name, photo, password: password || undefined });
    onClose();
  }

  const inp = INPUT();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 420, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>O meu perfil</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", cursor: "pointer", flexShrink: 0, border: `2px dashed ${THEME.border}`, background: THEME.sidebar, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="user" size={24} color={THEME.textMuted} />}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 12, color: THEME.textMuted, cursor: "pointer", marginBottom: 4 }}>
                <Icon name="upload" size={12} /> {photo ? "Alterar foto" : "Adicionar foto"}
              </button>
              {photo && <button onClick={() => setPhoto("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: THEME.danger, padding: 0 }}>Remover</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setPhoto(ev.target.result); r.readAsDataURL(f); }}} />
          </div>
          {[
            ["Nome de utilizador", name, setName, "text", "Nome Apelido"],
            ["Nova palavra-passe (opcional)", password, setPassword, "password", "Nova palavra-passe"],
            ["Confirmar palavra-passe", confirm, setConfirm, "password", "Repetir palavra-passe"],
          ].map(([lbl, val, setter, type, ph]) => (
            <div key={lbl}>
              <label style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>{lbl}</label>
              <input style={inp} type={type} value={val} onChange={e => setter(e.target.value)} placeholder={ph} />
            </div>
          ))}
          {err && <div style={{ background: THEME.dangerBg, border: `1px solid ${THEME.danger}44`, borderRadius: 7, padding: "7px 12px", fontSize: 12, color: THEME.danger }}>{err}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: THEME.textMuted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={handleSave} style={{ background: THEME.accent, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export function Main() {
  const [processos,    setProcessos]    = useState(PROCESSOS);
  const [tarefas,      setTarefas]      = useState(() => store.getTarefas());
  const [inboxEmails,  setInboxEmails]  = useState(() => store.getInboxEmails());
  const [users,        setUsers]        = useState(() => store.getUsers());
  const [selected,     setSelected]     = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);   // tarefa open from SupervisorWidget
  const [adminOpen,    setAdminOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [branding,     setBranding]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("crm_branding") || "{}"); } catch { return {}; }
  });
  const [currentUser,  setCurrentUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("crm_user") || "{}"); } catch { return {}; }
  });

  // ── Theme toggle ───────────────────────────────────────────────────────────
  // themeVersion is bumped to force a full re-render when THEME is mutated
  const [themeMode,    setThemeMode]    = useState(getStoredTheme);
  const [themeVersion, setThemeVersion] = useState(0);

  function toggleTheme() {
    const next = themeMode === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
    setThemeMode(next);
    setThemeVersion(v => v + 1);
  }

  const navigate = useNavigate();
  const accent   = branding.accent || THEME.accent;

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleProcessoUpdate(updated) {
    setProcessos(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelected(updated);
  }

  function handleProfileSave({ name, photo }) {
    const updated = { ...currentUser, name, photo };
    localStorage.setItem("crm_user", JSON.stringify(updated));
    setCurrentUser(updated);
    const storeUsers = store.getUsers().map(u => u.email === currentUser.email ? { ...u, name, photo: photo || u.photo } : u);
    store.saveUsers(storeUsers);
    setUsers(storeUsers);
  }

  function handleUsersChange(u) { setUsers(u); }

  function handleLogout() {
    localStorage.removeItem("crm_user");
    navigate("/login");
  }

  // ── Repor dados mock — apenas em desenvolvimento ──────────────────────────
  // Limpa todas as chaves de localStorage e repõe o estado React aos dados
  // mock originais. Só aparece quando import.meta.env.DEV === true (localhost).
  function handleQAReset() {
    // Clear every runtime key including theme
    const keys = [
      "crm_users","crm_stages","crm_fu","crm_priorities","crm_roles",
      "crm_assignment","crm_task_assignment","crm_tarefas","crm_inbox",
      "crm_col_prefs","crm_sort_prefs","crm_branding","crm_theme",
    ];
    keys.forEach(k => localStorage.removeItem(k));

    // Reset all React state to original mock values
    setProcessos([...PROCESSOS]);
    setTarefas([...TAREFAS]);
    setInboxEmails([...INBOX_EMAILS]);
    setUsers(store.getUsers());   // re-reads seed from data.js now that crm_users is gone
    setBranding({});
    setSelected(null);
    setSelectedTask(null);
    setAdminOpen(false);
    setProfileOpen(false);

    // Reset theme to dark and force full re-render
    applyTheme("dark");
    setThemeMode("dark");
    setThemeVersion(v => v + 1);  // bumps key on root div → full subtree re-render
  }

  function handleTaskUpdate(updated) {
    const next = tarefas.map(t => t.id === updated.id ? updated : t);
    setTarefas(next);
    store.saveTarefas(next);
    setSelectedTask(updated);
  }

  // ── Badge counts ───────────────────────────────────────────────────────────
  const isPrivileged   = currentUser?.role === "admin" || currentUser?.role === "supervisor";
  const processosBadge = processos.filter(p => !p.archived && p.status < 7).length;
  const tarefasBadge   = tarefas.filter(t => {
    const active = t.status === "Por Fazer" || t.status === "Em Curso" ||
                   t.status === "Bloqueado" || t.status === "Escalado";
    if (!active) return false;
    if (isPrivileged) return true;   // admin/supervisor see all active tasks
    return t.owner === currentUser?.name || t.owner === null;
  }).length;
  const inboxBadge = inboxEmails.filter(e => !e.isInternal && e.status === "pending").length;

  const sharedProps = {
    processos, setProcessos,
    tarefas,   setTarefas,
    inboxEmails, setInboxEmails,
    users,
    currentUser,
    accent,
    onSelectProcesso: setSelected,
    onOpenTask:       setSelectedTask,
    onLogout:         handleLogout,
  };

  return (
    // key={themeVersion} forces a full subtree re-render when theme changes,
    // ensuring all components re-read the mutated THEME object
    <div key={themeVersion} style={{ display: "flex", height: "100vh", background: THEME.bg, overflow: "hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        * { scrollbar-width: thin; scrollbar-color: ${THEME.border} ${THEME.sidebar}; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${THEME.sidebar}; }
        ::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 3px; }
        tr:hover td { background: ${THEME.sidebarHover}; }
      `}</style>

      {/* ── Left sidebar ── */}
      <Sidebar
        currentUser={currentUser}
        processosBadge={processosBadge}
        tarefasBadge={tarefasBadge}
        inboxBadge={inboxBadge}
        accent={accent}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onLogout={handleLogout}
      />

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0 }}>

        {/* ── Topbar strip: theme toggle + QA reset ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, padding: "8px 20px", borderBottom: `1px solid ${THEME.border}`, background: THEME.sidebar, flexShrink: 0 }}>
          {/* QA reset — dev builds only */}
          {import.meta.env.DEV && (
            <button
              onClick={handleQAReset}
              title="Repõe todos os dados mock ao estado original (apenas em desenvolvimento)"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", fontSize: 11, fontWeight: 600, background: "#2d0a0a", color: "#f87171", border: "1px solid #ef444444", borderRadius: 6, cursor: "pointer" }}
            >
              <Icon name="x" size={11} color="#f87171" /> Repor dados mock
            </button>
          )}

          {/* Dark / light mode toggle */}
          <button
            onClick={toggleTheme}
            title={themeMode === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", fontSize: 12, fontWeight: 500, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 7, cursor: "pointer", color: THEME.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
          >
            <Icon name={themeMode === "dark" ? "sun" : "moon"} size={14} color={THEME.textMuted} />
            {themeMode === "dark" ? "Claro" : "Escuro"}
          </button>
        </div>

        {/* ── Page routes ── */}
        <Routes>
          <Route path="/"           element={<Navigate to="/processos" replace />} />
          <Route path="/processos"  element={<Processos {...sharedProps} />} />
          <Route path="/tarefas"    element={<Tarefas   {...sharedProps} />} />
          <Route path="/inbox"      element={<Inbox     {...sharedProps} />} />
          <Route path="/arquivo"    element={<Arquivo   {...sharedProps} />} />
          <Route path="*"           element={<Navigate to="/processos" replace />} />
        </Routes>
      </div>

      {/* ── Global overlays ── */}
      {selected && (
        <DetailDrawer
          p={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleProcessoUpdate}
          users={users}
          currentUser={currentUser}
        />
      )}
      {/* Shell-level TaskDrawer — opened from SupervisorWidget or anywhere */}
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          users={users}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          setProcessos={setProcessos}
          processos={processos}
        />
      )}
      {adminOpen && (
        <AdminPanel
          onClose={() => setAdminOpen(false)}
          onBrandingChange={b => { setBranding(b); }}
          onUsersChange={handleUsersChange}
        />
      )}
      {profileOpen && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setProfileOpen(false)}
          onSave={handleProfileSave}
        />
      )}
      <Toast />
    </div>
  );
}
