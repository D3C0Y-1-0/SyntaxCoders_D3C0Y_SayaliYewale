def test_get_alerts_list_contains_complete_display_info(client):
    """Verify frontend receives everything to display alerts without N+1 requests."""
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1

    item = data["items"][0]
    # Required display fields
    assert "id" in item
    assert "cve_id" in item
    assert "title" in item
    assert "severity" in item
    assert "score" in item
    assert "band" in item
    assert "status" in item
    assert "published_at" in item
    assert "generated_at" in item
    assert "source_url" in item
    assert "factors" in item
    assert "affected_assets" in item
    assert "recommendations" in item

    # Check factors structure
    factors = item["factors"]
    assert "severity" in factors
    assert "exploit" in factors
    assert "asset_criticality" in factors
    assert "confidence" in factors
    assert "freshness" in factors

    # Check affected asset structure
    assert len(item["affected_assets"]) >= 1
    asset_detail = item["affected_assets"][0]
    assert "asset" in asset_detail
    assert "product" in asset_detail
    assert "version" in asset_detail
    assert "criticality" in asset_detail
    assert "match" in asset_detail
    assert "confidence" in asset_detail
    assert "match_reason" in asset_detail


def test_get_alert_detail(client):
    list_resp = client.get("/api/v1/alerts")
    alert_id = list_resp.json()["items"][0]["id"]

    response = client.get(f"/api/v1/alerts/{alert_id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == alert_id
    assert "affected_assets" in detail
    assert len(detail["affected_assets"]) >= 1
    assert "factors" in detail
    assert "evidence" in detail
    assert "recommendations" in detail


def test_dashboard_and_alerts_consistency(client):
    """Verify dashboard counts use the identical risk bands and alert statuses as /alerts."""
    dash_resp = client.get("/api/v1/dashboard/summary")
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()

    counts = dash_data["counts"]
    total_alerts = counts["total_alerts"]

    # Sum of risk bands equals total alerts
    by_band = counts["by_band"]
    sum_by_band = sum(by_band.values())
    assert sum_by_band == total_alerts

    # Sum of statuses equals total alerts
    by_status = counts["by_status"]
    sum_by_status = sum(by_status.values())
    assert sum_by_status == total_alerts

    # Querying /alerts?band=... yields the exact count reported by dashboard
    for band_name, expected_count in by_band.items():
        band_resp = client.get(f"/api/v1/alerts?band={band_name}")
        assert band_resp.status_code == 200
        assert band_resp.json()["total"] == expected_count

    # Querying /alerts?status=... yields the exact count reported by dashboard
    for status_name, expected_count in by_status.items():
        status_resp = client.get(f"/api/v1/alerts?status={status_name}")
        assert status_resp.status_code == 200
        assert status_resp.json()["total"] == expected_count


def test_alert_status_update_and_persistence(client):
    list_resp = client.get("/api/v1/alerts")
    alert_id = list_resp.json()["items"][0]["id"]

    # Update status to acknowledged
    patch_resp = client.patch(
        f"/api/v1/alerts/{alert_id}/status",
        json={"status": "acknowledged", "note": "Reviewed by triage lead"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "acknowledged"

    # Verify persistent state upon query
    detail_resp = client.get(f"/api/v1/alerts/{alert_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["status"] == "acknowledged"
    assert detail_resp.json()["acknowledged_at"] is not None


def test_error_handling_unknown_alert(client):
    response = client.get("/api/v1/alerts/al_nonexistent_999")
    assert response.status_code == 404
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "NOT_FOUND"
    assert "request_id" in body["error"]


def test_error_handling_invalid_filter_param(client):
    response = client.get("/api/v1/alerts?band=catastrophic")
    assert response.status_code == 400
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert "request_id" in body["error"]
