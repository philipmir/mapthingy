"""
Production API client for machine data integration
"""
import httpx
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class MachineAPIClient:
    """Client for integrating with real machine APIs"""
    
    def __init__(self, base_url: str, api_key: str, timeout: int = 30):
        self.base_url = base_url
        self.api_key = api_key
        self.timeout = timeout
        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "SinterCast-Monitor/1.0"
            }
        )
    
    async def get_all_machines(self) -> List[Dict[str, Any]]:
        """Fetch all machines from the API"""
        try:
            logger.info(f"Fetching machines from {self.base_url}/machines")
            response = await self.client.get(f"{self.base_url}/machines")
            response.raise_for_status()
            
            machines = response.json()
            logger.info(f"Successfully fetched {len(machines)} machines")
            return machines
            
        except httpx.RequestError as e:
            logger.error(f"API request failed: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching machines: {e}")
            return []
    
    async def get_machine_status(self, machine_id: str) -> Dict[str, Any]:
        """Get current status of a specific machine"""
        try:
            logger.debug(f"Fetching status for machine {machine_id}")
            response = await self.client.get(f"{self.base_url}/machines/{machine_id}/status")
            response.raise_for_status()
            
            status_data = response.json()
            logger.debug(f"Machine {machine_id} status: {status_data.get('status')}")
            return status_data
            
        except httpx.RequestError as e:
            logger.error(f"Failed to get status for machine {machine_id}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error getting machine status: {e}")
            return {}
    
    async def update_machine_status(self, machine_id: str, status: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update machine status via API"""
        try:
            payload = {
                "status": status,
                "data": data,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Updating machine {machine_id} status to {status}")
            response = await self.client.post(
                f"{self.base_url}/machines/{machine_id}/status",
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Successfully updated machine {machine_id}")
            return result
            
        except httpx.RequestError as e:
            logger.error(f"Failed to update machine {machine_id}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error updating machine: {e}")
            return {}
    
    async def get_machine_history(self, machine_id: str, hours: int = 24) -> List[Dict[str, Any]]:
        """Get historical data for a machine"""
        try:
            params = {"hours": hours}
            response = await self.client.get(
                f"{self.base_url}/machines/{machine_id}/history",
                params=params
            )
            response.raise_for_status()
            
            history = response.json()
            logger.debug(f"Retrieved {len(history)} history records for machine {machine_id}")
            return history
            
        except httpx.RequestError as e:
            logger.error(f"Failed to get history for machine {machine_id}: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting machine history: {e}")
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Check API health and connectivity"""
        try:
            response = await self.client.get(f"{self.base_url}/health")
            response.raise_for_status()
            
            health_data = response.json()
            logger.info("API health check successful")
            return health_data
            
        except httpx.RequestError as e:
            logger.error(f"API health check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error in health check: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
        logger.info("API client closed")

class MachineWebSocketClient:
    """WebSocket client for real-time machine updates"""
    
    def __init__(self, ws_url: str, on_message_callback):
        self.ws_url = ws_url
        self.on_message_callback = on_message_callback
        self.websocket = None
        self.running = False
        self.reconnect_interval = 5
        self.max_reconnect_attempts = 10
        self.reconnect_attempts = 0
    
    async def connect(self):
        """Connect to machine WebSocket with auto-reconnect"""
        try:
            import websockets
            
            self.websocket = await websockets.connect(
                self.ws_url,
                ping_interval=20,
                ping_timeout=10,
                close_timeout=10
            )
            self.running = True
            self.reconnect_attempts = 0
            logger.info(f"Connected to WebSocket: {self.ws_url}")
            
            # Start listening for messages
            await self.listen()
            
        except Exception as e:
            logger.error(f"WebSocket connection failed: {e}")
            await self.handle_reconnect()
    
    async def listen(self):
        """Listen for real-time updates"""
        try:
            async for message in self.websocket:
                try:
                    import json
                    data = json.loads(message)
                    await self.on_message_callback(data)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse WebSocket message: {e}")
                except Exception as e:
                    logger.error(f"Error processing WebSocket message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.warning("WebSocket connection closed")
            self.running = False
            await self.handle_reconnect()
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            self.running = False
            await self.handle_reconnect()
    
    async def handle_reconnect(self):
        """Handle WebSocket reconnection"""
        if self.reconnect_attempts < self.max_reconnect_attempts:
            self.reconnect_attempts += 1
            logger.info(f"Attempting to reconnect ({self.reconnect_attempts}/{self.max_reconnect_attempts})")
            await asyncio.sleep(self.reconnect_interval)
            await self.connect()
        else:
            logger.error("Max reconnection attempts reached")
    
    async def send_message(self, message: dict):
        """Send message to machine WebSocket"""
        if self.websocket and self.running:
            try:
                import json
                await self.websocket.send(json.dumps(message))
                logger.debug(f"Sent message: {message}")
            except Exception as e:
                logger.error(f"Failed to send WebSocket message: {e}")
    
    async def close(self):
        """Close WebSocket connection"""
        self.running = False
        if self.websocket:
            await self.websocket.close()
            logger.info("WebSocket connection closed")

# Factory function for creating API client
def create_api_client() -> Optional[MachineAPIClient]:
    """Create API client from environment variables"""
    base_url = os.getenv("API_BASE_URL")
    api_key = os.getenv("API_KEY")
    
    if not base_url or not api_key:
        logger.warning("API credentials not configured, using simulation mode")
        return None
    
    return MachineAPIClient(base_url, api_key)

# Factory function for creating WebSocket client
def create_websocket_client(on_message_callback) -> Optional[MachineWebSocketClient]:
    """Create WebSocket client from environment variables"""
    ws_url = os.getenv("WS_URL")
    
    if not ws_url:
        logger.warning("WebSocket URL not configured")
        return None
    
    return MachineWebSocketClient(ws_url, on_message_callback)
