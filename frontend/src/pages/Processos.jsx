import { useState } from "react";
import { useLocation } from "react-router-dom";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { daysLeft } from "../utils.js";
import { Toolbar } from "../components/Toolbar.jsx";
import { TableView } from "../components/TableView.jsx";
import { KanbanView } from "../components/KanbanView.jsx";
import { Icon } from "../icons.jsx";

export function Processos({ processos, setProcessos, tarefas, users, currentUser, accent, onSelectProcesso }) {
  const location = useLocation();
  const [view,         setView]         = useState("table");
  const [search,       setSearch]       = useState("");
  const [ownerFilter,  setOwnerFilter]  = useState("Todos");
  const [commFilter,   setCommFilter]   = useState("Todos");
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter ?? null);
  const [myTab,        setMyTab]        = useState(false);
  const [sortState,    setSortState]    = useState(() => store.getSortPrefs(currentUser?.email));
  const [colFilters,   setColFilters]   = useState({});    // { colKey: Set<value> }

  // Visible (non-archived) processes only on this page
  const active = processos.filter(p => !p.archived);

  // Apply all filters
  let rows = active.filter(p => {
    if (myTab) {
      const n = currentUser?.name ?? "";
      if (p.owner !== n && p.comm !== n && p.compra !== n) return false;
    }
    if (ownerFilter !== "Todos" && p.owner !== ownerFilter) return false;
    if (commFilter  !== "Todos" && p.comm  !== commFilter)  return false;

    if      (statusFilter === null)      { /* no status filter */ }
    else if (statusFilter === "open")    { if (p.status >= 7)   return false; }
    else if (statusFilter === "overdue") { if (!(daysLeft(p.deadline) < 0 && p.status < 7)) return false; }
    else if (statusFilter === "urgent")  { const d = daysLeft(p.deadline); if (!(d >= 0 && d <= 2 && p.status < 7)) return false; }
    else if (statusFilter === "won")     { if (p.status !== 10) return false; }  // Ganhos = Encomenda (id 10)
    else if (statusFilter === "carry")   { if (!p.carryover || p.status >= 7) return false; }
    else                                 { if (p.status !== Number(statusFilter)) return false; }

    // General search across all key fields
    if (search) {
      const q = search.toLowerCase();
      const stages = store.getStages();
      const stageLabel = stages.find(s => s.id === p.status)?.label?.toLowerCase() ?? "";
      const match = [p.client, p.brand, p.model, p.id, p.comprador, p.owner, p.comm, stageLabel]
        .some(v => v && String(v).toLowerCase().includes(q));
      if (!match) return false;
    }

    // Per-column filters
    for (const [col, values] of Object.entries(colFilters)) {
      if (values instanceof Set && values.size > 0) {
        const cellVal = String(p[col] ?? "");
        if (!values.has(cellVal)) return false;
      }
    }

    return true;
  });

  // Apply sort
  if (sortState.col) {
    rows = [...rows].sort((a, b) => {
      const av = a[sortState.col] ?? "";
      const bv = b[sortState.col] ?? "";
      const cmp = String(av).localeCompare(String(bv), "pt");
      return sortState.dir === "asc" ? cmp : -cmp;
    });
  }

  function handleSortChange(newSort) {
    setSortState(newSort);
    store.saveSortPrefs(currentUser?.email, newSort);
  }

  function handleColFilterChange(newFilters) {
    setColFilters(newFilters);
  }

  function handlePriorityChange(processId, newPriority) {
    setProcessos(prev => prev.map(p => p.id === processId ? { ...p, priority: newPriority } : p));
  }

  const accentColor = accent || THEME.accent;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: THEME.bg }}>

      {/* Page header */}
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: THEME.text }}>Processos</h1>
          <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>
            Maio 2026 · {active.filter(p => p.status < 7).length} em aberto
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: THEME.success, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: THEME.textDim }}>Inbox sincronizada</span>
          </div>
        </div>
      </div>

      {/* Meus/Todos tabs */}
      <div style={{ padding: "12px 24px 0", display: "flex", gap: 6 }}>
        {[{ id: false, label: "Todos os processos" }, { id: true, label: "Meus processos" }].map(t => (
          <button
            key={String(t.id)}
            onClick={() => { setMyTab(t.id); setStatusFilter(null); setOwnerFilter("Todos"); setCommFilter("Todos"); setSearch(""); }}
            style={{
              padding: "5px 14px", fontSize: 12, fontWeight: 500, borderRadius: 8,
              border: `1px solid ${myTab === t.id ? accentColor : THEME.border}`,
              cursor: "pointer",
              background: myTab === t.id ? `${accentColor}22` : "transparent",
              color: myTab === t.id ? accentColor : THEME.textMuted,
              transition: "all 0.1s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <Toolbar
        view={view} setView={setView}
        search={search} setSearch={setSearch}
        ownerFilter={ownerFilter} setOwnerFilter={setOwnerFilter}
        commFilter={commFilter}   setCommFilter={setCommFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        onFilterChange={() => setMyTab(false)}
        currentUser={currentUser}
      />

      {/* Content */}
      <div style={{ flex: 1 }}>
        {view === "table" && (
          <TableView
            rows={rows}
            onSelect={onSelectProcesso}
            users={users}
            currentUser={currentUser}
            sortState={sortState}
            onSortChange={handleSortChange}
            colFilters={colFilters}
            onColFilterChange={handleColFilterChange}
            onPriorityChange={handlePriorityChange}
          />
        )}
        {view === "kanban" && (
          <KanbanView
            rows={rows}
            processos={processos}
            setProcessos={setProcessos}
            onSelect={onSelectProcesso}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}
