# 🔄 API Switching Guide - Quick Reference

This is a quick reference for switching between mock and real API modes.

## TL;DR - How to Switch

### Use Mock Data (Development/Testing)
```bash
# Edit backend/.env
USE_MOCK_DATA=mock
```

### Use Real API (Production)
```bash
# Edit backend/.env
USE_MOCK_DATA=real
API_BASE_URL=https://your-api.com/v1
API_KEY=your_actual_key_here
```

Then restart the backend: `python main.py`

## Current Setup

You now have two modes:

### 🎮 Mock Mode (Default)
- Uses simulated machine data
- No API credentials needed
- Perfect for development
- Machines update every 15 seconds (configurable)

### 🔌 Real API Mode
- Connects to actual machine API
- Requires API credentials
- Polls API every 10 seconds
- Broadcasts real machine status updates

## File Structure

```
backend/
├── .env              # Your configuration (not in git)
├── env.example       # Example configuration (safe to commit)
├── config.py         # NEW: Configuration management
├── main.py           # UPDATED: Supports both modes
├── api_client.py     # API client for real mode
└── requirements.txt  # UPDATED: Added new dependencies
```

## Installation Steps

### 1. Install New Dependencies
```bash
cd backend
pip install -r requirements.txt
```

This adds:
- `pydantic-settings` - For configuration management
- `httpx` - For async HTTP requests to real API

### 2. Create Your .env File
```bash
# Copy the example (already done for you)
cp env.example .env

# Edit .env to configure your mode
# By default it's set to mock mode
```

### 3. Start the Backend
```bash
python main.py
```

You'll see which mode is active:
```
============================================================
🚀 Machine Monitor Starting
============================================================
📊 Data Mode: MOCK
🎮 Using MOCK/SIMULATION data
   Update Interval: 15s
   Recovery Interval: 30s
============================================================
```

## Configuration Reference

### All Available Settings

```bash
# DATA MODE (main setting)
USE_MOCK_DATA=mock              # or 'real'

# REAL API SETTINGS (only used when USE_MOCK_DATA=real)
API_BASE_URL=https://api.example.com/v1
API_KEY=your_key_here
API_TIMEOUT=30
WS_URL=wss://api.example.com/ws

# MOCK/SIMULATION SETTINGS (only used when USE_MOCK_DATA=mock)
SIMULATION_UPDATE_INTERVAL=15   # seconds between status changes
SIMULATION_RECOVERY_INTERVAL=30 # seconds before recovery

# CORS SETTINGS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# LOGGING
LOG_LEVEL=INFO
```

## Testing Both Modes

### Test Mock Mode
```bash
# 1. Set to mock mode in .env
USE_MOCK_DATA=mock

# 2. Start backend
python main.py

# 3. Start frontend (in another terminal)
cd ../frontend
npm start

# 4. Open browser to http://localhost:3000
# You should see machines changing status every 15 seconds
```

### Test Real API Mode
```bash
# 1. Set to real mode in .env
USE_MOCK_DATA=real
API_BASE_URL=https://your-actual-api.com/v1
API_KEY=your_actual_key

# 2. Restart backend
python main.py

# You should see:
# 🔌 Initializing Real API client...
# ✅ API Health: {...}
# 🔄 Starting real API polling...
# ✅ Polled X machines from real API

# 3. Frontend automatically shows real data
```

## What Changed?

### New File: `config.py`
- Loads settings from `.env` file
- Provides `settings` object used throughout the app
- Shows startup banner with current mode

### Updated: `main.py`
- Now imports `config` and `api_client`
- `get_machines()` checks mode and uses appropriate source
- `get_machine()` checks mode and uses appropriate source
- `simulate_machine_updates()` only runs in mock mode
- `poll_real_api()` NEW function for real API mode
- `startup_event()` initializes based on mode

### Updated: `requirements.txt`
- Added `pydantic-settings` for config management
- Added `httpx` for async HTTP requests

### Updated: `api_client.py`
- Already had the infrastructure needed
- `create_api_client()` creates client from env vars

## Common Questions

### Q: What happens if I set real mode but don't configure API credentials?
A: The system automatically falls back to mock mode and shows a warning.

### Q: Do I need to change anything in the frontend?
A: No! The frontend connects to the backend API the same way in both modes.

### Q: Can I switch modes without restarting?
A: No, you need to restart the backend after changing `.env`.

### Q: What if my real API has a different data format?
A: You may need to adjust the `api_client.py` to transform the data to match the expected format.

### Q: How do I know which mode is running?
A: Check the console output when starting the backend. It clearly shows the mode.

## Troubleshooting

### "ModuleNotFoundError: No module named 'pydantic_settings'"
```bash
pip install -r requirements.txt
```

### "ModuleNotFoundError: No module named 'config'"
Make sure you're in the `backend/` directory when running `python main.py`

### Frontend shows no data
1. Check backend is running (`python main.py`)
2. Check console for errors
3. Try clearing browser cache (Ctrl+Shift+R)
4. Check browser console for errors (F12)

### Real API connection fails
1. Verify API_BASE_URL is correct
2. Verify API_KEY is valid
3. Test the API with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" https://your-api.com/v1/machines
   ```
4. Check network connectivity

## Security Reminder

⚠️ **IMPORTANT**: The `.env` file is in `.gitignore` and should NEVER be committed to git with real credentials!

✅ Safe to commit:
- `env.example` (has placeholder values)
- `config.py` (no secrets)
- `README_API_SWITCHING.md` (this file)

❌ Never commit:
- `.env` (contains real secrets)
- Any file with actual API keys

## Next Steps

1. **For Development**: Keep using mock mode
2. **For Testing API Integration**: 
   - Get your API credentials
   - Configure `.env` with real values
   - Switch to real mode
   - Test the connection
3. **For Production Deployment**: See `DEPLOYMENT_GUIDE.md`

---

**Need the full detailed guide?** See `SWITCHING_GUIDE.md`

