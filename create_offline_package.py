"""
Quick offline package creator - Alternative method
Creates a complete standalone package
"""

import os
import subprocess
import shutil
from pathlib import Path

def main():
    print("Creating offline installation package...")
    
    # Package directory
    package_name = "REST_API_OFFLINE_PACKAGE"
    package_dir = Path(package_name)
    
    # Remove old package if exists
    if package_dir.exists():
        shutil.rmtree(package_dir)
    
    package_dir.mkdir()
    
    # Copy source files
    print("Copying source files...")
    source_dir = package_dir / "source_files"
    source_dir.mkdir()
    
    files_to_copy = [
        "test_api.py",
        "machine_data_collector.py", 
        "machine_config.py",
        "requirements.txt",
        "install.bat"
    ]
    
    for file in files_to_copy:
        src = Path(f"REST API/{file}")
        if src.exists():
            shutil.copy2(src, source_dir / file)
            print(f"  ✓ {file}")
    
    # Download packages
    print("\nDownloading Python packages...")
    packages_dir = package_dir / "packages"
    packages_dir.mkdir()
    
    requirements = Path("REST API/requirements.txt")
    if requirements.exists():
        subprocess.run([
            "pip", "download",
            "-r", str(requirements),
            "-d", str(packages_dir)
        ])
        print(f"  ✓ Packages downloaded")
    
    # Create install script
    print("\nCreating installation script...")
    install_script = package_dir / "INSTALL.bat"
    with open(install_script, 'w') as f:
        f.write("""@echo off
echo Installing REST API (Offline Mode)...
cd source_files
pip install --no-index --find-links=..\\packages -r requirements.txt
echo.
echo Installation complete!
echo.
echo Edit machine_config.py and run: python test_api.py
pause
""")
    
    print(f"\n✅ Package created: {package_dir}")
    print(f"   Size: {get_size(package_dir)}")
    print(f"\nTransfer this folder to the machine computer and run INSTALL.bat")

def get_size(path):
    total = 0
    for entry in Path(path).rglob('*'):
        if entry.is_file():
            total += entry.stat().st_size
    # Convert to MB
    return f"{total / (1024*1024):.1f} MB"

if __name__ == "__main__":
    main()


