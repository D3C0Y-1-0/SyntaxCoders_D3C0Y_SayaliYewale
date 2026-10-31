from fastapi import APIRouter
from .health import router as health_router
from .alerts import router as alerts_router
from .assets import router as assets_router
from .ingestions import router as ingestions_router
from .dashboard import router as dashboard_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(health_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(assets_router)
api_v1_router.include_router(ingestions_router)
api_v1_router.include_router(dashboard_router)

