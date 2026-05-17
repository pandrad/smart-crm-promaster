import { useState, useRef } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { PROCESSOS } from "../mock/data.js";
import { store } from "../store.js";
import { THEME } from "../theme.js";
import { Sidebar } from "../components/Sidebar.jsx";
import { DetailDrawer } from "../components/DetailDrawer.jsx";
import { AdminPanel } from "../components/AdminPanel.jsx";
import { Toast } from "../components/Toast.jsx";
import { Avatar } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";
import { daysLeft } from "../utils.js";

// Lazy-imported page components (avoids circular deps, keeps shell lean)
import { Processos } from "./Processos.jsx";
import { Tarefas } from "./Tarefas.jsx";
import { Inbox } from "./Inbox.jsx";
import { Arquivo } from "./Arquivo.jsx";

const INPUT = { width: "100%", padding: "7px 10px", fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", boxSizing: "border-box", background: THEME.card, color: THEME.text };

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

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: THEME.card, borderRadius: 14, width: 420, maxWidth: "95vw", border: `1px solid ${THEME.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${THEME.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>O meu perfil</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* photo */}
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
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Nome de utilizador</label>
            <input style={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="Nome Apelido" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Nova palavra-passe (opcional)</label>
            <input style={INPUT} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nova palavra-passe" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Confirmar palavra-passe</label>
            <input style={INPUT} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repetir palavra-passe" />
          </div>
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
  // ── Shared state lifted here so all child pages can read/update it ─────────
  const [processos,    setProcessos]    = useState(PROCESSOS);
  const [tarefas,      setTarefas]      = useState(() => store.getTarefas());
  const [inboxEmails,  setInboxEmails]  = useState(() => store.getInboxEmails());
  const [users,        setUsers]        = useState(() => store.getUsers());
  const [selected,     setSelected]     = useState(null);   // processo open in drawer
  const [adminOpen,    setAdminOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [branding,     setBranding]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("crm_branding") || "{}"); } catch { return {}; }
  });
  const [currentUser,  setCurrentUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("crm_user") || "{}"); } catch { return {}; }
  });

  const navigate = useNavigate();
  const accent   = branding.accent || THEME.accent;

  // ── Shared handlers ────────────────────────────────────────────────────────
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

  // ── Badge counts for sidebar ───────────────────────────────────────────────
  const processosBadge = processos.filter(p => !p.archived && p.status < 7).length;
  const tarefasBadge   = tarefas.filter(t => t.status === "Pendente").length;
  const inboxBadge     = inboxEmails.filter(e => !e.isInternal && e.status === "pending").length;

  // ── Props bundle passed down to child pages ────────────────────────────────
  const sharedProps = {
    processos, setProcessos,
    tarefas,   setTarefas,
    inboxEmails, setInboxEmails,
    users,
    currentUser,
    accent,
    onSelectProcesso: setSelected,
    onLogout: handleLogout,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: THEME.bg, overflow: "hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        * { scrollbar-width: thin; scrollbar-color: ${THEME.border} ${THEME.sidebar}; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${THEME.sidebar}; }
        ::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 3px; }
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
      />

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0 }}>
        <Routes>
          <Route path="/"           element={<Navigate to="/processos" replace />} />
          <Route path="/processos"  element={<Processos {...sharedProps} />} />
          <Route path="/tarefas"    element={<Tarefas   {...sharedProps} />} />
          <Route path="/inbox"      element={<Inbox     {...sharedProps} />} />
          <Route path="/arquivo"    element={<Arquivo   {...sharedProps} />} />
          <Route path="*"           element={<Navigate to="/processos" replace />} />
        </Routes>
      </div>

      {/* ── Global overlays (always mounted at shell level) ── */}
      {selected && (
        <DetailDrawer
          p={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleProcessoUpdate}
          users={users}
          currentUser={currentUser}
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
