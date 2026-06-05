import { useState, useEffect } from "react";
import { store } from "./store.js";

// Date fixed to the mock dataset's reference point so urgency tags are
// deterministic in Stage 1. Replaced by `new Date()` when real data is wired.
const MOCK_TODAY = new Date("2026-04-27");

export const daysLeft = (ddmmyyyy) =>
  Math.round((new Date(ddmmyyyy.split("/").reverse().join("-")) - MOCK_TODAY) / 86400000);

// ─────────────────────────────────────────────────────────────────────────────
// DEV TESTING ONLY — simulateAIClassification()
//
// THIS FUNCTION IS FOR DEV TESTING ONLY.
// REMOVE BEFORE STAGE 3 AND REPLACE WITH A REAL CLAUDE API CALL IN THE BACKEND.
//
// The real classification happens in the backend (email_processor.py) via the
// Claude API. In Stage 5 the frontend calls POST /api/classify-email and the
// response replaces this simulated output entirely.
// ─────────────────────────────────────────────────────────────────────────────
export function simulateAIClassification(email) {
  const taskTypes = store.getTaskTypes().map(t => t.label);
  const subjectLower = (email.subject || "").toLowerCase();
  const bodyLower    = (email.body || email.preview || "").toLowerCase();
  const text         = subjectLower + " " + bodyLower;

  // Simple keyword heuristic — deterministic per email content
  let type = "Não Classificado";
  let confidence = 0.55;

  if (/cotação|pedido de cot|quot|proposal|proposta/.test(text)) {
    type = "Pré-Entrada";         confidence = 0.91;
  } else if (/encomenda|order|prazo de entrega|status da encomenda/.test(text)) {
    type = "Status de Encomenda"; confidence = 0.87;
  } else if (/desconto|discount|renegoc|preço/.test(text)) {
    type = "Desconto";            confidence = 0.82;
  } else if (/conta corrente|factura|invoice|liquidar|pagamento/.test(text)) {
    type = "Contas Correntes";    confidence = 0.85;
  } else if (/nova empresa|registo|empresa nova|cliente novo/.test(text)) {
    type = "Cliente Novo";        confidence = 0.88;
  } else if (/follow.up|acompanhamento|seguimento/.test(text)) {
    type = "Follow-up";           confidence = 0.78;
  } else if (/reclamação|reclama|complaint/.test(text)) {
    type = "Diversos";            confidence = 0.70;
  }

  // Fallback to first configured type if the heuristic picked one not in store
  if (!taskTypes.includes(type)) {
    type = taskTypes[0] ?? "Não Classificado";
    confidence = 0.50;
  }

  // Check if this sender has a direct client responsibility assignment.
  // If so, include the suggested responsável in the classification result so
  // the triage flow can pre-fill the owner without round-robin.
  const clientAssignments = store.getClientAssignments();
  const senderName = email.senderName || "";
  const suggestedResponsavel = clientAssignments[senderName] ?? null;

  return { type, category: type, confidence, simulated: true, suggestedResponsavel };
}

export function useWindowSize() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { width, isMobile: width <= 768 };
}
