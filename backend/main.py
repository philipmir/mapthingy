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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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

# Real SinterCast customer machine data - Automated System 4000
AUTOMATED_SYSTEM_4000 = [
    {
        "id": "asimco_china",
        "name": "ASIMCO International",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 42.1, "pressure": 2.2, "speed": 1450}
    },
    {
        "id": "caterpillar_usa",
        "name": "Caterpillar",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "online",
        "location": "USA",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.7, "pressure": 1.9, "speed": 1600}
    },
    {
        "id": "daedong_korea",
        "name": "Daedong Metals",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "online",
        "location": "Korea",
        "last_seen": datetime.now(),
        "data": {"temperature": 41.3, "pressure": 2.1, "speed": 1500}
    },
    {
        "id": "dashiang_1",
        "name": "Dashiang Precision (Line 1)",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 39.8, "pressure": 2.0, "speed": 1550}
    },
    {
        "id": "dashiang_2",
        "name": "Dashiang Precision (Line 2)",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "warning",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 48.2, "pressure": 2.6, "speed": 1200}
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
        "status": "warning",
        "location": "Mexico",
        "last_seen": datetime.now(),
        "data": {"temperature": 47.3, "pressure": 2.7, "speed": 1100}
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
        "data": {"temperature": 35.2, "pressure": 1.5, "speed": 800}
    },
    {
        "id": "case_western_usa",
        "name": "Case Western Reserve",
        "latitude": 41.4993,
        "longitude": -81.6944,
        "status": "online",
        "location": "USA",
        "last_seen": datetime.now(),
        "data": {"temperature": 36.8, "pressure": 1.6, "speed": 750}
    },
    {
        "id": "csic_china",
        "name": "CSIC",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 37.4, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "dongfeng_mini_china",
        "name": "Dongfeng (Mini-System)",
        "latitude": 30.5728,
        "longitude": 114.3055,
        "status": "online",
        "location": "China",
        "last_seen": datetime.now(),
        "data": {"temperature": 38.1, "pressure": 1.8, "speed": 900}
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

# Combine both systems with system type labels
SAMPLE_MACHINES = []

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
