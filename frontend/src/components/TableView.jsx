import { useState, useRef, useEffect } from "react";
import { daysLeft, useWindowSize } from "../utils.js";
import { store } from "../store.js";
import { THEME } from "../theme.js";
import { Avatar, UrgencyTag, StageBadge, FUBadge } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";
import { ALL_COLUMNS } from "./Toolbar.jsx";

// ── Priority inline dropdown ──────────────────────────────────────────────────
function PriorityCell({ p, canChange, onPriorityChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const dot = (
    <span
      title={p.priority}
      style={{ width: 9, height: 9, borderRadius: "50%", display: "inline-block", flexShrink: 0, background: p.priority === "Alta" ? THEME.danger : THEME.border, cursor: canChange ? "pointer" : "default" }}
    />
  );

  if (!canChange) return dot;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <div onClick={e => { e.stopPropagation(); setOpen(v => !v); }} style={{ cursor: "pointer" }}>
        {dot}
      </div>
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "4px 0", zIndex: 100, minWidth: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          {["Normal", "Alta"].map(prio => (
            <div key={prio} onClick={() => { onPriorityChange(p.id, prio); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: prio === "Alta" ? THEME.danger : THEME.textMuted, background: p.priority === prio ? THEME.sidebarHover : "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = p.priority === prio ? THEME.sidebarHover : "transparent"; }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: prio === "Alta" ? THEME.danger : THEME.border, display: "inline-block" }} />
              {prio}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Column header with sort + filter ─────────────────────────────────────────
function TH({ colKey, label, sortState, onSort, rows, colFilters, onColFilter, children }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setFilterOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isSorted  = sortState?.col === colKey;
  const activeFilter = colFilters[colKey];
  const hasFilter = activeFilter instanceof Set && activeFilter.size > 0;

  function handleSort(e) {
    e.stopPropagation();
    if (!colKey) return;
    const newDir = isSorted && sortState.dir === "asc" ? "desc" : "asc";
    onSort?.({ col: colKey, dir: newDir });
  }

  // Distinct values for this column from current rows
  const distinctValues = colKey
    ? [...new Set(rows.map(r => String(r[colKey] ?? "")).filter(Boolean))].sort()
    : [];

  function toggleFilterValue(val) {
    const current = colFilters[colKey] instanceof Set ? colFilters[colKey] : new Set();
    const next = new Set(current);
    next.has(val) ? next.delete(val) : next.add(val);
    onColFilter?.({ ...colFilters, [colKey]: next });
  }

  function clearFilter(e) {
    e.stopPropagation();
    const { [colKey]: _, ...rest } = colFilters;
    onColFilter?.(rest);
  }

  return (
    <th ref={ref} style={{ padding: "9px 10px", fontSize: 10, fontWeight: 600, color: THEME.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap", position: "relative", userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Sort trigger */}
        <span onClick={handleSort} style={{ display: "flex", alignItems: "center", gap: 3, cursor: colKey ? "pointer" : "default" }}>
          {children ?? label}
          {colKey && (
            <span style={{ color: isSorted ? THEME.accent : THEME.border, fontSize: 10 }}>
              {isSorted ? (sortState.dir === "asc" ? " ↑" : " ↓") : " ↕"}
            </span>
          )}
        </span>

        {/* Column filter */}
        {colKey && distinctValues.length > 0 && (
          <span style={{ position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setFilterOpen(v => !v); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 2px", color: hasFilter ? THEME.accent : THEME.border, lineHeight: 1 }}
              title="Filtrar coluna"
            >
              <Icon name="filter-col" size={10} color={hasFilter ? THEME.accent : THEME.border} />
            </button>
            {filterOpen && (
              <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "6px 0", zIndex: 110, minWidth: 160, maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
                {hasFilter && (
                  <div onClick={clearFilter} style={{ padding: "5px 12px", fontSize: 11, color: THEME.danger, cursor: "pointer", borderBottom: `1px solid ${THEME.border}`, marginBottom: 4 }}>
                    Limpar filtro
                  </div>
                )}
                {distinctValues.map(val => {
                  const checked = activeFilter instanceof Set && activeFilter.has(val);
                  return (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}
                      onMouseEnter={e => { e.currentTarget.style.background = THEME.sidebarHover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleFilterValue(val)} style={{ accentColor: THEME.accent }} />
                      <span style={{ color: THEME.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{val}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </span>
        )}
      </div>
    </th>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TableView({ rows, onSelect, users = [], currentUser = {}, sortState = { col: null, dir: "asc" }, onSortChange, colFilters = {}, onColFilterChange, onPriorityChange }) {
  const { isMobile } = useWindowSize();
  const photoOf = name => users.find(u => u.name === name)?.photo;
  const isAdmin      = currentUser.role === "admin";
  const isSupervisor = currentUser.role === "supervisor";
  const canChangePriority = isAdmin || isSupervisor;

  // Column visibility from store
  const savedPrefs = store.getColumnPrefs(currentUser?.email);
  const hiddenCols = new Set(savedPrefs?.hidden ?? []);
  const isVisible  = key => !hiddenCols.has(key);

  const thProps = { sortState, onSort: onSortChange, rows, colFilters, onColFilter: onColFilterChange };

  const rowBg    = THEME.bg;
  const rowHover = THEME.sidebarHover;
  const theadBg  = THEME.sidebar;

  // ── Mobile card list ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ padding: "0 14px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0 && (
          <p style={{ textAlign: "center", color: THEME.textDim, padding: "40px 0", fontSize: 13 }}>Nenhum processo encontrado</p>
        )}
        {rows.map(p => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            style={{ background: THEME.card, borderRadius: 10, border: `1px solid ${THEME.border}`, padding: "12px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: THEME.textDim }}>{p.id}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {p.priority === "Alta" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.danger, display: "inline-block" }} />}
                <StageBadge id={p.status} />
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text }}>{p.client}</div>
            {(p.brand || p.model) && (
              <div style={{ fontSize: 12, color: THEME.textMuted }}>{[p.brand, p.model].filter(Boolean).join(" · ")}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Avatar name={p.owner} size={22} photo={photoOf(p.owner)} />
                <span style={{ fontSize: 12, color: THEME.textMuted }}>{p.owner.split(" ")[0]}</span>
              </div>
              <UrgencyTag deadline={p.deadline} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Desktop table ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "0 24px 32px" }}>
      <div style={{ background: THEME.card, borderRadius: 12, border: `1px solid ${THEME.border}`, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: theadBg, borderBottom: `1px solid ${THEME.border}` }}>
              {isVisible("id")        && <TH colKey="id"        label="Nº"               {...thProps} />}
              {isVisible("created")   && <TH colKey="created"   label="Criado"           {...thProps} />}
              {isVisible("deadline")  && <TH colKey={null}       label="Data Limite"      {...thProps} />}
              {isVisible("priority")  && <TH colKey="priority"  label="P"                {...thProps} />}
              {isVisible("status")    && <TH colKey={null}       label="Estado"           {...thProps} />}
              {isVisible("fu")        && <TH colKey={null}       label="Follow Up"        {...thProps} />}
              {isVisible("client")    && <TH colKey="client"    label="Cliente"          {...thProps} />}
              {isVisible("brand")     && <TH colKey="brand"     label="Marca"            {...thProps} />}
              {isVisible("model")     && <TH colKey="model"     label="Modelo"           {...thProps} />}
              {isVisible("owner")     && <TH colKey="owner"     label="Resp. Cotação"    {...thProps} />}
              {isVisible("comm")      && <TH colKey="comm"      label="Resp. Comercial"  {...thProps} />}
              {isVisible("comprador") && <TH colKey="comprador" label="Comprador"        {...thProps} />}
              {isVisible("price")     && <TH colKey={null}       label="Valor"            {...thProps} />}
              {isVisible("emails")    && <TH colKey="emails"    label="Emails"           {...thProps} />}
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                style={{ borderBottom: `1px solid ${THEME.borderLight}`, cursor: "pointer", background: rowBg }}
                onMouseEnter={e => { e.currentTarget.style.background = rowHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
              >
                {isVisible("id") && (
                  <td style={{ padding: "9px 10px", fontSize: 11, fontFamily: "monospace", color: THEME.textDim }}>{p.id}</td>
                )}
                {isVisible("created") && (
                  <td style={{ padding: "9px 10px", fontSize: 11, color: THEME.textDim }}>{p.created}</td>
                )}
                {isVisible("deadline") && (
                  <td style={{ padding: "9px 10px" }}>{(() => {
                    const sla = store.getSLASettings();
                    const entry = sla.processoStatus?.[p.status];
                    if (!entry || !entry.value) return <span style={{ fontSize: 11, color: THEME.textDim }}>Sem SLA definido</span>;
                    try {
                      const [d, m, y] = p.created.split("/").map(Number);
                      const base = new Date(y, m - 1, d);
                      const ms = entry.unit === "dias" ? entry.value * 86400000 : entry.value * 3600000;
                      const due = new Date(base.getTime() + ms);
                      const pad = n => String(n).padStart(2, "0");
                      const breached = due < new Date();
                      const dateStr = `${pad(due.getDate())}/${pad(due.getMonth()+1)}/${due.getFullYear()}`;
                      return <span style={{ fontSize: 11, fontWeight: breached ? 700 : 400, color: breached ? THEME.danger : THEME.textMuted }}>{breached ? "⚠ " : ""}{dateStr}</span>;
                    } catch {
                      return <span style={{ fontSize: 11, color: THEME.textDim }}>Sem SLA definido</span>;
                    }
                  })()}</td>
                )}
                {isVisible("priority") && (
                  <td style={{ padding: "9px 10px" }} onClick={e => canChangePriority && e.stopPropagation()}>
                    <PriorityCell p={p} canChange={canChangePriority} onPriorityChange={onPriorityChange} />
                  </td>
                )}
                {isVisible("status") && (
                  <td style={{ padding: "9px 10px" }}><StageBadge id={p.status} /></td>
                )}
                {isVisible("fu") && (
                  <td style={{ padding: "9px 10px" }}>
                    {p.status >= 9 && p.fu ? <FUBadge label={p.fu} /> : <span style={{ color: THEME.border, fontSize: 12 }}>—</span>}
                  </td>
                )}
                {isVisible("client") && (
                  <td style={{ padding: "9px 10px", fontSize: 12, fontWeight: 600, color: THEME.text, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.client}</td>
                )}
                {isVisible("brand") && (
                  <td style={{ padding: "9px 10px", fontSize: 12, color: THEME.textMuted }}>{p.brand}</td>
                )}
                {isVisible("model") && (
                  <td style={{ padding: "9px 10px", fontSize: 12, color: THEME.textMuted }}>{p.model || "—"}</td>
                )}
                {isVisible("owner") && (
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar name={p.owner} size={22} photo={photoOf(p.owner)} />
                      <span style={{ fontSize: 11, color: THEME.textMuted }}>{p.owner.split(" ")[0]}</span>
                    </div>
                  </td>
                )}
                {isVisible("comm") && (
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar name={p.comm} size={22} photo={photoOf(p.comm)} />
                      <span style={{ fontSize: 11, color: THEME.textMuted }}>{p.comm.split(" ")[0]}</span>
                    </div>
                  </td>
                )}
                {isVisible("comprador") && (
                  <td style={{ padding: "9px 10px", fontSize: 12, color: THEME.textMuted }}>{p.comprador || "—"}</td>
                )}
                {isVisible("price") && (
                  <td style={{ padding: "9px 10px", fontSize: 12, fontWeight: p.price ? 600 : 400, color: p.price ? THEME.text : THEME.border }}>
                    {p.price ? "€" + p.price.toLocaleString("pt-PT") : "—"}
                  </td>
                )}
                {isVisible("emails") && (
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: THEME.textDim }}>
                      <Icon name="mail" size={10} color={THEME.textDim} />{p.emails}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p style={{ textAlign: "center", color: THEME.textDim, padding: "40px 0", fontSize: 13 }}>
            Nenhum processo encontrado
          </p>
        )}
      </div>
    </div>
  );
}
