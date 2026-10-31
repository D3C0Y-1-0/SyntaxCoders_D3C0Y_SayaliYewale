import uuid
from typing import Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    def __init__(self, message: str, code: str = "BAD_REQUEST", status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found", code: str = "NOT_FOUND"):
        super().__init__(message=message, code=code, status_code=404)


class ValidationError(AppError):
    def __init__(self, message: str = "Invalid input parameter", code: str = "VALIDATION_ERROR"):
        super().__init__(message=message, code=code, status_code=400)


def create_error_response(message: str, code: str, status_code: int, request_id: Optional[str] = None) -> JSONResponse:
    req_id = request_id or f"req-{uuid.uuid4().hex[:8]}"
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "request_id": req_id,
            }
        },
    )


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    return create_error_response(exc.message, exc.code, exc.status_code, request_id)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    code = "HTTP_ERROR"
    if exc.status_code == 404:
        code = "RESOURCE_NOT_FOUND"
    elif exc.status_code == 400:
        code = "BAD_REQUEST"
    elif exc.status_code >= 500:
        code = "INTERNAL_SERVER_ERROR"
    return create_error_response(str(exc.detail), code, exc.status_code, request_id)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    details = exc.errors()
    msg = "; ".join([f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in details])
    return create_error_response(f"Validation failed: {msg}", "VALIDATION_ERROR", status.HTTP_422_UNPROCESSABLE_ENTITY, request_id)


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    # Safe error message - never leak raw stack traces or internal secrets
    return create_error_response(
        "An unexpected internal error occurred. Please contact system support.",
        "INTERNAL_SERVER_ERROR",
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        request_id,
    )

