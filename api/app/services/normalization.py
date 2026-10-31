import re
import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Optional, Dict
from ..schemas.enums import Severity


def normalize_text(text: Optional[str]) -> str:
    if not text:
        return ""
    # Strip whitespace, lower case, replace multiple spaces/tabs
    return re.sub(r"\s+", " ", text.strip()).lower()


def normalize_severity(severity_str: Optional[str], cvss: Optional[float] = None) -> Severity:
    if severity_str:
        s = severity_str.strip().upper()
        if "CRIT" in s:
            return Severity.CRITICAL
        if "HIGH" in s:
            return Severity.HIGH
        if "MED" in s:
            return Severity.MEDIUM
        if "LOW" in s:
            return Severity.LOW

    if cvss is not None:
        if cvss >= 9.0:
            return Severity.CRITICAL
        if cvss >= 7.0:
            return Severity.HIGH
        if cvss >= 4.0:
            return Severity.MEDIUM
        if cvss > 0.0:
            return Severity.LOW

    return Severity.UNKNOWN


def parse_utc_timestamp(val: Any) -> datetime:
    if isinstance(val, datetime):
        if val.tzinfo is None:
            return val
        return val.astimezone(timezone.utc).replace(tzinfo=None)

    if isinstance(val, str):
        # Clean ISO formats with Z or offsets
        s = val.strip().replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(s)
            if dt.tzinfo is not None:
                dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
            return dt
        except ValueError:
            pass

    return datetime.utcnow()


def compute_payload_hash(data: Any) -> str:
    serialized = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

