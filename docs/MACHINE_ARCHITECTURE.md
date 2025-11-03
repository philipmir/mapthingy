# Machine Data Collection Architecture

## 🏗️ Correct Architecture Overview

**You do NOT need a REST API server on every machine computer!**

Only **ONE central server** needs to run the REST API. Each machine computer only needs a lightweight data collector.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Machine Computers                         │
│  (50 machines - No REST API needed!)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Machine PC 1    Machine PC 2    Machine PC 3    ...        │
│     │                │                │                       │
│     │                │                │                       │
│     └──────┬─────────┴────────┬───────┘                       │
│            │                   │                               │
│            │  HTTP POST        │                               │
│            │  (Send Data)      │                               │
│            ▼                   ▼                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Central Server (ONE)                       │
│                  (backend/main.py)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐            │
│  │  REST API Server                              │            │
│  │  - Receives data from all machines            │            │
│  │  - Stores in database                         │            │
│  │  - Serves data to frontend                    │            │
│  └──────────────────────────────────────────────┘            │
│            │                                                  │
│            │  HTTP GET                                        │
│            ▼                                                  │
│  ┌──────────────────────────────────────────────┐            │
│  │  Frontend (React Map)                        │            │
│  │  - Displays all machines on map              │            │
│  │  - Shows real-time status                    │            │
│  └──────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## 🖥️ What Goes Where

### Machine Computers (50 machines)

**What they need:**
- ✅ `machine_data_collector.py` - Data collection script
- ✅ `machine_config.py` - Machine-specific configuration
- ✅ Python + dependencies (requests, psutil, pyserial)

**What they DO:**
1. Read sensor data from the machine
2. Collect system information
3. Send data to central API via HTTP POST
4. No server needed!

**What they DON'T need:**
- ❌ REST API server (`test_api.py`)
- ❌ WebSocket server
- ❌ FastAPI / Uvicorn
- ❌ Database
- ❌ Heavy dependencies

### Central Server (ONE server)

**What it needs:**
- ✅ REST API server (`backend/main.py` or `test_api.py`)
- ✅ Database (PostgreSQL)
- ✅ Frontend files
- ✅ All dependencies

**What it DOES:**
1. Receives data from all 50 machines
2. Stores data in database
3. Serves data to frontend
4. Broadcasts real-time updates via WebSocket

## 🔄 Data Flow

### Step 1: Data Collection (Machine Computer)
```
machine_data_collector.py
    ↓
Reads sensors (temperature, pressure, speed)
    ↓
Collects system info (uptime, disk usage)
    ↓
HTTP POST → Central API Server
```

### Step 2: Data Processing (Central Server)
```
Central API receives POST request
    ↓
Validates data
    ↓
Stores in database
    ↓
Broadcasts update via WebSocket
```

### Step 3: Display (Frontend)
```
Frontend connects to Central API
    ↓
Receives all machine data
    ↓
Displays markers on map
    ↓
Shows real-time updates
```

## 📦 What to Install

### On Each Machine Computer:

**Lightweight Package (Small ~1MB):**
```
machine_package/
├── machine_data_collector.py    ← Collects and sends data
├── machine_config.py            ← Machine configuration
├── requirements.txt             ← requests, psutil, pyserial
└── INSTALL.bat                  ← Installation script
```

### On Central Server:

**Full Package (Larger):**
```
central_server/
├── backend/
│   ├── main.py                  ← REST API server
│   ├── database.py              ← Database connection
│   └── config.py                ← Configuration
├── frontend/                    ← React map application
└── requirements.txt             ← All dependencies
```

## 🎯 Configuration

### Machine Computer Configuration (`machine_config.py`)

```python
# Machine-specific settings
MACHINE_ID = "ironcast_berlin"  # Unique for each machine
MACHINE_NAME = "IronCast Berlin"

# Point to YOUR CENTRAL SERVER
API_URL = "http://your-central-server.com:8000"  # ← Central server!
API_KEY = "machine_specific_key"

# Sensor configuration
SENSOR_PORT = "COM1"
```

