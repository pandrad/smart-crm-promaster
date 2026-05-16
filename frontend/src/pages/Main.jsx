import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PROCESSOS, daysLeft } from "../data.js";
import { store } from "../store.js";
import { StatsBar } from "../components/StatsBar.jsx";
import { Toolbar } from "../components/Toolbar.jsx";
import { TableView } from "../components/TableView.jsx";
import { KanbanView } from "../components/KanbanView.jsx";
import { DetailDrawer } from "../components/DetailDrawer.jsx";
import { Toast } from "../components/Toast.jsx";
import { AdminPanel } from "../components/AdminPanel.jsx";
import { Avatar } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

function getBranding() {
  try { return JSON.parse(localStorage.getItem("crm_branding") || "{}"); } catch { return {}; }
}

const INPUT = { width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", boxSizing: "border-box", background: "white" };

// ── User profile modal ────────────────────────────────────────────────────────
function ProfileModal({ currentUser, onClose, onSave }) {
  const fileRef = useRef(null);
  const [name,     setName]     = useState(currentUser.name || "");
  const [photo,    setPhoto]    = useState(currentUser.photo || "");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [err,      setErr]      = useState("");

  function handleSave() {
    if (password && password !== confirm) { setErr("As palavras-passe não coincidem."); return; }
    onSave({ name, photo, password: password || undefined });
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 14, width: 420, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>O meu perfil</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* photo */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", cursor: "pointer", flexShrink: 0, border: "2px dashed #cbd5e1", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="user" size={24} color="#94a3b8" />}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: "5px 12px", fontSize: 12, color: "#475569", cursor: "pointer", marginBottom: 4 }}>
                <Icon name="upload" size={12} /> {photo ? "Alterar foto" : "Adicionar foto"}
              </button>
              {photo && <button onClick={() => setPhoto("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", padding: 0 }}>Remover</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setPhoto(ev.target.result); r.readAsDataURL(f); }}} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Nome de utilizador</label>
            <input style={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="Nome Apelido" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Nova palavra-passe (opcional)</label>
            <input style={INPUT} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nova palavra-passe" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Confirmar palavra-passe</label>
            <input style={INPUT} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repetir palavra-passe" />
          </div>
          {err && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, padding: "7px 12px", fontSize: 12, color: "#b91c1c" }}>{err}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 16px", fontSize: 13, color: "#475569", cursor: "pointer" }}>Cancelar</button>
            <button onClick={handleSave} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function Main() {
  const [processos,     setProcessos]     = useState(PROCESSOS);
  const [users,         setUsers]         = useState(() => store.getUsers());
  const [view,          setView]          = useState("table");
  const [selected,      setSelected]      = useState(null);
  const [search,        setSearch]        = useState("");
  const [ownerFilter,   setOwnerFilter]   = useState("Todos");
  const [commFilter,    setCommFilter]    = useState("Todos");
  const [statusFilter,  setStatusFilter]  = useState(null);   // null = Todos
  const [myTab,         setMyTab]         = useState(false);
  const [adminOpen,     setAdminOpen]     = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [branding,      setBranding]      = useState(getBranding);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crm_user") || "{}"); } catch { return {}; }
  });

  function handleLogout() {
    localStorage.removeItem("crm_user");
    navigate("/login");
  }

  function handleProfileSave({ name, photo, password }) {
    const updated = { ...currentUser, name, photo };
    localStorage.setItem("crm_user", JSON.stringify(updated));
    setCurrentUser(updated);
    // Also update the user record in the store so avatars update everywhere
    const storeUsers = store.getUsers().map(u => u.email === currentUser.email ? { ...u, name, photo: photo || u.photo } : u);
    store.saveUsers(storeUsers);
    setUsers(storeUsers);
  }

  function handleProcessoUpdate(updated) {
    setProcessos(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelected(updated);
  }

  function handleStatClick(filterId) {
    setStatusFilter(filterId);
    if (filterId !== null) { setOwnerFilter("Todos"); setCommFilter("Todos"); setSearch(""); }
  }

  // User-filtered slice — used by StatsBar in "Meus processos" mode
  const myProcessos = processos.filter(p => {
    const n = currentUser.name ?? "";
    return p.owner === n || p.comm === n || p.compra === n;
  });

  const rows = processos.filter(p => {
    if (myTab) {
      const n = currentUser.name ?? "";
      if (p.owner !== n && p.comm !== n && p.compra !== n) return false;
    }
    if (ownerFilter !== "Todos" && p.owner !== ownerFilter) return false;
    if (commFilter  !== "Todos" && p.comm  !== commFilter)  return false;

    if (statusFilter === null) { /* no filter */ }
    else if (statusFilter === "open")    { if (p.status >= 6) return false; }
    else if (statusFilter === "overdue") { if (!(daysLeft(p.deadline) < 0 && p.status < 6)) return false; }
    else if (statusFilter === "urgent")  { const d = daysLeft(p.deadline); if (!(d >= 0 && d <= 2 && p.status < 6)) return false; }
    else if (statusFilter === "won")     { if (p.status !== 6) return false; }
    else                                 { if (p.status !== Number(statusFilter)) return false; }

    const q = search.toLowerCase();
    if (q && !p.client.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) && !p.id.includes(q)) return false;
    return true;
  });

  const accent = branding.accent || "#2563eb";
  const userPhoto = currentUser.photo || users.find(u => u.email === currentUser.email)?.photo;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>

      {/* ── Topbar ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="bar" size={16} color="white" />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{branding.appName || "Processo Comercial"}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{branding.subtitle || "Gestão de cotações e follow-up"}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, color: "#64748b" }}>Inbox sincronizada</span>
          </div>

          {/* Profile button */}
          <button
            onClick={() => setProfileOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}
          >
            <Avatar name={currentUser.name || "U"} size={22} photo={userPhoto} />
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{(currentUser.name || "").split(" ")[0] || "Perfil"}</span>
          </button>

          {currentUser.role === "admin" && (
            <button
              onClick={() => setAdminOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: adminOpen ? accent : "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, color: adminOpen ? "white" : "#475569", cursor: "pointer" }}
            >
              <Icon name="settings" size={13} color={adminOpen ? "white" : "#475569"} /> Administração
            </button>
          )}

          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#dc2626", cursor: "pointer" }}>
            <Icon name="logout" size={13} color="#dc2626" /> Sair
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <StatsBar
        processos={processos}
        myProcessos={myProcessos}
        myTab={myTab}
        activeFilter={statusFilter}
        onStatClick={handleStatClick}
      />

      {/* ── Meus processos tab ── */}
      <div style={{ padding: "10px 24px 0", display: "flex", gap: 6 }}>
        {[{ id: false, label: "Todos os processos" }, { id: true, label: "Meus processos" }].map(t => (
          <button key={String(t.id)}
            onClick={() => { setMyTab(t.id); setStatusFilter(null); setOwnerFilter("Todos"); setCommFilter("Todos"); setSearch(""); }}
            style={{ padding: "5px 14px", fontSize: 12, fontWeight: 500, borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", background: myTab === t.id ? accent : "white", color: myTab === t.id ? "white" : "#64748b" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <Toolbar
        view={view} setView={setView}
        search={search} setSearch={setSearch}
        ownerFilter={ownerFilter} setOwnerFilter={setOwnerFilter}
        commFilter={commFilter}   setCommFilter={setCommFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        onFilterChange={() => setMyTab(false)}
      />

      {view === "table"  && <TableView  rows={rows} onSelect={setSelected} users={users} />}
      {view === "kanban" && <KanbanView rows={rows} processos={processos} setProcessos={setProcessos} onSelect={setSelected} currentUser={currentUser} />}

      {selected && (
        <DetailDrawer
          p={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleProcessoUpdate}
          users={users}
          currentUser={currentUser}
        />
      )}

      {adminOpen   && <AdminPanel onClose={() => setAdminOpen(false)} onBrandingChange={b => setBranding(b)} onUsersChange={u => setUsers(u)} />}
      {profileOpen && <ProfileModal currentUser={currentUser} onClose={() => setProfileOpen(false)} onSave={handleProfileSave} />}

      <Toast />
    </div>
  );
}
