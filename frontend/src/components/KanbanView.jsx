import { useState, useRef } from "react";
import { daysLeft } from "../utils.js";
import { store } from "../store.js";
import { THEME } from "../theme.js";
import { Avatar, UrgencyTag } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

function KanbanCard({ p, onClick, locked, isDragging }) {
  const d = daysLeft(p.deadline);
  const borderColor = d < 0 ? THEME.danger : d <= 2 ? THEME.warning : THEME.border;

  return (
    <div
      onClick={() => !locked && onClick(p)}
      style={{
        background: locked ? THEME.bg : THEME.card,
        borderRadius: 10,
        border: `1px solid ${locked ? THEME.border : borderColor}`,
        borderLeft: `3px solid ${locked ? THEME.border : borderColor}`,
        padding: "10px 12px",
        marginBottom: 8,
        cursor: locked ? "not-allowed" : "grab",
        opacity: isDragging ? 0.4 : locked ? 0.5 : 1,
        transition: "opacity 0.1s",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: "monospace" }}>{p.id}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {p.priority === "Alta" && !locked && (
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.danger, display: "inline-block" }} />
          )}
          {locked && <Icon name="lock" size={11} color={THEME.border} />}
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: locked ? THEME.textDim : THEME.text, marginBottom: 4, lineHeight: 1.3 }}>
        {p.client}
      </div>
      <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 8 }}>
        {p.brand}{p.model ? ` · ${p.model}` : ""}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Avatar name={p.owner} size={22} />
          <span style={{ fontSize: 11, color: THEME.textMuted }}>{p.owner.split(" ")[0]}</span>
        </div>
        <UrgencyTag deadline={p.deadline} />
      </div>
      {p.emails > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, color: THEME.textDim, fontSize: 11 }}>
          <Icon name="mail" size={10} color={THEME.textDim} /> {p.emails} email{p.emails !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export function KanbanView({ rows, processos, setProcessos, onSelect, currentUser }) {
  const dragging = useRef(null);
  const [overCol, setOverCol] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const userName = currentUser?.name ?? "";
  const isAdmin  = currentUser?.role === "admin";

  function isOwned(p) {
    if (isAdmin) return true;
    return p.owner === userName || p.comm === userName || p.compra === userName;
  }

  function handleDragStart(e, p) {
    dragging.current = { id: p.id, fromStage: p.status };
    setDraggingId(p.id);
    e.dataTransfer.effectAllowed = "move";
    // Firefox requires dataTransfer.setData to initiate drag
    e.dataTransfer.setData("text/plain", p.id);
  }

  function handleDragEnd() {
    dragging.current = null;
    setDraggingId(null);
    setOverCol(null);
  }

  function handleDragOver(e, stageId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(stageId);
  }

  function handleDragLeave(e) {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOverCol(null);
    }
  }

  function handleDrop(e, targetStageId) {
    e.preventDefault();
    setOverCol(null);
    if (!dragging.current) return;
    const { id, fromStage } = dragging.current;
    dragging.current = null;
    setDraggingId(null);
    if (fromStage === targetStageId) return;

    setProcessos(prev => prev.map(p => p.id === id ? { ...p, status: targetStageId } : p));
  }

  const stages = store.getStages();

  return (
    <div style={{ padding: "0 24px 32px", overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 12, minWidth: stages.length * 212 }}>
        {stages.map(stage => {
          const cards  = rows.filter(p => p.status === stage.id);
          const isOver = overCol === stage.id && draggingId !== null;

          return (
            <div
              key={stage.id}
              style={{ width: 200, flexShrink: 0 }}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, stage.id)}
            >
              {/* column header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: stage.color }}>{stage.label}</span>
                <span style={{ fontSize: 11, background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.textDim, fontWeight: 700 }}>
                  {cards.length}
                </span>
              </div>

              {/* drop zone */}
              <div style={{
                minHeight: 300, borderRadius: 12, padding: 8,
                background: isOver ? `${stage.color}18` : THEME.sidebar,
                border: isOver ? `2px dashed ${stage.color}` : `2px solid ${THEME.border}`,
                transition: "all 0.12s",
              }}>
                {cards.map(p => {
                  const locked = !isOwned(p);
                  return (
                    <div
                      key={p.id}
                      draggable={!locked}
                      onDragStart={locked ? undefined : e => handleDragStart(e, p)}
                      onDragEnd={handleDragEnd}
                    >
                      <KanbanCard
                        p={p}
                        onClick={onSelect}
                        locked={locked}
                        isDragging={draggingId === p.id}
                      />
                    </div>
                  );
                })}
                {cards.length === 0 && (
                  <div style={{ textAlign: "center", color: THEME.border, fontSize: 12, padding: "32px 0" }}>
                    {isOver ? "Soltar aqui" : "Vazio"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
