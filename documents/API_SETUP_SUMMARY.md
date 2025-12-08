# ✅ API Setup Complete - Summary

I've set up an easy way for you to switch between mock (simulated) data and a real API for testing machine markers!

## 🎯 What Was Done

### 1. Created Configuration System
- **`backend/.env`** - Your configuration file (change `USE_MOCK_DATA` to switch modes)
- **`backend/config.py`** - Configuration management (loads settings from .env)
- Shows clear banner on startup indicating which mode is active

### 2. Updated Backend to Support Both Modes
- **`backend/main.py`** - Now supports both mock and real API
  - In **mock mode**: Uses simulated data (no API needed)
  - In **real mode**: Connects to your actual API
  - Just change one line in `.env` to switch!

### 3. Enhanced Dependencies
- **`backend/requirements.txt`** - Added:
  - `pydantic-settings` - For configuration management
  - `httpx` - For async HTTP requests to real API

### 4. Created Documentation
- **`SWITCHING_GUIDE.md`** - Comprehensive guide with examples
- **`README_API_SWITCHING.md`** - Quick reference
- **`QUICK_START.md`** - Super quick start guide
- **`backend/test_connection.py`** - Test script to verify setup

## 🚀 How to Use

### Use Mock Data (Current Default - No API Needed)
```bash
# backend/.env is already set to:
USE_MOCK_DATA=mock

# Just start the backend:
cd backend
python main.py
```

### Switch to Real API
```bash
# 1. Edit backend/.env:
USE_MOCK_DATA=real
API_BASE_URL=https://your-actual-api.com/v1
API_KEY=your_actual_api_key_here

# 2. Install dependencies (if not done):
pip install -r requirements.txt

# 3. Test your setup (optional):
python test_connection.py

# 4. Start backend:
python main.py
```

That's it! The frontend automatically works with both modes.

## 📊 What You'll See

### Mock Mode Console Output:
```
============================================================
🚀 Machine Monitor Starting
============================================================
📊 Data Mode: MOCK
🎮 Using MOCK/SIMULATION data
   Update Interval: 15s
   Recovery Interval: 30s
============================================================
🎮 Starting simulation mode...
SIMULATION: All machines set to green status...
```

### Real API Mode Console Output:
```
============================================================
🚀 Machine Monitor Starting
============================================================
📊 Data Mode: REAL
🔌 Using REAL API
   API URL: https://your-api.com/v1
   WebSocket URL: wss://your-api.com/ws
============================================================
🔌 Initializing Real API client...
✅ API Health: {...}
🔄 Starting real API polling...
✅ Polled 52 machines from real API
```

## 🎮 Try It Now

### Quick Test with Mock Mode (No Setup Needed):
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python main.py

# Terminal 2 - Frontend
cd frontend
npm start

# Browser: http://localhost:3000
# You'll see simulated machines updating every 15 seconds
```

## 📝 Configuration File Reference

**backend/.env** - The ONLY file you need to edit:
```bash
# MAIN SETTING - Change this to switch modes
USE_MOCK_DATA=mock    # or 'real'

# Only needed for real mode:
API_BASE_URL=https://your-api.com/v1
API_KEY=your_key_here
API_TIMEOUT=30

# Optional settings:
SIMULATION_UPDATE_INTERVAL=15    # seconds (mock mode)
SIMULATION_RECOVERY_INTERVAL=30  # seconds (mock mode)
```

## 🔄 Switching Process

1. **Stop backend** (`Ctrl+C`)
2. **Edit `backend/.env`** - Change `USE_MOCK_DATA=mock` to `USE_MOCK_DATA=real` (or vice versa)
3. **Start backend** - `python main.py`
4. **No frontend changes needed** - It automatically connects to the new data

## 📚 Documentation

- **Quick Start**: `QUICK_START.md`
- **API Reference**: `README_API_SWITCHING.md`
- **Full Guide**: `SWITCHING_GUIDE.md`
- **Test Script**: `backend/test_connection.py`

## 🔧 What If My API Format Is Different?

If your real API returns data in a different format, you can adjust the transformation in `backend/api_client.py`. The API client already handles common formats, but you might need to map field names.

## ✨ Key Features

✅ **Zero frontend changes** - Works transparently  
✅ **One-line switch** - Just change `USE_MOCK_DATA` in .env  
✅ **Clear feedback** - Startup banner shows current mode  
✅ **Fallback protection** - Auto-falls back to mock if API fails  
✅ **Test script** - Verify setup before starting  
✅ **Configurable** - Adjust timing, URLs, etc. via .env  

## 🎯 Next Steps

1. **Test mock mode first** - Make sure everything works
2. **Get API credentials** - From your API provider
3. **Update .env** - Add real API URL and key
4. **Test connection** - Run `python test_connection.py`
5. **Switch mode** - Change USE_MOCK_DATA to 'real'
6. **Restart backend** - Start with real API

## ⚠️ Important Notes

- **.env file is NOT in git** - Safe to put credentials (already in .gitignore)
- **Don't commit .env** - Keep your API keys secure
- **Mock mode is default** - No risk of accidentally hitting real API
- **Frontend unchanged** - No modifications needed to frontend code

## 🆘 Troubleshooting

### "ModuleNotFoundError: No module named 'pydantic_settings'"
```bash
cd backend
pip install -r requirements.txt
```

### "No API credentials configured, falling back to mock mode"
This is normal if:
- You're in real mode but haven't set API_KEY
- System automatically uses mock data instead

### Need more help?
- Check `README_API_SWITCHING.md`
- Run test script: `python backend/test_connection.py`
- See full guide: `SWITCHING_GUIDE.md`

---

**Ready to test!** The system is now set up and ready to use with mock data by default, and you can switch to real API anytime by editing one line in `backend/.env`.

