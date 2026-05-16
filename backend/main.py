import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


class Settings(BaseSettings):
    azure_tenant_id: str
    azure_client_id: str
    azure_client_secret: str
    inbox_user_id: str = "info@promaster.co"
    webhook_base_url: str
    webhook_secret: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from graph_api import ensure_subscription
    try:
        sub_id = await ensure_subscription()
        log.info("Graph API subscription active: %s", sub_id)
    except Exception as exc:
        log.error("Failed to create Graph API subscription: %s", exc)
    yield


app = FastAPI(title="Smart CRM — Promaster", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten after Step 5
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}


# ── Graph API webhook ─────────────────────────────────────────────────────────

@app.post("/webhook/graph")
async def graph_webhook(
    request: Request,
    validationToken: str | None = Query(default=None),
):
    # Step 1 of the handshake: Microsoft sends ?validationToken=... and expects
    # it echoed back as plain text with 200.
    if validationToken:
        log.info("Graph API webhook validated")
        return Response(content=validationToken, media_type="text/plain")

    body = await request.json()
    log.debug("Raw notification: %s", json.dumps(body, indent=2))

    for notification in body.get("value", []):
        # Ignore lifecycle notifications (subscriptionRemoved, reauthorizationRequired)
        if notification.get("lifecycleEvent"):
            log.info("Lifecycle event: %s", notification["lifecycleEvent"])
            continue

        client_state = notification.get("clientState", "")
        if client_state != settings.webhook_secret:
            log.warning("Notification with wrong clientState — ignoring")
            continue

        resource = notification.get("resource", "")
        change_type = notification.get("changeType", "")
        log.info("New notification | changeType=%s resource=%s", change_type, resource)

        if change_type == "created":
            # Extract message ID from resource path:
            # e.g. "Users/abc.../Messages/AAMk..."
            parts = resource.split("/")
            if "Messages" in parts:
                message_id = parts[parts.index("Messages") + 1]
                await handle_new_email(message_id)

    # Microsoft expects 202 Accepted
    return Response(status_code=202)


async def handle_new_email(message_id: str):
    from graph_api import fetch_email
    try:
        email = await fetch_email(message_id)
        log.info(
            "EMAIL RECEIVED | from=%s | subject=%s | conversationId=%s",
            email.get("from", {}).get("emailAddress", {}).get("address"),
            email.get("subject"),
            email.get("conversationId"),
        )
        # TODO Step 3: run Claude classification + create processo record
    except Exception as exc:
        log.error("Failed to process message %s: %s", message_id, exc)
