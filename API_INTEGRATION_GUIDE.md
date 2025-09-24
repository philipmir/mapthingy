# Real API Integration Guide

## Overview

This guide explains how to connect the Global Machine Monitor to real production APIs, replacing the simulated data with live machine data from actual SinterCast installations.

## 1. API Architecture Options

### Option A: Direct Machine API Integration
Connect directly to individual machine APIs at customer sites.

### Option B: Centralized Data Hub
Use a centralized data collection system that aggregates data from all machines.

### Option C: Hybrid Approach
Combine both direct connections and centralized data for maximum reliability.

## 2. Production Backend Updates

### 2.1 Environment Configuration

Create `.env` file in backend directory:
```env
# API Configuration
API_BASE_URL=https://api.sintercast.com/v1
API_KEY=your_api_key_here
API_TIMEOUT=30

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/machine_monitor
REDIS_URL=redis://localhost:6379

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL=30
WS_MAX_CONNECTIONS=1000

# Machine Data Sources
MACHINE_DATA_SOURCE=api  # api, database, hybrid
ENABLE_SIMULATION=false
```

### 2.2 Database Schema

```sql
-- Machines table
CREATE TABLE machines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    system_type VARCHAR(50),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Machine data table
CREATE TABLE machine_data (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id),
    temperature DECIMAL(5, 2),
    pressure DECIMAL(5, 2),
    speed INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Machine status history
CREATE TABLE machine_status_history (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id),
    status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data JSONB
);
```

## 3. API Integration Patterns

### 3.1 RESTful API Integration

```python
# backend/api_client.py
import httpx
import asyncio
from typing import List, Dict, Any
from datetime import datetime

class MachineAPIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"Authorization": f"Bearer {api_key}"}
        )
    
    async def get_all_machines(self) -> List[Dict[str, Any]]:
        """Fetch all machines from the API"""
        try:
            response = await self.client.get(f"{self.base_url}/machines")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"API request failed: {e}")
            return []
    
    async def get_machine_status(self, machine_id: str) -> Dict[str, Any]:
        """Get current status of a specific machine"""
        try:
            response = await self.client.get(f"{self.base_url}/machines/{machine_id}/status")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"Failed to get status for machine {machine_id}: {e}")
            return {}
    
    async def update_machine_status(self, machine_id: str, status: str, data: Dict[str, Any]):
        """Update machine status via API"""
        try:
            payload = {
                "status": status,
                "data": data,
                "timestamp": datetime.now().isoformat()
            }
            response = await self.client.post(
                f"{self.base_url}/machines/{machine_id}/status",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"Failed to update machine {machine_id}: {e}")
            return {}
```

### 3.2 WebSocket Integration

```python
# backend/websocket_client.py
import asyncio
import websockets
import json
from typing import Callable

class MachineWebSocketClient:
    def __init__(self, ws_url: str, on_message: Callable):
        self.ws_url = ws_url
        self.on_message = on_message
        self.websocket = None
        self.running = False
    
    async def connect(self):
        """Connect to machine WebSocket"""
        try:
            self.websocket = await websockets.connect(self.ws_url)
            self.running = True
            print(f"Connected to {self.ws_url}")
            
            # Start listening for messages
            await self.listen()
        except Exception as e:
            print(f"WebSocket connection failed: {e}")
    
    async def listen(self):
        """Listen for real-time updates"""
        try:
            async for message in self.websocket:
                data = json.loads(message)
                await self.on_message(data)
        except websockets.exceptions.ConnectionClosed:
            print("WebSocket connection closed")
            self.running = False
        except Exception as e:
            print(f"WebSocket error: {e}")
            self.running = False
    
    async def send_message(self, message: dict):
        """Send message to machine WebSocket"""
        if self.websocket and self.running:
            await self.websocket.send(json.dumps(message))
```

## 4. Updated Backend Implementation

### 4.1 Production-Ready Main.py

