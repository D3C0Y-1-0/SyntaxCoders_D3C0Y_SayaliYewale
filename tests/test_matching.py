from api.app.services.matcher import match_advisory_to_asset
from api.app.schemas.enums import MatchStatus


def test_known_matching_version_correctly_identified():
    rules = [
        {
            "vendor": "ExampleCorp",
            "product": "ExampleServer",
            "version_range": ">=4.0.0, <=4.3.0",
        }
    ]

    # Target asset with known affected version 4.2.1
    status, reason, confidence = match_advisory_to_asset(
        advisory_affected_products=rules,
        asset_product="ExampleServer",
        asset_vendor="ExampleCorp",
        asset_version="4.2.1",
    )
    assert status in (MatchStatus.EXACT, MatchStatus.CANDIDATE)
    assert confidence >= 0.85
    assert "satisfies vulnerable range" in reason


def test_unrelated_product_never_exact_match():
    rules = [
        {
            "vendor": "ExampleCorp",
            "product": "ExampleServer",
            "version_range": ">=4.0.0, <=4.3.0",
        }
    ]

    # Completely unrelated PostgreSQL database product
    status, reason, confidence = match_advisory_to_asset(
        advisory_affected_products=rules,
        asset_product="PostgreSQL",
        asset_vendor="PostgreSQL Global Development Group",
        asset_version="16.1",
    )
    assert status == MatchStatus.NONE
    assert status != MatchStatus.EXACT
    assert status != MatchStatus.CANDIDATE
    assert confidence == 0.0


def test_ambiguous_version_remains_candidate():
    rules = [
        {
            "vendor": "ExampleCorp",
            "product": "ExampleServer",
            "version_range": ">=4.0.0, <=4.3.0",
        }
    ]

    # Asset with ambiguous or non-standard version string (e.g. "build-alpha-custom")
    status, reason, confidence = match_advisory_to_asset(
        advisory_affected_products=rules,
        asset_product="ExampleServer",
        asset_vendor="ExampleCorp",
        asset_version="build-alpha-custom",
    )
    assert status == MatchStatus.CANDIDATE
    assert 0.0 < confidence < 0.85
    assert "ambiguous" in reason.lower()


def test_missing_version_never_interpreted_as_unaffected():
    rules = [
        {
            "vendor": "ExampleCorp",
            "product": "ExampleServer",
            "version_range": ">=4.0.0, <=4.3.0",
        }
    ]

    # Asset version is completely missing (None): must remain a candidate, never marked safe/unaffected
    status, reason, confidence = match_advisory_to_asset(
        advisory_affected_products=rules,
        asset_product="ExampleServer",
        asset_vendor="ExampleCorp",
        asset_version=None,
    )
    assert status == MatchStatus.CANDIDATE
    assert status != MatchStatus.NONE
    assert confidence > 0.0
    assert "version evidence is ambiguous" in reason.lower()


def test_unaffected_version_outside_range():
    rules = [
        {
            "vendor": "LegacySoftware",
            "product": "LegacyMail",
            "version_range": "<2.5.0",
        }
    ]

    # Asset version is 3.1.0, which is definitively outside <2.5.0
    status, reason, confidence = match_advisory_to_asset(
        advisory_affected_products=rules,
        asset_product="LegacyMail",
        asset_vendor="LegacySoftware",
        asset_version="3.1.0",
    )
    assert status == MatchStatus.NONE
    assert confidence == 0.0
    assert "exceeds" in reason or "not less than" in reason
