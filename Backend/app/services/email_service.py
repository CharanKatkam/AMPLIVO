import logging
from dataclasses import dataclass

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

    async def _dispatch(self, *, to: str, subject: str, body: str, token: str) -> None:
        logger.info("Sending email to %s: %s", to, subject)
        _outbox.append(SentEmail(to=to, subject=subject, body=body, token=token))
