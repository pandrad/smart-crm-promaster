# Step 1 — Azure AD Setup Checklist

Do this in the client's Azure tenant (they need Global Admin or Application Admin rights).

---

## 1. Register the app

1. Go to **portal.azure.com** → **Azure Active Directory** → **App registrations** → **New registration**
2. Name: `smart-crm-promaster` (or anything recognisable)
3. Supported account types: **Accounts in this organizational directory only** (single tenant)
4. Redirect URI: leave blank for now
5. Click **Register**
6. Copy **Application (client) ID** → `AZURE_CLIENT_ID`
7. Copy **Directory (tenant) ID** → `AZURE_TENANT_ID`

---

## 2. Create a client secret

1. Left menu → **Certificates & secrets** → **New client secret**
2. Description: `smart-crm-prod`, Expires: **24 months**
3. Copy the **Value** immediately (it's hidden after you leave the page) → `AZURE_CLIENT_SECRET`

---

## 3. Grant API permissions

1. Left menu → **API permissions** → **Add a permission** → **Microsoft Graph** → **Application permissions**
2. Add these:
   - `Mail.Read` — read emails in the group inbox
   - `Mail.Send` — send notification emails (needed for Step 7; add now)
   - `Files.Read.All` — read OneDrive/SharePoint links
   - `User.Read.All` — resolve user display names
3. Click **Grant admin consent for [tenant name]** — the Status column must show green ticks for all four

> **Important:** these are *Application* permissions (app acts on its own, no user sign-in).
> Do NOT add Delegated permissions.

---

## 4. Give the app access to the group inbox

The app registers as an application-level reader, but the group inbox
(`info@promaster.co`) may block app access by default.

Run this once in **Exchange Admin Center** (or PowerShell):

```powershell
# In Exchange Online PowerShell
Add-MailboxPermission -Identity "info@promaster.co" `
  -User "smart-crm-promaster" `
  -AccessRights ReadPermission `
  -AutoMapping $false
```

Or via Graph Explorer (as admin):
- `POST https://graph.microsoft.com/v1.0/users/info@promaster.co/mailFolders/inbox/messages`
- If this returns data → access is already granted.

---

## 5. Verify with Graph Explorer

1. Go to **developer.microsoft.com/graph/graph-explorer**
2. Sign in as an admin of the tenant
3. Run: `GET https://graph.microsoft.com/v1.0/users/info@promaster.co/mailFolders/inbox/messages?$top=5`
4. Expect a JSON list of messages. If you get a 403 → go back to step 4.

---

## 6. Local test run

```bash
cd backend

# Copy and fill in your values
cp .env.example .env

# Install deps (use a venv)
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Start ngrok in a separate terminal (install from ngrok.com if needed)
ngrok http 8000
# Copy the https://xxx.ngrok-free.app URL → set as WEBHOOK_BASE_URL in .env

# Start the backend
uvicorn main:app --reload --port 8000
```

Expected log output when an email arrives:
```
INFO  Graph API subscription active: <subscription-id>
INFO  New notification | changeType=created resource=Users/.../Messages/AAMk...
INFO  EMAIL RECEIVED | from=client@example.com | subject=Pedido de cotação... | conversationId=AAQk...
```

---

## Step 1 is done when:

- [ ] App registered in Azure AD
- [ ] Client secret copied to `.env`
- [ ] Admin consent granted for all 4 permissions
- [ ] Graph Explorer returns inbox messages without error
- [ ] `uvicorn` is running and ngrok URL is in `.env`
- [ ] Send a test email to `info@promaster.co` and see it logged in the terminal

Once all boxes are ticked → proceed to **Step 2** (Supabase + backend skeleton).
