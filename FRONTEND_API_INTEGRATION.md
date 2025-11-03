# Frontend Integration with REST API - Summary

## ✅ Changes Made

### 1. Frontend API Configuration
- **Created**: `frontend/src/apiConfig.js` - Centralized API configuration
- **Updated**: `frontend/src/App.js` - Now fetches from new REST API

### 2. API Endpoint Updated
- **Old**: `http://localhost:8000/api/machines` (backend proxy)
- **New**: `http://192.168.175.116:8023/machines` (machine computer REST API)

### 3. Real-time Updates
- **Changed**: WebSocket → Polling (test API doesn't have WebSocket)
- **Poll Interval**: Every 5 seconds
- **Status**: Connection status displayed in UI

## 🔧 Configuration

### API Configuration File: `frontend/src/apiConfig.js`
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.175.116:8023',
  ENDPOINTS: {
    MACHINES: '/machines',
    HEALTH: '/health',
    ROOT: '/'
  },
  POLL_INTERVAL: 5000, // 5 seconds
  TIMEOUT: 30000 // 30 seconds
};
```

**To change the API URL**: Edit `frontend/src/apiConfig.js`

## 📊 Data Structure

The REST API returns machine data in this format:
```json
{
  "id": "asimco_china",
  "name": "ASIMCO International",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "status": "online",
  "location": "China",
  "system_type": "Automated System 4000",
  "last_seen": "2024-01-XX...",
  "data": {
    "temperature": 42.1,
    "pressure": 2.2,
    "speed": 1450,
    "disk_volume": 78.5
  }
}
```

## 🎯 Status Mapping

The frontend automatically maps legacy statuses to specification-compliant statuses:

| API Status | Frontend Status | Color |
|------------|----------------|-------|
| `online` | `green` | 🟢 Green |
| `warning` | `yellow` | 🟡 Yellow |
| `error` | `red` | 🔴 Red |
| `offline` | `black` | ⚫ Black |

## 🚀 Testing Steps

### 1. Start the REST API Server
On the machine computer:
```bash
cd "REST API"
python test_api.py
```

### 2. Start the Frontend
On your development computer:
```bash
cd frontend
npm start
```

### 3. Verify in Browser
- Open: `http://localhost:3000`
- Check: All 50 machines should appear on the map
- Verify: Markers show correct colors based on status
- Test: Click markers to see machine details

### 4. Check Console
- Open browser DevTools (F12)
- Check Console tab for:
  - "Fetching machines from API..." message
  - "API Response:" with machine data
  - Connection status updates

## 🔍 Troubleshooting

### Issue: No machines showing on map
**Solution**: 
1. Check REST API is running: `curl http://192.168.175.116:8023/machines`
2. Check browser console for errors
3. Verify CORS is enabled on REST API server

### Issue: CORS errors in browser
**Solution**: The REST API needs CORS middleware. Check `test_api.py` has:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Connection status shows "Error"
**Solution**:
1. Check network connectivity
2. Verify API URL is correct in `apiConfig.js`
3. Check firewall rules allow port 8023

## 📝 Next Steps

1. ✅ Frontend integrated with REST API
2. ✅ Polling set up for real-time updates
3. ⏳ Test markers display correctly
4. ⏳ Test status filtering
5. ⏳ Test machine popups
6. ⏳ Add WebSocket support (optional)

## 🎉 Success Indicators

- ✅ Map loads with all 50 machines
- ✅ Markers show correct colors (green/yellow/red/black)
- ✅ Machine popups show correct data
- ✅ Status filters work correctly
- ✅ Connection status shows "Connected"
- ✅ Machines update every 5 seconds

Your frontend is now integrated with the REST API! 🚀

