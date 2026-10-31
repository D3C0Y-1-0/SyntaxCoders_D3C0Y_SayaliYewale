import re
from typing import Tuple, Optional, List, Dict, Any
from packaging import version as pkg_version
from .normalization import normalize_text
from ..schemas.enums import MatchStatus


def parse_clean_version(ver_str: str) -> Optional[pkg_version.Version]:
    if not ver_str:
        return None
    # Strip non-standard prefixes like 'v', 'v.'
    clean = re.sub(r"^[vV]\.?", "", ver_str.strip())
    # Grab basic digits and dots
    match = re.search(r"(\d+(\.\d+)*)", clean)
    if not match:
        return None
    try:
        return pkg_version.parse(match.group(1))
    except Exception:
        return None


def is_version_in_range(asset_ver_str: Optional[str], range_str: Optional[str]) -> Tuple[Optional[bool], str]:
    """
    Returns:
      (True, reason) if asset version satisfies vulnerable range
      (False, reason) if asset version is definitively outside vulnerable range
      (None, reason) if version information is ambiguous or cannot be evaluated
    """
    if not range_str or range_str.strip() in ("", "*"):
        return None, "All versions potentially affected or range unspecified"

    if not asset_ver_str:
        return None, "Asset version unspecified"

    parsed_asset = parse_clean_version(asset_ver_str)
    if not parsed_asset:
        return None, f"Could not parse asset version '{asset_ver_str}'"

    # Split compound conditions, e.g. ">=4.0.0, <=4.3.0"
    clauses = [c.strip() for c in range_str.split(",") if c.strip()]
    in_range = True

    for clause in clauses:
        op_match = re.match(r"^(>=|<=|>|<|==|=)?\s*([vV]?\d+(\.\d+)*.*)$", clause)
        if not op_match:
            continue
        op = op_match.group(1) or "=="
        v_str = op_match.group(2)
        parsed_target = parse_clean_version(v_str)
        if not parsed_target:
            continue

        if op in ("==", "="):
            if parsed_asset != parsed_target:
                return False, f"Asset version {parsed_asset} does not equal required {parsed_target}"
        elif op == ">=":
            if parsed_asset < parsed_target:
                return False, f"Asset version {parsed_asset} is less than minimum {parsed_target}"
        elif op == ">":
            if parsed_asset <= parsed_target:
                return False, f"Asset version {parsed_asset} is not greater than {parsed_target}"
        elif op == "<=":
            if parsed_asset > parsed_target:
                return False, f"Asset version {parsed_asset} exceeds maximum {parsed_target}"
        elif op == "<":
            if parsed_asset >= parsed_target:
                return False, f"Asset version {parsed_asset} is not less than {parsed_target}"

    return True, f"Asset version {parsed_asset} satisfies vulnerable range [{range_str}]"


def match_advisory_to_asset(
    advisory_affected_products: List[Dict[str, Any]],
    asset_product: str,
    asset_vendor: Optional[str],
    asset_version: Optional[str],
) -> Tuple[MatchStatus, str, float]:
    """
    Deterministic & conservative matching of an advisory's affected products against an organization asset.
    Returns: (match_status, match_reason, confidence)
    """
    norm_asset_prod = normalize_text(asset_product)
    norm_asset_vend = normalize_text(asset_vendor)

    best_status = MatchStatus.NONE
    best_reason = f"No affected product rule matches asset '{asset_product}'"
    best_confidence = 0.0

    if not advisory_affected_products:
        return MatchStatus.NONE, "Advisory has no specified affected products", 0.0

    for rule in advisory_affected_products:
        rule_prod = normalize_text(rule.get("product", ""))
        rule_vend = normalize_text(rule.get("vendor", ""))
        rule_range = rule.get("version_range", "")

        # Check product match
        product_matched = False
        if rule_prod and (rule_prod == norm_asset_prod or rule_prod in norm_asset_prod or norm_asset_prod in rule_prod):
            product_matched = True

        if not product_matched:
            continue

        # Check vendor match if both specified
        vendor_matched = False
        vendor_boost = 0.0
        if rule_vend and norm_asset_vend:
            if rule_vend == norm_asset_vend or rule_vend in norm_asset_vend or norm_asset_vend in rule_vend:
                vendor_matched = True
                vendor_boost = 0.1
            else:
                vendor_boost = -0.1

        # Check version
        ver_result, ver_reason = is_version_in_range(asset_version, rule_range)

        if ver_result is True:
            # High specificity match
            status = MatchStatus.EXACT if vendor_matched else MatchStatus.CANDIDATE
            confidence = min(1.0, 0.85 + max(0.0, vendor_boost))
            reason = f"Product '{asset_product}' matched; {ver_reason}"
            if confidence > best_confidence:
                best_status = status
                best_confidence = round(confidence, 2)
                best_reason = reason
        elif ver_result is None:
            # Ambiguous / missing version - conservative fallback (do NOT mark unaffected because fields are missing)
            status = MatchStatus.CANDIDATE
            confidence = max(0.40, min(0.70, 0.50 + vendor_boost))
            reason = f"Product '{asset_product}' matched, but version evidence is ambiguous: {ver_reason}"
            if confidence > best_confidence:
                best_status = status
                best_confidence = round(confidence, 2)
                best_reason = reason
        else:
            # Definitively outside range
            reason = f"Product matched but {ver_reason}"
            if best_confidence == 0.0:
                best_reason = reason

    return best_status, best_reason, best_confidence

