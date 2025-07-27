# app/core/exception_handlers.py

import structlog
from fastapi import Request
from fastapi.responses import JSONResponse
from gspread.exceptions import SpreadsheetNotFound, WorksheetNotFound, APIError
from pydantic import ValidationError

log = structlog.get_logger()

class AgentLogicError(Exception):
    """Raised when the agent completes its run but fails at its task."""
    pass

async def agent_logic_error_handler(request: Request, exc: AgentLogicError):
    await log.awarning("Agent logic error", detail=str(exc))
    return JSONResponse(
        status_code=400, # Bad Request
        content={"status": "error", "message": str(exc)}
    )

async def value_error_handler(request: Request, exc: ValueError):
    await log.awarning("Value error from business logic", detail=str(exc))
    return JSONResponse(
        status_code=400, # Bad Request for invalid input
        content={"status": "error", "message": str(exc)}
    )
    
async def spreadsheet_not_found_handler(request: Request, exc: SpreadsheetNotFound):
    await log.awarning("SpreadsheetNotFound error", detail=str(exc))
    return JSONResponse(
        status_code=404, # Not Found
        content={"status": "error", "message": "The requested spreadsheet could not be found."}
    )

async def worksheet_not_found_handler(request: Request, exc: WorksheetNotFound):
    await log.awarning("WorksheetNotFound error", detail=str(exc))
    return JSONResponse(
        status_code=404, # Not Found
        content={"status": "error", "message": "The requested worksheet was not found."}
    )

async def gspread_api_error_handler(request: Request, exc: APIError):
    await log.aerror("GSpread API error", detail=str(exc))
    return JSONResponse(
        status_code=429, # Too Many Requests (Rate Limiting)
        content={"status": "error", "message": "An error occurred with the Google Sheets API, likely due to rate limiting. Please try again later."}
    )

async def validation_error_handler(request: Request, exc: ValidationError):
    await log.awarning("Pydantic validation error", detail=str(exc))
    return JSONResponse(
        status_code=422, # Unprocessable Entity
        content={"status": "error", "message": "Invalid data provided.", "details": exc.errors()}
    )

async def generic_exception_handler(request: Request, exc: Exception):
    await log.aexception("An unhandled exception occurred")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "An unexpected internal server error occurred."}
    )

def register_exception_handlers(app):
    app.add_exception_handler(AgentLogicError, agent_logic_error_handler)
    app.add_exception_handler(ValueError, value_error_handler)
    app.add_exception_handler(SpreadsheetNotFound, spreadsheet_not_found_handler)
    app.add_exception_handler(WorksheetNotFound, worksheet_not_found_handler)
    app.add_exception_handler(APIError, gspread_api_error_handler)
    app.add_exception_handler(ValidationError, validation_error_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
