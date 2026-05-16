import { useState, useRef } from "react";
import { daysLeft } from "../utils.js";
import { store } from "../store.js";
import { Avatar, UrgencyTag } from "./Primitives.jsx";
import { Icon } from "../icons.jsx";

function KanbanCard({ p, onClick, locked, isDragging }) {
  const d = daysLeft(p.deadline);
  const borderColor = d < 0 ? "#ef4444" : d <= 2 ? "#f59e0b" : "#e2e8f0";

  return (
    <div
      onClick={() => !locked && onClick(p)}
      style={{
        background: locked ? "#f1f5f9" : "white",
        borderRadius: 10,
        border: `1px solid ${locked ? "#e2e8f0" : borderColor}`,
        borderLeft: `3px solid ${locked ? "#cbd5e1" : borderColor}`,
        padding: "10px 12px",
        marginBottom: 8,
        cursor: locked ? "not-allowed" : "grab",
        opacity: isDragging ? 0.4 : locked ? 0.55 : 1,
        transition: "opacity 0.1s",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>#{p.id}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {p.priority === "Alta" && !locked && (
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          )}
          {locked && <Icon name="lock" size={11} color="#cbd5e1" />}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: locked ? "#94a3b8" : "#1e293b", marginBottom: 4, lineHeight: 1.3 }}>
        {p.client}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>
        {p.brand}{p.model ? ` · ${p.model}` : ""}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Avatar name={p.owner} size={22} />
          <span style={{ fontSize: 11, color: "#64748b" }}>{p.owner.split(" ")[0]}</span>
        </div>
        <UrgencyTag deadline={p.deadline} />
      </div>
      {p.emails > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, color: "#94a3b8", fontSize: 11 }}>
          <Icon name="mail" size={10} /> {p.emails} email{p.emails !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export function KanbanView({ rows, processos, setProcessos, onSelect, currentUser }) {
  // Track which card is being dragged — stored in a ref so it survives across
  // the synthetic event boundary without triggering re-renders mid-drag.
  const dragging = useRef(null);   // { id, fromStage }
  const [overCol, setOverCol] = useState(null);  // stage id being hovered over
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
                <span style={{ fontSize: 11, background: "white", border: "1px solid #e2e8f0", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 700 }}>
                  {cards.length}
                </span>
              </div>

              {/* drop zone */}
              <div style={{
                minHeight: 300, borderRadius: 12, padding: 8,
                background: isOver ? stage.bg : "#f1f5f9",
                border: isOver ? `2px dashed ${stage.color}` : "2px solid transparent",
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
                  <div style={{ textAlign: "center", color: "#cbd5e1", fontSize: 12, padding: "32px 0" }}>
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
