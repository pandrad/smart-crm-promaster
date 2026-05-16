import { Icon } from "../icons.jsx";
import { daysLeft } from "../utils.js";

// processos     — full list (for overall totals)
// myProcessos   — user-filtered list (used when myTab is active)
// myTab         — whether "Meus processos" is active
// activeFilter  — current filter id
// onStatClick   — callback(filterId | null)
export function StatsBar({ processos, myProcessos, myTab, activeFilter, onStatClick }) {
  const src = myTab ? myProcessos : processos;

  const overdue = src.filter(p => daysLeft(p.deadline) < 0 && p.status < 6).length;
  const urgent  = src.filter(p => { const d = daysLeft(p.deadline); return d >= 0 && d <= 2 && p.status < 6; }).length;
  const open    = src.filter(p => p.status < 6).length;
  const won     = src.filter(p => p.status === 6).length;
  const total   = src.length;

  const stats = [
    { id: null,      label: "Todos",        value: total,   icon: "list",     color: "#475569", bg: "#f1f5f9" },
    { id: "open",    label: "Em Aberto",    value: open,    icon: "layers",   color: "#2563eb", bg: "#dbeafe" },
    { id: "overdue", label: "Em Atraso",    value: overdue, icon: "alert",    color: "#dc2626", bg: "#fee2e2" },
    { id: "urgent",  label: "Urgentes",     value: urgent,  icon: "clock",    color: "#d97706", bg: "#fef3c7" },
    { id: "won",     label: "Ganhos (mês)", value: won,     icon: "trending", color: "#16a34a", bg: "#dcfce7" },
  ];

  return (
    <div style={{ padding: "16px 24px 0", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
      {stats.map(s => {
        const isActive = activeFilter === s.id || (s.id === null && activeFilter === null) || (s.id === "won" && activeFilter === "6");
        return (
          <div
            key={s.label}
            onClick={() => onStatClick(isActive ? null : s.id)}
            style={{
              background: "white", borderRadius: 12,
              border: isActive ? `2px solid ${s.color}` : "1px solid #f1f5f9",
              padding: isActive ? "11px 15px" : "12px 16px",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", transition: "all 0.12s",
              boxShadow: isActive ? `0 0 0 3px ${s.color}18` : "none",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = s.color + "55"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = "#f1f5f9"; }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={s.icon} size={15} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: isActive ? s.color : "#94a3b8", marginTop: 2, fontWeight: isActive ? 600 : 400 }}>{s.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
