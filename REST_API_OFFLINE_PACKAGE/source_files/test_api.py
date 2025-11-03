from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Load machine-specific configuration
try:
    from machine_config import (
        MACHINE_ID,
        MACHINE_NAME,
        LOCATION,
        SYSTEM_TYPE,
        LATITUDE,
        LONGITUDE,
    )
except Exception:
    # Sensible defaults if config not present
    MACHINE_ID = "INHOUSE_MACHINE"
    MACHINE_NAME = "Inhouse Machine"
    LOCATION = "Local"
    SYSTEM_TYPE = "Automated System 4000"
    LATITUDE = 0.0
    LONGITUDE = 0.0

app = FastAPI(title=f"Machine API - {MACHINE_NAME} ({MACHINE_ID})")

# Allow CORS from your main PC
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact IPs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_MACHINES = [
    {
        "id": MACHINE_ID,
        "name": MACHINE_NAME,
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "status": "online",
        "location": LOCATION,
        "system_type": SYSTEM_TYPE,
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 42.0, "pressure": 2.1, "speed": 1450, "disk_volume": 75.0}
    }
]
 

@app.get("/")
def root():
    return {
        "message": f"Machine API - {MACHINE_NAME} ({MACHINE_ID})",
        "status": "running",
        "total_machines": len(SAMPLE_MACHINES)
    }

@app.get("/machines")
def get_machines():
    """Return local machine only"""
    return SAMPLE_MACHINES

@app.get("/machines/{machine_id}")
def get_machine(machine_id: str):
    """Get specific machine"""
    machine = next((m for m in SAMPLE_MACHINES if m["id"] == machine_id), None)
    if not machine:
        return {"error": "Machine not found"}
    return machine

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "total_machines": len(SAMPLE_MACHINES),
        "api_version": "1.0.0"
    }

@app.post("/machines/{machine_id}/status")
def update_machine_status(machine_id: str, status: str, data: dict = None):
    """Update machine status (for testing)"""
    machine = next((m for m in SAMPLE_MACHINES if m["id"] == machine_id), None)
    if not machine:
        return {"error": "Machine not found"}
    
    machine["status"] = status
    machine["last_seen"] = datetime.now().isoformat()
    
    if data:
        machine["data"].update(data)
    
    return {"message": f"Machine {machine_id} status updated to {status}", "machine": machine}

if __name__ == "__main__":
    import uvicorn
    print(f"Starting Machine API with {len(SAMPLE_MACHINES)} machine(s)")
    print(f"Machine: {MACHINE_NAME} ({MACHINE_ID}) @ {LOCATION}")
    print("API will be available at http://0.0.0.0:8023")
    uvicorn.run(app, host="0.0.0.0", port=8023)