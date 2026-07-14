import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { useWindowSize } from "../utils.js";
import { PROCESSOS, TAREFAS, INBOX_EMAILS } from "../mock/data.js";
import { store } from "../store.js";
import { THEME, applyTheme, getStoredTheme, saveTheme } from "../theme.js";
import { Sidebar } from "../components/Sidebar.jsx";
import { DetailDrawer } from "../components/DetailDrawer.jsx";
import { AdminPanel } from "../components/AdminPanel.jsx";

import { Avatar } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

import { Dashboard } from "./Dashboard.jsx";
import { Processos } from "./Processos.jsx";
import { Tarefas, TaskDrawer, getUnacknowledgedAckCount } from "./Tarefas.jsx";
import { Inbox } from "./Inbox.jsx";
import { Arquivo } from "./Arquivo.jsx";
import { Clientes } from "./Clientes.jsx";
import { DevTools } from "../components/DevTools.jsx";

const INPUT = () => ({ width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.card, color: THEME.text });

// ── Bottom navigation bar (mobile only) ──────────────────────────────────────
function BottomNav({ currentUser, processosBadge, tarefasBadge, inboxBadge, accent, onOpenAdmin }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;
  const isAdmin   = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const isPrivileged = isAdmin || isSupervisor;
  const ac = accent || THEME.accent;

  const items = [
    { icon: "bar",      label: "Dashboard",    route: "/dashboard", badge: null,           show: true,          action: () => navigate("/dashboard") },
    { icon: "tasks",    label: "Tarefas",      route: "/tarefas",   badge: tarefasBadge,   show: true,          action: () => navigate("/tarefas") },
    { icon: "list",     label: "Processos",    route: "/processos", badge: processosBadge, show: true,          action: () => navigate("/processos") },
    { icon: "inbox",    label: "Inbox",        route: "/inbox",     badge: inboxBadge,     show: isPrivileged,  action: () => navigate("/inbox") },
    { icon: "users",    label: "Clientes",     route: "/clientes",  badge: null,           show: true,          action: () => navigate("/clientes") },
    { icon: "archive",  label: "Arquivo",      route: "/arquivo",   badge: null,           show: true,          action: () => navigate("/arquivo") },
    { icon: "settings", label: "Admin",        route: null,         badge: null,           show: isPrivileged,  action: onOpenAdmin },
  ].filter(i => i.show);

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 56, background: THEME.sidebar, borderTop: `1px solid ${THEME.border}`, display: "flex", zIndex: 200, flexShrink: 0 }}>
      {items.map(item => {
        const active = item.route && (path === item.route || (item.route === "/dashboard" && path === "/"));
        return (
          <button
            key={item.label}
            onClick={item.action}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: active ? ac : THEME.textDim, position: "relative", minHeight: 56 }}
          >
            <Icon name={item.icon} size={20} color={active ? ac : THEME.textDim} />
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            {item.badge > 0 && (
              <span style={{ position: "absolute", top: 6, right: "calc(50% - 14px)", background: ac, color: "white", fontSize: 9, fontWeight: 700, borderRadius: 9999, padding: "1px 5px", minWidth: 16, textAlign: "center" }}>
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

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
  const { isMobile } = useWindowSize();
  const [processos,    setProcessos]    = useState(() => store.getProcessos());
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

  const navigate  = useNavigate();
  const accent    = branding.accent   || THEME.accent;
  const appName   = branding.appName  || "Smart CRM";
  const appLogo   = branding.logoUrl  || "";
  const appSubtitle = branding.subtitle || "";

  // Update browser tab title whenever branding changes
  useEffect(() => {
    document.title = branding.appName || "Smart CRM";
  }, [branding.appName]);

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

  // DEV ONLY — user switcher: swaps session without going through login
  function handleSwitchUser(user) {
    localStorage.setItem("crm_user", JSON.stringify(user));
    setCurrentUser(user);
    setThemeVersion(v => v + 1);
  }

  // ── Repor dados mock — apenas em desenvolvimento ──────────────────────────
  // Limpa todas as chaves de localStorage e repõe o estado React aos dados
  // mock originais. Só aparece quando import.meta.env.DEV === true (localhost).
  function handleQAReset() {
    // Clear every runtime key including theme
    const keys = [
      "crm_users","crm_stages","crm_fu","crm_priorities","crm_roles",
      "crm_assignment","crm_task_assignment","crm_processos","crm_tarefas","crm_inbox",
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
  const processosBadge = processos.filter(p => !p.archived && p.status < 8).length;
  const _activeLabels  = new Set(["Por Fazer","Em Curso","Escalado","Devolvido","Cancelamento Pendente"]
    .map(r => store.getLabelForSystemRole(r)).filter(Boolean));
  // Combines the user's own active tasks with unacknowledged process-handoff
  // notifications (see getUnacknowledgedAckCount in Tarefas.jsx) into a single
  // badge total, since both genuinely require the person's attention.
  const tarefasBadge   = tarefas.filter(t => {
    if (!_activeLabels.has(t.status)) return false;
    return t.owner === currentUser?.name;
  }).length + getUnacknowledgedAckCount(processos, currentUser?.name);
  // Inbox badge only relevant for admin/supervisor (standard users don't see Inbox nav item)
  const inboxBadge = isPrivileged
    ? inboxEmails.filter(e => !e.isInternal && e.status === "pending").length
    : 0;

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
    <div key={themeVersion} style={{ display: "flex", height: isMobile ? "100dvh" : "100vh", flexDirection: isMobile ? "column" : "row", background: THEME.bg, overflow: "hidden" }}>
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
        appName={appName}
        appLogo={appLogo}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onLogout={handleLogout}
      />

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0, paddingBottom: isMobile ? 56 : 0 }}>

        {/* ── Topbar strip: theme toggle + mobile user avatar ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: isMobile ? "8px 14px" : "8px 20px", borderBottom: `1px solid ${THEME.border}`, background: THEME.sidebar, flexShrink: 0 }}>
          {/* App name on mobile */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, background: accent, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {appLogo
                  ? <img src={appLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Icon name="bar" size={13} color="white" />
                }
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>{appName}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: isMobile ? 0 : "auto" }}>
            {/* Dark / light mode toggle */}
            <button
              onClick={toggleTheme}
              title={themeMode === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: isMobile ? "6px 10px" : "5px 12px", fontSize: 12, fontWeight: 500, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 7, cursor: "pointer", color: THEME.textMuted, minHeight: isMobile ? 38 : "auto" }}
              onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            >
              <Icon name={themeMode === "dark" ? "sun" : "moon"} size={14} color={THEME.textMuted} />
              {!isMobile && (themeMode === "dark" ? "Claro" : "Escuro")}
            </button>
            {/* User avatar — mobile only, taps to open profile */}
            {isMobile && (
              <button onClick={() => setProfileOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}>
                <Avatar name={currentUser?.name || "U"} size={30} photo={currentUser?.photo} />
              </button>
            )}
          </div>
        </div>

        {/* ── Page routes ── */}
        <Routes>
          <Route path="/"           element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"  element={<Dashboard  {...sharedProps} />} />
          <Route path="/processos"  element={<Processos {...sharedProps} />} />
          <Route path="/tarefas"    element={<Tarefas   {...sharedProps} />} />
          <Route path="/inbox"      element={<Inbox     {...sharedProps} />} />
          <Route path="/clientes"   element={<Clientes  processos={processos} onSelectProcesso={setSelected} currentUser={currentUser} />} />
          <Route path="/arquivo"    element={<Arquivo   {...sharedProps} />} />
          <Route path="*"           element={<Navigate to="/dashboard" replace />} />
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
          tarefas={tarefas}
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
      {/* Toast disabled — may be reintroduced later */}

      {/* Mobile bottom navigation */}
      {isMobile && (
        <BottomNav
          currentUser={currentUser}
          processosBadge={processosBadge}
          tarefasBadge={tarefasBadge}
          inboxBadge={inboxBadge}
          accent={accent}
          onOpenAdmin={() => setAdminOpen(true)}
        />
      )}

      {/* DEV tools visible in dev mode OR when VITE_SHOW_DEV_TOOLS=true — remove env var before real production deployment */}
      {(import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_TOOLS === 'true') && (
        <DevTools
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          processos={processos}
          setProcessos={setProcessos}
          setTarefas={setTarefas}
          setInboxEmails={setInboxEmails}
          setThemeVersion={setThemeVersion}
        />
      )}
    </div>
  );
}
