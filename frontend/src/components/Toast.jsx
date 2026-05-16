import { useState, useEffect } from "react";
import { Icon } from "../icons.jsx";

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
      background: "white", border: "1px solid #e2e8f0",
      borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      padding: 16, width: 320, zIndex: 60,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: "#dbeafe",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon name="mail" size={16} color="#2563eb" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Novo email detectado</span>
            <button
              onClick={() => setVisible(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}
            >
              <Icon name="x" size={13} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            De: <strong>carlos.menezes@terramovida.pt</strong>
          </div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
            "Solicito cotação urgente para VOLVO EC480E…"
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: "#e0f2fe", color: "#0369a1" }}>
              🤖 VOLVO EC480E
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: "#dcfce7", color: "#15803d" }}>
              Novo cliente
            </span>
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
            Processo criado automaticamente → #2004631
          </div>
        </div>
      </div>
    </div>
  );
}
