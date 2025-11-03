# Database Architecture in Global Machine Monitor

## How the Database Fits Into the System

The database serves as the **persistent storage layer** and **data management hub** for the entire system. Here's how it integrates:

## Database Integration Diagram

```mermaid
graph TB
    %% Data Sources
    subgraph DataSources["📡 Data Sources"]
        RealAPIs["Real Machine APIs<br/>🌐 External Data"]
        Simulation["Simulation Data<br/>🎮 Mock Data"]
        ManualInput["Manual Updates<br/>✋ User Input"]
    end
    
    %% Backend Processing Layer
    subgraph Backend["🐍 Backend Processing"]
        subgraph MainApp["main.py - Current Implementation"]
            SimulationMode["Simulation Mode<br/>🎮 In-Memory Data"]
            MockData["SAMPLE_MACHINES<br/>📊 Hardcoded Data"]
        end
        
        subgraph SpecApp["main_specification.py - Database-Enabled"]
            APIRoutes["API Routes<br/>🛣️ REST Endpoints"]
            WebSocketRoutes["WebSocket Routes<br/>⚡ Real-time"]
            DatabaseIntegration["Database Integration<br/>🗄️ Persistent Storage"]
        end
        
        subgraph DatabaseLayer["Database Layer"]
            DatabaseManager["DatabaseManager<br/>🔧 Operations"]
            Models["SQLAlchemy Models<br/>📋 Data Structure"]
            Schema["PostgreSQL Schema<br/>🏗️ Table Structure"]
        end
    end
    
    %% Database Tables
    subgraph DatabaseTables["🗄️ Database Tables"]
        MachinesTable["machines<br/>📍 Machine Info<br/>• id, name, location<br/>• latitude, longitude<br/>• status, system_type<br/>• last_seen, timestamps"]
        
        MachineDataTable["machine_data<br/>📊 Sensor Data<br/>• temperature, pressure<br/>• speed, disk_volume<br/>• timestamp, raw_data"]
        
        StatusHistoryTable["machine_status_history<br/>📈 Status Changes<br/>• status transitions<br/>• timestamps, reasons<br/>• change tracking"]
        
        AlertsTable["system_alerts<br/>🚨 Alert Management<br/>• alert types, severity<br/>• acknowledgment status<br/>• alert history"]
    end
    
    %% Frontend Layer
    subgraph Frontend["⚛️ Frontend Layer"]
        ReactApp["React App<br/>🎯 User Interface"]
        MapDisplay["World Map<br/>🗺️ Machine Visualization"]
        Analytics["Analytics Dashboard<br/>📊 Metrics & Reports"]
        Alerts["Alert System<br/>🚨 Notifications"]
    end
    
    %% Data Flow Connections
    RealAPIs -.->|API Calls| APIRoutes
    Simulation -.->|Mock Data| SimulationMode
    ManualInput -.->|User Actions| APIRoutes
    
    %% Current vs Future Architecture
    SimulationMode -.->|In-Memory| MockData
    MockData -.->|Direct Access| ReactApp
    
    %% Database-Enabled Architecture
    APIRoutes -.->|Uses| DatabaseManager
    WebSocketRoutes -.->|Uses| DatabaseManager
    DatabaseIntegration -.->|Manages| DatabaseManager
    
    DatabaseManager -.->|Queries| Models
    Models -.->|Maps to| Schema
    Schema -.->|Defines| MachinesTable
    Schema -.->|Defines| MachineDataTable
    Schema -.->|Defines| StatusHistoryTable
    Schema -.->|Defines| AlertsTable
    
    %% Data Retrieval
    DatabaseManager -.->|Retrieves| MachinesTable
    DatabaseManager -.->|Retrieves| MachineDataTable
    DatabaseManager -.->|Retrieves| StatusHistoryTable
    DatabaseManager -.->|Retrieves| AlertsTable
    
    %% Frontend Data Flow
    DatabaseManager -.->|Serves Data| APIRoutes
    APIRoutes -.->|REST API| ReactApp
    WebSocketRoutes -.->|Real-time Updates| ReactApp
    
    ReactApp -.->|Displays| MapDisplay
    ReactApp -.->|Shows| Analytics
    ReactApp -.->|Handles| Alerts
    
    %% Data Persistence Flow
    APIRoutes -.->|Updates| MachinesTable
    APIRoutes -.->|Stores| MachineDataTable
    APIRoutes -.->|Logs| StatusHistoryTable
    APIRoutes -.->|Creates| AlertsTable
    
    %% Styling
    classDef current fill:#ffebee
    classDef future fill:#e8f5e8
    classDef database fill:#e3f2fd
    classDef frontend fill:#fff3e0
    classDef data fill:#f3e5f5
    
    class SimulationMode,MockData current
    class APIRoutes,WebSocketRoutes,DatabaseIntegration,DatabaseManager,Models,Schema future
    class MachinesTable,MachineDataTable,StatusHistoryTable,AlertsTable database
    class ReactApp,MapDisplay,Analytics,Alerts frontend
    class RealAPIs,Simulation,ManualInput data
```

