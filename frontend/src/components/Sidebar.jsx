import { useNavigate, useLocation } from "react-router-dom";
import { THEME } from "../theme.js";
import { Avatar } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

function NavSection({ label }) {
  return (
    <div style={{ padding: "18px 16px 6px", fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
      {label}
    </div>
  );
}

function NavItem({ icon, label, path, active, badge, disabled, onClick }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", margin: "1px 8px", borderRadius: 8,
        cursor: disabled ? "default" : "pointer",
        background: active ? `${THEME.accent}22` : "transparent",
        borderLeft: active ? `2px solid ${THEME.accent}` : "2px solid transparent",
        opacity: disabled ? 0.4 : 1,
        transition: "background 0.1s",
      }}
      onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = THEME.sidebarHover; }}
      onMouseLeave={e => { if (!active && !disabled) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon name={icon} size={15} color={active ? THEME.accent : THEME.textMuted} />
      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? THEME.text : THEME.textMuted, flex: 1 }}>
        {label}
      </span>
      {badge != null && badge > 0 && (
        <span style={{ background: THEME.accent, color: "white", fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </div>
  );
}

export function Sidebar({ currentUser, processosBadge, tarefasBadge, inboxBadge, onOpenProfile, onOpenAdmin, onLogout, accent }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;
  const isAdmin   = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const roleLabel = currentUser?.role === "admin" ? "Administrador"
                  : currentUser?.role === "supervisor" ? "Supervisor"
                  : currentUser?.role === "comercial"  ? "Resp. Comercial"
                  : currentUser?.role === "cotacao"    ? "Resp. Cotação"
                  : currentUser?.role === "compra"     ? "Resp. Compra"
                  : "Utilizador";

  const activeAccent = accent || THEME.accent;

  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: THEME.sidebar,
      borderRight: `1px solid ${THEME.border}`,
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      overflowY: "auto",
    }}>

      {/* Logo area */}
      <div style={{ padding: "18px 16px 12px", borderBottom: `1px solid ${THEME.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: activeAccent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="bar" size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, lineHeight: 1.2 }}>Smart CRM</div>
            <div style={{ fontSize: 10, color: THEME.textDim }}>Promaster</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingBottom: 8 }}>

        <NavSection label="Principal" />
        <NavItem
          icon="list" label="Processos"
          path="/processos" active={path === "/processos" || path === "/"}
          badge={processosBadge}
          onClick={() => navigate("/processos")}
        />
        <NavItem
          icon="tasks" label="Tarefas"
          path="/tarefas" active={path === "/tarefas"}
          badge={tarefasBadge}
          onClick={() => navigate("/tarefas")}
        />
        {(isAdmin || isSupervisor) && (
          <NavItem
            icon="inbox" label="Inbox"
            path="/inbox" active={path === "/inbox"}
            badge={inboxBadge}
            onClick={() => navigate("/inbox")}
          />
        )}

        <NavSection label="Gestão" />
        <NavItem
          icon="users" label="Clientes"
          path="/clientes" active={path === "/clientes"}
          onClick={() => navigate("/clientes")}
        />
        <NavItem
          icon="archive" label="Arquivo"
          path="/arquivo" active={path === "/arquivo"}
          onClick={() => navigate("/arquivo")}
        />

        {(isAdmin || isSupervisor) && (
          <>
            <NavSection label="Sistema" />
            <NavItem
              icon="settings" label="Administração"
              path="/admin" active={false}
              onClick={onOpenAdmin}
            />
          </>
        )}
      </nav>

      {/* User chip */}
      <div
        onClick={onOpenProfile}
        style={{
          borderTop: `1px solid ${THEME.border}`,
          padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer",
          transition: "background 0.1s",
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <Avatar name={currentUser?.name || "U"} size={30} photo={currentUser?.photo} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentUser?.name || "Utilizador"}
          </div>
          <div style={{ fontSize: 10, color: THEME.textDim }}>{roleLabel}</div>
        </div>
        {/* sync pulse dot */}
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.success, flexShrink: 0, animation: "pulse 2s infinite" }} />
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          margin: "4px 10px 10px",
          padding: "8px 14px",
          background: "none",
          border: `1px solid ${THEME.border}`,
          borderRadius: 8,
          cursor: "pointer",
          color: THEME.danger,
          fontSize: 12,
          fontWeight: 500,
          transition: "background 0.1s",
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = THEME.dangerBg; }}
        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
      >
        <Icon name="logout" size={14} color={THEME.danger} />
        Terminar sessão
      </button>

    </div>
  );
}
