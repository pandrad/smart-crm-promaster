import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { THEME } from "../theme.js";
import { store } from "../store.js";
import { daysLeft } from "../utils.js";
import { Toolbar } from "../components/Toolbar.jsx";
import { TableView } from "../components/TableView.jsx";
import { KanbanView } from "../components/KanbanView.jsx";
import { Icon } from "../icons.jsx";
import { getDashboardView } from "./Dashboard.jsx";

// ── Process SLA breach — must match the exact logic TableView.jsx uses to
// render the red ⚠ Data Limite indicator: due date = p.created + the admin-
// configured SLA duration for the process's *current* status (not p.deadline,
// which is a separate/older field), with no status ceiling — a late-stage
// process with an SLA entry configured can still show as breached. ──────────
function isProcessoSlaBreach(p) {
  const sla = store.getSLASettings();
  const entry = sla.processoStatus?.[p.status];
  if (!entry || !entry.value) return false;
  try {
    const [d, m, y] = p.created.split("/").map(Number);
    const base = new Date(y, m - 1, d);
    const ms = entry.unit === "dias" ? entry.value * 86400000 : entry.value * 3600000;
    const due = new Date(base.getTime() + ms);
    return due < new Date();
  } catch { return false; }
}

// ── Visão Global — plain page-level title + current date sit above, with no
// card/box around them. Directly beneath, one single rounded container holds
// all four pooled figures together (Por Resolver larger/bold, then Tarefas,
// Processos, Tempo Excedido, each smaller, separated by dot separators) —
// not four separate boxes. Por Resolver is always exactly Tarefas +
// Processos shown alongside it — same pooled tasks-in-Por-Fazer +
// processes-currently-assigned-via-Resp.-Actual figures Dashboard itself
// already computes, just summed. Tempo Excedido pools SLA-breaching tasks
// and overdue processes. Purely presentational — the underlying figures are
// unchanged; only the layout/markup differs from the old pooled SummaryStrip. ─
function VisaoGlobalStrip({ porFazerTasks, myProcessos, tempoExcedido, onClick }) {
  const porResolver = porFazerTasks + myProcessos;
  const items = [
    { label: "Tarefas",        value: porFazerTasks },
    { label: "Processos",      value: myProcessos    },
    { label: "Tempo Excedido", value: tempoExcedido, color: THEME.danger },
  ];
  return (
    <div style={{ padding: "20px 24px 0" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: THEME.text }}>Visão Global</div>

      <div
        onClick={onClick}
        style={{ display: "flex", alignItems: "center", gap: 10, background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "14px 20px", marginTop: 14, cursor: "pointer" }}
        title="Ver detalhe no Dashboard"
      >
        <span style={{ fontSize: 24, fontWeight: 800, color: porResolver > 0 ? THEME.warning : THEME.text }}>{porResolver}</span>
        <span style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Por Resolver</span>
        {items.map(it => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: THEME.textDim, flexShrink: 0 }} />
            <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: it.value > 0 ? (it.color || THEME.text) : THEME.textMuted }}>{it.value}</span>
              <span style={{ fontSize: 12, color: THEME.textDim }}>{it.label}</span>
            </span>
          </div>
        ))}
      </div>
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
  // Meus Processos is the default for standard users; Admin/Supervisor default
  // to Todos os Processos instead. Meus Processos still appears first in the
  // tab order for everyone (see the tabs array below) — only the default
  // selection differs by role.
  const [myTab,        setMyTab]        = useState(() => {
    const isPrivilegedInit = currentUser?.role === "admin" || currentUser?.role === "supervisor";
    return !isPrivilegedInit;
  });
  const [sortState,    setSortState]    = useState(() => store.getSortPrefs(currentUser?.email));
  const [colFilters,   setColFilters]   = useState({});    // { colKey: Set<value> }

  // Visible (non-archived) processes only on this page
  const active = processos.filter(p => !p.archived);

  // ── Pooled summary strip — combines tasks and processes for the current user.
  // Mirrors Dashboard's own per-entity definitions (myActive/myPorFazer/
  // mySlaBreach for tasks; myOpen/myOverdue for processes) just summed together,
  // since Dashboard already provides the detailed split — this is only a
  // compact entry point, not a new breakdown.
  //
  // Admin/Supervisor: the strip reflects whichever view (Minhas/Geral) was
  // last selected on Dashboard's own toggle — read via getDashboardView(),
  // persisted in localStorage — so this page stays consistent with that
  // choice instead of always defaulting back to personal. Standard users
  // never see any toggle anywhere and always get their own personal figures.
  const userName = currentUser?.name ?? "";
  const isPrivileged = currentUser?.role === "admin" || currentUser?.role === "supervisor";
  const showGeral = isPrivileged && getDashboardView() === "all";
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
  const tasksInScope    = showGeral ? (tarefas || []) : (tarefas || []).filter(t => t.owner === userName);
  const activeTasksInScope   = tasksInScope.filter(t => !doneLabels.has(t.status));
  const porFazerTasksInScope = tasksInScope.filter(t => t.status === porFazerLabel);
  const taskSlaBreachInScope = activeTasksInScope.filter(isTaskSlaBreach);
  // Strictly Resp. Actual only — who currently and genuinely holds the
  // process right now — matching the exact condition the "Meus processos"
  // tab filter below already uses (p.respActual !== currentUser.name). Resp.
  // Comercial (comm) and the client contact (compra) are no longer folded in
  // here; this figure represents true current ownership only.
  const processosInScope = showGeral ? active : active.filter(p => p.respActual === userName);
  const overdueProcessosInScope = processosInScope.filter(isProcessoSlaBreach);

  const visaoGlobalTarefas   = porFazerTasksInScope.length;
  const visaoGlobalProcessos = processosInScope.length;
  const visaoGlobalTempoExcedido = taskSlaBreachInScope.length + overdueProcessosInScope.length;

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

      <VisaoGlobalStrip porFazerTasks={visaoGlobalTarefas} myProcessos={visaoGlobalProcessos} tempoExcedido={visaoGlobalTempoExcedido} onClick={() => navigate("/dashboard")} />

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

      {/* Meus/Todos tabs */}
      <div style={{ padding: "12px 24px 0", display: "flex", gap: 6 }}>
        {[{ id: true, label: "Meus processos" }, { id: false, label: "Todos os processos" }].map(t => (
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
