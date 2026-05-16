import { Icon } from "../icons.jsx";
import { STAGES } from "../data.js";
import { store } from "../store.js";

export function Toolbar({ view, setView, search, setSearch, ownerFilter, setOwnerFilter, commFilter, setCommFilter, statusFilter, setStatusFilter, onFilterChange }) {
  const users = store.getUsers();
  const cotacaoOwners   = [...new Set(users.filter(u => u.role === "cotacao"   && u.active !== false).map(u => u.name))];
  const comercialOwners = [...new Set(users.filter(u => u.role === "comercial" && u.active !== false).map(u => u.name))];

  function wrap(setter) {
    return v => { setter(v); onFilterChange?.(); };
  }

  return (
    <div style={{ padding: "10px 24px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      {/* search */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
          <Icon name="search" size={13} />
        </span>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); onFilterChange?.(); }}
          placeholder="Pesquisar…"
          style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", width: 200, background: "white" }}
        />
      </div>

      {/* resp. cotação */}
      <select value={ownerFilter} onChange={e => wrap(setOwnerFilter)(e.target.value)}
        style={{ fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", background: "white", outline: "none" }}>
        <option value="Todos">Resp. Cotação: Todos</option>
        {cotacaoOwners.map(o => <option key={o}>{o}</option>)}
      </select>

      {/* resp. comercial */}
      <select value={commFilter} onChange={e => wrap(setCommFilter)(e.target.value)}
        style={{ fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", background: "white", outline: "none" }}>
        <option value="Todos">Resp. Comercial: Todos</option>
        {comercialOwners.map(o => <option key={o}>{o}</option>)}
      </select>

      {/* status */}
      <select value={statusFilter} onChange={e => wrap(setStatusFilter)(e.target.value)}
        style={{ fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", background: "white", outline: "none" }}>
        <option value="Todos">Todos os estados</option>
        {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>

      {/* view toggle */}
      <div style={{ marginLeft: "auto", display: "flex", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "white" }}>
        {[["table", "list", "Tabela"], ["kanban", "columns", "Kanban"]].map(([v, ic, label]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", background: view === v ? "#2563eb" : "white", color: view === v ? "white" : "#64748b" }}>
            <Icon name={ic} size={13} color={view === v ? "white" : "#64748b"} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
