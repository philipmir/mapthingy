REST API OFFLINE INSTALLATION PACKAGE
========================================

This package contains everything needed to install the REST API
on a machine computer WITHOUT internet access.

INSTALLATION:
-------------
1. Copy this entire folder to the machine computer
2. Double-click INSTALL.bat
3. Edit source_files/machine_config.py with your settings
4. Run: cd source_files && python test_api.py

REQUIREMENTS:
-------------
- Python 3.7 or higher
- No internet connection needed!

FILES:
------
- source_files/          - All Python source code
- python_packages/       - All dependencies (wheel files)
- INSTALL.bat            - Installation script
- install_scripts/       - Additional installation scripts

TROUBLESHOOTING:
---------------
- Make sure Python is installed: python --version
- If installation fails, check that all files were copied correctly
- Port 8023 already in use? Change port in test_api.py

For more help, see docs/REAL_MACHINE_INTEGRATION.md
