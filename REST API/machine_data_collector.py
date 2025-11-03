#!/usr/bin/env python3
"""
Machine Data Collector for Real SinterCast Machines
Runs on each machine computer to send data to the monitoring system.

Based on the test_api.py structure but adapted for real machine data collection.
"""

import requests
import json
import psutil
import time
import serial
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import os
import sys

# Import machine-specific configuration
from machine_config import *

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class SinterCastMachineCollector:
    """
    Collects data from SinterCast machines and sends to monitoring API.
    Based on the test_api.py structure but for real machine integration.
    """
    
    def __init__(self):
        self.machine_id = MACHINE_ID
        self.api_url = API_URL
        self.api_key = API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": f"SinterCast-Machine-{self.machine_id}"
        }
        self.serial_connection = None
        self.last_status = "unknown"
        
        logger.info(f"Initializing collector for machine: {MACHINE_NAME} ({self.machine_id})")
        logger.info(f"API URL: {self.api_url}")
    
    def connect_to_machine_sensors(self) -> bool:
        """Connect to machine's sensor system via serial port"""
        try:
            if DEBUG_MODE:
                logger.info(f"DEBUG: Simulating sensor connection to {SENSOR_PORT}")
                return True
            
            self.serial_connection = serial.Serial(
                port=SENSOR_PORT,
                baudrate=BAUD_RATE,
                timeout=1
            )
            logger.info(f"Connected to machine sensors on {SENSOR_PORT}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to machine sensors: {e}")
            return False
    
    def read_temperature_sensor(self) -> float:
        """Read temperature from machine sensor"""
        if DEBUG_MODE:
            # Simulate realistic temperature readings
            import random
            base_temp = 42.0
            variation = random.uniform(-5, 5)
            return round(base_temp + variation, 1)
        
        if not self.serial_connection:
            return 0.0
        
        try:
            # Send command to read temperature (machine-specific protocol)
            self.serial_connection.write(b'TEMP?\r\n')
            response = self.serial_connection.readline().decode().strip()
            return float(response)
        except Exception as e:
            logger.error(f"Error reading temperature: {e}")
            return 0.0
    
    def read_pressure_sensor(self) -> float:
        """Read pressure from machine sensor"""
        if DEBUG_MODE:
            import random
            base_pressure = 2.1
            variation = random.uniform(-0.2, 0.2)
            return round(base_pressure + variation, 1)
        
        if not self.serial_connection:
            return 0.0
        
        try:
            self.serial_connection.write(b'PRESSURE?\r\n')
            response = self.serial_connection.readline().decode().strip()
            return float(response)
        except Exception as e:
            logger.error(f"Error reading pressure: {e}")
            return 0.0
    
    def read_speed_sensor(self) -> int:
        """Read speed from machine sensor"""
        if DEBUG_MODE:
            import random
            base_speed = 1450
            variation = random.randint(-100, 100)
            return max(0, base_speed + variation)
        
        if not self.serial_connection:
            return 0
        
        try:
            self.serial_connection.write(b'SPEED?\r\n')
            response = self.serial_connection.readline().decode().strip()
            return int(response)
        except Exception as e:
            logger.error(f"Error reading speed: {e}")
            return 0
    
    def collect_system_info(self) -> Dict[str, Any]:
        """Collect system information (similar to system_info_example.json)"""
        try:
            boot_time = psutil.boot_time()
            uptime_seconds = time.time() - boot_time
            
            return {
                "version": "1.0.0.0",
                "system": {
                    "os": "Windows" if os.name == 'nt' else "Linux",
                    "architecture": "x64",
                    "upTimeTicks": int(uptime_seconds * 10000000),
                    "upTime": {
                        "days": int(uptime_seconds // 86400),
                        "hours": int((uptime_seconds % 86400) // 3600),
                        "minutes": int((uptime_seconds % 3600) // 60),
                        "seconds": int(uptime_seconds % 60)
                    },
                    "name": os.environ.get('COMPUTERNAME', 'Unknown'),
                    "processors": psutil.cpu_count(),
                    "time": datetime.now().isoformat(),
                    "utcTime": datetime.utcnow().isoformat(),
                    "timezone": {
                        "id": "Local Time",
                        "displayName": "Local Timezone",
                        "standardName": "Local Standard Time",
                        "daylightName": "Local Daylight Time",
                        "baseUtcOffset": {"ticks": 0},
                        "supportsDaylightSavingTime": True
                    }
                },
                "disks": [
                    {
                        "mountPoint": f"{disk.mountpoint}",
                        "type": "Fixed",
                        "label": disk.device,
                        "format": disk.fstype or "Unknown",
                        "freeSpace": psutil.disk_usage(disk.mountpoint).free,
                        "totalSize": psutil.disk_usage(disk.mountpoint).total,
                        "usedPercentage": round((psutil.disk_usage(disk.mountpoint).used / psutil.disk_usage(disk.mountpoint).total) * 100, 2)
                    }
                    for disk in psutil.disk_partitions()
                    if disk.fstype
                ]
            }
        except Exception as e:
            logger.error(f"Error collecting system info: {e}")
            return {}
    
    def collect_sensor_data(self) -> Dict[str, Any]:
        """Collect all sensor data from the machine"""
        try:
            temperature = self.read_temperature_sensor()
            pressure = self.read_pressure_sensor()
            speed = self.read_speed_sensor()
            
            # Calculate disk usage
            disk_usage = psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:').percent
            
            return {
                "temperature": temperature,
                "pressure": pressure,
                "speed": speed,
                "disk_volume": round(disk_usage, 1),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error collecting sensor data: {e}")
            return {}
    
    def determine_machine_status(self, sensor_data: Dict[str, Any]) -> str:
        """Determine machine status based on sensor readings"""
        temperature = sensor_data.get("temperature", 0)
        pressure = sensor_data.get("pressure", 0)
        speed = sensor_data.get("speed", 0)
        
        # Status determination logic (based on your test_api.py thresholds)
        if temperature >= TEMPERATURE_CRITICAL or pressure >= PRESSURE_CRITICAL:
            return "red"  # Critical error
        elif temperature >= TEMPERATURE_WARNING or pressure >= PRESSURE_WARNING or speed < SPEED_MINIMUM:
            return "yellow"  # Warning
        elif speed == 0:
            return "black"  # Not accessible
        else:
            return "green"  # Normal operation
    
    def create_machine_payload(self) -> Dict[str, Any]:
        """Create the complete machine data payload"""
        system_info = self.collect_system_info()
        sensor_data = self.collect_sensor_data()
        status = self.determine_machine_status(sensor_data)
        
        # Create payload similar to your test_api.py structure
        payload = {
            "machine_id": self.machine_id,
            "name": MACHINE_NAME,
            "latitude": LATITUDE,
            "longitude": LONGITUDE,
            "status": status,
            "location": LOCATION,
            "system_type": SYSTEM_TYPE,
            "last_seen": datetime.utcnow().isoformat(),
            "data": sensor_data,
            "system_info": system_info
        }
        
        return payload
    
    def send_data_to_api(self) -> bool:
        """Send collected data to the monitoring API"""
        try:
            payload = self.create_machine_payload()
            
            # Use the same endpoint structure as your test_api.py
            response = requests.post(
                f"{self.api_url}/api/machines/{self.machine_id}/status",
                headers=self.headers,
                json=payload,
                timeout=TIMEOUT_SECONDS
            )
            
            if response.status_code == 200:
                logger.info(f"? Data sent successfully for {MACHINE_NAME}")
                self.last_status = payload["status"]
                return True
            else:
                logger.error(f"? Failed to send data: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"? Network error sending data: {e}")
            return False
        except Exception as e:
            logger.error(f"? Error sending data: {e}")
            return False
    
    def test_api_connection(self) -> bool:
        """Test connection to the monitoring API"""
        try:
            response = requests.get(
                f"{self.api_url}/",
                headers=self.headers,
                timeout=TIMEOUT_SECONDS
            )
            
            if response.status_code == 200:
                logger.info(f"? API connection test successful")
                return True
            else:
                logger.error(f"? API connection test failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"? API connection test error: {e}")
            return False
    
    def run_continuous(self):
        """Run data collection continuously"""
        logger.info(f"?? Starting continuous data collection for {MACHINE_NAME}")
        logger.info(f"?? Sending data every {COLLECTION_INTERVAL} seconds to {self.api_url}")
        
        # Test API connection first
        if not self.test_api_connection():
            logger.error("? Cannot connect to API. Check network and credentials.")
            return
        
        # Connect to machine sensors
        if not self.connect_to_machine_sensors():
            logger.warning("?? Cannot connect to machine sensors. Running in simulation mode.")
        
        consecutive_failures = 0
        
        while True:
            try:
                success = self.send_data_to_api()
                
                if success:
                    consecutive_failures = 0
                else:
                    consecutive_failures += 1
                    
                    if consecutive_failures >= RETRY_ATTEMPTS:
                        logger.error(f"? {consecutive_failures} consecutive failures. Stopping collection.")
                        break
                
                time.sleep(COLLECTION_INTERVAL)
                
            except KeyboardInterrupt:
                logger.info("?? Data collection stopped by user")
                break
            except Exception as e:
                logger.error(f"? Unexpected error: {e}")
                time.sleep(COLLECTION_INTERVAL)

def main():
    """Main entry point"""
    print(f"?? SinterCast Machine Data Collector")
    print(f"Machine: {MACHINE_NAME} ({MACHINE_ID})")
    print(f"Location: {LOCATION}")
    print(f"System Type: {SYSTEM_TYPE}")
    print(f"API URL: {API_URL}")
    print(f"Collection Interval: {COLLECTION_INTERVAL} seconds")
    print(f"Debug Mode: {DEBUG_MODE}")
    print("-" * 50)
    
    collector = SinterCastMachineCollector()
    collector.run_continuous()

if __name__ == "__main__":
    main()