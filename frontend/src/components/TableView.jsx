import { daysLeft } from "../data.js";
import { Avatar, UrgencyTag, StageBadge, FUBadge, PriorityDot } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

const TH = ({ children }) => (
  <th style={{
    padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap",
  }}>
    {children}
  </th>
);

export function TableView({ rows, onSelect, users = [] }) {
  const photoOf = name => users.find(u => u.name === name)?.photo;
  return (
    <div style={{ padding: "0 24px 32px" }}>
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #f1f5f9", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
              <TH>Nº</TH><TH>Criado</TH><TH>Prazo</TH><TH>Prio</TH><TH>Estado</TH>
              <TH>Follow Up</TH><TH>Cliente</TH><TH>Marca</TH><TH>Modelo</TH>
              <TH>Resp. Cotação</TH><TH>Resp. Comercial</TH><TH>Requerente</TH><TH>Valor</TH><TH>Emails</TH>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                style={{ borderBottom: "1px solid #f8fafc", cursor: "pointer", background: "white" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
              >
                <td style={{ padding: "10px 12px", fontSize: 11, fontFamily: "monospace", color: "#94a3b8" }}>{p.id}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>{p.created}</td>
                <td style={{ padding: "10px 12px" }}><UrgencyTag deadline={p.deadline} /></td>
                <td style={{ padding: "10px 12px" }}><PriorityDot priority={p.priority} /></td>
                <td style={{ padding: "10px 12px" }}><StageBadge id={p.status} /></td>
                <td style={{ padding: "10px 12px" }}><FUBadge label={p.fu} /></td>
                <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "#1e293b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.client}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>{p.brand}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>{p.model || "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar name={p.owner} size={24} photo={photoOf(p.owner)} />
                    <span style={{ fontSize: 12, color: "#475569" }}>{p.owner.split(" ")[0]}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar name={p.comm} size={24} photo={photoOf(p.comm)} />
                    <span style={{ fontSize: 12, color: "#475569" }}>{p.comm.split(" ")[0]}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>{p.req}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: p.price ? 600 : 400, color: p.price ? "#1e293b" : "#94a3b8" }}>
                  {p.price ? "€" + p.price.toLocaleString("pt-PT") : "—"}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94a3b8" }}>
                    <Icon name="mail" size={11} />{p.emails}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0", fontSize: 13 }}>
            Nenhum processo encontrado
          </p>
        )}
      </div>
    </div>
  );
}
