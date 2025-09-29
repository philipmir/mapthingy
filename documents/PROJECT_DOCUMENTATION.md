# Global Machine Monitor - Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Installation & Setup](#installation--setup)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [Database Schema](#database-schema)
9. [Real-Time Features](#real-time-features)
10. [Production Deployment](#production-deployment)
11. [Security](#security)
12. [Monitoring & Analytics](#monitoring--analytics)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)

## 🎯 Project Overview

The **Global Machine Monitor** is a sophisticated real-time monitoring dashboard designed for SinterCast, a Swedish company specializing in automated process control systems for foundries. The system provides comprehensive oversight of customer installations worldwide through an interactive world map interface.

### Business Context

SinterCast provides two main product lines:
- **Automated System 4000 (AS4000)**: Full-scale production systems for major foundries
- **Mini-System 4000 (MS4000)**: Compact systems for research institutions and smaller operations

### Key Objectives

- **Real-time Monitoring**: Track machine status across global locations
- **Performance Analytics**: Monitor temperature, pressure, speed, and disk usage
- **Customer Support**: Proactive issue identification and resolution
- **Business Intelligence**: Data-driven insights for operational excellence

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│◄──►│  FastAPI Backend│◄──►│  Customer APIs  │
│                 │    │                 │    │                 │
│ • Interactive   │    │ • REST API      │    │ • Real Machine  │
│   World Map     │    │ • WebSocket     │    │   Data          │
│ • Real-time     │    │ • Database      │    │ • Status Updates│
│   Updates       │    │ • Analytics     │    │ • Sensor Data   │
│ • Analytics     │    │ • Broadcasting  │    │                 │
│   Dashboard     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Overview

#### Frontend (React)
- **Interactive World Map**: Leaflet-based mapping with custom markers
- **Real-time Updates**: WebSocket integration for live status changes
- **Analytics Dashboard**: Filtering, metrics, and performance tracking
- **Responsive Design**: Works across desktop and mobile devices

#### Backend (FastAPI)
- **REST API**: Machine data endpoints and status updates
- **WebSocket Server**: Real-time communication with frontend
- **Database Integration**: PostgreSQL for persistent storage
- **API Client**: Integration with real machine APIs

#### Data Sources
- **Real Machine APIs**: Direct connections to customer installations
- **Database**: Historical data and analytics
- **WebSocket Streams**: Live machine status updates

## ✨ Features

### Core Features

#### 1. **Interactive World Map**
- **Global Coverage**: 50+ real customer installations worldwide
- **Custom Markers**: Color-coded status indicators
- **System Differentiation**: Circles for AS4000, squares for MS4000
- **Country Clustering**: Intelligent marker arrangement
- **Auto-fitting**: Dynamic map bounds

#### 2. **Real-Time Monitoring**
- **Live Status Updates**: WebSocket-based real-time communication
- **Status Indicators**: Online (🟢), Warning (🟡), Offline (🔴), Error (🟣)
- **Performance Metrics**: Temperature, pressure, speed, disk usage
- **Connection Status**: Visual indicators for system connectivity

#### 3. **Analytics Dashboard**
- **Filtering System**: Status, system type, and country filters
- **Performance Metrics**: Average temperature, pressure, speed, disk usage
- **System Uptime**: Real-time uptime percentage calculation
- **Historical Data**: Trend analysis and performance tracking

#### 4. **Machine Management**
- **Detailed Information**: Machine specifications and location data
- **Status History**: Track status changes over time
- **Performance Tracking**: Monitor sensor readings and trends
- **Alert System**: Proactive issue identification

### Advanced Features

#### 1. **Multi-System Support**
- **Automated System 4000**: Production-scale operations
- **Mini-System 4000**: Research and development facilities
- **Visual Differentiation**: Different marker shapes and sizes
- **System-Specific Analytics**: Separate metrics for each system type

#### 2. **Geographic Intelligence**
- **Country-Based Clustering**: Organize machines by geographic location
- **Regional Analytics**: Performance metrics by country/region
- **Distance Calculations**: Proximity-based analysis
- **Time Zone Support**: Global operation awareness

#### 3. **Data Visualization**
- **Interactive Popups**: Detailed machine information on click
- **Status Counters**: Real-time status distribution
- **Performance Charts**: Historical trend visualization
- **Filter Integration**: Dynamic data filtering and analysis

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0**: Modern React with hooks and functional components
- **Leaflet**: Interactive mapping library
- **React-Leaflet**: React integration for Leaflet
- **Styled Components**: CSS-in-JS styling
- **Socket.io-client**: Real-time WebSocket communication
- **Axios**: HTTP client for API requests

### Backend
- **FastAPI**: Modern Python web framework
- **WebSockets**: Real-time bidirectional communication
- **PostgreSQL**: Relational database for persistent storage
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server for production deployment

### Infrastructure
- **Docker**: Containerization for deployment
- **Nginx**: Reverse proxy and static file serving
- **Redis**: Caching and session storage
- **SSL/TLS**: Secure communication
- **Monitoring**: Application performance monitoring

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: v16 or higher
- **Python**: v3.8 or higher
- **PostgreSQL**: v13 or higher
- **Redis**: v6 or higher (optional)
- **Docker**: v20 or higher (optional)

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/global-machine-monitor.git
cd global-machine-monitor
```

#### 2. Install Dependencies
```bash
# Install all dependencies
npm run install-all

# Or install separately
npm install                    # Root dependencies
cd frontend && npm install     # Frontend dependencies
cd ../backend && pip install -r requirements.txt  # Backend dependencies
```

#### 3. Configure Environment
```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit configuration
nano backend/.env
```

#### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run server  # Backend on port 8000
npm run client  # Frontend on port 3000
```

#### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Development Setup

#### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend Development
```bash
cd frontend
npm install
npm start
```

#### Database Setup
```bash
# Create database
createdb machine_monitor

# Run migrations
python -c "from database import init_database; init_database()"
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:8000
Production: https://api.your-domain.com
```

### Authentication
```http
Authorization: Bearer your_api_key_here
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

#### 2. Get All Machines
```http
GET /api/machines
```
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

#### 3. Get Specific Machine
```http
GET /api/machines/{machine_id}
```

#### 4. Update Machine Status
```http
POST /api/machines/{machine_id}/status
```
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

#### 5. WebSocket Connection
```javascript
const socket = io('ws://localhost:8000/ws');

socket.on('message', (data) => {
  const message = JSON.parse(data);
  if (message.type === 'machine_update') {
    // Handle machine status update
  }
});
```

## 🎨 Frontend Components

### Main Components

#### 1. **App.js** - Main Application Component
- **State Management**: Machine data, filters, analytics
- **API Integration**: Data fetching and real-time updates
- **WebSocket Connection**: Live status updates
- **Map Rendering**: Interactive world map with markers

#### 2. **MapContainer** - Interactive Map
- **Leaflet Integration**: OpenStreetMap tiles
- **Custom Markers**: Status-based color coding
- **Popup Information**: Detailed machine data
- **Auto-fitting**: Dynamic map bounds

#### 3. **Analytics Panel** - Data Analysis
- **Filtering System**: Status, system type, country filters
- **Performance Metrics**: Real-time calculations
- **Collapsible Interface**: Space-efficient design
- **Export Functionality**: Data export capabilities

#### 4. **Status Panel** - System Overview
- **Status Counters**: Real-time status distribution
- **Connection Status**: WebSocket connectivity
- **System Legend**: Marker type explanations
- **Performance Indicators**: Key metrics display

### Styled Components

#### 1. **MapWrapper** - Map Container
```javascript
const MapWrapper = styled.div`
  flex: 1;
  position: relative;
`;
```

#### 2. **AnalyticsPanel** - Analytics Dashboard
```javascript
const AnalyticsPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
`;
```

#### 3. **StatusPanel** - Status Overview
```javascript
const StatusPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
`;
```

## 🗄️ Database Schema

### Tables

#### 1. **machines** - Machine Information
```sql
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
```

#### 2. **machine_data** - Sensor Readings
```sql
CREATE TABLE machine_data (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id),
    temperature DECIMAL(5, 2),
    pressure DECIMAL(5, 2),
    speed INTEGER,
    disk_volume DECIMAL(5, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB
);
```

#### 3. **machine_status_history** - Status Changes
```sql
CREATE TABLE machine_status_history (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id),
    status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data JSONB,
    reason VARCHAR(255)
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_location ON machines(location);
CREATE INDEX idx_machine_data_timestamp ON machine_data(timestamp);
CREATE INDEX idx_machine_data_machine_id ON machine_data(machine_id);
```

## ⚡ Real-Time Features

### WebSocket Communication

#### Connection Management
```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.active_connections.remove(connection)
```

#### Message Format
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

### Real-Time Updates

#### 1. **Status Changes**
- **Automatic Broadcasting**: All connected clients receive updates
- **Status Validation**: Ensure data integrity
- **Historical Tracking**: Store status change history
- **Performance Monitoring**: Track update frequency

#### 2. **Data Synchronization**
- **Conflict Resolution**: Handle concurrent updates
- **Data Validation**: Ensure data consistency
- **Error Handling**: Graceful failure recovery
- **Retry Logic**: Automatic reconnection

## 🚀 Production Deployment

### Docker Configuration

#### Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY . .

# Production settings
ENV PYTHONPATH=/app
ENV DATABASE_URL=postgresql://user:password@db:5432/machine_monitor

# Expose port
EXPOSE 8000

# Start with Gunicorn
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

#### Docker Compose
```yaml
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

### Environment Configuration

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/machine_monitor
REDIS_URL=redis://localhost:6379

# API Configuration
API_BASE_URL=https://api.sintercast.com/v1
API_KEY=your_production_api_key
WS_URL=wss://machines.sintercast.com/ws

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here

# Production Settings
MACHINE_DATA_SOURCE=api
ENABLE_SIMULATION=false
LOG_LEVEL=INFO
```

#### Frontend (.env)
```bash
REACT_APP_API_BASE_URL=https://api.your-domain.com
REACT_APP_WS_URL=wss://api.your-domain.com/ws
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_UPDATE_INTERVAL=10000
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Security

### Authentication & Authorization

#### JWT Token Authentication
```python
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not verify_jwt_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid token")
    return credentials.credentials
```

#### API Key Authentication
```python
async def verify_api_key(api_key: str = Header(None)):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key
```

### Data Security

#### 1. **Input Validation**
```python
from pydantic import BaseModel, validator

class MachineUpdate(BaseModel):
    machine_id: str
    status: str
    data: Dict[str, Any] = {}
    timestamp: datetime
    
    @validator('status')
    def validate_status(cls, v):
        if v not in ['online', 'offline', 'warning', 'error']:
            raise ValueError('Invalid status')
        return v
```

#### 2. **SQL Injection Prevention**
```python
# Use parameterized queries
machine = db.query(Machine).filter(Machine.id == machine_id).first()
```

#### 3. **CORS Configuration**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### Security Checklist

- [ ] **Authentication**: JWT tokens and API keys
- [ ] **Authorization**: Role-based access control
- [ ] **Input Validation**: Data sanitization and validation
- [ ] **SQL Injection**: Parameterized queries
- [ ] **XSS Protection**: Content Security Policy
- [ ] **HTTPS**: SSL/TLS encryption
- [ ] **Rate Limiting**: API request throttling
- [ ] **Logging**: Security event monitoring
- [ ] **Backup**: Secure data backup procedures
- [ ] **Updates**: Regular security patches

## 📊 Monitoring & Analytics

### Application Monitoring

#### Health Checks
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "database": "connected",
        "api": "connected"
    }
```

#### Performance Monitoring
```python
import time
from functools import wraps

def monitor_performance(func):
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

### Analytics Features

#### 1. **Real-Time Metrics**
- **System Uptime**: Percentage of online machines
- **Performance Averages**: Temperature, pressure, speed, disk usage
- **Status Distribution**: Online, warning, offline, error counts
- **Geographic Analysis**: Performance by country/region

#### 2. **Historical Data**
- **Trend Analysis**: Performance over time
- **Status History**: Machine status changes
- **Performance Tracking**: Sensor reading trends
- **Alert Analysis**: Issue frequency and patterns

#### 3. **Custom Analytics**
- **Filtered Metrics**: Analytics for specific subsets
- **Comparative Analysis**: System type comparisons
- **Regional Performance**: Country-based analysis
- **Time-based Analysis**: Historical trends

### Logging Configuration

```python
import logging

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

# Log machine updates
async def log_machine_update(machine_id: str, status: str, data: dict):
    logger.info(f"Machine {machine_id} status updated to {status}")
    logger.debug(f"Machine data: {data}")
```

## 🔧 Troubleshooting

### Common Issues

#### 1. **WebSocket Connection Issues**
```javascript
// Check WebSocket connection
const socket = io('ws://localhost:8000/ws');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});
```

#### 2. **API Connection Issues**
```bash
# Test API connectivity
curl -X GET http://localhost:8000/health

# Test machine data
curl -X GET http://localhost:8000/api/machines

# Test WebSocket
wscat -c ws://localhost:8000/ws
```

#### 3. **Database Connection Issues**
```python
# Test database connection
from database import db_manager

async def test_database():
    try:
        machines = await db_manager.get_all_machines()
        print(f"Database connected: {len(machines)} machines")
    except Exception as e:
        print(f"Database error: {e}")
```

### Performance Issues

#### 1. **Slow API Responses**
- Check database indexes
- Monitor query performance
- Implement caching
- Optimize database queries

#### 2. **WebSocket Disconnections**
- Check network stability
- Implement reconnection logic
- Monitor connection limits
- Add error handling

#### 3. **Frontend Performance**
- Optimize React rendering
- Implement lazy loading
- Use React.memo for components
- Monitor bundle size

### Debugging Tools

#### 1. **Backend Debugging**
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Add debug endpoints
@app.get("/debug/machines")
async def debug_machines():
    return {
        "total": len(SAMPLE_MACHINES),
        "online": len([m for m in SAMPLE_MACHINES if m["status"] == "online"]),
        "connections": len(manager.active_connections)
    }
```

#### 2. **Frontend Debugging**
```javascript
// Enable React DevTools
// Add console logging
console.log('Machine data:', machines);
console.log('WebSocket status:', connectionStatus);

// Add error boundaries
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## 🤝 Contributing

### Development Setup

#### 1. **Fork Repository**
```bash
git clone https://github.com/your-username/global-machine-monitor.git
cd global-machine-monitor
```

#### 2. **Create Feature Branch**
```bash
git checkout -b feature/new-feature
```

#### 3. **Install Dependencies**
```bash
npm run install-all
```

#### 4. **Run Tests**
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
npm test
```

#### 5. **Submit Pull Request**
- Ensure all tests pass
- Add documentation for new features
- Follow coding standards
- Include test coverage

### Coding Standards

#### 1. **Python (Backend)**
- Follow PEP 8 style guide
- Use type hints
- Add docstrings
- Write unit tests

#### 2. **JavaScript (Frontend)**
- Use ESLint configuration
- Follow React best practices
- Use functional components
- Add PropTypes validation

#### 3. **Documentation**
- Update README for new features
- Add API documentation
- Include code examples
- Update deployment guides

### Testing

#### 1. **Unit Tests**
```python
# Backend tests
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_machines():
    response = client.get("/api/machines")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

#### 2. **Integration Tests**
```python
# Test WebSocket connection
def test_websocket_connection():
    with client.websocket_connect("/ws") as websocket:
        websocket.send_text("test message")
        data = websocket.receive_text()
        assert data is not None
```

#### 3. **Frontend Tests**
```javascript
// React component tests
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders machine monitor', () => {
  render(<App />);
  const linkElement = screen.getByText(/Global Machine Monitor/i);
  expect(linkElement).toBeInTheDocument();
});
```

## 📞 Support

### Getting Help

#### 1. **Documentation**
- Check this documentation first
- Review API documentation
- Read deployment guides
- Check troubleshooting section

#### 2. **Issues**
- Search existing issues
- Create new issue with details
- Include error logs
- Provide reproduction steps

#### 3. **Community**
- Join discussion forums
- Ask questions in chat
- Share solutions
- Contribute improvements

### Contact Information

- **Project Repository**: https://github.com/your-org/global-machine-monitor
- **Documentation**: https://docs.your-domain.com
- **API Documentation**: https://api.your-domain.com/docs
- **Support Email**: support@your-domain.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SinterCast**: For providing real customer data and requirements
- **OpenStreetMap**: For map tiles and geographic data
- **Leaflet**: For interactive mapping capabilities
- **FastAPI**: For modern Python web framework
- **React**: For component-based frontend development

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready
