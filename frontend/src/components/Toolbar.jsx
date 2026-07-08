import { useState, useRef, useEffect } from "react";
import { Icon } from "../icons.jsx";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { useWindowSize } from "../utils.js";

const ALL_COLUMNS = [
  { key: "id",       label: "Nº"              },
  { key: "created",  label: "Criado"          },
  { key: "deadline", label: "Prazo"           },
  { key: "priority", label: "Prio"            },
  { key: "status",   label: "Estado"          },
  { key: "fu",       label: "Follow Up"       },
  { key: "client",   label: "Cliente"         },
  { key: "brand",    label: "Marca"           },
  { key: "model",    label: "Modelo"          },
  { key: "respActual",   label: "Resp. Actual"    },
  { key: "respAbertura", label: "Resp. Abertura"  },
  { key: "owner",        label: "Resp. Cotação"   },
  { key: "comm",         label: "Resp. Comercial" },
  { key: "comprador",label: "Comprador"       },
  { key: "price",    label: "Valor"           },
  { key: "emails",   label: "Emails"          },
];

const BTN = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 12px", fontSize: 12, fontWeight: 500,
  border: `1px solid ${THEME.border}`, borderRadius: 7,
  background: "transparent", color: THEME.textMuted, cursor: "pointer",
  transition: "background 0.1s",
};

