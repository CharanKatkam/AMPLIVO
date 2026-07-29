import bcrypt
import re
import secrets
import string

from app.core.config import settings

_UPPERCASE_RE = re.compile(r"[A-Z]")
_LOWERCASE_RE = re.compile(r"[a-z]")
_DIGIT_RE = re.compile(r"\d")
_SPECIAL_CHAR_RE = re.compile(r"[^A-Za-z0-9]")


def hash_password(plain_password: str) -> str:
    pwd_bytes = plain_password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def generate_temp_password() -> str:
    """A random one-time password for a staff-provisioned client-portal
    account (see app/services/client_account_service.py) - always passes
    is_strong_password() below by construction, since it's never a value
    the client themselves chose."""
    alphabet_upper = string.ascii_uppercase
    alphabet_lower = string.ascii_lowercase
    digits = string.digits
    special = "!@#$%^*"
    core = [secrets.choice(alphabet_upper), secrets.choice(alphabet_lower), secrets.choice(digits), secrets.choice(special)]
    core += [secrets.choice(alphabet_upper + alphabet_lower + digits) for _ in range(6)]
    secrets.SystemRandom().shuffle(core)
    return "".join(core)


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
