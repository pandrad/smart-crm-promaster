import { useState, useEffect } from "react";
import { Icon } from "../icons.jsx";
import { THEME } from "../theme.js";
import { MOCK_TOAST } from "../mock/data.js";
import { TYPE_COLORS } from "../pages/Tarefas.jsx";

export function Toast({ currentUser }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const tc = TYPE_COLORS[MOCK_TOAST.type] || TYPE_COLORS["Diversos"];

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: THEME.card, border: `1px solid ${THEME.border}`,
      borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      padding: 16, width: 320, zIndex: 60,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: tc.bg, border: `1px solid ${tc.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="tasks" size={16} color={tc.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.text }}>Nova tarefa atribuída</span>
            <button onClick={() => setVisible(false)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textDim, padding: 0, flexShrink: 0 }}>
              <Icon name="x" size={13} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
            Para: <strong style={{ color: THEME.text }}>{currentUser?.name || "—"}</strong>
            <span style={{ color: THEME.textDim }}> · por {MOCK_TOAST.assignedBy}</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", marginTop: 6, padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: tc.bg, color: tc.color }}>
            {MOCK_TOAST.type}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, marginTop: 5 }}>{MOCK_TOAST.client}</div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {MOCK_TOAST.note}
          </div>
          <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 6, fontFamily: "monospace" }}>
            #{MOCK_TOAST.taskId}
          </div>
        </div>
      </div>
    </div>
  );
}
