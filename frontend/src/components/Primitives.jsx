import { daysLeft } from "../data.js";
import { store } from "../store.js";

const AVATAR_PALETTE = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];

export function Avatar({ name, size = 26, photo }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
  const bg = AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
  return (
    <div title={name} style={{ background: bg, width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
      {photo ? <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

export function UrgencyTag({ deadline }) {
  const d = daysLeft(deadline);
  if (d < 0)   return <Tag bg="#fee2e2" color="#dc2626">⚠ {Math.abs(d)}d atraso</Tag>;
  if (d === 0) return <Tag bg="#fef3c7" color="#b45309">Hoje</Tag>;
  if (d <= 2)  return <Tag bg="#ffedd5" color="#c2410c">{d}d</Tag>;
  return              <Tag bg="#f0fdf4" color="#15803d">{d}d</Tag>;
}

// Always read from store so admin edits are reflected immediately
export function StageBadge({ id }) {
  const stages = store.getStages();
  const s = stages.find(x => x.id === id);
  return s ? <Tag bg={s.bg} color={s.color}>{s.label}</Tag> : null;
}

export function FUBadge({ label }) {
  const list = store.getFUStatuses();
  const s = list.find(x => x.label === label);
  return <Tag bg={s?.bg ?? "#f1f5f9"} color={s?.color ?? "#64748b"}>{label}</Tag>;
}

export function Tag({ bg, color, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", background: bg, color, ...style }}>
      {children}
    </span>
  );
}

export function PriorityDot({ priority }) {
  return (
    <span title={priority} style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: priority === "Alta" ? "#ef4444" : "#cbd5e1" }} />
  );
}
