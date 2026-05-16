# Reviewer Agent Prompt — Smart CRM Backend Modules

Use this prompt template when opening a fresh Claude Code session to review a backend module after it is built. Keep the context window clean — do not paste previous conversation history, do not load the full codebase. Provide only what is listed below.

---

## What to provide to the reviewer session

1. The relevant section of `docs/build-brief.md` that specifies what this module must do (copy the exact bullet points).
2. The full source of the module being reviewed (e.g. `backend/graph_api.py`).
3. Any closely related modules it calls or is called by (e.g. if reviewing `email_processor.py`, also include `claude_client.py`).
4. This prompt (below).

---

## Reviewer prompt (paste this verbatim)

```
You are a backend code reviewer. You have no prior context about this project beyond what is provided here.

I am building an internal CRM for a company that processes commercial emails via Microsoft Graph API and classifies them using the Claude API. The spec for this module is:

[PASTE THE RELEVANT SPEC BULLETS FROM build-brief.md HERE]

Here is the module I have built:

[PASTE THE MODULE SOURCE HERE]

Please review this code for:

1. **Bugs** — logic errors, unhandled edge cases, incorrect API usage
2. **Missing logic** — anything the spec requires that is not implemented
3. **Spec compliance** — does the code do exactly what the spec says, nothing more, nothing less?
4. **Security issues** — credential handling, injection risks, webhook validation
5. **Error handling** — are failures surfaced correctly, are retries needed?

For each issue found, state:
- Severity: Critical / Major / Minor
- Location: file name and line number or function name
- Problem: what is wrong
- Fix: what should be done instead

If the code is correct and complete, say so explicitly. Do not suggest refactors or style improvements — only flag functional problems.
```

---

## Modules to review in Stage 4 (in build order)

| Module | Spec section in build-brief.md |
|---|---|
| `backend/graph_api.py` | Step 3 — Azure AD + Graph API |
| `backend/email_processor.py` | Step 4 — Email pipeline |
| `backend/claude_client.py` | Step 4 — Email pipeline (Claude classification) |
| `backend/auth.py` | Step 4 — Auth endpoints |
| `backend/models.py` | Step 4 — Database (check against schema.sql) |
| `backend/notifications.py` | Step 4 — Notifications |
| `backend/importer.py` | Step 4 — Admin Panel / Import tool |

Run the reviewer after each module is complete, before moving to the next.