### Central Server Configuration (`backend/config.py`)

```python
# CORS - Allow machines to send data
cors_origins = "http://machine1.com,http://machine2.com,..."

# Database
database_url = "postgresql://user:pass@localhost/machines"

# API endpoints
api_base_url = "http://your-central-server.com:8000"
```

## 🚀 Deployment Steps

### Step 1: Set Up Central Server

1. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Configure database:
   ```bash
   # Set up PostgreSQL
   # Update database connection in config.py
   ```

3. Start REST API server:
   ```bash
   python backend/main.py
   ```

### Step 2: Install on Machine Computers

1. Copy lightweight package to each machine
2. Run `INSTALL.bat` (installs only data collector dependencies)
3. Edit `machine_config.py`:
   - Set unique `MACHINE_ID`
   - Set `API_URL` to central server
4. Run data collector:
   ```bash
   python machine_data_collector.py
   ```

### Step 3: Start Frontend

1. On central server or separate frontend server:
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. Open browser to see all machines on map!

## 📊 Resource Comparison

### Machine Computer (Data Collector Only)

| Resource | Usage |
|----------|-------|
| Python Packages | ~5 packages (requests, psutil, pyserial) |
| Disk Space | ~5-10 MB |
| Memory | ~20-50 MB |
| CPU | Minimal (sends data every 30s) |
| Network | Outbound only (HTTP POST) |

### Central Server (Full API)

| Resource | Usage |
|----------|-------|
| Python Packages | ~15 packages (FastAPI, SQLAlchemy, etc.) |
| Disk Space | ~100-200 MB |
| Memory | ~200-500 MB |
| CPU | Moderate (handles 50 machines) |
| Network | Inbound + Outbound (API + WebSocket) |

## ✅ Summary

**Machine Computers:**
- ✅ Only need data collector
- ✅ Lightweight (~5-10 MB)
- ✅ No server needed
- ✅ Just sends data

**Central Server:**
- ✅ One server for all machines
- ✅ Handles all API requests
- ✅ Stores all data
- ✅ Serves frontend

**Key Point:** Machines are **clients**, not servers! They send data, they don't serve it.

## 🔧 Creating the Lightweight Machine Package

To create a package with only the data collector:

```bash
python create_machine_package.py
```

This creates a much smaller package containing:
- `machine_data_collector.py`
- `machine_config.py`
- `requirements.txt` (minimal - just requests, psutil, pyserial)
- `INSTALL.bat`

No REST API server, no FastAPI, no database - just a lightweight data sender!

---

**Remember:** Only ONE central server needs the REST API. Odd-numbered machines just collect and send data! 🚀

## 🤔 When Would You Want a REST API on Each Machine?

While the standard architecture uses lightweight data collectors on machines, there are scenarios where having a REST API server on each machine makes sense:

### ✅ Pros of REST API on Each Machine

#### 1. **Local Monitoring & Control**
- **Direct Machine Access**: Technicians can access machine status directly without going through central server
- **Local Dashboards**: Machine-specific web interfaces for operators
- **Immediate Access**: No network dependency for local operations

#### 2. **Offline Operation**
- **Works Without Internet**: Machine continues operating if network fails
- **Local Data Storage**: Stores data locally when central server is unreachable
- **Resilience**: Machine doesn't stop if central server goes down

#### 3. **Reduced Network Dependency**
- **Lower Bandwidth**: Only sends updates when central server requests
- **Pull vs Push**: Central server pulls data when needed vs constant pushing
- **Network Efficiency**: Can batch requests, reduce connection overhead

#### 4. **Independent Operation**
- **Standalone Capability**: Each machine is self-contained
- **No Single Point of Failure**: Central server outage doesn't affect machine operation
- **Edge Computing**: Processing happens at the edge (on machine)

#### 5. **Machine-Specific Features**
- **Custom Endpoints**: Machine-specific APIs for specialized operations
- **Local Control**: Direct machine control via REST API
- **Device Management**: Direct access to machine settings, calibration, etc.

