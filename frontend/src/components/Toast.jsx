import { useState, useEffect } from "react";
import { Icon } from "../icons.jsx";
import { THEME } from "../theme.js";
import { MOCK_TOAST } from "../mock/data.js";

export function Toast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: THEME.card, border: `1px solid ${THEME.border}`,
      borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      padding: 16, width: 320, zIndex: 60,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="mail" size={16} color="#60a5fa" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.text }}>Novo email detectado</span>
            <button onClick={() => setVisible(false)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textDim, padding: 0 }}>
              <Icon name="x" size={13} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
            De: <strong style={{ color: THEME.text }}>{MOCK_TOAST.sender}</strong>
          </div>
          <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
            "{MOCK_TOAST.excerpt}"
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <Tag bg="#1e3a5f" color="#60a5fa">🤖 {MOCK_TOAST.equipment}</Tag>
            {MOCK_TOAST.isNew && <Tag bg={THEME.successBg} color={THEME.success}>Novo cliente</Tag>}
          </div>
          <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 6 }}>
            Processo criado automaticamente → #{MOCK_TOAST.processId}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ bg, color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: bg, color }}>
      {children}
    </span>
  );
}
