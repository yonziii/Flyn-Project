# backend/app/tools/gspread_tool.py
import gspread
import gspread_asyncio
from google.oauth2.credentials import Credentials
import structlog
from typing import List, Dict, Any
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig

from app.core.config import settings

log = structlog.get_logger()

def get_creds_for_user(refresh_token: str) -> Credentials:
    # This function remains the same
    return Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.readonly"]
    )


@tool
async def batch_append_to_sheet(
    spreadsheet_id: str, 
    worksheet_name: str, 
    data_rows: List[List[str]],
    config: RunnableConfig
) -> Dict[str, str]:
    """
    Appends MULTIPLE rows of data to a Google Sheet in a single batch. This should be the final step.
    """
    client = config['configurable'].get("gspread_client")
    if not client:
        raise ValueError("Authorized gspread client not found in config.")
            
    spreadsheet = await client.open_by_key(spreadsheet_id)
    worksheet = await spreadsheet.worksheet(worksheet_name)
    await worksheet.append_rows(data_rows, value_input_option='USER_ENTERED')
    return {"message": f"Successfully appended {len(data_rows)} rows to '{worksheet_name}'."}