#### 6. **Security & Access Control**
- **Local Authentication**: Machine-level security and access control
- **Isolated Access**: Limit access to specific machines
- **Network Isolation**: Machines can be on isolated networks

#### 7. **Scalability**
- **Distributed Load**: Central server doesn't handle all requests
- **Horizontal Scaling**: Each machine handles its own requests
- **Reduced Bottleneck**: Central server just aggregates, doesn't collect

#### 8. **Development & Testing**
- **Standalone Testing**: Test each machine independently
- **Easier Debugging**: Direct access to machine data
- **Development Flexibility**: Developers can work on individual machines

### ❌ Cons of REST API on Each Machine

#### 1. **Resource Overhead**
- **Memory Usage**: ~200-500 MB per machine (vs ~20-50 MB for collector)
- **CPU Usage**: Constant server running (vs minimal for collector)
- **Disk Space**: ~100-200 MB per machine (vs ~5-10 MB)

#### 2. **Management Complexity**
- **50 Servers to Manage**: Instead of just 1 central server
- **Updates**: Need to update 50 machines vs 1 server
- **Monitoring**: Need to monitor 50 servers
- **Configuration**: Configure 50 different instances

#### 3. **Security Surface**
- **50 Attack Surfaces**: 50 API servers exposed vs 1
- **Firewall Rules**: Need firewall rules for 50 machines
- **Security Updates**: More servers = more security patches needed

#### 4. **Network Complexity**
- **Port Management**: Each machine needs exposed port
- **Firewall Configuration**: More complex network setup
- **IP Management**: Need to track 50 API endpoints

#### 5. **Cost**
- **Hardware**: Machines need more resources
- **Maintenance**: More complex maintenance
- **IT Resources**: More IT overhead

#### 6. **Dependency Management**
- **Python/Packages**: Need Python + dependencies on all machines
- **Version Consistency**: Keeping 50 machines in sync
- **Package Updates**: Updating 50 machines when dependencies change

### 📊 Comparison Table

| Aspect | Lightweight Collector | Full REST API |
|--------|----------------------|---------------|
| **Memory** | ~20-50 MB | ~200-500 MB |
| **Disk Space** | ~5-10 MB | ~100-200 MB |
| **CPU Usage** | Minimal | Moderate |
| **Network** | Outbound only | Inbound + Outbound |
| **Complexity** | Low | High |
| **Dependencies** | 3 packages | 15+ packages |
| **Management** | Simple | Complex |
| **Offline Operation** | ❌ Stops if disconnected | ✅ Continues |
| **Local Access** | ❌ No | ✅ Yes |
| **Scalability** | Central server bottleneck | Distributed |
| **Security Surface** | Small | Large |

### 🎯 When to Use Each Approach

#### Use Lightweight Collectors When:
- ✅ Simple monitoring is sufficient
- ✅ All machines always connected
- ✅ Centralized management preferred
- ✅ Minimize resource usage
- ✅ Standard machine setup
- ✅ Limited IT resources

#### Use REST API on Machines When:
- ✅ Machines need local monitoring
- ✅ Frequent network outages
- ✅ Machine-specific control needed
- ✅ Edge computing requirements
- ✅ Network bandwidth concerns
- ✅ Independent operation needed
- ✅ Security isolation required

### 🔄 Hybrid Approach

You can also use a **hybrid approach**:

- **Local REST API**: Lightweight API for local monitoring/control
- **Data Collector**: Still sends data to central server
- **Best of Both**: Local access + centralized management

Example:
```python
# Machine runs both:
# 1. Lightweight REST API for local access (port 8023)
# 2. Data collector sends to central server
```

### 📝 Recommendation

**For Most Cases**: Use lightweight data collectors
- Simpler to manage
- Lower resource usage
- Easier to deploy
- Standard architecture

**Consider REST API on Machines If**:
- Machines frequently offline
- Local access required
- Network bandwidth limited
- Edge computing needed

---

**Final Note**: The architecture choice depends on your specific requirements. For most industrial monitoring scenarios, lightweight collectors are the better choice. But for edge computing or offline-first scenarios, REST APIs on machines make sense.
