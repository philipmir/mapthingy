"""
Create Lightweight Machine Data Collector Package
This creates a minimal package with ONLY the data collector - no REST API server needed
"""

import os
import subprocess
import shutil
from pathlib import Path

def create_machine_package():
    """Create lightweight package for machine computers (data collector only)"""
    
    print("=" * 60)
    print("Creating Lightweight Machine Data Collector Package")
    print("=" * 60)
    
    # Package directory
    package_dir = Path("MACHINE_DATA_COLLECTOR_PACKAGE")
    if package_dir.exists():
        print(f"\n⚠ Warning: {package_dir} already exists. Removing old package...")
        shutil.rmtree(package_dir)
    
    package_dir.mkdir()
    (package_dir / "source_files").mkdir()
    (package_dir / "python_packages").mkdir()
    
    print("\n1. Copying data collector files...")
    
    # Only copy data collector files
    files_to_copy = [
        "machine_data_collector.py",
        "machine_config.py"
    ]
    
    for file in files_to_copy:
        src = Path(f"REST API/{file}")
        if src.exists():
            dst = package_dir / "source_files" / file
            shutil.copy2(src, dst)
            print(f"   ✓ Copied {file}")
        else:
            print(f"   ⚠ Warning: {file} not found")
    
    # Create minimal requirements.txt (only data collector dependencies)
    requirements_file = package_dir / "source_files" / "requirements.txt"
    with open(requirements_file, 'w') as f:
        f.write("""# Machine Data Collector Dependencies (Minimal)
requests>=2.28.0
psutil>=5.9.0
pyserial>=3.5
""")
    
    print(f"   ✓ Created minimal requirements.txt")
    
    print("\n2. Downloading Python packages...")
    
    packages_dir = package_dir / "python_packages"
    
    try:
        print("   Downloading packages (this may take a minute)...")
        result = subprocess.run([
            "python", "-m", "pip", "download",
            "-r", str(requirements_file),
            "-d", str(packages_dir)
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            package_count = len(list(packages_dir.glob("*")))
            print(f"   ✓ Downloaded {package_count} packages")
        else:
            print(f"   ✗ Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"   ✗ Error downloading packages: {e}")
        return False
    
    print("\n3. Creating installation scripts...")
    
    # Create simple install script
    install_script = package_dir / "INSTALL.bat"
    with open(install_script, 'w') as f:
        f.write("""@echo off
echo ========================================
echo Machine Data Collector Installation
echo (Lightweight - No REST API Server)
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Install Python 3.7+ first
    pause
    exit /b 1
)

echo Installing packages...
cd source_files
python -m pip install --no-index --find-links=..\python_packages -r requirements.txt

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Installation Complete!
    echo ========================================
    echo.
    echo NEXT STEPS:
    echo 1. Edit machine_config.py:
    echo    - Set MACHINE_ID (unique for each machine)
    echo    - Set API_URL (point to your CENTRAL server)
    echo    - Set API_KEY
    echo.
    echo 2. Run: cd source_files
    echo    Then: python machine_data_collector.py
    echo.
    echo The collector will send data to your central API server.
    echo.
) else (
    echo.
    echo Installation failed!
)
pause
""")
    
    print(f"   ✓ Created {install_script}")
    
    # Create README
    readme = package_dir / "README.txt"
    with open(readme, 'w') as f:
        f.write("""MACHINE DATA COLLECTOR PACKAGE
================================

This is a LIGHTWEIGHT package for machine computers.
It contains ONLY the data collector - no REST API server needed!

WHAT THIS DOES:
--------------
- Collects sensor data from the machine
- Sends data to your CENTRAL API server
- No server needed on the machine!

INSTALLATION:
-------------
1. Copy this entire folder to the machine computer
2. Double-click INSTALL.bat
3. Edit source_files/machine_config.py:
   - Set MACHINE_ID (unique for this machine)
   - Set API_URL (your central server URL)
   - Set API_KEY
4. Run: cd source_files && python machine_data_collector.py

CONFIGURATION:
-------------
Edit source_files/machine_config.py:

MACHINE_ID = "unique_machine_name"  # Change for each machine!
API_URL = "http://your-central-server.com:8000"  # Your central API
API_KEY = "your_api_key"

REQUIREMENTS:
------------
- Python 3.7+
- No internet needed after installation!
- Much smaller than full REST API package

WHAT THIS PACKAGE CONTAINS:
---------------------------
- machine_data_collector.py  - Data collection script
- machine_config.py          - Configuration file
- requirements.txt           - Minimal dependencies (3 packages only!)

WHAT IT DOES NOT CONTAIN:
------------------------
- No REST API server (test_api.py)
- No FastAPI
- No database
- No heavy dependencies

The machine just collects and SENDS data to your central server!
""")
    
    print(f"   ✓ Created {readme}")
    
    # Summary
    source_count = len(list((package_dir / "source_files").glob("*")))
    package_count = len(list((package_dir / "python_packages").glob("*")))
    
    total_size = sum(f.stat().st_size for f in package_dir.rglob('*') if f.is_file())
    size_mb = total_size / (1024 * 1024)
    
    print(f"\n{'=' * 60}")
    print("✅ Lightweight Package Created!")
    print(f"{'=' * 60}")
    print(f"📦 Location: {package_dir.absolute()}")
    print(f"📄 Source Files: {source_count}")
    print(f"📦 Python Packages: {package_count}")
    print(f"💾 Total Size: {size_mb:.1f} MB")
    print(f"\n✅ Ready for machine computers!")
    print(f"\n📋 Next Steps:")
    print(f"   1. Copy '{package_dir}' to each machine computer")
    print(f"   2. Run INSTALL.bat on each machine")
    print(f"   3. Configure machine_config.py with unique MACHINE_ID")
    print(f"   4. Set API_URL to point to your CENTRAL server")
    print(f"   5. Run: python machine_data_collector.py")
    print(f"\n💡 Remember: Machines send data TO your central server!")
    print(f"{'=' * 60}\n")
    
    return True

if __name__ == "__main__":
    try:
        create_machine_package()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
