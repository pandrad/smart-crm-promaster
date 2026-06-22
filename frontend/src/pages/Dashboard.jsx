import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { daysLeft, useWindowSize } from "../utils.js";
import { StatsBar } from "../components/StatsBar.jsx";
import { SupervisorWidget } from "../components/SupervisorWidget.jsx";
import { Avatar, Tag } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

function ActivityList({ items, users }) {
  return (
    <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
      {items.map((h, i) => {
        const u = users.find(usr => usr.name === h.actor);
        return (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderBottom: i < items.length - 1 ? `1px solid ${THEME.borderLight}` : "none" }}>
            <Avatar name={h.actor || "?"} size={24} photo={u?.photo} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: THEME.textDim }}>{h.taskId}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{h.actor}</span>
                <Tag bg={THEME.sidebar} color={THEME.textDim} style={{ fontSize: 10 }}>{h.action}</Tag>
                <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: "auto", flexShrink: 0 }}>{h.ts}</span>
              </div>
              {h.note && (
                <div style={{ fontSize: 11, color: THEME.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {h.note.split("\n")[0]}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Dashboard({ processos, tarefas, users, currentUser, accent, onOpenTask }) {
  const { isMobile } = useWindowSize();
  const navigate = useNavigate();
  const accentColor = accent || THEME.accent;

  const isAdmin      = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";
  const isPrivileged = isAdmin || isSupervisor;

  const [showAllProcesses, setShowAllProcesses] = useState(isPrivileged);

  const userName = currentUser?.name ?? "";

  // ── Personal stats ──────────────────────────────────────────────────────────

  const activeStatusLabels = new Set(
    ["Por Fazer", "Em Curso", "Escalado", "Devolvido", "Cancelamento Pendente"]
      .map(r => store.getLabelForSystemRole(r)).filter(Boolean)
  );

  const doneLabels = new Set(
    ["Concluído", "Cancelado"].map(r => store.getLabelForSystemRole(r)).filter(Boolean)
  );
  const porFazerLabel = store.getLabelForSystemRole("Por Fazer");
  const myOwned       = tarefas.filter(t => t.owner === userName);
  const myActive      = myOwned.filter(t => !doneLabels.has(t.status));
  const myPorFazer    = myOwned.filter(t => t.status === porFazerLabel);
  const mySlaBreach   = myActive.filter(t => {
    if (!t.due) return false;
    try { const [d, m, y] = t.due.split("/").map(Number); return new Date("2026-05-15T12:00:00") > new Date(y, m - 1, d); } catch { return false; }
  });
  const active        = processos.filter(p => !p.archived);
  const myProcessos   = active.filter(p => p.owner === userName || p.comm === userName || p.compra === userName);
  const myOpen        = myProcessos.filter(p => p.status < 7);
  const myOverdue     = myProcessos.filter(p => daysLeft(p.deadline) < 0 && p.status < 7);
  const myUrgent      = myProcessos.filter(p => { const d = daysLeft(p.deadline); return d >= 0 && d <= 2 && p.status < 7; });

  const taskStats = [
    { label: "Por fazer",       value: myPorFazer.length,   color: "#94a3b8",     icon: "list",   nav: "/tarefas", filter: "activas" },
    { label: "Activas",         value: myActive.length,     color: THEME.warning, icon: "tasks",  nav: "/tarefas", filter: "activas" },
    { label: "SLA excedido",    value: mySlaBreach.length,  color: THEME.danger,  icon: "alert",  nav: "/tarefas", filter: "activas" },
  ];

  const processStats = [
    { label: "Em aberto",   value: myOpen.length,    color: "#60a5fa",  icon: "layers", nav: "/processos", filter: "open"    },
    { label: "Em atraso",   value: myOverdue.length, color: THEME.danger, icon: "alert", nav: "/processos", filter: "overdue" },
    { label: "Prazo próximo", value: myUrgent.length, color: "#fbbf24", icon: "clock",  nav: "/processos", filter: "urgent"  },
  ];

  // ── Recent activity ────────────────────────────────────────────────────────

  const myActivity = tarefas
    .filter(t => t.owner === userName || t.history?.some(h => h.actor === userName))
    .flatMap(t => (t.history || []).map(h => ({ ...h, taskId: t.id, client: t.client })))
    .filter(h => h.ts)
    .sort((a, b) => (b.ts || "").localeCompare(a.ts || ""))
    .slice(0, 8);

  const allActivity = isPrivileged
    ? tarefas
        .flatMap(t => (t.history || []).map(h => ({ ...h, taskId: t.id, client: t.client })))
        .filter(h => h.ts)
        .sort((a, b) => (b.ts || "").localeCompare(a.ts || ""))
        .slice(0, 8)
    : [];

  // ── StatsBar click → navigate to Processos with filter pre-applied ────────

  function handleStatClick(filterId) {
    navigate("/processos", { state: { statusFilter: filterId } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      {/* Page header */}
      <div style={{ padding: isMobile ? "16px 14px 0" : "20px 24px 0" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Dashboard</h1>
        <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
          Bem-vindo, {userName.split(" ")[0] || "Utilizador"}
        </div>
      </div>

      <div style={{ padding: isMobile ? "12px 14px" : "16px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Tarefas summary ── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            As minhas tarefas
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : `repeat(${taskStats.length},1fr)`, gap: 10 }}>
            {taskStats.map(s => (
              <div
                key={s.label}
                onClick={() => navigate(s.nav, { state: { statusFilter: s.filter } })}
                style={{ textAlign: "center", background: THEME.sidebar, borderRadius: 10, padding: "14px 10px", border: `1px solid ${THEME.border}`, cursor: "pointer", transition: "border-color 0.1s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}66`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.border; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 7, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <Icon name={s.icon} size={14} color={s.color} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.value > 0 ? s.color : THEME.text, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Process overview (StatsBar) ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Visão geral de processos
            </div>
            {!isPrivileged && (
              <button
                onClick={() => setShowAllProcesses(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "3px 10px", fontSize: 11, color: showAllProcesses ? accentColor : THEME.textMuted, cursor: "pointer" }}
              >
                <Icon name="layers" size={11} color={showAllProcesses ? accentColor : THEME.textDim} />
                {showAllProcesses ? "Ver meus" : "Ver todos"}
              </button>
            )}
          </div>
        </div>
      </div>

      <StatsBar
        processos={active}
        myProcessos={myProcessos}
        myTab={!showAllProcesses}
        activeFilter={null}
        onStatClick={handleStatClick}
        accent={accentColor}
      />

      <div style={{ padding: isMobile ? "12px 14px" : "16px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Supervisor widget (admin/supervisor only) ── */}
        {isPrivileged && (
          <SupervisorWidget processos={active} tarefas={tarefas} onOpenTask={onOpenTask} />
        )}

        {/* ── Recent activity ── */}
        {isPrivileged && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Actividade geral
            </div>
            {allActivity.length === 0 ? (
              <div style={{ fontSize: 13, color: THEME.textDim, padding: "16px 0" }}>Sem actividade recente</div>
            ) : (
              <ActivityList items={allActivity} users={users} />
            )}
          </div>
        )}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            {isPrivileged ? "As minhas" : "Actividade recente"}
          </div>
          {myActivity.length === 0 ? (
            <div style={{ fontSize: 13, color: THEME.textDim, padding: "16px 0" }}>Sem actividade recente</div>
          ) : (
            <ActivityList items={myActivity} users={users} />
          )}
        </div>
      </div>

      {/* Bottom spacer for mobile */}
      {isMobile && <div style={{ height: 32 }} />}
    </div>
  );
}
