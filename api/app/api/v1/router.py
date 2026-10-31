"""Aggregation router for API v1."""
from fastapi import APIRouter
from api.app.api.v1.health import router as health_router
from api.app.api.v1.alerts import router as alerts_router
from api.app.api.v1.assets import router as assets_router
from api.app.api.v1.ingestions import router as ingestions_router
from api.app.api.v1.dashboard import router as dashboard_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(assets_router)
api_v1_router.include_router(ingestions_router)
api_v1_router.include_router(dashboard_router)

