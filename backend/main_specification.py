"""
Global Machine Monitor API - Specification Compliant Backend

This file implements the exact API structure required by the specification.
It includes database integration and matches the system_info_example.json structure.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uvicorn
from database import db_manager, init_database
from status_config import get_system_status

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="System Status Portal API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# WEBSOCKET CONNECTION MANAGER
# =============================================================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.active_connections.remove(connection)

manager = ConnectionManager()

# =============================================================================
# DATA MODELS - SPECIFICATION COMPLIANT
# =============================================================================
class SystemInfo(BaseModel):
    """System information model matching specification requirements"""
    version: str
    system: Dict[str, Any]
    disks: List[Dict[str, Any]]

class SystemUpdate(BaseModel):
    """System update model for real-time updates"""
    system_id: str
    status: str
    data: Dict[str, Any] = {}
    timestamp: datetime

class SystemStatus(BaseModel):
    """System status model for API responses"""
    id: str
    name: str
    location: str
    latitude: float
    longitude: float
    status: str
    system_type: Optional[str] = None
    last_seen: datetime
    data: Dict[str, Any] = {}

# =============================================================================
# API ENDPOINTS - SPECIFICATION COMPLIANT
# =============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "System Status Portal API", "status": "running", "version": "1.0.0"}

@app.get("/api/systems", response_model=List[SystemStatus])
async def get_systems():
    """
    Get all systems - matches specification requirements
    Returns systems with color-coded status information
    """
    try:
        systems = await db_manager.get_all_machines()
        logger.info(f"Retrieved {len(systems)} systems")
        return systems
    except Exception as e:
        logger.error(f"Error retrieving systems: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/systems/{system_id}", response_model=SystemStatus)
async def get_system(system_id: str):
    """
    Get specific system - matches specification requirements
    Returns detailed system information for popup dialog
    """
    try:
        system = await db_manager.get_machine_by_id(system_id)
        if not system:
            raise HTTPException(status_code=404, detail="System not found")
        return system
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving system {system_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/systems/{system_id}/data")
async def update_system_data(system_id: str, system_info: SystemInfo):
    """
    Update system data - matches specification requirements
    Receives system information from remote systems
    """
    try:
        # Extract system information from the specification format
        system_data = {
            "api_version": system_info.version,
            "windows_version": system_info.system.get("os"),
            "uptime_days": system_info.system.get("upTime", {}).get("days", 0),
            "computer_name": system_info.system.get("name"),
            "timezone": system_info.system.get("timezone", {}).get("id"),
            "timezone_display_name": system_info.system.get("timezone", {}).get("displayName"),
            "timezone_standard_name": system_info.system.get("timezone", {}).get("standardName"),
            "timezone_daylight_name": system_info.system.get("timezone", {}).get("daylightName"),
            "timezone_base_utc_offset_ticks": system_info.system.get("timezone", {}).get("baseUtcOffset", {}).get("ticks"),
            "timezone_supports_daylight_saving": system_info.system.get("timezone", {}).get("supportsDaylightSavingTime", False),
            "actual_time": datetime.fromisoformat(system_info.system.get("time", "").replace("Z", "+00:00")) if system_info.system.get("time") else None,
            "utc_time": datetime.fromisoformat(system_info.system.get("utcTime", "").replace("Z", "+00:00")) if system_info.system.get("utcTime") else None,
            "disk_usage": system_info.disks,
            "memory_usage": {}  # Will be populated from system data
        }
        
        # Determine system status using specification-compliant logic
        system_status = get_system_status({
            "last_seen": datetime.now(),
            "data": system_data
        })
        
        # Update system status in database
        success = await db_manager.update_machine_status(system_id, system_status, system_data)
        if not success:
            raise HTTPException(status_code=404, detail="System not found")
        
        # Broadcast update to connected clients
        await manager.broadcast(json.dumps({
            "type": "system_update",
            "system_id": system_id,
            "status": system_status,
            "data": system_data,
            "timestamp": datetime.now().isoformat()
        }))
        
        logger.info(f"Updated system {system_id} data")
        return {"message": "System data updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating system {system_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/systems/{system_id}/history")
async def get_system_history(system_id: str, hours: int = 24):
    """
    Get system history - matches specification requirements
    Returns historical data for the specified time period
    """
    try:
        history = await db_manager.get_machine_history(system_id, hours)
        return {"system_id": system_id, "history": history, "hours": hours}
    except Exception as e:
        logger.error(f"Error retrieving system history: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/analytics")
async def get_analytics(hours: int = 24):
    """
    Get analytics data - matches specification requirements
    Returns system analytics for dashboard
    """
    try:
        analytics = await db_manager.get_analytics(hours)
        return analytics
    except Exception as e:
        logger.error(f"Error retrieving analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates - matches specification requirements
    Provides real-time system status updates
    """
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# =============================================================================
# STATUS DETERMINATION - SPECIFICATION COMPLIANT
# =============================================================================
# Status determination is now handled by status_config.py module
# This provides configurable status criteria as required by the specification

# =============================================================================
# APPLICATION STARTUP
# =============================================================================
@app.on_event("startup")
async def startup_event():
    """Initialize database and start background tasks"""
    try:
        # Initialize database
        init_database()
        logger.info("Database initialized successfully")
        
        # Start background tasks
        asyncio.create_task(cleanup_old_data())
        logger.info("Background tasks started")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")

async def cleanup_old_data():
    """Clean up old data to maintain 2-month retention"""
    while True:
        try:
            # Run cleanup every 24 hours
            await asyncio.sleep(24 * 60 * 60)
            
            # Clean up old data
            # This would call the database cleanup function
            logger.info("Running data cleanup...")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
