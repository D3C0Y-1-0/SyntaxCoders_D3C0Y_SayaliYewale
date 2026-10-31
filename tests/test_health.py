def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "timestamp" in data
    # Health must not expose secrets or connection strings
    assert "DATABASE_URL" not in str(data)
    assert "password" not in str(data).lower()


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "SentinelScope"
    assert "/api/v1/alerts" in data["alerts"]

