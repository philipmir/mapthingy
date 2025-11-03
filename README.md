# Global Machine Monitor

A real-time dashboard for monitoring machine status worldwide. Built with React frontend and Python FastAPI backend, featuring interactive world maps, WebSocket connections, and comprehensive analytics.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

This will start:
- Backend API server on http://localhost:8000
- React frontend on http://localhost:3000

## 📚 Documentation

All documentation is located in the `docs/` folder:

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in minutes
- **[API Switching Guide](docs/README_API_SWITCHING.md)** - Switch between mock and real data
- **[Comprehensive Guide](docs/SWITCHING_GUIDE.md)** - Detailed switching instructions
- **[API Setup Summary](docs/API_SETUP_SUMMARY.md)** - Complete setup overview
- **[Architecture Map](docs/CODE_ARCHITECTURE_MAP.md)** - System architecture diagram
- **[Touchscreen Guide](docs/TOUCHSCREEN_GUIDE.md)** - Touchscreen interface guide

## 🛠️ Tech Stack

- **Frontend**: React, Leaflet, WebSocket API
- **Backend**: Python FastAPI, WebSockets, SQLAlchemy
- **Database**: PostgreSQL with 2-month retention
- **Real-time**: WebSocket connections for live updates

## 🎯 Features

- **Interactive World Map** with custom markers
- **Real-time Status Updates** via WebSocket
- **Alert System** with screen flashes and animations
- **Analytics Dashboard** with filtering and metrics
- **Global Machine Coverage** across multiple countries
- **Dual Machine Types** (Automated System 4000 & Mini-System 4000)

## 📄 License

MIT
