import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { daysLeft } from "../utils.js";
import { Toolbar } from "../components/Toolbar.jsx";
import { TableView } from "../components/TableView.jsx";
import { KanbanView } from "../components/KanbanView.jsx";
import { Icon } from "../icons.jsx";

// ── Summary strip — pooled Por Fazer / Activas / SLA Excedido across tasks and
// processes, compact entry point into Dashboard's detailed breakdown. ────────
function SummaryStrip({ porFazer, activas, slaExcedido, onClick }) {
  const items = [
    { label: "Por fazer",    value: porFazer,    color: "#94a3b8" },
    { label: "Activas",      value: activas,      color: THEME.warning },
    { label: "SLA excedido", value: slaExcedido, color: THEME.danger },
  ];
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 18, padding: "8px 24px", cursor: "pointer", borderBottom: `1px solid ${THEME.border}`, background: THEME.sidebar }}
      title="Ver detalhe no Dashboard"
    >
      {items.map((it, i) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: it.value > 0 ? it.color : THEME.textMuted }}>{it.value}</span>
          <span style={{ fontSize: 11, color: THEME.textDim }}>{it.label}</span>
          {i < items.length - 1 && <span style={{ width: 1, height: 12, background: THEME.border, marginLeft: 12 }} />}
        </div>
      ))}
      <Icon name="chevron" size={11} color={THEME.textDim} style={{ marginLeft: "auto" }} />
    </div>
  );
}

export function Processos({ processos, setProcessos, tarefas, users, currentUser, accent, onSelectProcesso }) {
  const location = useLocation();
  const navigate = useNavigate();
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

  // ── Pooled summary strip — combines tasks and processes for the current user.
  // Mirrors Dashboard's own per-entity definitions (myActive/myPorFazer/
  // mySlaBreach for tasks; myOpen/myOverdue for processes) just summed together,
  // since Dashboard already provides the detailed split — this is only a
  // compact entry point, not a new breakdown.
  const userName = currentUser?.name ?? "";
  const doneLabels = new Set(
    ["Concluído", "Cancelado"].map(r => store.getLabelForSystemRole(r)).filter(Boolean)
  );
  const porFazerLabel = store.getLabelForSystemRole("Por Fazer");
  function isTaskSlaBreach(task) {
    if (!task.due) return false;
    try {
      const [d, m, y] = task.due.split("/").map(Number);
      return new Date("2026-05-15T12:00:00") > new Date(y, m - 1, d);
    } catch { return false; }
  }
  const myTasksAll      = (tarefas || []).filter(t => t.owner === userName);
  const myActiveTasks   = myTasksAll.filter(t => !doneLabels.has(t.status));
  const myPorFazerTasks = myTasksAll.filter(t => t.status === porFazerLabel);
  const myTaskSlaBreach = myActiveTasks.filter(isTaskSlaBreach);
  // "Mine" is based on respActual (who currently has the process), not owner
  // (Resp. Cotação), since owner is now a frozen historical field that no
  // longer necessarily reflects who is actively working the process today.
  const myProcessosForStrip    = active.filter(p => p.respActual === userName || p.comm === userName || p.compra === userName);
  const myOpenProcessosStrip   = myProcessosForStrip.filter(p => p.status < 8);
  const myOverdueProcessosStrip = myProcessosForStrip.filter(p => daysLeft(p.deadline) < 0 && p.status < 8);

  const pooledPorFazer    = myPorFazerTasks.length;
  const pooledActivas     = myActiveTasks.length + myOpenProcessosStrip.length;
  const pooledSlaExcedido = myTaskSlaBreach.length + myOverdueProcessosStrip.length;

  // Apply all filters
  let rows = active.filter(p => {
    if (myTab) {
      // "Meus processos" strictly follows Resp. Actual — who currently has
      // the process — not Resp. Comercial/Resp. Compra.
      if (p.respActual !== (currentUser?.name ?? "")) return false;
    }
    // This dropdown is explicitly labeled "Resp. Cotação" (Toolbar.jsx) and
    // filters by that specific historical role, not by current holder.
    if (ownerFilter !== "Todos" && p.owner !== ownerFilter) return false;
    if (commFilter  !== "Todos" && p.comm  !== commFilter)  return false;

    if      (statusFilter === null)      { /* no status filter */ }
    else if (statusFilter === "open")    { if (p.status >= 8)   return false; }
    else if (statusFilter === "overdue") { if (!(daysLeft(p.deadline) < 0 && p.status < 8)) return false; }
    else if (statusFilter === "urgent")  { const d = daysLeft(p.deadline); if (!(d >= 0 && d <= 2 && p.status < 8)) return false; }
    else if (statusFilter === "won")     { if (p.status !== 12) return false; }  // Ganhos = Adjudicado (id 12)
    else if (statusFilter === "carry")   { if (!p.carryover || p.status >= 8) return false; }
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
            Maio 2026 · {active.filter(p => p.status < 8).length} em aberto
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: THEME.success, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: THEME.textDim }}>Inbox sincronizada</span>
          </div>
        </div>
      </div>

      <SummaryStrip porFazer={pooledPorFazer} activas={pooledActivas} slaExcedido={pooledSlaExcedido} onClick={() => navigate("/dashboard")} />

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
