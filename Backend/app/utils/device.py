import re
from dataclasses import dataclass

# Order matters: Edge/Opera UAs also contain "Chrome" and "Safari" tokens, and
# Chrome UAs also contain "Safari" - most specific patterns must be checked first.
_BROWSER_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("Edge", re.compile(r"Edg(?:e|A|iOS)?/[\d.]+")),
    ("Opera", re.compile(r"(?:OPR|Opera)/[\d.]+")),
    ("Chrome", re.compile(r"Chrome/[\d.]+")),
    ("Firefox", re.compile(r"Firefox/[\d.]+")),
    ("Internet Explorer", re.compile(r"MSIE [\d.]+|Trident/.*rv:[\d.]+")),
    ("Safari", re.compile(r"Version/[\d.]+.*Safari")),
]

_OS_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("Windows", re.compile(r"Windows NT")),
    ("iOS", re.compile(r"iPhone OS|iPad; CPU OS")),
    ("macOS", re.compile(r"Mac OS X")),
    ("Android", re.compile(r"Android")),
    ("Linux", re.compile(r"Linux")),
]

_BOT_PATTERN = re.compile(r"bot|crawl|spider|slurp|curl|wget|python-requests|httpx", re.IGNORECASE)
_TABLET_PATTERN = re.compile(r"iPad|Tablet|(?:Android(?!.*Mobile))", re.IGNORECASE)
_MOBILE_PATTERN = re.compile(r"Mobi|iPhone|Android.*Mobile", re.IGNORECASE)


@dataclass(frozen=True)
class DeviceInfo:
    browser: str
    operating_system: str
    device: str


def parse_user_agent(user_agent: str | None) -> DeviceInfo:
    if not user_agent:
        return DeviceInfo(browser="Unknown", operating_system="Unknown", device="Unknown")

    browser = next((name for name, pattern in _BROWSER_PATTERNS if pattern.search(user_agent)), "Unknown")
    operating_system = next(
        (name for name, pattern in _OS_PATTERNS if pattern.search(user_agent)), "Unknown"
    )

    if _BOT_PATTERN.search(user_agent):
        device = "Bot"
    elif _TABLET_PATTERN.search(user_agent):
        device = "Tablet"
    elif _MOBILE_PATTERN.search(user_agent):
        device = "Mobile"
    else:
        device = "Desktop"

    return DeviceInfo(browser=browser, operating_system=operating_system, device=device)
