@echo off
REM SinterCast Machine Data Collector Installation Script
REM Run this script on each machine computer to set up data collection

echo ========================================
echo SinterCast Machine Data Collector Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

echo Python found. Installing dependencies...

REM Install required packages
pip install requests psutil pyserial

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo NEXT STEPS:
echo 1. Edit machine_config.py with your machine-specific settings
echo 2. Update MACHINE_ID, API_URL, and API_KEY
echo 3. Configure sensor port (SENSOR_PORT) if needed
echo 4. Run: python machine_data_collector.py
echo.
echo For help, see the REAL_MACHINE_INTEGRATION.md documentation
echo.
pause

