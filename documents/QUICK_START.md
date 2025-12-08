# 🚀 Quick Start - API Switching

## Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

## Step 2: Choose Your Mode

### Option A: Mock Mode (For Testing)
Your `.env` file is already configured for mock mode:
```bash
USE_MOCK_DATA=mock
```

### Option B: Real API Mode
Edit `backend/.env` and change:
```bash
USE_MOCK_DATA=real
API_BASE_URL=https://your-actual-api.com/v1
API_KEY=your_actual_api_key_here
```

## Step 3: Test Your Setup (Optional)
```bash
python test_connection.py
```

This will verify your configuration before starting the server.

## Step 4: Start the Backend
```bash
python main.py
```

You should see:
```
============================================================
🚀 Machine Monitor Starting
============================================================
📊 Data Mode: MOCK (or REAL)
...
============================================================
```

## Step 5: Start the Frontend
In a new terminal:
```bash
cd frontend
npm start
```

## That's It! 🎉

Open http://localhost:3000 and you'll see:
- **Mock Mode**: Simulated machines with status updates every 15 seconds
- **Real Mode**: Actual machine data from your API

## Switching Modes

1. Edit `backend/.env`
2. Change `USE_MOCK_DATA=mock` to `USE_MOCK_DATA=real` (or vice versa)
3. Restart the backend: `Ctrl+C` then `python main.py`
4. Frontend automatically connects to the new data source

## Need Help?

- **Full Guide**: See `README_API_SWITCHING.md`
- **Detailed Switching Guide**: See `SWITCHING_GUIDE.md`
- **Test Setup**: Run `python backend/test_connection.py`

