import uuid
import base64
import re
import structlog
from abc import ABC, abstractmethod
from langgraph.graph.state import CompiledStateGraph
from langchain_core.messages import HumanMessage
from supabase import create_client, Client

from app.core.config import settings
from app.schemas import AgentResponse, User
from app.prompts import SYSTEM_PROMPT
from app.agent import ReceiptAgent
from app.core.exception_handlers import AgentLogicError

log = structlog.get_logger()

class IReceiptService(ABC):
    @abstractmethod
    async def process_receipt(
        self, spreadsheet_id: str, worksheet_name: str, image_bytes: bytes, image_content_type: str
    ) -> AgentResponse:
        pass

class ReceiptService(IReceiptService):
    def __init__(self, agent_runnable: CompiledStateGraph  = None):
        # Allow injecting the agent for easier testing
        self.agent_runnable = agent_runnable or ReceiptAgent().get_agent()
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    async def process_receipt(
        self, spreadsheet_id: str, image_bytes: bytes, image_content_type: str, current_user: User
    ) -> AgentResponse:
        
        response = self.supabase.table("spreadsheets").select("id").eq("user_id", str(current_user.id)).eq("google_spreadsheet_id", spreadsheet_id).execute()
        if not response.data:
            raise AgentLogicError("Access denied. You do not own this spreadsheet or it has not been registered.")

        if not current_user.google_refresh_token:
             raise AgentLogicError("Google account not linked or token is missing. Please reconnect your Google account.")

        # Basic input sanitization
        if not re.match(r"^[a-zA-Z0-9-_]{40,}$", spreadsheet_id):
             raise ValueError("Invalid spreadsheet_id format.")

        thread_id = str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}

        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        response = self.supabase.table("spreadsheets").select("schema_summary").eq("google_spreadsheet_id", spreadsheet_id).single().execute()
        schema_summary = response.data.get("schema_summary", "No summary available. Please refresh the canvas schema.")

        # Inject the summary into the initial message
        prompt_text = (
            f"{SYSTEM_PROMPT}\n\n"
            f"You are working with the Google Sheet that has the ID: {spreadsheet_id}\n" # <-- ADD THIS LINE
            f"--- SPREADSHEET SUMMARY ---\n{schema_summary}\n---------------------------\n\n"
        )
        
        initial_message = HumanMessage(
            content=[
                {"type": "text", "text": prompt_text},
                {"type": "image_url", "image_url": f"data:{image_content_type};base64,{base64_image}"},
            ]
        )

        initial_state = {
            "messages": [initial_message],
            "spreadsheet_id": spreadsheet_id,
            "google_refresh_token": current_user.google_refresh_token
        }

        final_state = await self.agent_runnable.ainvoke(initial_state, config)

        if final_state.get("messages"):
            last_message = final_state["messages"][-1]
            result_message = last_message.content
        else:
            result_message = "Agent finished without providing a final message."
        
        failure_keywords = ["error", "failed", "unable to", "could not", "unexpected"] 
        if any(keyword in result_message.lower() for keyword in failure_keywords):
            await log.awarning("Agent completed with a business logic failure", agent_response=result_message)
            raise AgentLogicError(result_message)
        
        await log.ainfo("Receipt processing service finished successfully.")
        return AgentResponse(status="success", message=str(result_message))