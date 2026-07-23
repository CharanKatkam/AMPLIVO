import re

from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.BCRYPT_ROUNDS,
)

_UPPERCASE_RE = re.compile(r"[A-Z]")
_LOWERCASE_RE = re.compile(r"[a-z]")
_DIGIT_RE = re.compile(r"\d")
_SPECIAL_CHAR_RE = re.compile(r"[^A-Za-z0-9]")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def is_strong_password(value: str) -> bool:
    """Stricter policy than UserCreate.password's registration-time check:
    minimum 8 characters plus uppercase, lowercase, digit, and special
    character. Used for password-reset only, since tightening the existing
    registration validator would break already-registered users' passwords.
    """
    return (
        len(value) >= 8
        and bool(_UPPERCASE_RE.search(value))
        and bool(_LOWERCASE_RE.search(value))
        and bool(_DIGIT_RE.search(value))
        and bool(_SPECIAL_CHAR_RE.search(value))
    )
