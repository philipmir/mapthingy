# System Status Portal - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the System Status Portal according to the specification requirements.

## Prerequisites

- **Operating System**: Windows or Linux (as specified)
- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **PostgreSQL**: 12 or higher
- **Git**: For version control

## Installation Steps

### 1. Database Setup

#### Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Linux (CentOS/RHEL)
sudo yum install postgresql-server postgresql-contrib
```

#### Create Database
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database and user
CREATE DATABASE system_status_portal;
CREATE USER portal_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE system_status_portal TO portal_user;

-- Connect to the database
\c system_status_portal

-- Run the schema
\i backend/database_schema.sql
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration
Create `backend/.env` file:
```env
DATABASE_URL=postgresql://portal_user:secure_password@localhost:5432/system_status_portal
SECRET_KEY=your-secret-key-here
DEBUG=False
```

#### Initialize Database
```bash
cd backend
python -c "from database import init_database; init_database()"
```

#### Start Backend Server
```bash
# Development
python main_specification.py

# Production (using Gunicorn)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main_specification:app --bind 0.0.0.0:8000
```

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd frontend
npm install
```

#### Build for Production
```bash
npm run build
```

#### Serve Frontend
```bash
# Development
npm start

# Production (using serve)
npm install -g serve
serve -s build -l 3000
```

### 4. Production Deployment

#### Using Docker (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: system_status_portal
      POSTGRES_USER: portal_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database_schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://portal_user:secure_password@postgres:5432/system_status_portal
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Using Systemd (Linux)

Create `/etc/systemd/system/system-status-portal.service`:
```ini
[Unit]
Description=System Status Portal
After=network.target

[Service]
Type=simple
User=portal
WorkingDirectory=/opt/system-status-portal
ExecStart=/usr/bin/python3 main_specification.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5. Configuration

#### Status Criteria Configuration

The system allows configuration of status criteria through the web interface:

1. **Temperature Thresholds**:
   - Warning: 60°C
   - Error: 80°C

2. **Pressure Thresholds**:
   - Warning: 3.0 bar
   - Error: 5.0 bar

3. **Disk Volume Thresholds**:
   - Warning: 85%
   - Error: 95%

4. **Connection Timeouts**:
   - Timeout: 5 minutes
   - Offline: 30 minutes

#### API Configuration

The API endpoints are configured as follows:

- **GET /api/systems** - Get all systems
- **GET /api/systems/{id}** - Get specific system
- **POST /api/systems/{id}/data** - Update system data
- **GET /api/systems/{id}/history** - Get historical data
- **GET /api/analytics** - Get analytics data
- **WebSocket /ws** - Real-time updates

### 6. Data Retention

The system automatically maintains 2-month data retention:

- **System Data**: 2 months
- **Status History**: 2 months
- **Alerts**: 1 month

Cleanup runs automatically every 24 hours.

### 7. Security Considerations

#### Production Security
- Change default passwords
- Use HTTPS in production
- Configure firewall rules
- Enable database SSL
- Use environment variables for secrets

#### Authentication (Future Enhancement)
- Add JWT authentication
- Implement role-based access
- Add API key authentication for machine reporting

### 8. Monitoring and Logging

#### Logging Configuration
```python
# In main_specification.py
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('system_status_portal.log'),
        logging.StreamHandler()
    ]
)
```

#### Health Checks
- **Backend**: `GET /` returns status
- **Database**: Connection health check
- **Frontend**: Static file serving

### 9. Troubleshooting

#### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify connection string
   - Check firewall rules

2. **Frontend Not Loading**
   - Check if backend is running
   - Verify CORS configuration
   - Check browser console for errors

3. **WebSocket Connection Failed**
   - Check if WebSocket endpoint is accessible
   - Verify firewall configuration
   - Check for proxy issues

#### Log Files
- **Backend**: `system_status_portal.log`
- **Database**: PostgreSQL logs
- **Frontend**: Browser console

### 10. Maintenance

#### Regular Maintenance Tasks
- Monitor disk space usage
- Check database performance
- Review log files
- Update dependencies
- Backup database

#### Backup Strategy
```bash
# Database backup
pg_dump system_status_portal > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf system_status_portal_$(date +%Y%m%d).tar.gz /opt/system-status-portal
```

### 11. Performance Optimization

#### Database Optimization
- Regular VACUUM and ANALYZE
- Index optimization
- Connection pooling

#### Application Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching
- Load balancing for high availability

## Conclusion

This deployment guide provides comprehensive instructions for setting up the System Status Portal according to the specification requirements. The system is designed to be self-hosted, open-source, and compliant with MIT licensing requirements.

For additional support, refer to the project documentation or contact the development team.
