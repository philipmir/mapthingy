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

app = FastAPI(title="Global Machine Monitor API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove disconnected clients
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Machine data models
class MachineData(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    status: str  # "online", "offline", "warning", "error"
    last_seen: datetime
    location: str
    data: Dict[str, Any] = {}

class MachineUpdate(BaseModel):
    machine_id: str
    status: str
    data: Dict[str, Any] = {}
    timestamp: datetime

# Sample machine data (replace with real data from your Swedish headquarters)
SAMPLE_MACHINES = [
    {
        "id": "machine_001",
        "name": "Production Line A - Stockholm",
        "latitude": 59.3293,
        "longitude": 18.0686,
        "status": "online",
        "location": "Stockholm, Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 45.2, "pressure": 2.3, "speed": 1500}
    },
    {
        "id": "machine_002", 
        "name": "Packaging Unit B - Gothenburg",
        "latitude": 57.7089,
        "longitude": 11.9746,
        "status": "online",
        "location": "Gothenburg, Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.7, "pressure": 1.8, "speed": 1200}
    },
    {
        "id": "machine_003",
        "name": "Quality Control C - Malmö",
        "latitude": 55.6050,
        "longitude": 13.0038,
        "status": "warning",
        "location": "Malmö, Sweden",
        "last_seen": datetime.now(),
        "data": {"temperature": 52.1, "pressure": 2.8, "speed": 800}
    },
    {
        "id": "machine_004",
        "name": "Assembly Line D - Berlin",
        "latitude": 52.5200,
        "longitude": 13.4050,
        "status": "online",
        "location": "Berlin, Germany",
        "last_seen": datetime.now(),
        "data": {"temperature": 41.5, "pressure": 2.1, "speed": 1400}
    },
    {
        "id": "machine_005",
        "name": "Testing Station E - London",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "status": "offline",
        "location": "London, UK",
        "last_seen": datetime.now(),
        "data": {"temperature": 0, "pressure": 0, "speed": 0}
    }
]

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Global Machine Monitor API", "status": "running"}

@app.get("/api/machines")
async def get_machines():
    """Get all machine data"""
    return SAMPLE_MACHINES

@app.get("/api/machines/{machine_id}")
async def get_machine(machine_id: str):
    """Get specific machine data"""
    machine = next((m for m in SAMPLE_MACHINES if m["id"] == machine_id), None)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine

@app.post("/api/machines/{machine_id}/status")
async def update_machine_status(machine_id: str, update: MachineUpdate):
    """Update machine status (simulate machine reporting)"""
    machine = next((m for m in SAMPLE_MACHINES if m["id"] == machine_id), None)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    machine["status"] = update.status
    machine["last_seen"] = update.timestamp
    machine["data"].update(update.data)
    
    # Broadcast update to all connected clients
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
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Simulate real-time machine status updates
async def simulate_machine_updates():
    """Simulate machine status changes for demo purposes"""
    while True:
        await asyncio.sleep(10)  # Update every 10 seconds
        
        # Randomly update a machine status
        machine = random.choice(SAMPLE_MACHINES)
        old_status = machine["status"]
        
        # Simulate status changes
        if old_status == "online":
            new_status = random.choice(["warning", "online", "online", "online"])  # 75% online, 25% warning
        elif old_status == "warning":
            new_status = random.choice(["online", "offline", "warning", "warning"])  # 25% each
        else:  # offline
            new_status = random.choice(["online", "offline", "offline"])  # 33% online, 67% offline
        
        machine["status"] = new_status
        machine["last_seen"] = datetime.now()
        
        # Update some data values
        if new_status == "online":
            machine["data"]["temperature"] = round(random.uniform(35, 50), 1)
            machine["data"]["pressure"] = round(random.uniform(1.5, 2.5), 1)
            machine["data"]["speed"] = random.randint(1000, 1800)
        elif new_status == "warning":
            machine["data"]["temperature"] = round(random.uniform(50, 65), 1)
            machine["data"]["pressure"] = round(random.uniform(2.5, 3.5), 1)
            machine["data"]["speed"] = random.randint(500, 1200)
        else:  # offline
            machine["data"]["temperature"] = 0
            machine["data"]["pressure"] = 0
            machine["data"]["speed"] = 0
        
        # Broadcast update
        await manager.broadcast(json.dumps({
            "type": "machine_update",
            "machine_id": machine["id"],
            "status": new_status,
            "data": machine["data"],
            "timestamp": machine["last_seen"].isoformat()
        }))

# Start background task for simulated updates
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_machine_updates())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
