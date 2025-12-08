@echo off
echo Installing REST API (Offline Mode)...
cd source_files
pip install --no-index --find-links=..\python_packages -r requirements.txt
if %errorlevel% equ 0 (
    echo.
    echo Installation complete!
    echo.
    echo Next: Edit machine_config.py and run: python test_api.py
) else (
    echo.
    echo Installation failed. Check errors above.
)
pause
