import { Icon } from "../icons.jsx";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { daysLeft, useWindowSize } from "../utils.js";

// ── Process SLA breach — must match the exact logic already used everywhere
// else in the app (Dashboard.jsx, Tarefas.jsx, Processos.jsx, TableView.jsx's
// red ⚠ Data Limite indicator): due date = p.created + the admin-configured
// SLA duration for the process's *current* status, not p.deadline. ──────────
function isProcessoSlaBreach(p) {
  const sla = store.getSLASettings();
  const entry = sla.processoStatus?.[p.status];
  if (!entry || !entry.value) return false;
  try {
    const [d, m, y] = p.created.split("/").map(Number);
    const base = new Date(y, m - 1, d);
    const ms = entry.unit === "dias" ? entry.value * 86400000 : entry.value * 3600000;
    const due = new Date(base.getTime() + ms);
    return due < new Date();
  } catch { return false; }
}

// processos     — full visible (non-archived) list
// myProcessos   — user-filtered list (when myTab is active)
// myTab         — whether "Meus processos" is active
// activeFilter  — current filter id (null = Todos)
// onStatClick   — callback(filterId | null)
// accent        — branding accent override
export function StatsBar({ processos, myProcessos, myTab, activeFilter, onStatClick, accent }) {
  const { isMobile } = useWindowSize();
  const src = myTab ? myProcessos : processos;
  const accentColor = accent || THEME.accent;

  // "Em Atraso" now counts SLA breach — same calculation as Tempo Excedido
  // (and TableView.jsx's red ⚠ Data Limite indicator) — not the old
  // deadline-based daysLeft() comparison.
  const overdue  = src.filter(isProcessoSlaBreach).length;
  const urgent   = src.filter(p => { const d = daysLeft(p.deadline); return d >= 0 && d <= 2 && p.status < 8; }).length;
  const open     = src.filter(p => p.status < 8).length;
  const won      = src.filter(p => p.status === 12).length;
  const carryover = src.filter(p => p.carryover === true && p.status < 8).length;
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
    <div style={{ padding: isMobile ? "12px 14px 0" : "16px 24px 0", display: "flex", gap: 10, overflowX: isMobile ? "auto" : "visible", flexWrap: isMobile ? "nowrap" : "wrap", paddingBottom: isMobile ? 4 : 0 }}>
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
              flex: isMobile ? "0 0 auto" : 1,
              minWidth: isMobile ? 120 : "auto",
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
