import { useState } from "react";
import { THEME } from "../theme.js";
import { useWindowSize } from "../utils.js";
import { StageBadge } from "../components/Primitives.jsx";
import { Icon } from "../icons.jsx";

export function Arquivo({ processos, onSelectProcesso }) {
  const { isMobile } = useWindowSize();
  const [search, setSearch] = useState("");

  const archived = processos.filter(p => p.archived);

  const rows = archived.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [p.client, p.brand, p.model, p.id, p.comprador].some(v => v && String(v).toLowerCase().includes(q));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      <div style={{ padding: isMobile ? "16px 14px 0" : "20px 24px 0" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Arquivo</h1>
        <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>Processos arquivados (mais de 3 anos) · {archived.length} registos</div>
      </div>

      <div style={{ padding: isMobile ? "10px 14px" : "12px 24px" }}>
        <div style={{ position: "relative", width: isMobile ? "100%" : 240 }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: THEME.textDim, pointerEvents: "none" }}><Icon name="search" size={13} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar arquivo…"
            style={{ paddingLeft: 28, paddingRight: 10, paddingTop: isMobile ? 10 : 6, paddingBottom: isMobile ? 10 : 6, fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", width: "100%", background: THEME.card, color: THEME.text, boxSizing: "border-box" }}
          />
        </div>
      </div>

      <div style={{ margin: isMobile ? "0 14px 12px" : "0 24px 12px", background: THEME.sidebar, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="archive" size={14} color={THEME.textDim} />
        <span style={{ fontSize: 12, color: THEME.textDim }}>Processos arquivados são só de leitura e não aparecem na lista principal.</span>
      </div>

      {isMobile ? (
        <div style={{ padding: "0 14px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.length === 0 && <p style={{ textAlign: "center", color: THEME.textDim, padding: "40px 0", fontSize: 13 }}>{search ? "Nenhum registo encontrado" : "Sem processos arquivados"}</p>}
          {rows.map(p => (
            <div key={p.id} onClick={() => onSelectProcesso(p)} style={{ background: THEME.card, borderRadius: 10, border: `1px solid ${THEME.border}`, padding: "12px 14px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: THEME.textDim }}>{p.id}</span>
                <StageBadge id={p.status} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text, marginBottom: 2 }}>{p.client}</div>
              {(p.brand || p.model) && <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 4 }}>{[p.brand, p.model].filter(Boolean).join(" · ")}</div>}
              <div style={{ fontSize: 11, color: THEME.textDim }}>{p.created}{p.price ? ` · €${p.price.toLocaleString("pt-PT")}` : ""}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "0 24px 32px" }}>
          <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: THEME.sidebar, borderBottom: `1px solid ${THEME.border}` }}>
                  {["Nº", "Criado", "Estado", "Cliente", "Comprador", "Marca", "Modelo", "Valor"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(p => (
                  <tr key={p.id} onClick={() => onSelectProcesso(p)}
                    style={{ borderBottom: `1px solid ${THEME.borderLight}`, cursor: "pointer", background: THEME.bg }}
                    onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = THEME.bg; }}
                  >
                    <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 11, color: THEME.textDim }}>{p.id}</td>
                    <td style={{ padding: "9px 12px", fontSize: 11, color: THEME.textDim }}>{p.created}</td>
                    <td style={{ padding: "9px 12px" }}><StageBadge id={p.status} /></td>
                    <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, color: THEME.text }}>{p.client}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: THEME.textMuted }}>{p.comprador || "—"}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: THEME.textMuted }}>{p.brand}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: THEME.textMuted }}>{p.model || "—"}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: p.price ? 600 : 400, color: p.price ? THEME.text : THEME.border }}>
                      {p.price ? "€" + p.price.toLocaleString("pt-PT") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p style={{ textAlign: "center", color: THEME.textDim, padding: "40px 0", fontSize: 13 }}>
                {search ? "Nenhum registo encontrado" : "Sem processos arquivados"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
