import os
from dotenv import load_dotenv

# Load envioronment variables for langsmith
load_dotenv()

# Import necessary modules
import io
import magic
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException 
from fastapi.middleware.cors import CORSMiddleware
import structlog
from pydantic import BaseModel
from typing import List, Dict

# Import application-specific modules
from app.services.spreadsheet_service import SpreadsheetService
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.exception_handlers import register_exception_handlers
from app.schemas import AgentResponse, User 
from app.services.receipt_service import ReceiptService, IReceiptService
from app.dependencies import get_current_user

from app.services.user_service import UserService
# Setup
setup_logging()
app = FastAPI(title="ReceiptAgent API", version="1.0.0")
register_exception_handlers(app)
log = structlog.get_logger()

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencies injection
def get_receipt_service():
    return ReceiptService()

# Health Check Endpoint
@app.get("/", tags=["Health Check"], summary="Health Check")
async def read_root():
    await log.ainfo("Health check endpoint was called.")
    return {"status": "ok"}

class SpreadsheetRegistration(BaseModel):
    spreadsheet_id: str
    name: str

# Register a spreadsheet for the current user
@app.post("/spreadsheets", status_code=201, summary="Register a spreadsheet")
async def register_spreadsheet_for_user(
    reg_data: SpreadsheetRegistration,
    current_user: User = Depends(get_current_user),
    spreadsheet_service: SpreadsheetService = Depends(SpreadsheetService)
):
    """Registers a spreadsheet to the currently authenticated user."""
    return await spreadsheet_service.register_spreadsheet(reg_data.spreadsheet_id, reg_data.name, current_user)

# Get the list of worksheets for a given spreadsheet
@app.get("/spreadsheets/{spreadsheet_id}/worksheets", response_model=List[str], summary="Get worksheets for a spreadsheet")
async def get_spreadsheet_worksheets(
    spreadsheet_id: str,
    current_user: User = Depends(get_current_user),
    spreadsheet_service: SpreadsheetService = Depends(SpreadsheetService)
):
    """Returns a list of worksheet names for a given spreadsheet."""
    return await spreadsheet_service.get_worksheets(spreadsheet_id, current_user)

@app.get("/canvases", response_model=List[Dict], summary="Get all canvases for a user")
async def get_user_canvases(
    current_user: User = Depends(get_current_user),
    spreadsheet_service: SpreadsheetService = Depends(SpreadsheetService)
):
    """
    Retrieves a list of all canvases (spreadsheets) registered to the
    currently authenticated user.
    """
    return await spreadsheet_service.get_canvases(current_user)

@app.post("/canvases/{spreadsheet_id}/refresh-schema", summary="Refresh Schema for a Canvas")
async def refresh_canvas_schema(
    spreadsheet_id: str,
    current_user: User = Depends(get_current_user),
    spreadsheet_service: SpreadsheetService = Depends(SpreadsheetService)
):
    """
    Triggers a background analysis of the specified spreadsheet to update
    its cached schema summary.
    """
    return await spreadsheet_service.refresh_schema_summary(spreadsheet_id, current_user)


# Process a receipt and append to Google Sheets
@app.post(
    "/process-receipt", 
    response_model=AgentResponse, 
    tags=["Agent"],
    summary="Process a receipt and append to Google Sheets",
    description="""
    Uploads a receipt image and uses an AI agent to extract line items,
    then appends the structured data to a specified Google Sheet.

    This is a long-running operation that can take 10-15 seconds.
    """
)
async def process_receipt(
    spreadsheet_id: str = Form(...),
    worksheet_name: str = Form(...),
    image: UploadFile = File(...),
    receipt_service: IReceiptService = Depends(get_receipt_service),
    current_user: User = Depends(get_current_user)
):
    # 1. File validation
    image_bytes = await image.read()
    if not image_bytes:
        # This will be caught by our custom exception middleware if we add a handler
        # For now, HTTPException is fine.
        raise HTTPException(status_code=400, detail="File is empty.")
    
    true_mime_type = magic.from_buffer(image_bytes, mime=True)
    if not true_mime_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"File not a valid image. Detected type: {true_mime_type}")

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            output_buffer = io.BytesIO()
            img.save(output_buffer, format='PNG')
            sanitized_image_bytes = output_buffer.getvalue()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupt image file: {e}")

    #Delegate to the service layer
    response = await receipt_service.process_receipt(
        spreadsheet_id=spreadsheet_id,
        image_bytes=sanitized_image_bytes,
        image_content_type="image/png",
        # Pass the user object to the service
        current_user=current_user 
    )
    
    return response

class TokenData(BaseModel):
    refresh_token: str

# Store the user's Google refresh token
@app.post("/users/me/google-token", status_code=204)
async def store_google_token(
    token_data: TokenData,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(UserService) # Inject the new service
):
    """
    Receives and stores the user's Google refresh token.
    """
    user_service.store_google_refresh_token(current_user.auth_id, token_data.refresh_token)
    return


