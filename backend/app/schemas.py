# app/schemas.py
import uuid
from datetime import datetime
from typing import TypedDict, Annotated, Sequence, Optional, List
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field

class User(BaseModel):
    id: uuid.UUID
    auth_id: uuid.UUID
    email: str
    full_name: Optional[str] = None
    google_refresh_token: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Spreadsheet(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    google_spreadsheet_id: str
    name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    spreadsheet_id: str
    worksheet_name: str
    google_refresh_token: str 
    result: Optional[str]

class AgentResponse(BaseModel):
    status: str
    message: str