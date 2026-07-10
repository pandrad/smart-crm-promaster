import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { daysLeft, useWindowSize } from "../utils.js";
import { StatsBar } from "../components/StatsBar.jsx";
import { SupervisorWidget } from "../components/SupervisorWidget.jsx";
import { Avatar, Tag } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";
import { getUnacknowledgedAckCount } from "./Tarefas.jsx";

function ActivityList({ items, users }) {
  return (
    <div style={{ background: THEME.card, overflow: "hidden" }}>
      {items.map((h, i) => {
        // Fall back to owner-at-time for the avatar/name shown whenever an
        // entry has no actor recorded (older pre-fix process entries only).
        const displayActor = h.actor || h.ownerAtTime || "?";
        const u = users.find(usr => usr.name === displayActor);
        // Task entries carry a short `action` label (e.g. "Concluído") shown
        // as a tag, with the longer detail in `note`. Process timeline entries
        // only have one combined descriptive string in `action` — shown as
        // the detail line directly, with no redundant tag. Discriminated by
        // `kind`, not by presence of `actor` — both entry types now carry a
        // real actor field.
        const hasShortAction = h.kind === "task";
        return (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderBottom: i < items.length - 1 ? `1px solid ${THEME.borderLight}` : "none" }}>
            <Avatar name={displayActor} size={24} photo={u?.photo} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: THEME.textDim }}>{h.recordId}</span>
                {hasShortAction && <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{h.actor}</span>}
                {hasShortAction && <Tag bg={THEME.sidebar} color={THEME.textDim} style={{ fontSize: 10 }}>{h.action}</Tag>}
                <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: "auto", flexShrink: 0 }}>{h.ts}</span>
              </div>
              {hasShortAction && h.note && (
                <div style={{ fontSize: 11, color: THEME.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {h.note.split("\n")[0]}
                </div>
              )}
              {!hasShortAction && (
                <div style={{ fontSize: 11, color: THEME.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {h.action}
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
  const [activityView,     setActivityView]     = useState("mine");

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
  // "Mine" is based on respActual (who currently has the process), not owner
  // (Resp. Cotação), since owner is now a frozen historical field that no
  // longer necessarily reflects who is actively working the process today —
  // consistent with the same change already applied in Processos.jsx/Tarefas.jsx.
  const myProcessos   = active.filter(p => p.respActual === userName || p.comm === userName || p.compra === userName);
  const myOpen        = myProcessos.filter(p => p.status < 8);
  const myOverdue     = myProcessos.filter(p => daysLeft(p.deadline) < 0 && p.status < 8);
  const myUrgent      = myProcessos.filter(p => { const d = daysLeft(p.deadline); return d >= 0 && d <= 2 && p.status < 8; });

  const myAckCount = getUnacknowledgedAckCount(processos, userName);

  const taskStats = [
    { label: "Por fazer",       value: myPorFazer.length,   color: "#94a3b8",     icon: "list",   nav: "/tarefas", filter: "activas" },
    { label: "Activas",         value: myActive.length,     color: THEME.warning, icon: "tasks",  nav: "/tarefas", filter: "activas" },
    { label: "SLA excedido",    value: mySlaBreach.length,  color: THEME.danger,  icon: "alert",  nav: "/tarefas", filter: "activas" },
    { label: "Notificações",    value: myAckCount,          color: THEME.warning, icon: "alert",  nav: "/tarefas", filter: "activas" },
  ];

  const processStats = [
    { label: "Em aberto",   value: myOpen.length,    color: "#60a5fa",  icon: "layers", nav: "/processos", filter: "open"    },
    { label: "Em atraso",   value: myOverdue.length, color: THEME.danger, icon: "alert", nav: "/processos", filter: "overdue" },
    { label: "Prazo próximo", value: myUrgent.length, color: "#fbbf24", icon: "clock",  nav: "/processos", filter: "urgent"  },
  ];

  // ── Recent activity ────────────────────────────────────────────────────────

  // Combines both tasks (t.history) and processes (p.timeline) into one feed —
  // "actividade recente" must reflect every action the user takes anywhere in
  // the app, not just task actions. Each drawer's own history/timeline display
  // is untouched; this is purely an aggregation for the Dashboard feed.
  //
  // Task and process entries use different shapes at the source (task history:
  // { actor, action, note, ts }; process timeline: { icon, color, time, text },
  // with no explicit actor — the acting user is only baked into `text`).
  // normaliseTask / normaliseProcesso below map both onto one common display
  // shape consumed by ActivityList: { ts, actor, action, note, recordId }.
  //
  // Process timeline entries now carry a real actor field (added alongside
  // this fix — see DetailDrawer.jsx, every entries.push(...)/entry literal),
  // so personal-view filtering can match on it directly instead of only
  // falling back to current ownership. Both conditions are independent, not
  // either/or: an entry qualifies if the user was the actor who performed
  // that specific action, OR the record currently belongs to them — so an
  // action that hands a process off to someone else still shows up in the
  // acting user's own feed, exactly like task entries already work via
  // (actor === userName || taskOwner === userName).
  function normaliseTask(t) {
    return (t.history || []).map(h => ({
      ts: h.ts, actor: h.actor, action: h.action, note: h.note, kind: "task",
      recordId: t.id, client: t.client, ownerAtTime: t.owner,
    }));
  }

  function normaliseProcesso(p) {
    return (p.timeline || []).map(h => ({
      ts: h.time, actor: h.actor || null, action: h.text, note: null, kind: "processo",
      recordId: p.id, client: p.client,
      ownerAtTime: p.respActual || p.owner || p.comm || p.compra,
    }));
  }

  // Personal view must only show entries the current user is actually part of —
  // where they were the actor, or they were the record's owner at the time of
  // the entry. History entries don't store an owner snapshot, so "owner at the
  // time" is approximated as the record's current owner: correct for every
  // entry after the last reassignment, which is what matters for a recent-
  // activity feed. Filtering per-entry (not per-record) prevents a record the
  // user merely touched once, or currently owns, from leaking every other
  // person's entries on it.
  const myActivity = [...tarefas.flatMap(normaliseTask), ...processos.flatMap(normaliseProcesso)]
    .filter(h => h.ts && (h.actor === userName || h.ownerAtTime === userName))
    .sort((a, b) => (b.ts || "").localeCompare(a.ts || ""))
    .slice(0, 20);

  const allActivity = isPrivileged
    ? [...tarefas.flatMap(normaliseTask), ...processos.flatMap(normaliseProcesso)]
        .filter(h => h.ts)
        .sort((a, b) => (b.ts || "").localeCompare(a.ts || ""))
        .slice(0, 20)
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
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {isPrivileged && activityView === "all" ? "Actividade geral" : "Actividade recente"}
            </div>
            {isPrivileged && (
              <div style={{ display: "flex", gap: 0, border: `1px solid ${THEME.border}`, borderRadius: 7, overflow: "hidden" }}>
                {[{ id: "mine", label: "As Minhas" }, { id: "all", label: "Geral" }].map(v => (
                  <button key={v.id} onClick={() => setActivityView(v.id)}
                    style={{ padding: "3px 10px", fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer",
                      background: activityView === v.id ? `${accentColor}22` : "transparent",
                      color: activityView === v.id ? accentColor : THEME.textMuted }}>
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {(() => {
            const items = isPrivileged && activityView === "all" ? allActivity : myActivity;
            if (items.length === 0) return <div style={{ fontSize: 13, color: THEME.textDim, padding: "16px 0" }}>Sem actividade recente</div>;
            return (
              <div style={{ maxHeight: 280, overflowY: "auto", borderRadius: 12, border: `1px solid ${THEME.border}` }}>
                <ActivityList items={items} users={users} />
              </div>
            );
          })()}
        </div>
      </div>

      {/* Bottom spacer for mobile */}
      {isMobile && <div style={{ height: 32 }} />}
    </div>
  );
}
