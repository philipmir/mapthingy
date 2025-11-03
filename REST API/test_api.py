from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime
from typing import List, Dict, Any

app = FastAPI(title="Complete Test Machine API - All 52 Machines")

# Allow CORS from your main PC
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact IPs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Complete machine data with all 52 machines from your main app
SAMPLE_MACHINES = [
    # AUTOMATED SYSTEM 4000 MACHINES (28 machines)
    {
        "id": "asimco_china",
        "name": "ASIMCO International",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "status": "online",
        "location": "China",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 42.1, "pressure": 2.2, "speed": 1450, "disk_volume": 78.5}
    },
    {
        "id": "caterpillar_usa",
        "name": "Caterpillar",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "online",
        "location": "USA",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 38.7, "pressure": 1.9, "speed": 1600, "disk_volume": 82.3}
    },
    {
        "id": "daedong_korea",
        "name": "Daedong Metals",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "online",
        "location": "Korea",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 41.3, "pressure": 2.1, "speed": 1500, "disk_volume": 75.8}
    },
    {
        "id": "dashiang_1",
        "name": "Dashiang Precision (Line 1)",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 39.8, "pressure": 2.0, "speed": 1550, "disk_volume": 88.2}
    },
    {
        "id": "dashiang_2",
        "name": "Dashiang Precision (Line 2)",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "warning",
        "location": "China",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 48.2, "pressure": 2.6, "speed": 1200, "disk_volume": 45.7}
    },
    {
        "id": "dongfeng_china",
        "name": "Dongfeng",
        "latitude": 30.5728,
        "longitude": 114.3055,
        "status": "online",
        "location": "China",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 43.5, "pressure": 2.3, "speed": 1400}
    },
    {
        "id": "doktas_turkey",
        "name": "Döktas",
        "latitude": 39.9334,
        "longitude": 32.8597,
        "status": "online",
        "location": "Turkey",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 40.2, "pressure": 2.0, "speed": 1450}
    },
    {
        "id": "faw_china",
        "name": "FAW Changchun",
        "latitude": 43.8171,
        "longitude": 125.3235,
        "status": "online",
        "location": "China",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 41.7, "pressure": 2.2, "speed": 1500}
    },
    {
        "id": "federal_mogul_sweden",
        "name": "Federal Mogul",
        "latitude": 59.3293,
        "longitude": 18.0686,
        "status": "online",
        "location": "Sweden",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 38.9, "pressure": 1.8, "speed": 1600}
    },
    {
        "id": "hyundai_korea",
        "name": "Hyundai Jeonju",
        "latitude": 35.8242,
        "longitude": 127.1480,
        "status": "online",
        "location": "Korea",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 42.8, "pressure": 2.3, "speed": 1450}
    },
    {
        "id": "impro_mexico",
        "name": "Impro Mexico",
        "latitude": 19.4326,
        "longitude": -99.1332,
        "status": "online",
        "location": "Mexico",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 44.1, "pressure": 2.4, "speed": 1350}
    },
    {
        "id": "ironcast_mexico",
        "name": "IronCast",
        "latitude": 25.6866,
        "longitude": -100.3161,
        "status": "error",
        "location": "Mexico",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 75.3, "pressure": 4.7, "speed": 500, "disk_volume": 15.2}
    },
    {
        "id": "maringa_brazil",
        "name": "Maringá Soldas",
        "latitude": -23.4205,
        "longitude": -51.9332,
        "status": "offline",
        "location": "Brazil",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 43.6, "pressure": 2.2, "speed": 1400}
    },
    {
        "id": "scania_classic_sweden",
        "name": "Scania Classic Foundry",
        "latitude": 58.4108,
        "longitude": 15.6214,
        "status": "online",
        "location": "Sweden",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 39.4, "pressure": 1.9, "speed": 1550}
    },
    {
        "id": "scania_new_sweden",
        "name": "Scania New Foundry",
        "latitude": 58.4108,
        "longitude": 15.6214,
        "status": "online",
        "location": "Sweden",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 40.7, "pressure": 2.0, "speed": 1500}
    },
    {
        "id": "skf_sweden",
        "name": "SKF Mekan",
        "latitude": 58.4108,
        "longitude": 15.6214,
        "status": "online",
        "location": "Sweden",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 38.2, "pressure": 1.8, "speed": 1600}
    },
    {
        "id": "tafalla_spain",
        "name": "Tafalla Iron Foundry",
        "latitude": 42.5300,
        "longitude": -1.6700,
        "status": "online",
        "location": "Spain",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 41.9, "pressure": 2.1, "speed": 1450}
    },
    {
        "id": "tupy_betim_brazil",
        "name": "Tupy Betim",
        "latitude": -19.9167,
        "longitude": -44.1000,
        "status": "online",
        "location": "Brazil",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 44.3, "pressure": 2.3, "speed": 1400}
    },
    {
        "id": "tupy_joinville_e0",
        "name": "Tupy Joinville Line E0",
        "latitude": -26.3044,
        "longitude": -48.8464,
        "status": "online",
        "location": "Brazil",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 42.8, "pressure": 2.2, "speed": 1450}
    },
    {
        "id": "tupy_joinville_c4",
        "name": "Tupy Joinville Line C4",
        "latitude": -26.3044,
        "longitude": -48.8464,
        "status": "warning",
        "location": "Brazil",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 46.7, "pressure": 2.5, "speed": 1250}
    },
    {
        "id": "tupy_ramos_mexico",
        "name": "Tupy Ramos",
        "latitude": 25.6866,
        "longitude": -100.3161,
        "status": "online",
        "location": "Mexico",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 43.1, "pressure": 2.1, "speed": 1500}
    },
    {
        "id": "tupy_saltillo_3",
        "name": "Tupy Saltillo Line 3",
        "latitude": 25.4232,
        "longitude": -101.0053,
        "status": "online",
        "location": "Mexico",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 42.5, "pressure": 2.2, "speed": 1450}
    },
    {
        "id": "tupy_saltillo_4",
        "name": "Tupy Saltillo Line 4",
        "latitude": 25.4232,
        "longitude": -101.0053,
        "status": "online",
        "location": "Mexico",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 41.8, "pressure": 2.1, "speed": 1500}
    },
    {
        "id": "vdp_italy",
        "name": "VDP",
        "latitude": 45.4642,
        "longitude": 9.1900,
        "status": "online",
        "location": "Italy",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 40.6, "pressure": 2.0, "speed": 1550}
    },
    {
        "id": "volvo_sweden",
        "name": "Volvo",
        "latitude": 57.7089,
        "longitude": 11.9746,
        "status": "online",
        "location": "Sweden",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 39.2, "pressure": 1.9, "speed": 1600}
    },
    {
        "id": "zhongding_china",
        "name": "Zhongding Power",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "system_type": "Automated System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 43.7, "pressure": 2.3, "speed": 1400}
    },
    
    # MINI-SYSTEM 4000 MACHINES (24 machines)
    {
        "id": "ask_chemicals_usa",
        "name": "ASK Chemicals",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "online",
        "location": "USA",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 35.2, "pressure": 1.5, "speed": 800, "disk_volume": 92.1}
    },
    {
        "id": "case_western_usa",
        "name": "Case Western Reserve",
        "latitude": 41.4993,
        "longitude": -81.6944,
        "status": "online",
        "location": "USA",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 36.8, "pressure": 1.6, "speed": 750, "disk_volume": 85.4}
    },
    {
        "id": "csic_china",
        "name": "CSIC",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 37.4, "pressure": 1.7, "speed": 850, "disk_volume": 78.9}
    },
    {
        "id": "dongfeng_mini_china",
        "name": "Dongfeng (Mini-System)",
        "latitude": 30.5728,
        "longitude": 114.3055,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 38.1, "pressure": 1.8, "speed": 900, "disk_volume": 71.2}
    },
    {
        "id": "dongya_china",
        "name": "Dongya Technology",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 36.5, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "doosan_1_korea",
        "name": "Doosan Infracore (Line 1)",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "online",
        "location": "Korea",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 37.9, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "doosan_2_korea",
        "name": "Doosan Infracore (Line 2)",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "warning",
        "location": "Korea",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 42.3, "pressure": 2.1, "speed": 700}
    },
    {
        "id": "faw_research_china",
        "name": "FAW Changchun – Research",
        "latitude": 43.8171,
        "longitude": 125.3235,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 35.8, "pressure": 1.5, "speed": 750}
    },
    {
        "id": "faw_wuxi_china",
        "name": "FAW Wuxi",
        "latitude": 31.5689,
        "longitude": 120.2886,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 37.2, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "ford_usa",
        "name": "Ford Casting Development",
        "latitude": 42.3314,
        "longitude": -83.0458,
        "status": "online",
        "location": "USA",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 36.1, "pressure": 1.5, "speed": 850}
    },
    {
        "id": "impro_china",
        "name": "Impro China",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 38.7, "pressure": 1.8, "speed": 900}
    },
    {
        "id": "jiangling_china",
        "name": "Jiangling Motors",
        "latitude": 28.6139,
        "longitude": 115.8821,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 37.5, "pressure": 1.7, "speed": 800}
    },
    {
        "id": "jonkoping_sweden",
        "name": "Jönköping University",
        "latitude": 57.7826,
        "longitude": 14.1618,
        "status": "online",
        "location": "Sweden",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 35.9, "pressure": 1.5, "speed": 750}
    },
    {
        "id": "mid_city_usa",
        "name": "Mid-City Foundry",
        "latitude": 41.8781,
        "longitude": -87.6298,
        "status": "online",
        "location": "USA",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 36.3, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "roslagsgjuteriet_sweden",
        "name": "Roslagsgjuteriet",
        "latitude": 59.3293,
        "longitude": 18.0686,
        "status": "online",
        "location": "Sweden",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 36.7, "pressure": 1.6, "speed": 850}
    },
    {
        "id": "saroj_india",
        "name": "Saroj Group",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "status": "online",
        "location": "India",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 38.4, "pressure": 1.8, "speed": 900}
    },
    {
        "id": "shanxi_diesel_china",
        "name": "Shanxi Diesel",
        "latitude": 37.8706,
        "longitude": 112.5489,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 37.8, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "shanxi_sanlian_china",
        "name": "Shanxi Sanlian",
        "latitude": 37.8706,
        "longitude": 112.5489,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 36.9, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "toa_koki_japan",
        "name": "Toa Koki",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "status": "online",
        "location": "Japan",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 37.1, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "total_solutions_korea",
        "name": "Total Solutions & Power",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "status": "online",
        "location": "Korea",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 38.2, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "tupy_funfrap_portugal",
        "name": "Tupy Funfrap",
        "latitude": 41.1579,
        "longitude": -8.6291,
        "status": "online",
        "location": "Portugal",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 36.6, "pressure": 1.6, "speed": 800}
    },
    {
        "id": "undisclosed_japan",
        "name": "Undisclosed",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "status": "online",
        "location": "Japan",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 37.3, "pressure": 1.7, "speed": 850}
    },
    {
        "id": "university_alabama_usa",
        "name": "University of Alabama",
        "latitude": 33.2098,
        "longitude": -87.5692,
        "status": "online",
        "location": "USA",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 35.7, "pressure": 1.5, "speed": 750}
    },
    {
        "id": "yto_china",
        "name": "YTO Group",
        "latitude": 34.7466,
        "longitude": 113.6253,
        "status": "online",
        "location": "China",
        "system_type": "Mini-System 4000",
        "last_seen": datetime.now().isoformat(),
        "data": {"temperature": 38.5, "pressure": 1.8, "speed": 900}
    }
]

@app.get("/")
def root():
    return {
        "message": "Complete Test Machine API - All 52 Machines", 
        "status": "running", 
        "total_machines": len(SAMPLE_MACHINES),
        "automated_systems": len([m for m in SAMPLE_MACHINES if m["system_type"] == "Automated System 4000"]),
        "mini_systems": len([m for m in SAMPLE_MACHINES if m["system_type"] == "Mini-System 4000"])
    }

@app.get("/machines")
def get_machines():
    """Return all 52 machines"""
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
    print(f"Starting Complete Test Machine API with {len(SAMPLE_MACHINES)} machines")
    print(f"Automated Systems: {len([m for m in SAMPLE_MACHINES if m['system_type'] == 'Automated System 4000'])}")
    print(f"Mini Systems: {len([m for m in SAMPLE_MACHINES if m['system_type'] == 'Mini-System 4000'])}")
    print("API will be available at http://0.0.0.0:8023")
    uvicorn.run(app, host="0.0.0.0", port=8023)