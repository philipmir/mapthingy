@echo off
REM Offline Installation Script for REST API
REM Run this script on the machine computer (no internet required)

echo ========================================
echo REST API Offline Installation
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ before running this script
    pause
    exit /b 1
)

echo Python found. Installing packages from offline package...
echo.

REM Navigate to source files directory
cd /d "%~dp0..\source_files"

REM Install packages from local directory
echo Installing Python packages...
pip install --no-index --find-links=..\python_packages -r requirements.txt

if %errorlevel% neq 0 (
    echo ERROR: Failed to install packages
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Files are located in: %~dp0..\source_files
echo.
echo NEXT STEPS:
echo 1. Edit machine_config.py with your machine-specific settings
echo 2. Update MACHINE_ID, API_URL, and API_KEY
echo 3. Run: python test_api.py
echo.
pause
