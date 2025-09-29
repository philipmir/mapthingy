"""
Global Machine Monitor API - Production Ready Backend

This file contains the main FastAPI application for the Global Machine Monitor.
It includes both simulation code (for demo purposes) and real API integration points.

IMPORTANT: When transitioning to production:
1. Replace SAMPLE_MACHINES with real API calls
2. Remove simulate_machine_updates() function
3. Implement real WebSocket connections to machine APIs
4. Add proper authentication and security
5. Configure production database
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import asyncio
import json
import random
from datetime import datetime
from typing import List, Dict, Any
from pydantic import BaseModel
import uvicorn

# =============================================================================
# PRODUCTION CONFIGURATION
# =============================================================================
# TODO: Move these to environment variables in production
# TODO: Add proper authentication middleware
# TODO: Add rate limiting and security headers
# TODO: Configure production database connection

app = FastAPI(title="Global Machine Monitor API", version="1.0.0")

# =============================================================================
# CORS CONFIGURATION - UPDATE FOR PRODUCTION
# =============================================================================
# TODO: Restrict CORS origins in production to specific domains
# TODO: Remove wildcard methods and headers for security
# TODO: Add proper CORS preflight handling
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # PRODUCTION: Replace with actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],  # PRODUCTION: Specify exact methods needed
    allow_headers=["*"],  # PRODUCTION: Specify exact headers needed
)

# =============================================================================
# WEBSOCKET CONNECTION MANAGER - PRODUCTION READY
# =============================================================================
# This class manages WebSocket connections for real-time updates
# PRODUCTION: This is needed for real-time machine status updates
# PRODUCTION: Consider adding connection limits and authentication
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        # TODO: Add connection limits for production
        # TODO: Add authentication for WebSocket connections
        # TODO: Add connection monitoring and logging

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # TODO: Log connection in production
        # TODO: Add connection authentication

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        # TODO: Log disconnection in production

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        """Broadcast message to all connected clients - PRODUCTION READY"""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove disconnected clients
                self.active_connections.remove(connection)
                # TODO: Add proper error handling and logging

manager = ConnectionManager()

# =============================================================================
# DATA MODELS - PRODUCTION READY
# =============================================================================
# These models define the structure of machine data
# PRODUCTION: These models are used for API validation and should be kept
class MachineData(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    status: str  # "online", "offline", "warning", "error"
    last_seen: datetime
    location: str
    data: Dict[str, Any] = {}  # Contains temperature, pressure, speed, disk_volume

class MachineUpdate(BaseModel):
    """Model for machine status updates - PRODUCTION READY"""
    machine_id: str
    status: str
    data: Dict[str, Any] = {}  # Sensor data from real machines
    timestamp: datetime

# =============================================================================
# SIMULATION DATA - REPLACE WITH REAL API CALLS IN PRODUCTION
# =============================================================================
# WARNING: This is SIMULATION DATA for demo purposes only
# PRODUCTION: Replace this entire section with real API calls to customer machines
# PRODUCTION: Use the api_client.py module to fetch real machine data
# PRODUCTION: Consider caching real data in database for performance

# Real SinterCast customer machine data - Automated System 4000
# TODO: Replace with real API calls in production
AUTOMATED_SYSTEM_4000 = [
    {
        "id": "asimco_china",
        "name": "ASIMCO International",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 42.1, "pressure": 2.2, "speed": 1450, "disk_volume": 78.5}
    },
    {
        "id": "caterpillar_usa",
        "name": "Caterpillar",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "online",
        "location": "USA",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.7, "pressure": 1.9, "speed": 1600, "disk_volume": 82.3}
    },
    {
        "id": "daedong_korea",
        "name": "Daedong Metals",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "online",
        "location": "Korea",
        "last_seen": datetime.now(),
        "data": {"temperature": 41.3, "pressure": 2.1, "speed": 1500, "disk_volume": 75.8}
    },
    {
        "id": "dashiang_1",
        "name": "Dashiang Precision (Line 1)",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 39.8, "pressure": 2.0, "speed": 1550, "disk_volume": 88.2}
    },
    {
        "id": "dashiang_2",
        "name": "Dashiang Precision (Line 2)",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "warning",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 48.2, "pressure": 2.6, "speed": 1200, "disk_volume": 45.7}
    },
    {
        "id": "dongfeng_china",
        "name": "Dongfeng",
        "latitude": 30.5728,
        "longitude": 114.3055,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 43.5, "pressure": 2.3, "speed": 1400}
    },
    {
        "id": "doktas_turkey",
        "name": "Döktas",
        "latitude": 39.9334,
        "longitude": 32.8597,
        "status": "online",
        "location": "Turkey",
        "last_seen": datetime.now(),
        "data": {"temperature": 40.2, "pressure": 2.0, "speed": 1450}
    },
    {
        "id": "faw_china",
        "name": "FAW Changchun",
        "latitude": 43.8171,
        "longitude": 125.3235,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 41.7, "pressure": 2.2, "speed": 1500}
    },
    {
        "id": "federal_mogul_sweden",
        "name": "Federal Mogul",
        "latitude": 59.3293,
        "longitude": 18.0686,
        "status": "online",
        "location": "Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.9, "pressure": 1.8, "speed": 1600}
    },
    {
        "id": "hyundai_korea",
        "name": "Hyundai Jeonju",
        "latitude": 35.8242,
        "longitude": 127.1480,
        "status": "online",
        "location": "Korea",
        "last_seen": datetime.now(),
        "data": {"temperature": 42.8, "pressure": 2.3, "speed": 1450}
    },
    {
        "id": "impro_mexico",
        "name": "Impro Mexico",
        "latitude": 19.4326,
        "longitude": -99.1332,
        "status": "online",
        "location": "Mexico",
        "last_seen": datetime.now(),
        "data": {"temperature": 44.1, "pressure": 2.4, "speed": 1350}
    },
    {
        "id": "ironcast_mexico",
        "name": "IronCast",
        "latitude": 25.6866,
        "longitude": -100.3161,
        "status": "error",
        "location": "Mexico",
        "last_seen": datetime.now(),
        "data": {"temperature": 75.3, "pressure": 4.7, "speed": 500, "disk_volume": 15.2}
    },
    {
        "id": "maringa_brazil",
        "name": "Maringá Soldas",
        "latitude": -23.4205,
        "longitude": -51.9332,
        "status": "online",
        "location": "Brazil",
        "last_seen": datetime.now(),
        "data": {"temperature": 43.6, "pressure": 2.2, "speed": 1400}
    },
    {
        "id": "scania_classic_sweden",
        "name": "Scania Classic Foundry",
        "latitude": 58.4108,
        "longitude": 15.6214,
        "status": "online",
        "location": "Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 39.4, "pressure": 1.9, "speed": 1550}
    },
    {
        "id": "scania_new_sweden",
        "name": "Scania New Foundry",
        "latitude": 58.4108,
        "longitude": 15.6214,
        "status": "online",
        "location": "Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 40.7, "pressure": 2.0, "speed": 1500}
    },
    {
        "id": "skf_sweden",
        "name": "SKF Mekan",
        "latitude": 58.4108,
        "longitude": 15.6214,
        "status": "online",
        "location": "Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.2, "pressure": 1.8, "speed": 1600}
    },
    {
        "id": "tafalla_spain",
        "name": "Tafalla Iron Foundry",
        "latitude": 42.5300,
        "longitude": -1.6700,
        "status": "online",
        "location": "Spain",
        "last_seen": datetime.now(),
        "data": {"temperature": 41.9, "pressure": 2.1, "speed": 1450}
    },
    {
        "id": "tupy_betim_brazil",
        "name": "Tupy Betim",
        "latitude": -19.9167,
        "longitude": -44.1000,
        "status": "online",
        "location": "Brazil",
        "last_seen": datetime.now(),
        "data": {"temperature": 44.3, "pressure": 2.3, "speed": 1400}
    },
    {
        "id": "tupy_joinville_e0",
        "name": "Tupy Joinville Line E0",
        "latitude": -26.3044,
        "longitude": -48.8464,
        "status": "online",
        "location": "Brazil",
        "last_seen": datetime.now(),
        "data": {"temperature": 42.8, "pressure": 2.2, "speed": 1450}
    },
    {
        "id": "tupy_joinville_c4",
        "name": "Tupy Joinville Line C4",
        "latitude": -26.3044,
        "longitude": -48.8464,
        "status": "warning",
        "location": "Brazil",
        "last_seen": datetime.now(),
        "data": {"temperature": 46.7, "pressure": 2.5, "speed": 1250}
    },
    {
        "id": "tupy_ramos_mexico",
        "name": "Tupy Ramos",
        "latitude": 25.6866,
        "longitude": -100.3161,
        "status": "online",
        "location": "Mexico",
        "last_seen": datetime.now(),
        "data": {"temperature": 43.1, "pressure": 2.1, "speed": 1500}
    },
    {
        "id": "tupy_saltillo_3",
        "name": "Tupy Saltillo Line 3",
        "latitude": 25.4232,
        "longitude": -101.0053,
        "status": "online",
        "location": "Mexico",
        "last_seen": datetime.now(),
        "data": {"temperature": 42.5, "pressure": 2.2, "speed": 1450}
    },
    {
        "id": "tupy_saltillo_4",
        "name": "Tupy Saltillo Line 4",
        "latitude": 25.4232,
        "longitude": -101.0053,
        "status": "online",
        "location": "Mexico",
        "last_seen": datetime.now(),
        "data": {"temperature": 41.8, "pressure": 2.1, "speed": 1500}
    },
    {
        "id": "vdp_italy",
        "name": "VDP",
        "latitude": 45.4642,
        "longitude": 9.1900,
        "status": "online",
        "location": "Italy",
        "last_seen": datetime.now(),
        "data": {"temperature": 40.6, "pressure": 2.0, "speed": 1550}
    },
    {
        "id": "volvo_sweden",
        "name": "Volvo",
        "latitude": 57.7089,
        "longitude": 11.9746,
        "status": "online",
        "location": "Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 39.2, "pressure": 1.9, "speed": 1600}
    },
    {
        "id": "zhongding_china",
        "name": "Zhongding Power",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 43.7, "pressure": 2.3, "speed": 1400}
    }
]

# Mini-System 4000 locations
MINI_SYSTEM_4000 = [
    {
        "id": "ask_chemicals_usa",
        "name": "ASK Chemicals",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "online",
        "location": "USA",
        "last_seen": datetime.now(),
        "data": {"temperature": 35.2, "pressure": 1.5, "speed": 800, "disk_volume": 92.1}
    },
    {
        "id": "case_western_usa",
        "name": "Case Western Reserve",
        "latitude": 41.4993,
        "longitude": -81.6944,
        "status": "online",
        "location": "USA",
        "last_seen": datetime.now(),
        "data": {"temperature": 36.8, "pressure": 1.6, "speed": 750, "disk_volume": 85.4}
    },
    {
        "id": "csic_china",
        "name": "CSIC",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 37.4, "pressure": 1.7, "speed": 850, "disk_volume": 78.9}
    },
    {
        "id": "dongfeng_mini_china",
        "name": "Dongfeng (Mini-System)",
        "latitude": 30.5728,
        "longitude": 114.3055,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.1, "pressure": 1.8, "speed": 900, "disk_volume": 71.2}
    },
    {
        "id": "dongya_china",
        "name": "Dongya Technology",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 36.5, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "doosan_1_korea",
        "name": "Doosan Infracore (Line 1)",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "online",
        "location": "Korea",
        "last_seen": datetime.now(),
        "data": {"temperature": 37.9, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "doosan_2_korea",
        "name": "Doosan Infracore (Line 2)",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "warning",
        "location": "Korea",
        "last_seen": datetime.now(),
        "data": {"temperature": 42.3, "pressure": 2.1, "speed": 700}
    },
    {
        "id": "faw_research_china",
        "name": "FAW Changchun – Research",
        "latitude": 43.8171,
        "longitude": 125.3235,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 35.8, "pressure": 1.5, "speed": 750}
    },
    {
        "id": "faw_wuxi_china",
        "name": "FAW Wuxi",
        "latitude": 31.5689,
        "longitude": 120.2886,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 37.2, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "ford_usa",
        "name": "Ford Casting Development",
        "latitude": 42.3314,
        "longitude": -83.0458,
        "status": "online",
        "location": "USA",
        "last_seen": datetime.now(),
        "data": {"temperature": 36.1, "pressure": 1.5, "speed": 850}
    },
    {
        "id": "impro_china",
        "name": "Impro China",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.7, "pressure": 1.8, "speed": 900}
    },
    {
        "id": "jiangling_china",
        "name": "Jiangling Motors",
        "latitude": 28.6139,
        "longitude": 115.8821,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 37.5, "pressure": 1.7, "speed": 800}
    },
    {
        "id": "jonkoping_sweden",
        "name": "Jönköping University",
        "latitude": 57.7826,
        "longitude": 14.1618,
        "status": "online",
        "location": "Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 35.9, "pressure": 1.5, "speed": 750}
    },
    {
        "id": "mid_city_usa",
        "name": "Mid-City Foundry",
        "latitude": 41.8781,
        "longitude": -87.6298,
        "status": "online",
        "location": "USA",
        "last_seen": datetime.now(),
        "data": {"temperature": 36.3, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "roslagsgjuteriet_sweden",
        "name": "Roslagsgjuteriet",
        "latitude": 59.3293,
        "longitude": 18.0686,
        "status": "online",
        "location": "Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 36.7, "pressure": 1.6, "speed": 850}
    },
    {
        "id": "saroj_india",
        "name": "Saroj Group",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "status": "online",
        "location": "India",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.4, "pressure": 1.8, "speed": 900}
    },
    {
        "id": "shanxi_diesel_china",
        "name": "Shanxi Diesel",
        "latitude": 37.8706,
        "longitude": 112.5489,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 37.8, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "shanxi_sanlian_china",
        "name": "Shanxi Sanlian",
        "latitude": 37.8706,
        "longitude": 112.5489,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 36.9, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "toa_koki_japan",
        "name": "Toa Koki",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "status": "online",
        "location": "Japan",
        "last_seen": datetime.now(),
        "data": {"temperature": 37.1, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "total_solutions_korea",
        "name": "Total Solutions & Power",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "online",
        "location": "Korea",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.2, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "tupy_funfrap_portugal",
        "name": "Tupy Funfrap",
        "latitude": 41.1579,
        "longitude": -8.6291,
        "status": "online",
        "location": "Portugal",
        "last_seen": datetime.now(),
        "data": {"temperature": 36.6, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "undisclosed_japan",
        "name": "Undisclosed",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "status": "online",
        "location": "Japan",
        "last_seen": datetime.now(),
        "data": {"temperature": 37.3, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "university_alabama_usa",
        "name": "University of Alabama",
        "latitude": 33.2098,
        "longitude": -87.5692,
        "status": "online",
        "location": "USA",
        "last_seen": datetime.now(),
        "data": {"temperature": 35.7, "pressure": 1.5, "speed": 750}
    },
    {
        "id": "yto_china",
        "name": "YTO Group",
        "latitude": 34.7466,
        "longitude": 113.6253,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.5, "pressure": 1.8, "speed": 900}
    }
]

# =============================================================================
# SIMULATION DATA AGGREGATION - REPLACE IN PRODUCTION
# =============================================================================
# WARNING: This combines simulation data - REPLACE WITH REAL API CALLS
# PRODUCTION: Replace SAMPLE_MACHINES with real database queries
# PRODUCTION: Use database.py module to fetch real machine data
# PRODUCTION: Implement proper data caching and refresh strategies

# Combine both systems with system type labels
SAMPLE_MACHINES = []  # TODO: Replace with real database query in production

# Add Automated System 4000 machines
for machine in AUTOMATED_SYSTEM_4000:
    machine_copy = machine.copy()
    machine_copy["system_type"] = "Automated System 4000"
    machine_copy["name"] = f"{machine['name']} (AS4000)"
    SAMPLE_MACHINES.append(machine_copy)

# Add Mini-System 4000 machines
for machine in MINI_SYSTEM_4000:
    machine_copy = machine.copy()
    machine_copy["system_type"] = "Mini-System 4000"
    machine_copy["name"] = f"{machine['name']} (MS4000)"
    SAMPLE_MACHINES.append(machine_copy)

# =============================================================================
# API ENDPOINTS - PRODUCTION READY WITH MODIFICATIONS NEEDED
# =============================================================================
# These endpoints are production ready but need real data sources
# PRODUCTION: Replace SAMPLE_MACHINES with real database queries
# PRODUCTION: Add authentication and authorization
# PRODUCTION: Add proper error handling and logging
# PRODUCTION: Add rate limiting and request validation

@app.get("/")
async def root():
    """Health check endpoint - PRODUCTION READY"""
    return {"message": "Global Machine Monitor API", "status": "running"}

@app.get("/api/machines")
async def get_machines():
    """
    Get all machine data - PRODUCTION READY
    
    PRODUCTION: Replace SAMPLE_MACHINES with:
    - Real database query using database.py
    - Real API calls using api_client.py
    - Cached data for performance
    """
    # TODO: Replace with real database query
    # machines = await db_manager.get_all_machines()
    return SAMPLE_MACHINES

@app.get("/api/machines/{machine_id}")
async def get_machine(machine_id: str):
    """
    Get specific machine data - PRODUCTION READY
    
    PRODUCTION: Replace with real database query
    """
    # TODO: Replace with real database query
    # machine = await db_manager.get_machine_by_id(machine_id)
    machine = next((m for m in SAMPLE_MACHINES if m["id"] == machine_id), None)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine

@app.post("/api/machines/{machine_id}/status")
async def update_machine_status(machine_id: str, update: MachineUpdate):
    """
    Update machine status - PRODUCTION READY
    
    PRODUCTION: This endpoint receives real status updates from machines
    PRODUCTION: Replace SAMPLE_MACHINES with real database updates
    PRODUCTION: Add authentication for machine reporting
    PRODUCTION: Add validation for machine data
    """
    # TODO: Replace with real database update
    # await db_manager.update_machine_status(machine_id, update.status, update.data)
    
    machine = next((m for m in SAMPLE_MACHINES if m["id"] == machine_id), None)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    machine["status"] = update.status
    machine["last_seen"] = update.timestamp
    machine["data"].update(update.data)
    
    # Broadcast update to all connected clients - PRODUCTION READY
    await manager.broadcast(json.dumps({
        "type": "machine_update",
        "machine_id": machine_id,
        "status": update.status,
        "data": update.data,
        "timestamp": update.timestamp.isoformat()
    }))
    
    return {"message": "Status updated successfully"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates - PRODUCTION READY
    
    PRODUCTION: This endpoint provides real-time machine status updates
    PRODUCTION: Add authentication for WebSocket connections
    PRODUCTION: Add connection monitoring and logging
    PRODUCTION: Consider adding connection limits
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive - PRODUCTION READY
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # TODO: Add logging for disconnections in production

# =============================================================================
# SIMULATION CODE - REMOVE IN PRODUCTION
# =============================================================================
# WARNING: This is SIMULATION CODE for demo purposes only
# PRODUCTION: REMOVE this entire function in production
# PRODUCTION: Replace with real WebSocket connections to machine APIs
# PRODUCTION: Use api_client.py to connect to real machine data sources

async def simulate_machine_updates():
    """
    SIMULATION FUNCTION - REMOVE IN PRODUCTION
    
    This function simulates machine status changes for demo purposes.
    In production, this should be replaced with:
    1. Real WebSocket connections to machine APIs
    2. Real machine data polling
    3. Real status update handling
    """
    # First, ensure all machines start as green (active with no alarms)
    for machine in SAMPLE_MACHINES:
        machine["status"] = "green"
        machine["data"]["temperature"] = round(random.uniform(35, 50), 1)
        machine["data"]["pressure"] = round(random.uniform(1.5, 2.5), 1)
        machine["data"]["speed"] = random.randint(1000, 1800)
        machine["data"]["disk_volume"] = round(random.uniform(60, 95), 1)
    
    print("SIMULATION: All machines set to green status (active with no alarms)")
    
    while True:
        await asyncio.sleep(15)  # Update every 15 seconds
        
        # Find machines that are currently in alert status
        alert_machines = [m for m in SAMPLE_MACHINES if m["status"] in ["yellow", "red", "black", "grey"]]
        
        # If there are alert machines, reset them to green (active with no alarms)
        if alert_machines:
            for machine in alert_machines:
                old_status = machine["status"]
                machine["status"] = "green"
                machine["data"]["temperature"] = round(random.uniform(35, 50), 1)
                machine["data"]["pressure"] = round(random.uniform(1.5, 2.5), 1)
                machine["data"]["speed"] = random.randint(1000, 1800)
                machine["data"]["disk_volume"] = round(random.uniform(60, 95), 1)
                machine["last_seen"] = datetime.now()
                print(f"SIMULATION: Machine {machine['name']} recovered from {old_status} to green")
                
                # Broadcast recovery update
                update_message = {
                    "type": "machine_update",
                    "machine_id": machine["id"],
                    "status": "green",
                    "data": machine["data"],
                    "timestamp": machine["last_seen"].isoformat()
                }
                print(f"BROADCASTING: Sending recovery update for {machine['name']} to {len(manager.active_connections)} clients")
                await manager.broadcast(json.dumps(update_message))
            
            # Wait 30 seconds before creating new alert to ensure clean separation
            await asyncio.sleep(30)
        else:
            # No alert machines, pick ONE random machine to change to alert status
            machine = random.choice(SAMPLE_MACHINES)
            old_status = machine["status"]
            
            # Only change to alert status (not back to green)
            # Use specification-compliant status values with weighted probability
            alert_statuses = ["yellow", "red", "black", "grey"]
            # Weight the probabilities: yellow (40%), red (30%), black (20%), grey (10%)
            new_status = random.choices(alert_statuses, weights=[40, 30, 20, 10])[0]
            
            machine["status"] = new_status
            machine["last_seen"] = datetime.now()
            print(f"SIMULATION: Machine {machine['name']} changed from {old_status} to {new_status}")
            
            # Update data values based on new status - SIMULATION DATA
            if new_status == "yellow":  # Active with warnings
                machine["data"]["temperature"] = round(random.uniform(50, 65), 1)
                machine["data"]["pressure"] = round(random.uniform(2.5, 3.5), 1)
                machine["data"]["speed"] = random.randint(500, 1200)
                machine["data"]["disk_volume"] = round(random.uniform(20, 60), 1)
            elif new_status == "red":  # Active with errors
                machine["data"]["temperature"] = round(random.uniform(70, 85), 1)  # Very high temperature
                machine["data"]["pressure"] = round(random.uniform(4.0, 5.5), 1)  # Very high pressure
                machine["data"]["speed"] = random.randint(200, 800)  # Low speed
                machine["data"]["disk_volume"] = round(random.uniform(5, 25), 1)  # Very low disk space
            elif new_status == "black":  # System not accessible
                machine["data"]["temperature"] = 0
                machine["data"]["pressure"] = 0
                machine["data"]["speed"] = 0
                machine["data"]["disk_volume"] = 0
            else:  # grey - Not connected to SOSON
                machine["data"]["temperature"] = 0
                machine["data"]["pressure"] = 0
                machine["data"]["speed"] = 0
                machine["data"]["disk_volume"] = 0
            
            # Broadcast alert update
            update_message = {
                "type": "machine_update",
                "machine_id": machine["id"],
                "status": new_status,
                "data": machine["data"],
                "timestamp": machine["last_seen"].isoformat()
            }
            print(f"BROADCASTING: Sending alert update for {machine['name']} to {len(manager.active_connections)} clients")
            await manager.broadcast(json.dumps(update_message))

# =============================================================================
# APPLICATION STARTUP - PRODUCTION CONFIGURATION NEEDED
# =============================================================================
# PRODUCTION: Replace simulation with real API connections
# PRODUCTION: Add proper error handling and logging
# PRODUCTION: Add health checks and monitoring
# PRODUCTION: Configure production database connection

@app.on_event("startup")
async def startup_event():
    """
    Application startup event - PRODUCTION CONFIGURATION NEEDED
    
    PRODUCTION: Replace simulation with:
    1. Real database initialization
    2. Real API client connections
    3. Real WebSocket connections to machines
    4. Health check endpoints
    5. Monitoring setup
    """
    # TODO: Initialize database connection in production
    # TODO: Initialize API clients in production
    # TODO: Start real WebSocket connections to machines
    # TODO: Add health check endpoints
    
    # SIMULATION ONLY - REMOVE IN PRODUCTION
    asyncio.create_task(simulate_machine_updates())

if __name__ == "__main__":
    # PRODUCTION: Use proper ASGI server (Gunicorn + Uvicorn)
    # PRODUCTION: Add SSL/TLS configuration
    # PRODUCTION: Add proper logging configuration
    # PRODUCTION: Add monitoring and metrics
    uvicorn.run(app, host="0.0.0.0", port=8000)