export function Toolbar({ view, setView, search, setSearch, ownerFilter, setOwnerFilter, commFilter, setCommFilter, statusFilter, setStatusFilter, onFilterChange, currentUser }) {
  const { isMobile } = useWindowSize();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const stages  = store.getStages();
  // Resp. Cotação / Resp. Comercial are role assignments tracked in
  // crm_user_roles (role ids "resp-cotacao"/"resp-comercial"), not the legacy
  // user.role field (which only ever holds "admin"/"supervisor"/etc. for
  // permission checks) — resolveRoleUsers is the correct lookup here.
  const cotacaoOwners   = store.resolveRoleUsers("resp-cotacao").map(u => u.name);
  const comercialOwners = store.resolveRoleUsers("resp-comercial").map(u => u.name);

  // Column visibility
  const savedPrefs = store.getColumnPrefs(currentUser?.email);
  const defaultHidden = new Set(["fu"]); // FU hidden by default until status >= 9 filter
  const [hiddenCols, setHiddenCols] = useState(() => new Set(savedPrefs?.hidden ?? []));
  const [colPopoverOpen, setColPopoverOpen] = useState(false);
  const colPopoverRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (colPopoverRef.current && !colPopoverRef.current.contains(e.target)) setColPopoverOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleCol(key) {
    setHiddenCols(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      store.saveColumnPrefs(currentUser?.email, { hidden: [...next] });
      return next;
    });
  }

  function wrap(setter) {
    return v => { setter(v); onFilterChange?.(); };
  }

  const SEL = { fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, padding: "6px 10px", background: THEME.card, color: THEME.textMuted, outline: "none", cursor: "pointer" };

  const filterControls = (
    <>
      <select value={ownerFilter} onChange={e => wrap(setOwnerFilter)(e.target.value)} style={{ ...SEL, ...(isMobile ? { padding: "12px 10px", fontSize: 13, width: "100%" } : {}) }}>
        <option value="Todos">Resp. Cotação: Todos</option>
        {cotacaoOwners.map(o => <option key={o}>{o}</option>)}
      </select>
      <select value={commFilter} onChange={e => wrap(setCommFilter)(e.target.value)} style={{ ...SEL, ...(isMobile ? { padding: "12px 10px", fontSize: 13, width: "100%" } : {}) }}>
        <option value="Todos">Resp. Comercial: Todos</option>
        {comercialOwners.map(o => <option key={o}>{o}</option>)}
      </select>
      <select value={statusFilter ?? "Todos"} onChange={e => { const v = e.target.value; wrap(setStatusFilter)(v === "Todos" ? null : v); }} style={{ ...SEL, ...(isMobile ? { padding: "12px 10px", fontSize: 13, width: "100%" } : {}) }}>
        <option value="Todos">Todos os estados</option>
        {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </>
  );

  return (
    <div style={{ padding: isMobile ? "10px 14px" : "10px 24px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8, alignItems: isMobile ? "stretch" : "center", flexWrap: "wrap" }}>

      {/* Search — full width on mobile */}
      <div style={{ position: "relative", width: isMobile ? "100%" : "auto" }}>
        <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: THEME.textDim, pointerEvents: "none" }}>
          <Icon name="search" size={13} />
        </span>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); onFilterChange?.(); }}
          placeholder="Pesquisar…"
          style={{ paddingLeft: 28, paddingRight: 10, paddingTop: isMobile ? 10 : 6, paddingBottom: isMobile ? 10 : 6, fontSize: 12, border: `1px solid ${THEME.border}`, borderRadius: 7, outline: "none", width: isMobile ? "100%" : 190, background: THEME.card, color: THEME.text, boxSizing: "border-box" }}
        />
      </div>

      {/* Mobile: Filtros button row */}
      {isMobile ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setFiltersOpen(true)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", fontSize: 13, fontWeight: 500, border: `1px solid ${THEME.border}`, borderRadius: 7, background: (ownerFilter !== "Todos" || commFilter !== "Todos" || statusFilter) ? `${THEME.accent}22` : "transparent", color: (ownerFilter !== "Todos" || commFilter !== "Todos" || statusFilter) ? THEME.accent : THEME.textMuted, cursor: "pointer", minHeight: 44 }}
          >
            <Icon name="filter-col" size={14} color={(ownerFilter !== "Todos" || commFilter !== "Todos" || statusFilter) ? THEME.accent : THEME.textMuted} />
            Filtros {(ownerFilter !== "Todos" || commFilter !== "Todos" || statusFilter) ? "·" : ""}
          </button>
          {/* View toggle */}
          <div style={{ display: "flex", border: `1px solid ${THEME.border}`, borderRadius: 8, overflow: "hidden" }}>
            {[["table", "list"], ["kanban", "columns"]].map(([v, ic]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 14px", border: "none", cursor: "pointer", background: view === v ? THEME.accent : "transparent", color: view === v ? "white" : THEME.textMuted, minHeight: 44 }}>
                <Icon name={ic} size={15} color={view === v ? "white" : THEME.textMuted} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {filterControls}

          {/* Column visibility toggle — desktop only */}
          <div style={{ position: "relative" }} ref={colPopoverRef}>
            <button
              onClick={() => setColPopoverOpen(v => !v)}
              style={{ ...BTN, background: colPopoverOpen ? THEME.sidebarHover : "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
              onMouseLeave={e => { if (!colPopoverOpen) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name="eye" size={13} color={THEME.textMuted} /> Colunas
            </button>
            {colPopoverOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "8px 0", zIndex: 90, minWidth: 180, boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
                {ALL_COLUMNS.map(col => {
                  const hidden = hiddenCols.has(col.key);
                  return (
                    <label key={col.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <input type="checkbox" checked={!hidden} onChange={() => toggleCol(col.key)} style={{ accentColor: THEME.accent }} />
                      <span style={{ fontSize: 12, color: hidden ? THEME.textDim : THEME.text }}>{col.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div style={{ marginLeft: "auto", display: "flex", border: `1px solid ${THEME.border}`, borderRadius: 8, overflow: "hidden" }}>
            {[["table", "list", "Tabela"], ["kanban", "columns", "Kanban"]].map(([v, ic, label]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", background: view === v ? THEME.accent : "transparent", color: view === v ? "white" : THEME.textMuted, transition: "background 0.1s" }}>
                <Icon name={ic} size={13} color={view === v ? "white" : THEME.textMuted} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Filtros bottom sheet — mobile only */}
      {isMobile && filtersOpen && (
        <>
          <div onClick={() => setFiltersOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 140 }} />
          <div style={{ position: "fixed", bottom: 56, left: 0, right: 0, background: THEME.sidebar, borderRadius: "16px 16px 0 0", border: `1px solid ${THEME.border}`, borderBottom: "none", padding: "16px 16px 24px", zIndex: 150, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: THEME.text }}>Filtros</span>
              <button onClick={() => setFiltersOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 4 }}><Icon name="x" size={16} /></button>
            </div>
            {filterControls}
          </div>
        </>
      )}
    </div>
  );
}

// Export the column list so TableView can use the same source of truth
export { ALL_COLUMNS };
