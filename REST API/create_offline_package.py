"""
Offline Package Creator for REST API
Run this script on a computer WITH internet to create an offline installation package
"""

import os
import subprocess
import shutil
from pathlib import Path

def create_offline_package():
    """Create an offline installation package"""
    
    print("=" * 60)
    print("Creating Offline Installation Package for REST API")
    print("=" * 60)
    
    # Create package directory
    package_dir = Path("REST_API_OFFLINE_PACKAGE")
    if package_dir.exists():
        print(f"\n⚠ Warning: {package_dir} already exists. Removing old package...")
        shutil.rmtree(package_dir)
    
    package_dir.mkdir()
    
    # Create subdirectories
    (package_dir / "source_files").mkdir()
    (package_dir / "python_packages").mkdir()
    (package_dir / "install_scripts").mkdir()
    
    print("\n1. Copying source files...")
    
    # Copy all Python source files
    source_files = [
        "test_api.py",
        "machine_data_collector.py",
        "machine_config.py",
        "requirements.txt",
        "install.bat"
    ]
    
    for file in source_files:
        src = Path(f"REST API/{file}")
        if src.exists():
            dst = package_dir / "source_files" / file
            shutil.copy2(src, dst)
            print(f"   ✓ Copied {file}")
        else:
            print(f"   ⚠ Warning: {file} not found")
    
    print("\n2. Downloading Python packages...")
    
    # Download all packages to a local directory
    packages_dir = package_dir / "python_packages"
    requirements_file = Path("REST API/requirements.txt")
    
    if requirements_file.exists():
        print(f"   Reading requirements from {requirements_file}")
        
        # Download packages using pip download; target Python 3.11 wheels for Windows amd64
        # This avoids building native extensions for Python 3.13 which may not have wheels yet
        try:
            print("   Downloading packages for Windows (cp311) — this may take a few minutes...")
            result = subprocess.run([
                "python", "-m", "pip", "download",
                "-r", str(requirements_file),
                "-d", str(packages_dir),
                "--only-binary", ":all:",
                "--platform", "win_amd64",
                "--implementation", "cp",
                "--python-version", "3.11",
                "--abi", "cp311"
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
    
    # Create Windows installation script
    install_script = package_dir / "install_scripts" / "install_offline.bat"
    with open(install_script, 'w') as f:
        f.write("""@echo off
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
cd /d "%~dp0..\\source_files"

REM Install packages from local directory
echo Installing Python packages...
pip install --no-index --find-links=..\\python_packages -r requirements.txt

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
echo Files are located in: %~dp0..\\source_files
echo.
echo NEXT STEPS:
echo 1. Edit machine_config.py with your machine-specific settings
echo 2. Update MACHINE_ID, API_URL, and API_KEY
echo 3. Run: python test_api.py
echo.
pause
""")
    
    print(f"   ✓ Created {install_script}")
    
    # Create simple INSTALL.bat in root
    simple_install = package_dir / "INSTALL.bat"
    with open(simple_install, 'w') as f:
        f.write("""@echo off
echo Installing REST API (Offline Mode)...
cd source_files
pip install --no-index --find-links=..\\python_packages -r requirements.txt
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
""")
    
    print(f"   ✓ Created {simple_install}")
    
    # Create README
    readme = package_dir / "README.txt"
    with open(readme, 'w') as f:
        f.write("""REST API OFFLINE INSTALLATION PACKAGE
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
""")
    
    print(f"   ✓ Created {readme}")
    
    print("\n4. Package Summary...")
    
    # Count files
    source_count = len(list((package_dir / "source_files").glob("*")))
    package_count = len(list((package_dir / "python_packages").glob("*")))
    
    # Calculate size
    total_size = sum(f.stat().st_size for f in package_dir.rglob('*') if f.is_file())
    size_mb = total_size / (1024 * 1024)
    
    print(f"\n{'=' * 60}")
    print("✅ Package Created Successfully!")
    print(f"{'=' * 60}")
    print(f"📦 Location: {package_dir.absolute()}")
    print(f"📄 Source Files: {source_count}")
    print(f"📦 Python Packages: {package_count}")
    print(f"💾 Total Size: {size_mb:.1f} MB")
    print(f"\n✅ Ready to transfer to machine computer!")
    print(f"\n📋 Next Steps:")
    print(f"   1. Copy '{package_dir}' folder to USB drive or network share")
    print(f"   2. Transfer to machine computer")
    print(f"   3. On machine computer, run: INSTALL.bat")
    print(f"   4. Configure: source_files\\machine_config.py")
    print(f"   5. Run: cd source_files && python test_api.py")
    print(f"\n{'=' * 60}\n")
    
    return True

if __name__ == "__main__":
    try:
        create_offline_package()
    except Exception as e:
        print(f"\n❌ Error creating package: {e}")
        import traceback
        traceback.print_exc()
