// Date fixed to the mock dataset's reference point so urgency tags are
// deterministic in Stage 1. Replaced by `new Date()` when real data is wired.
const MOCK_TODAY = new Date("2026-04-27");

export const daysLeft = (ddmmyyyy) =>
  Math.round((new Date(ddmmyyyy.split("/").reverse().join("-")) - MOCK_TODAY) / 86400000);
