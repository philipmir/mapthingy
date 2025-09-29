# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Global Machine Monitor to production with real API integrations.

## 🚨 Critical Changes Required for Production

### 1. **REMOVE SIMULATION CODE**

#### Backend Changes (`backend/main.py`):
```python
# ❌ REMOVE THESE SECTIONS:
- AUTOMATED_SYSTEM_4000 = [...]  # Lines 121-327
- MINI_SYSTEM_4000 = [...]       # Lines 332-572  
- SAMPLE_MACHINES = []           # Lines 637-651
- simulate_machine_updates()     # Lines 754-806
- asyncio.create_task(simulate_machine_updates())  # Line 834

# ✅ REPLACE WITH:
- Real database queries using database.py
- Real API calls using api_client.py
- Real WebSocket connections to machines
```

#### Frontend Changes (`frontend/src/App.js`):
```javascript
// ❌ UPDATE THESE:
- WebSocket URL: 'ws://127.0.0.1:8000/ws' → 'wss://your-domain.com/ws'
- API endpoints: '/api/machines' → 'https://your-api.com/api/machines'

// ✅ ADD:
- Authentication headers
- Error handling
- Loading states
- Reconnection logic
```

### 2. **ENVIRONMENT CONFIGURATION**

#### Backend Environment Variables:
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

#### Frontend Environment Variables:
```bash
REACT_APP_API_BASE_URL=https://api.your-domain.com
REACT_APP_WS_URL=wss://api.your-domain.com/ws
REACT_APP_ENABLE_ANALYTICS=true
```

### 3. **DATABASE SETUP**

#### Create Production Database:
```sql
-- Create database
CREATE DATABASE machine_monitor;

-- Create user
CREATE USER machine_monitor_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE machine_monitor TO machine_monitor_user;
```

#### Run Database Migrations:
```bash
# Initialize database
python -c "from database import init_database; init_database()"

# Or use Alembic for migrations
alembic upgrade head
```

### 4. **API INTEGRATION SETUP**

#### Replace Simulation with Real API Calls:

```python
# backend/main.py - Replace get_machines endpoint
@app.get("/api/machines")
async def get_machines():
    """Get all machine data from real API"""
    try:
        # Use real API client
        api_client = create_api_client()
        if api_client:
            machines = await api_client.get_all_machines()
            return machines
        else:
            # Fallback to database
            return await db_manager.get_all_machines()
    except Exception as e:
        logger.error(f"Failed to fetch machines: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch machine data")
```

#### Add Real WebSocket Connections:

```python
# backend/main.py - Replace simulation with real connections
@app.on_event("startup")
async def startup_event():
    """Initialize real API connections"""
    # Initialize database
    await init_database()
    
    # Initialize API clients
    api_client = create_api_client()
    ws_client = create_websocket_client(handle_machine_update)
    
    if api_client:
        # Start real WebSocket connections
        asyncio.create_task(ws_client.connect())
        
    # Remove simulation
    # asyncio.create_task(simulate_machine_updates())  # ❌ REMOVE
```

### 5. **SECURITY CONFIGURATION**

#### Add Authentication Middleware:
```python
# backend/auth.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    # Implement JWT verification
    if not verify_jwt_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid token")
    return credentials.credentials
```

#### Update CORS for Production:
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # ✅ Specific domains
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # ✅ Specific methods
    allow_headers=["Authorization", "Content-Type"],  # ✅ Specific headers
)
```

### 6. **PRODUCTION DEPLOYMENT**

#### Docker Configuration:
```dockerfile
# Dockerfile
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

#### Docker Compose for Production:
```yaml
# docker-compose.prod.yml
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
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=machine_monitor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

### 7. **MONITORING AND LOGGING**

#### Add Production Logging:
```python
# backend/logging.py
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

# Log machine updates
async def log_machine_update(machine_id: str, status: str, data: dict):
    logger.info(f"Machine {machine_id} status updated to {status}")
    logger.debug(f"Machine data: {data}")
