import logging
from dataclasses import dataclass

from app.core.config import settings

logger = logging.getLogger("app.email")

_outbox: list["SentEmail"] = []


@dataclass(frozen=True)
class SentEmail:
    to: str
    subject: str
    body: str
    token: str


def clear_outbox() -> None:
    _outbox.clear()


def get_outbox() -> list[SentEmail]:
    return list(_outbox)


class EmailService:
    """Dispatches transactional email.

    Backed by structured logging plus an in-memory outbox (inspected by
    tests) rather than a real SMTP/API provider, since no email delivery
    credentials are part of this project's tech stack. Every caller depends
    only on this class's two async methods, so swapping in a real SMTP/SES/
    SendGrid adapter later requires no changes anywhere else.
    """

    async def send_verification_email(self, *, to_email: str, full_name: str, token: str) -> None:
        subject = "Verify your Amplivo account"
        body = (
            f"Hi {full_name},\n\n"
            f"Please verify your email address using this token:\n{token}\n\n"
            "If you didn't create this account, you can ignore this email."
        )
        await self._dispatch(to=to_email, subject=subject, body=body, token=token)

    async def send_password_reset_email(self, *, to_email: str, full_name: str, token: str) -> None:
        subject = "Reset your Amplivo password"
        body = (
            f"Hi {full_name},\n\n"
            f"Use this token to reset your password:\n{token}\n\n"
            "If you didn't request this, you can safely ignore this email."
        )
        await self._dispatch(to=to_email, subject=subject, body=body, token=token)

    # ── Sales / CRM workflow emails ─────────────────────────────────────

    async def send_meeting_invite_email(self, *, to_email: str, contact_name: str, meeting_title: str, scheduled_at: str) -> None:
        subject = f"Meeting scheduled: {meeting_title}"
        body = (
            f"Hi {contact_name},\n\n"
            f"A meeting \"{meeting_title}\" has been scheduled with you for {scheduled_at}.\n\n"
            "We'll send a reminder closer to the time."
        )
        await self._dispatch(to=to_email, subject=subject, body=body, token="")

    async def send_meeting_rescheduled_email(self, *, to_email: str, contact_name: str, meeting_title: str, scheduled_at: str, reason: str | None) -> None:
        subject = f"Meeting rescheduled: {meeting_title}"
        body = (
            f"Hi {contact_name},\n\n"
            f"Your meeting \"{meeting_title}\" has been rescheduled to {scheduled_at}."
            + (f"\n\nReason: {reason}" if reason else "")
        )
        await self._dispatch(to=to_email, subject=subject, body=body, token="")

    async def send_meeting_cancelled_email(self, *, to_email: str, contact_name: str, meeting_title: str, reason: str | None) -> None:
        subject = f"Meeting cancelled: {meeting_title}"
        body = (
            f"Hi {contact_name},\n\n"
            f"Your meeting \"{meeting_title}\" has been cancelled."
            + (f"\n\nReason: {reason}" if reason else "")
        )
        await self._dispatch(to=to_email, subject=subject, body=body, token="")

    async def send_proposal_link_email(self, *, to_email: str, contact_name: str, proposal_title: str, portal_url: str) -> None:
        subject = f"Your proposal: {proposal_title}"
        body = (
            f"Hi {contact_name},\n\n"
            f"Please review your proposal \"{proposal_title}\" and let us know if you'd like to accept, "
            f"reject, or request changes:\n{portal_url}\n\n"
            "This link does not require a login."
        )
        await self._dispatch(to=to_email, subject=subject, body=body, token="")

    async def send_invoice_payment_link_email(self, *, to_email: str, contact_name: str, invoice_number: str, amount: float, currency: str, portal_url: str) -> None:
        subject = f"Invoice {invoice_number} - payment required"
        body = (
            f"Hi {contact_name},\n\n"
            f"Invoice {invoice_number} for {currency} {amount:,.2f} is ready. "
            f"You can view it and submit your payment details here:\n{portal_url}\n\n"
            "This link does not require a login."
        )
        await self._dispatch(to=to_email, subject=subject, body=body, token="")

    async def send_client_portal_welcome_email(self, *, to_email: str, full_name: str, username: str, temp_password: str, login_url: str) -> None:
        subject = "Welcome to your Amplivo Client Portal"
        body = (
            f"Hi {full_name},\n\n"
            "Your advance payment has been confirmed and your client portal account is ready.\n\n"
            f"Login URL: {login_url}\n"
            f"Username: {username}\n"
            f"Temporary password: {temp_password}\n\n"
            "Please log in and change your password as soon as possible."
        )
        await self._dispatch(to=to_email, subject=subject, body=body, token="")

    async def _dispatch(self, *, to: str, subject: str, body: str, token: str) -> None:
        if settings.BREVO_API_KEY:
            await self._send_via_brevo(to=to, subject=subject, body=body)
        else:
            logger.info("Sending email to %s: %s", to, subject)
            _outbox.append(SentEmail(to=to, subject=subject, body=body, token=token))

    async def _send_via_brevo(self, *, to: str, subject: str, body: str) -> None:
        """Real delivery via Brevo's transactional email HTTP API. Only
        reached when BREVO_API_KEY is configured (see app/core/config.py) -
        local/dev/test environments without a key keep using the log+outbox
        stub above, so nothing here blocks on real credentials existing."""
        import httpx

        payload = {
            "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
            "to": [{"email": to}],
            "subject": subject,
            "textContent": body,
        }
        headers = {"api-key": settings.BREVO_API_KEY, "content-type": "application/json", "accept": "application/json"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers)
                response.raise_for_status()
            logger.info("Sent email to %s via Brevo: %s", to, subject)
        except httpx.HTTPError:
            logger.exception("Brevo email send failed for %s: %s", to, subject)
