# Machine Monitor API Documentation

## Overview

This document describes the API endpoints and integration patterns for the Global Machine Monitor system when connected to real production APIs.

## Base URL

```
Production: https://api.sintercast.com/v1
Development: http://localhost:8000
```

## Authentication

All API requests require authentication using Bearer tokens:

```http
Authorization: Bearer your_api_key_here
```

## Endpoints

### 1. Health Check

#### GET /health

Check API health and connectivity.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### 2. Machine Management

#### GET /api/machines

Retrieve all machines with their current status.

**Response:**
```json
[
  {
    "id": "asimco_china",
    "name": "ASIMCO International (AS4000)",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "status": "online",
    "location": "China",
    "system_type": "Automated System 4000",
    "last_seen": "2024-01-15T10:30:00Z",
    "data": {
      "temperature": 42.1,
      "pressure": 2.2,
      "speed": 1450,
      "disk_volume": 78.5
    }
  }
]
```

#### GET /api/machines/{machine_id}

Get specific machine details.

**Parameters:**
- `machine_id` (string): Unique machine identifier

**Response:**
```json
{
  "id": "asimco_china",
  "name": "ASIMCO International (AS4000)",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "status": "online",
  "location": "China",
  "system_type": "Automated System 4000",
  "last_seen": "2024-01-15T10:30:00Z",
  "data": {
    "temperature": 42.1,
    "pressure": 2.2,
    "speed": 1450,
    "disk_volume": 78.5
  }
}
```

#### POST /api/machines/{machine_id}/status

Update machine status and data.

**Request Body:**
```json
{
  "status": "online",
  "data": {
    "temperature": 42.1,
    "pressure": 2.2,
    "speed": 1450,
    "disk_volume": 78.5
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "message": "Status updated successfully",
  "machine_id": "asimco_china",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Analytics

#### GET /api/analytics

Get system analytics and metrics.

**Query Parameters:**
- `hours` (integer, optional): Time range in hours (default: 24)

**Response:**
```json
{
  "total_machines": 50,
  "online_machines": 45,
  "uptime_percentage": 90.0,
  "status_counts": {
    "online": 45,
    "warning": 3,
    "offline": 2,
    "error": 0
  },
  "avg_temperature": 41.2,
  "avg_pressure": 2.1,
  "avg_speed": 1450,
  "avg_disk_volume": 78.5,
  "time_range_hours": 24
}
```

#### GET /api/machines/{machine_id}/history

Get historical data for a specific machine.

**Parameters:**
- `machine_id` (string): Machine identifier
- `hours` (integer, optional): Time range in hours (default: 24)

**Response:**
```json
[
  {
    "temperature": 42.1,
    "pressure": 2.2,
    "speed": 1450,
    "disk_volume": 78.5,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

### 4. WebSocket

#### WS /ws

Real-time WebSocket connection for live updates.

**Connection:**
```javascript
const socket = io('ws://localhost:8000/ws');
```

**Message Format:**
```json
{
  "type": "machine_update",
  "machine_id": "asimco_china",
  "status": "online",
  "data": {
    "temperature": 42.1,
    "pressure": 2.2,
    "speed": 1450,
    "disk_volume": 78.5
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Integration Patterns

### 1. Direct Machine API Integration

Connect directly to individual machine APIs at customer sites.

**Advantages:**
- Real-time data
- Direct control
- No data loss

**Disadvantages:**
- Complex network setup
- Security concerns
- Maintenance overhead

**Implementation:**
```python
# Connect to individual machine APIs
machine_apis = {
    "asimco_china": "https://asimco.internal/api/machine/001",
    "caterpillar_usa": "https://caterpillar.internal/api/machine/002"
}

async def fetch_machine_data(machine_id):
    api_url = machine_apis.get(machine_id)
    if api_url:
        response = await httpx.get(api_url, headers={"Authorization": "Bearer token"})
        return response.json()
```

### 2. Centralized Data Hub

Use a centralized system that aggregates data from all machines.

**Advantages:**
- Simplified architecture
- Centralized security
- Easy monitoring

**Disadvantages:**
- Single point of failure
- Data latency
- Complex aggregation

**Implementation:**
```python
# Connect to centralized data hub
HUB_API_URL = "https://hub.sintercast.com/api/v1"

async def fetch_all_machines():
    response = await httpx.get(f"{HUB_API_URL}/machines")
    return response.json()
```

### 3. Hybrid Approach

Combine both direct connections and centralized data.

**Advantages:**
- Best of both worlds
- Redundancy
- Flexibility

**Disadvantages:**
- Complex implementation
- Higher costs
- More maintenance

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": "Machine not found",
  "code": "MACHINE_NOT_FOUND",
  "details": "Machine with ID 'invalid_id' does not exist",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Retry Logic

```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def fetch_machine_data_with_retry(machine_id):
    response = await httpx.get(f"{API_BASE_URL}/machines/{machine_id}")
    response.raise_for_status()
    return response.json()
```

## Security Considerations

### 1. Authentication

- Use JWT tokens for API authentication
- Implement token refresh mechanism
- Store tokens securely

### 2. Data Encryption

- Use HTTPS for all communications
- Encrypt sensitive data at rest
- Implement proper key management

### 3. Access Control

- Implement role-based access control
- Use API rate limiting
- Monitor for suspicious activity

## Monitoring and Logging

### 1. Health Monitoring

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

### 2. Metrics Collection

```python
import time
from functools import wraps

def monitor_api_calls(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(f"API call {func.__name__} completed in {duration:.2f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"API call {func.__name__} failed after {duration:.2f}s: {e}")
            raise
    return wrapper
```

### 3. Logging

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Log API calls
logger.info(f"API call: GET /api/machines")
logger.error(f"API error: {error_message}")
```

## Testing

### 1. Unit Tests

```python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_get_machines():
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.json.return_value = [{"id": "test", "name": "Test Machine"}]
        mock_client.return_value.get.return_value = mock_response
        
        client = MachineAPIClient("https://api.test.com", "test_key")
        machines = await client.get_all_machines()
        
        assert len(machines) == 1
        assert machines[0]["id"] == "test"
```

### 2. Integration Tests

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_machines_endpoint():
    response = client.get("/api/machines")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### 3. Load Testing

```python
import asyncio
import aiohttp

async def load_test_api():
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(100):
            task = session.get("http://localhost:8000/api/machines")
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks)
        print(f"Completed {len(responses)} requests")
```

## Deployment

### 1. Docker Configuration

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Environment Variables

```bash
# API Configuration
API_BASE_URL=https://api.sintercast.com/v1
API_KEY=your_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/machine_monitor

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here

# Monitoring
LOG_LEVEL=INFO
ENABLE_METRICS=true
```

### 3. Production Deployment

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

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=machine_monitor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Migration Strategy

### Phase 1: Setup
1. Set up database
2. Configure API credentials
3. Test connectivity

### Phase 2: Integration
1. Implement API client
2. Add WebSocket connections
3. Test with real data

### Phase 3: Production
1. Deploy to production
2. Configure monitoring
3. Set up backups

### Phase 4: Optimization
1. Performance tuning
2. Security hardening
3. Scalability improvements

This documentation provides everything needed to integrate the Global Machine Monitor with real production APIs while maintaining security, reliability, and performance.
