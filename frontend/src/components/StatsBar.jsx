import { Icon } from "../icons.jsx";
import { THEME } from "../theme.js";
import { daysLeft } from "../utils.js";

// processos     — full visible (non-archived) list
// myProcessos   — user-filtered list (when myTab is active)
// myTab         — whether "Meus processos" is active
// activeFilter  — current filter id (null = Todos)
// onStatClick   — callback(filterId | null)
// accent        — branding accent override
export function StatsBar({ processos, myProcessos, myTab, activeFilter, onStatClick, accent }) {
  const src = myTab ? myProcessos : processos;
  const accentColor = accent || THEME.accent;

  const overdue  = src.filter(p => daysLeft(p.deadline) < 0 && p.status < 7).length;
  const urgent   = src.filter(p => { const d = daysLeft(p.deadline); return d >= 0 && d <= 2 && p.status < 7; }).length;
  const open     = src.filter(p => p.status < 7).length;
  // Ganhos = status Encomenda (id 10)
  const won      = src.filter(p => p.status === 10).length;
  const carryover = src.filter(p => p.carryover === true && p.status < 7).length;
  const total    = src.length;

  const stats = [
    { id: null,     label: "Todos",        value: total,    icon: "list",     color: THEME.textMuted, bg: THEME.card },
    { id: "open",   label: "Em Aberto",    value: open,     icon: "layers",   color: "#60a5fa",       bg: "#1e3a5f" },
    { id: "overdue",label: "Em Atraso",    value: overdue,  icon: "alert",    color: THEME.danger,    bg: THEME.dangerBg },
    { id: "urgent", label: "Urgentes",     value: urgent,   icon: "clock",    color: THEME.warning,   bg: THEME.warningBg },
    { id: "won",    label: "Ganhos",       value: won,      icon: "trending", color: THEME.success,   bg: THEME.successBg },
    // Transitados: processes carried over from previous month, visually distinct
    { id: "carry",  label: "Transitados",  value: carryover,icon: "trending", color: THEME.textDim,   bg: THEME.sidebar, muted: true },
  ];

  return (
    <div style={{ padding: "16px 24px 0", display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
      {stats.map(s => {
        const isActive = activeFilter === s.id;
        return (
          <div
            key={s.label}
            onClick={() => onStatClick(isActive ? null : s.id)}
            style={{
              background: s.bg,
              borderRadius: 10,
              border: isActive ? `2px solid ${s.color}` : `1px solid ${THEME.border}`,
              padding: isActive ? "10px 12px" : "11px 13px",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", transition: "all 0.12s",
              boxShadow: isActive ? `0 0 0 3px ${s.color}20` : "none",
              opacity: s.muted ? 0.75 : 1,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = `${s.color}66`; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = THEME.border; }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 7, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={s.icon} size={14} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: isActive ? s.color : THEME.textDim, marginTop: 2, fontWeight: isActive ? 600 : 400, lineHeight: 1.2 }}>
                {s.label}
                {s.muted && <span style={{ display: "block", fontSize: 9, color: THEME.textDim }}>Mês ant.</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
