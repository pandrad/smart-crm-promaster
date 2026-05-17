import { THEME } from "../theme.js";
import { daysLeft } from "../utils.js";
import { Icon } from "../icons.jsx";

// Full implementation in Phase C
export function SupervisorWidget({ processos, tarefas }) {
  const now      = new Date("2026-05-15"); // mock today
  const month    = 5;
  const year     = 2026;

  const openedThisMonth  = processos.filter(p => {
    const [, mm, yy] = (p.created || "").split("/").map(Number);
    return mm === month && yy === year;
  }).length;

  const closedThisMonth  = processos.filter(p => {
    const [, mm, yy] = (p.created || "").split("/").map(Number);
    return mm === month && yy === year && (p.status === 7 || p.status === 10);
  }).length;

  const overdueNow = processos.filter(p => daysLeft(p.deadline) < 0 && p.status < 7).length;
  const tasksPending = (tarefas || []).filter(t => t.status === "Pendente").length;

  const mostOverdue = processos
    .filter(p => daysLeft(p.deadline) < 0 && p.status < 7)
    .sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline))
    .slice(0, 3);

  return (
    <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
        Resumo de supervisão
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: mostOverdue.length ? 14 : 0 }}>
        {[
          { label: "Abertos mês",    value: openedThisMonth,  color: THEME.info    },
          { label: "Fechados mês",   value: closedThisMonth,  color: THEME.success },
          { label: "Em atraso",      value: overdueNow,       color: THEME.danger  },
          { label: "Tarefas pend.",  value: tasksPending,     color: THEME.warning },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {mostOverdue.length > 0 && (
        <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Mais atrasados</div>
          {mostOverdue.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: THEME.textMuted }}>{p.id}</span>
              <span style={{ fontSize: 11, color: THEME.textMuted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.client}</span>
              <span style={{ fontSize: 11, color: THEME.danger, fontWeight: 600, flexShrink: 0 }}>{Math.abs(daysLeft(p.deadline))}d atraso</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
