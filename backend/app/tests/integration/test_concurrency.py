# tests/integration/test_concurrency.py

import pytest
import asyncio
from unittest.mock import patch, MagicMock

# It's better to test the service directly
from app.services.receipt_service import ReceiptService

@pytest.mark.asyncio
@patch('app.services.receipt_service.ReceiptAgent')
async def test_service_concurrency(MockReceiptAgent):
    """
    Tests that two concurrent requests to the service complete successfully
    and that the agent is not re-initialized for every call.
    """
    # Mock the agent runnable to return a predictable response
    mock_agent_runnable = MagicMock()
    mock_agent_runnable.ainvoke.return_value = {"messages": [MagicMock(content="Success")]}
    
    # The ReceiptAgent is initialized once per service instance.
    # The key is to ensure the underlying gspread client is not re-initialized.
    # We can patch the tool file for a more direct test of that.
    
    with patch('app.tools.gspread_tool.get_creds_sync') as mock_get_creds:
        service = ReceiptService(agent_runnable=mock_agent_runnable)

        # Simulate two concurrent calls
        task1 = service.process_receipt("id1", "ws1", b"fake_bytes", "image/png")
        task2 = service.process_receipt("id2", "ws2", b"fake_bytes", "image/png")
        
        results = await asyncio.gather(task1, task2)

        # Assert that both tasks completed successfully
        assert len(results) == 2
        assert results[0].status == "success"
        assert results[1].status == "success"
        
        # Assert that credential loading was only called once, proving client reuse
        assert mock_get_creds.call_count == 1