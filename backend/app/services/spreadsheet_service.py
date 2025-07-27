from typing import List, Dict, Any
from supabase import create_client, Client
from fastapi import HTTPException, status
from functools import partial
import gspread_asyncio
import json

from app.core.config import settings
from app.schemas import User
from app.tools.gspread_tool import get_creds_for_user
from langchain_google_genai import ChatGoogleGenerativeAI

class SpreadsheetService:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=settings.GOOGLE_API_KEY)
    
    async def register_spreadsheet(self, spreadsheet_id: str, name: str, current_user: User):
        """Registers a spreadsheet for a user, or updates its name if it already exists."""
        data, count = self.supabase.table("spreadsheets").upsert({
            "user_id": str(current_user.id),
            "google_spreadsheet_id": spreadsheet_id,
            "name": name
        }, on_conflict="user_id, google_spreadsheet_id").execute()
        return data

    async def get_worksheets(self, spreadsheet_id: str, current_user: User) -> List[str]:
        """
        Fetches the list of worksheet names for a given spreadsheet,
        but only if the user owns it.
        """
        # 1. Authorization Check: Verify the user has this spreadsheet registered.
        response = self.supabase.table("spreadsheets").select("id").eq("user_id", str(current_user.id)).eq("google_spreadsheet_id", spreadsheet_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. This spreadsheet is not registered to your account."
            )
        
        # 2. Credential Check
        if not current_user.google_refresh_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account not linked or token is missing.")

        # 3. Fetch worksheets using the user's credentials
        try:
            user_creds_func = partial(get_creds_for_user, refresh_token=current_user.google_refresh_token)
            user_agcm = gspread_asyncio.AsyncioGspreadClientManager(user_creds_func)
            agc = await user_agcm.authorize()
            spreadsheet = await agc.open_by_key(spreadsheet_id)
            worksheets = await spreadsheet.worksheets()
            return [ws.title for ws in worksheets]
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch worksheets from Google: {e}")
        
    
    async def get_canvases(self, current_user: User) -> List[Dict]:
        """Fetches all registered spreadsheets (canvases) for the current user."""
        response = self.supabase.table("spreadsheets").select("*").eq("user_id", str(current_user.id)).order("created_at", desc=True).execute()
        return response.data

    async def refresh_schema_summary(self, spreadsheet_id: str, current_user: User):
        """Generates and saves an AI summary of the spreadsheet's structure."""
        if not current_user.google_refresh_token:
            raise HTTPException(status_code=400, detail="Google account not linked.")

        response = self.supabase.table("spreadsheets").select("id").eq("user_id", str(current_user.id)).eq("google_spreadsheet_id", spreadsheet_id).execute()
        if not response.data:
            raise HTTPException(status_code=403, detail="Access denied.")
        
        try:
            user_creds_func = partial(get_creds_for_user, refresh_token=current_user.google_refresh_token)
            user_agcm = gspread_asyncio.AsyncioGspreadClientManager(user_creds_func)
            agc = await user_agcm.authorize()
            spreadsheet = await agc.open_by_key(spreadsheet_id)
            
           # 1. Efficiently fetch all metadata for the entire spreadsheet in one API call
            metadata = await spreadsheet.fetch_sheet_metadata()
            
            sheet_details = []
            all_worksheets = await spreadsheet.worksheets()

            # Create a mapping of worksheet IDs to their properties from the metadata
            sheet_properties_map = {sheet['properties']['sheetId']: sheet for sheet in metadata['sheets']}

            for ws in all_worksheets:
                preview_data = await ws.get("A1:Z50", value_render_option='FORMATTED_VALUE')
                
                # 2. Find the corresponding sheet properties using the worksheet's ID
                sheet_props = sheet_properties_map.get(ws.id)
                
                # 3. Safely get the data validation rules from the fetched metadata
                validation_rules = sheet_props.get('dataValidationRules', []) if sheet_props else []
                
                sheet_details.append({
                    "name": ws.title, 
                    "preview": preview_data, 
                    "validation_rules": str(validation_rules) # Convert rules to string for the prompt
                })

            prompt = f"""
            Analyze the following Google Sheet structure and generate a concise summary for another AI agent.
            The goal is to provide context so the agent can correctly add new data.
            For each worksheet, identify the primary data table, its starting cell (e.g., A1, C5), its column headers, and the exact allowed values for any columns with dropdown menus.
            Structure data: {json.dumps(sheet_details)}
            
            Summary:
            """
            
            summary = (await self.llm.ainvoke(prompt)).content
            self.supabase.table("spreadsheets").update({"schema_summary": summary}).eq("google_spreadsheet_id", spreadsheet_id).execute()
            
            return {"status": "success", "summary": summary}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to analyze sheet: {e}")