```python
# backend/main.py (Updated sections)
import os
from dotenv import load_dotenv
from api_client import MachineAPIClient
from websocket_client import MachineWebSocketClient

# Load environment variables
load_dotenv()

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "https://api.sintercast.com/v1")
API_KEY = os.getenv("API_KEY")
MACHINE_DATA_SOURCE = os.getenv("MACHINE_DATA_SOURCE", "api")
ENABLE_SIMULATION = os.getenv("ENABLE_SIMULATION", "false").lower() == "true"

# Initialize API client
api_client = MachineAPIClient(API_BASE_URL, API_KEY) if API_KEY else None

# WebSocket message handler
async def handle_machine_update(data):
    """Handle real-time machine updates from WebSocket"""
    machine_id = data.get("machine_id")
    if machine_id:
        # Update machine status in database
        await update_machine_in_database(machine_id, data)
        
        # Broadcast to connected clients
        await manager.broadcast(json.dumps({
            "type": "machine_update",
            "machine_id": machine_id,
            "status": data.get("status"),
            "data": data.get("data", {}),
            "timestamp": data.get("timestamp")
        }))

# Initialize WebSocket client
ws_client = MachineWebSocketClient(
    f"{API_BASE_URL.replace('http', 'ws')}/ws",
    handle_machine_update
)

@app.on_event("startup")
async def startup_event():
    """Initialize connections on startup"""
    if MACHINE_DATA_SOURCE == "api" and api_client:
        # Start WebSocket connection for real-time updates
        asyncio.create_task(ws_client.connect())
    
    if ENABLE_SIMULATION:
        # Start simulation for demo purposes
        asyncio.create_task(simulate_machine_updates())

@app.get("/api/machines")
async def get_machines():
    """Get all machine data from API or database"""
    if MACHINE_DATA_SOURCE == "api" and api_client:
        machines = await api_client.get_all_machines()
        return machines
    else:
        # Fallback to database or simulation
        return SAMPLE_MACHINES
```

### 4.2 Database Integration

```python
# backend/database.py
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./machine_monitor.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Machine(Base):
    __tablename__ = "machines"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)
    location = Column(String(100), nullable=False)
    system_type = Column(String(50))
    last_seen = Column(DateTime)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class MachineData(Base):
    __tablename__ = "machine_data"
    
    id = Column(Integer, primary_key=True)
    machine_id = Column(String(50))
    temperature = Column(Float)
    pressure = Column(Float)
    speed = Column(Integer)
    timestamp = Column(DateTime)

# Database operations
async def get_machines_from_db():
    """Get all machines from database"""
    db = SessionLocal()
    try:
        machines = db.query(Machine).all()
        return [machine.__dict__ for machine in machines]
    finally:
        db.close()

async def update_machine_in_database(machine_id: str, data: dict):
    """Update machine data in database"""
    db = SessionLocal()
    try:
        machine = db.query(Machine).filter(Machine.id == machine_id).first()
        if machine:
            machine.status = data.get("status", machine.status)
            machine.last_seen = datetime.now()
            db.commit()
            
            # Store historical data
            machine_data = MachineData(
                machine_id=machine_id,
                temperature=data.get("data", {}).get("temperature"),
                pressure=data.get("data", {}).get("pressure"),
                speed=data.get("data", {}).get("speed")
            )
            db.add(machine_data)
            db.commit()
    finally:
        db.close()
```

## 5. Frontend Configuration

### 5.1 Environment Variables

Create `.env` file in frontend directory:
```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_UPDATE_INTERVAL=10000
```

### 5.2 API Configuration

```javascript
// frontend/src/config/api.js
const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
  updateInterval: parseInt(process.env.REACT_APP_UPDATE_INTERVAL) || 10000,
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true'
};

export default config;
```

### 5.3 Updated App.js

