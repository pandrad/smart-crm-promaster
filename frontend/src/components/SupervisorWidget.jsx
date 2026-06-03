import { THEME } from "../theme.js";
import { daysLeft, useWindowSize } from "../utils.js";
import { Icon } from "../icons.jsx";
import { Tag } from "./Primitives.jsx";
import { getTypeColor } from "../pages/Tarefas.jsx";

export function SupervisorWidget({ processos, tarefas, onOpenTask }) {
  const { isMobile } = useWindowSize();
  const month = 5;
  const year  = 2026;

  const openedThisMonth = processos.filter(p => {
    const [, mm, yy] = (p.created || "").split("/").map(Number);
    return mm === month && yy === year;
  }).length;

  const closedThisMonth = processos.filter(p => {
    const [, mm, yy] = (p.created || "").split("/").map(Number);
    return mm === month && yy === year && (p.status === 7 || p.status === 10);
  }).length;

  const overdueNow   = processos.filter(p => daysLeft(p.deadline) < 0 && p.status < 7).length;
  const escalated    = (tarefas || []).filter(t => t.status === "Escalado");
  const activeTasks  = (tarefas || []).filter(t =>
    t.status === "Por Fazer" || t.status === "Em Curso" || t.status === "Bloqueado"
  ).length;

  const mostOverdue = processos
    .filter(p => daysLeft(p.deadline) < 0 && p.status < 7)
    .sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline))
    .slice(0, 3);

  return (
    <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Section label */}
      <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Resumo de supervisão
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 10 }}>
        {[
          { label: "Abertos mês",   value: openedThisMonth, color: THEME.info    },
          { label: "Fechados mês",  value: closedThisMonth, color: THEME.success },
          { label: "Em atraso",     value: overdueNow,      color: THEME.danger  },
          { label: "Tarefas activas", value: activeTasks,   color: THEME.warning },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center", background: THEME.sidebar, borderRadius: 8, padding: "10px 8px", border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Escalated tasks — separate section */}
      {escalated.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#e879f9", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="escalate" size={11} color="#e879f9" />
            Tarefas escaladas ({escalated.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {escalated.map(t => {
              const tc = getTypeColor(t.type);
              // Find who escalated (last "Escalada" history entry actor)
              const escalatedBy = [...(t.history || [])].reverse().find(h => h.action === "Escalada")?.actor || "—";
              return (
                <div
                  key={t.id}
                  onClick={() => onOpenTask?.(t)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 11px", background: "#1a0a1a", border: "1px solid #e879f933", borderRadius: 8, cursor: onOpenTask ? "pointer" : "default" }}
                  onMouseEnter={e => { if (onOpenTask) e.currentTarget.style.background = "#2d0a2d"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#1a0a1a"; }}
                >
                  <Tag bg={tc.bg} color={tc.color} style={{ flexShrink: 0, marginTop: 1 }}>{t.type}</Tag>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.client || t.id}
                      <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: 6 }}>escalada por {escalatedBy}</span>
                    </div>
                    {t.escalationNote && (
                      <div style={{ fontSize: 11, color: "#f0abfc", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.escalationNote}
                      </div>
                    )}
                  </div>
                  {onOpenTask && <Icon name="chevron" size={13} color={THEME.textDim} style={{ flexShrink: 0, marginTop: 2 }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most overdue processes */}
      {mostOverdue.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Processos mais atrasados</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mostOverdue.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: THEME.textMuted, flexShrink: 0 }}>{p.id}</span>
                <span style={{ fontSize: 11, color: THEME.textMuted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.client}</span>
                <span style={{ fontSize: 11, color: THEME.danger, fontWeight: 600, flexShrink: 0 }}>{Math.abs(daysLeft(p.deadline))}d atraso</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