```

#### Add Health Checks:
```python
# backend/health.py
@app.get("/health")
async def health_check():
    """Production health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "database": "connected",
        "api": "connected"
    }

@app.get("/health/machines")
async def machine_health_check():
    """Check machine connectivity"""
    try:
        api_client = create_api_client()
        if api_client:
            health = await api_client.health_check()
            return health
        return {"status": "api_not_configured"}
    except Exception as e:
        return {"status": "error", "error": str(e)}
```

### 8. **FRONTEND PRODUCTION BUILD**

#### Update API Configuration:
```javascript
// frontend/src/config/api.js
const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.your-domain.com',
  wsUrl: process.env.REACT_APP_WS_URL || 'wss://api.your-domain.com/ws',
  updateInterval: parseInt(process.env.REACT_APP_UPDATE_INTERVAL) || 10000,
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true'
};

export default config;
```

#### Build for Production:
```bash
# Build React app
cd frontend
npm run build

# Serve with Nginx
sudo cp -r build/* /var/www/html/
```

### 9. **NGINX CONFIGURATION**

```nginx
# /etc/nginx/sites-available/machine-monitor
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

### 10. **SSL/TLS CONFIGURATION**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 11. **BACKUP AND RECOVERY**

#### Database Backup:
```bash
# Create backup script
#!/bin/bash
# backup.sh
pg_dump -h localhost -U postgres machine_monitor > backup_$(date +%Y%m%d_%H%M%S).sql

# Schedule backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

#### Application Backup:
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/app/
```

### 12. **TESTING PRODUCTION DEPLOYMENT**

#### Test API Endpoints:
```bash
# Test health check
curl https://your-domain.com/health

# Test machine data
curl https://your-domain.com/api/machines

# Test WebSocket
wscat -c wss://your-domain.com/ws
```

#### Test Frontend:
```bash
# Test frontend loading
curl https://your-domain.com/

# Test API integration
# Check browser console for errors
# Verify real-time updates work
```

### 13. **PERFORMANCE OPTIMIZATION**

#### Database Optimization:
```sql
-- Add indexes for better performance
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_location ON machines(location);
CREATE INDEX idx_machine_data_timestamp ON machine_data(timestamp);
```

#### Application Optimization:
```python
# Add caching
from functools import lru_cache

@lru_cache(maxsize=100)
async def get_cached_machines():
    return await db_manager.get_all_machines()
```

### 14. **SECURITY CHECKLIST**

- [ ] Remove all simulation code
- [ ] Configure production database
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Add authentication and authorization
- [ ] Enable logging and monitoring
- [ ] Set up backup procedures
- [ ] Test disaster recovery
- [ ] Configure rate limiting
- [ ] Add input validation
- [ ] Enable CORS properly
- [ ] Set up error handling

### 15. **MONITORING SETUP**

#### Add Application Monitoring:
```python
# backend/monitoring.py
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

#### Set up Alerts:
```bash
# Add to crontab for monitoring
# Check API health every 5 minutes
*/5 * * * * curl -f https://your-domain.com/health || echo "API DOWN" | mail -s "Alert" admin@your-domain.com
```

## 🚀 Deployment Checklist

### Pre-Deployment:
- [ ] Remove all simulation code
- [ ] Configure environment variables
- [ ] Set up production database
- [ ] Configure API credentials
- [ ] Set up SSL certificates
- [ ] Configure monitoring

### Deployment:
- [ ] Deploy backend with Docker
- [ ] Deploy frontend with Nginx
- [ ] Configure load balancing
- [ ] Set up monitoring
- [ ] Test all endpoints
- [ ] Verify real-time updates

### Post-Deployment:
- [ ] Monitor application logs
- [ ] Check database performance
- [ ] Verify API connectivity
- [ ] Test WebSocket connections
- [ ] Set up backups
- [ ] Configure alerts

## 📞 Support

For production deployment support:
- Check logs: `docker logs machine-monitor-app`
- Monitor database: `pg_stat_activity`
- Check API health: `curl https://your-domain.com/health`
- Verify WebSocket: Use browser dev tools

This guide ensures a smooth transition from simulation to production with real machine data integration.
