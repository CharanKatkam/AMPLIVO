from dataclasses import dataclass


@dataclass(frozen=True)
class LocationInfo:
    country: str | None
    city: str | None


class GeoLocationService:
    """Resolves a coarse (country, city) location for an IP address.

    No GeoIP database or third-party geolocation provider (MaxMind,
    ipapi.co, etc.) is part of this project's tech stack, so this default
    implementation always returns an unknown location. Every caller depends
    only on the `locate` method, so swapping in a real provider later
    requires no changes anywhere else - sessions created in the meantime
    simply have a null country/city, which satisfies the "if available"
    requirement honestly rather than fabricating a location.
    """

    def locate(self, ip_address: str | None) -> LocationInfo:
        return LocationInfo(country=None, city=None)