## 🔄 **Current vs Future Database Integration**

### **Current State (main.py):**
- **❌ No Database Integration** - Uses in-memory `SAMPLE_MACHINES` array
- **🎮 Simulation Only** - Mock data for development/testing
- **📊 Hardcoded Data** - Static machine data in code
- **⚡ Real-time Updates** - WebSocket broadcasts to frontend
- **🔄 No Persistence** - Data lost on restart

### **Future State (main_specification.py):**
- **✅ Full Database Integration** - Uses `DatabaseManager` for all operations
- **🗄️ Persistent Storage** - PostgreSQL with 2-month retention
- **📈 Historical Data** - Status changes and sensor data history
- **🚨 Alert Management** - Persistent alert tracking
- **🔄 Data Recovery** - Data survives restarts

## 📊 **Database Schema Overview**

### **Core Tables:**

1. **`machines`** - Machine metadata
   - Basic info: id, name, location, coordinates
   - Status: current status, system type
   - Timestamps: created, updated, last_seen

2. **`machine_data`** - Sensor readings
   - Metrics: temperature, pressure, speed, disk_volume
   - Metadata: timestamp, raw_data (JSON)
   - Links to machines table

3. **`machine_status_history`** - Status tracking
   - Status changes over time
   - Reasons for changes
   - Historical analysis

4. **`system_alerts`** - Alert management
   - Alert types and severity
   - Acknowledgment status
   - Alert history

## 🔄 **Data Flow Through Database**

### **1. Data Ingestion:**
```
Real APIs → API Client → Database Manager → PostgreSQL Tables
Simulation → Backend → Database Manager → PostgreSQL Tables
Manual Input → REST API → Database Manager → PostgreSQL Tables
```

### **2. Data Retrieval:**
```
Frontend Request → REST API → Database Manager → PostgreSQL Query → JSON Response
WebSocket Update → Database Manager → PostgreSQL Query → Real-time Broadcast
```

### **3. Data Persistence:**
```
Status Changes → Database Manager → Status History Table
Sensor Data → Database Manager → Machine Data Table
New Machines → Database Manager → Machines Table
Alerts → Database Manager → Alerts Table
```

## 🎯 **Key Database Operations**

### **DatabaseManager Methods:**
- `get_all_machines()` - Retrieve all machines with latest data
- `get_machine_by_id()` - Get specific machine details
- `update_machine_status()` - Update status and store sensor data
- `add_machine()` - Add new machines to system
- `get_machine_history()` - Historical sensor data
- `get_status_history()` - Status change history
- `get_analytics()` - Dashboard metrics

### **Data Retention:**
- **2-month retention** for sensor data
- **1-month retention** for alerts
- **Automatic cleanup** via scheduled jobs
- **Performance optimization** with indexes

## 🚀 **Migration Path**

### **To Enable Database Integration:**

1. **Switch to main_specification.py:**
   ```bash
   # Instead of: python main.py
   python main_specification.py
   ```

2. **Configure Database:**
   ```bash
   # Set in .env file
   DATABASE_URL=postgresql://user:password@localhost:5432/machine_monitor
   ```

3. **Initialize Database:**
   ```python
   from database import init_database
   init_database()  # Creates tables
   ```

4. **Update Frontend (if needed):**
   - API endpoints remain the same
   - WebSocket protocol unchanged
   - No frontend changes required

## 💡 **Benefits of Database Integration**

- **🔄 Data Persistence** - Survives restarts and crashes
- **📈 Historical Analysis** - Track trends over time
- **🚨 Alert Management** - Persistent alert tracking
- **📊 Better Analytics** - Historical metrics and reporting
- **🔍 Audit Trail** - Complete status change history
- **⚡ Performance** - Optimized queries with indexes
- **🛡️ Data Integrity** - ACID compliance and constraints

The database transforms the system from a **demo/prototype** into a **production-ready monitoring solution**! 🎉