```javascript
// frontend/src/App.js (Updated WebSocket connection)
import config from './config/api';

// WebSocket connection for real-time updates
useEffect(() => {
  const newSocket = io(config.wsUrl);
  
  newSocket.on('connect', () => {
    setConnectionStatus('Connected');
    console.log('Connected to server');
  });

  newSocket.on('disconnect', () => {
    setConnectionStatus('Disconnected');
    console.log('Disconnected from server');
  });

  newSocket.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'machine_update') {
        setMachines(prevMachines => 
          prevMachines.map(machine => 
            machine.id === message.machine_id 
              ? { 
                  ...machine, 
                  status: message.status, 
                  data: { ...machine.data, ...message.data },
                  last_seen: new Date(message.timestamp)
                }
              : machine
          )
        );
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  return () => {
    newSocket.close();
  };
}, []);
```

## 6. Deployment Configuration

### 6.1 Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY backend/ .
COPY frontend/build/ ./static/

# Environment variables
ENV PYTHONPATH=/app
ENV DATABASE_URL=postgresql://user:password@db:5432/machine_monitor

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 6.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/machine_monitor
      - API_BASE_URL=https://api.sintercast.com/v1
      - API_KEY=${API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=machine_monitor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 7. Security Considerations

### 7.1 API Security
- Use HTTPS for all API communications
- Implement API key authentication
- Add rate limiting to prevent abuse
- Use JWT tokens for user authentication

### 7.2 Data Security
- Encrypt sensitive data in transit and at rest
- Implement proper access controls
- Regular security audits
- Backup and disaster recovery

## 8. Monitoring and Logging

### 8.1 Application Monitoring
```python
# backend/monitoring.py
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('machine_monitor.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

async def log_machine_update(machine_id: str, status: str, data: dict):
    """Log machine status updates"""
    logger.info(f"Machine {machine_id} status updated to {status}")
    logger.debug(f"Machine data: {data}")

async def log_api_error(endpoint: str, error: str):
    """Log API errors"""
    logger.error(f"API error on {endpoint}: {error}")
```

### 8.2 Health Checks
```python
# backend/health.py
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health/machines")
async def machine_health_check():
    """Check machine connectivity"""
    if api_client:
        machines = await api_client.get_all_machines()
        return {
            "total_machines": len(machines),
            "online_machines": len([m for m in machines if m.get("status") == "online"]),
            "last_update": datetime.now().isoformat()
        }
    return {"error": "API client not configured"}
```

## 9. Testing

### 9.1 Unit Tests
```python
# backend/tests/test_api_client.py
import pytest
from unittest.mock import AsyncMock, patch
from api_client import MachineAPIClient

@pytest.mark.asyncio
async def test_get_all_machines():
    """Test fetching all machines"""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.json.return_value = [{"id": "test", "name": "Test Machine"}]
        mock_client.return_value.get.return_value = mock_response
        
        client = MachineAPIClient("https://api.test.com", "test_key")
        machines = await client.get_all_machines()
        
        assert len(machines) == 1
        assert machines[0]["id"] == "test"
```

### 9.2 Integration Tests
```python
# backend/tests/test_integration.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_machines_endpoint():
    """Test machines endpoint"""
    response = client.get("/api/machines")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_websocket_connection():
    """Test WebSocket connection"""
    with client.websocket_connect("/ws") as websocket:
        websocket.send_text("test message")
        data = websocket.receive_text()
        assert data is not None
```

## 10. Migration Strategy

### 10.1 Phase 1: Database Setup
1. Set up PostgreSQL database
2. Create database schema
3. Migrate existing machine data

### 10.2 Phase 2: API Integration
1. Implement API client
2. Add WebSocket connections
3. Test with real data

### 10.3 Phase 3: Production Deployment
1. Deploy to production environment
2. Configure monitoring and logging
3. Set up backup and recovery

### 10.4 Phase 4: Optimization
1. Performance tuning
2. Security hardening
3. Scalability improvements

This comprehensive guide provides everything needed to connect your Global Machine Monitor to real production APIs while maintaining the existing functionality and adding robust production features.
