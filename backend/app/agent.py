from functools import partial
import structlog
import json
import gspread_asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import ToolMessage, AIMessage
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig # Import RunnableConfig

from app.core.config import settings
from app.schemas import AgentState
# Import the tools directly
from app.tools.gspread_tool import get_creds_for_user,  batch_append_to_sheet

log = structlog.get_logger()

# Define the tools available to the agent (globally or within __init__)
tools = [batch_append_to_sheet] # These are the @tool decorated functions
tool_map = {tool.name: tool for tool in tools}

class ReceiptAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", 
            google_api_key=settings.GOOGLE_API_KEY, 
            temperature=0,
            convert_system_message_to_human=True
        )
        
        # Bind tools to LLM once during initialization
        self.llm_with_tools = self.llm.bind_tools(tools)
        
        # Define the graph
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("agent", self.agent_node)
        workflow.add_node("action", self.execute_tools)

        # Define edges
        workflow.set_entry_point("agent")
        workflow.add_conditional_edges(
            "agent",
            lambda state: "action" if state["messages"][-1].tool_calls else END,
            {"action": "action", END: END}
        )
        workflow.add_edge('action', 'agent')

        memory = MemorySaver()
        self.graph = workflow.compile(checkpointer=memory)

    async def agent_node(self, state: AgentState) -> dict:
        """Agent node that handles LLM interactions with pre-bound tools."""
        # The tools are already bound in __init__ (self.llm_with_tools)
        response = await self.llm_with_tools.ainvoke(state["messages"])
        return {"messages": [response]}

    async def execute_tools(self, state: AgentState) -> dict:
        """Execute tool calls from the last message"""
        last_message = state["messages"][-1]
        if not isinstance(last_message, AIMessage) or not last_message.tool_calls:
            return {"messages": []}

        refresh_token = state.get("google_refresh_token")
        if not refresh_token:
            # This check is crucial for catching missing tokens early
            tool_messages = [ToolMessage(
                content="Error: Google account not linked or token is missing. Please reconnect your Google account.",
                tool_call_id=last_message.tool_calls[0].get("id") if last_message.tool_calls else "error"
            )]
            await log.awarning("Google refresh token missing from state for tool execution.")
            return {"messages": tool_messages}

        # Authorize the gspread client once for this execution step
        agc = None # Initialize to None
        try:
            user_creds_func = partial(get_creds_for_user, refresh_token=refresh_token)
            user_agcm = gspread_asyncio.AsyncioGspreadClientManager(user_creds_func)
            agc = await user_agcm.authorize() # This is the authorized gspread client
        except Exception as e:
            # Catch authentication errors here so the tool execution doesn't proceed
            tool_messages = [ToolMessage(
                content=f"Authentication error with Google Sheets: {str(e)}. Please ensure your Google account is properly linked and has access.",
                tool_call_id=last_message.tool_calls[0].get("id") if last_message.tool_calls else "error"
            )]
            await log.aerror("Failed to authorize gspread client", error=str(e), refresh_token_present=bool(refresh_token))
            return {"messages": tool_messages}

        tool_messages = []
        
        for tool_call in last_message.tool_calls:
            tool_name = tool_call.get("name")
            tool_args = tool_call.get("args", {})
            tool_call_id = tool_call.get("id")
            
            # Create a RunnableConfig for this tool call, injecting the client
            run_config = RunnableConfig(configurable={"gspread_client": agc}) # Only client is needed by tool, not raw token
            
            try:
                # Retrieve the actual tool function by name from the global tool_map
                tool_function = tool_map[tool_name]
                
                # Invoke the tool function, passing tool_args from LLM and our custom run_config
                result = await tool_function.ainvoke(tool_args, config=run_config)
                
                tool_messages.append(
                    ToolMessage(
                        content=json.dumps(result),
                        tool_call_id=tool_call_id,
                    )
                )
                
            except Exception as e:
                # This exception handler catches errors *within* the tool function
                await log.aerror(
                    f"Error executing tool {tool_name}", 
                    error=str(e), 
                    tool_args=tool_args, 
                    tool_call_id=tool_call_id
                )
                tool_messages.append(
                    ToolMessage(
                        content=f"Error executing tool {tool_name}: {str(e)}",
                        tool_call_id=tool_call_id,
                    )
                )

        return {"messages": tool_messages}

    def get_agent(self):
        return self.graph