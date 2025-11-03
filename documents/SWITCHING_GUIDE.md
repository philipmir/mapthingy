# 🔄 Switching Between Mock and Real API

This guide explains how to easily switch between mock (simulated) data and real API data for machine monitoring.

## Quick Start

### 1. Using Mock Data (Default - For Development/Testing)

The system starts in **mock mode** by default, which simulates machine data for testing.

**To use mock mode:**
```bash
# In backend/.env file, set:
USE_MOCK_DATA=mock
```

Then restart the backend:
```bash
cd backend
python main.py
```

**Mock mode features:**
- ✅ No API credentials needed
- ✅ Simulated machine status changes every 15 seconds
- ✅ Perfect for development and testing
- ✅ Shows all visualization features

### 2. Using Real API (For Production)

To connect to the real machine API:

**Step 1: Configure your API credentials**

Edit `backend/.env` file:
```bash
# Switch to real mode
USE_MOCK_DATA=real

# Add your actual API credentials
API_BASE_URL=https://your-actual-api.com/v1
API_KEY=your_actual_api_key_here

# Optional: WebSocket URL for real-time updates
WS_URL=wss://your-actual-api.com/ws
```

**Step 2: Restart the backend**
```bash
cd backend
python main.py
```

You should see:
```
============================================================
🚀 Machine Monitor Starting
============================================================
📊 Data Mode: REAL
🔌 Using REAL API
   API URL: https://your-actual-api.com/v1
   WebSocket URL: wss://your-actual-api.com/ws
============================================================
```

## Configuration Options

### Mock Mode Settings

When `USE_MOCK_DATA=mock`, you can customize simulation behavior:

```bash
# How often machines change status (in seconds)
SIMULATION_UPDATE_INTERVAL=15

# How long machines stay in error before recovering (in seconds)
SIMULATION_RECOVERY_INTERVAL=30
```

### Real API Settings

When `USE_MOCK_DATA=real`, configure these:

```bash
# Main API endpoint
API_BASE_URL=https://api.example.com/v1

# Your API authentication key
API_KEY=your_key_here

# Request timeout in seconds
API_TIMEOUT=30

# WebSocket URL (optional, for real-time updates)
WS_URL=wss://api.example.com/ws
```

## How It Works

### Mock Mode Architecture
```
Frontend → Backend API → Simulated Data
                      ↓
                   WebSocket → Status Updates (simulated)
```

### Real Mode Architecture
```
Frontend → Backend API → Real External API → Actual Machines
                      ↓
                   WebSocket → Status Updates (from API polling)
```

## Testing the Switch

### 1. Verify Current Mode

Check the console output when starting the backend. You'll see:
- `📊 Data Mode: MOCK` - Using simulated data
- `📊 Data Mode: REAL` - Using real API

### 2. Test Mock Mode

```bash
# Set mock mode
echo "USE_MOCK_DATA=mock" > backend/.env

# Start backend
cd backend
python main.py

# In another terminal, start frontend
cd frontend
npm start

# You should see simulated machines on the map
```

### 3. Test Real API Mode

```bash
# Configure real API in backend/.env
USE_MOCK_DATA=real
API_BASE_URL=https://your-api.com/v1
API_KEY=your_key

# Restart backend
cd backend
python main.py

# The backend will now fetch real machine data
```

## Troubleshooting

### "No API credentials configured"

If you see this warning in real mode:
```
⚠️  No API credentials configured, falling back to mock mode
```

**Fix:** Check that your `backend/.env` file has:
```bash
USE_MOCK_DATA=real
API_BASE_URL=https://your-api.com/v1
API_KEY=your_actual_key
```

### "Failed to fetch from real API"

**Possible causes:**
1. Wrong API URL
2. Invalid API key
3. Network connectivity issues
4. API server is down

**Fix:** 
1. Verify your API credentials
2. Test the API URL in a browser or with curl
3. Check network connectivity
4. Temporarily switch back to mock mode for testing

### Frontend still showing old data

**Fix:** Clear browser cache and refresh:
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

## Best Practices

### Development Workflow
1. ✅ Use **mock mode** for frontend development
2. ✅ Use **mock mode** for testing visualization features
3. ✅ Use **real mode** only when testing API integration

### Production Deployment
1. ✅ Always use **real mode** in production
2. ✅ Store API credentials in secure environment variables (not in `.env` file)
3. ✅ Use proper API authentication
4. ✅ Set up monitoring and logging

### Security Notes
- 🔒 **Never commit** your `.env` file with real credentials to git
- 🔒 Use environment variables or secret management in production
- 🔒 The `.env` file is already in `.gitignore`
- 🔒 `env.example` is safe to commit (it has placeholder values)

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_MOCK_DATA` | `mock` | `mock` for simulation, `real` for actual API |
| `API_BASE_URL` | - | Base URL of your real API |
| `API_KEY` | - | Authentication key for real API |
| `API_TIMEOUT` | `30` | Request timeout in seconds |
| `WS_URL` | - | WebSocket URL for real-time updates |
| `SIMULATION_UPDATE_INTERVAL` | `15` | Seconds between simulated updates |
| `SIMULATION_RECOVERY_INTERVAL` | `30` | Seconds before machines recover |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins |
| `LOG_LEVEL` | `INFO` | Logging level |

## Example: Complete Workflow

### Starting Fresh (Mock Mode)
```bash
# 1. Clone/setup project
cd mapthingy

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Backend starts in mock mode by default
python main.py

# 4. In new terminal, start frontend
cd ../frontend
npm install
npm start

# 5. Open browser to http://localhost:3000
# You should see simulated machines updating
```

### Switching to Real API
```bash
# 1. Stop the backend (Ctrl+C)

# 2. Edit backend/.env
# Change USE_MOCK_DATA=mock to USE_MOCK_DATA=real
# Add your API credentials

# 3. Restart backend
python main.py

# 4. Frontend automatically connects to new data source
# Refresh browser if needed
```

## Need Help?

If you encounter issues:
1. Check the backend console for error messages
2. Verify your `.env` configuration
3. Test with mock mode first to isolate issues
4. Check that all dependencies are installed
5. Ensure ports 3000 (frontend) and 8000 (backend) are available

