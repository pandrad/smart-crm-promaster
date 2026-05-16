"""
Microsoft Graph API helpers for Step 1.

Responsibilities:
- Obtain and cache an app-only access token (client credentials flow)
- Create (or renew) the webhook subscription on the group inbox
- Fetch a full email message by ID
"""

import logging
import time
from datetime import datetime, timedelta, timezone

import httpx

log = logging.getLogger(__name__)

GRAPH_BASE = "https://graph.microsoft.com/v1.0"
TOKEN_URL_TEMPLATE = "https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

# In-memory token cache — good enough for Step 1; replace with Redis in prod
_token_cache: dict = {"access_token": None, "expires_at": 0.0}

# Active subscription ID (one per process lifetime)
_subscription_id: str | None = None


def _settings():
    from main import settings
    return settings


async def get_access_token() -> str:
    s = _settings()
    if _token_cache["access_token"] and time.time() < _token_cache["expires_at"] - 60:
        return _token_cache["access_token"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TOKEN_URL_TEMPLATE.format(tenant_id=s.azure_tenant_id),
            data={
                "grant_type": "client_credentials",
                "client_id": s.azure_client_id,
                "client_secret": s.azure_client_secret,
                "scope": "https://graph.microsoft.com/.default",
            },
        )
        resp.raise_for_status()
        data = resp.json()

    _token_cache["access_token"] = data["access_token"]
    _token_cache["expires_at"] = time.time() + data["expires_in"]
    log.info("Obtained new Graph API access token (expires in %ds)", data["expires_in"])
    return _token_cache["access_token"]


async def _graph_get(path: str) -> dict:
    token = await get_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GRAPH_BASE}{path}",
            headers={"Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def _graph_post(path: str, payload: dict) -> dict:
    token = await get_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GRAPH_BASE}{path}",
            json=payload,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )
        resp.raise_for_status()
        return resp.json()


async def ensure_subscription() -> str:
    """
    Create a new webhook subscription (or reuse existing).
    Returns the subscription ID.
    """
    global _subscription_id
    s = _settings()

    notification_url = f"{s.webhook_base_url}/webhook/graph"
    expiry = (datetime.now(timezone.utc) + timedelta(hours=1)).strftime(
        "%Y-%m-%dT%H:%M:%S.000Z"
    )

    payload = {
        "changeType": "created",
        "notificationUrl": notification_url,
        "resource": f"users/{s.inbox_user_id}/mailFolders/inbox/messages",
        "expirationDateTime": expiry,
        "clientState": s.webhook_secret,
    }

    data = await _graph_post("/subscriptions", payload)
    _subscription_id = data["id"]
    log.info(
        "Subscription created | id=%s | expires=%s | notificationUrl=%s",
        _subscription_id,
        data["expirationDateTime"],
        notification_url,
    )
    return _subscription_id


async def fetch_email(message_id: str) -> dict:
    """Fetch a full message from the group inbox by its Graph API message ID."""
    s = _settings()
    # $select keeps the response lean while returning everything we need
    fields = ",".join([
        "id", "subject", "from", "toRecipients", "ccRecipients",
        "receivedDateTime", "bodyPreview", "body",
        "conversationId", "internetMessageId", "hasAttachments",
    ])
    return await _graph_get(
        f"/users/{s.inbox_user_id}/messages/{message_id}?$select={fields}"
    )
