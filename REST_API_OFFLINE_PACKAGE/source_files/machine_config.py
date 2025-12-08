# Machine Configuration - Customize for each machine
import os

# Machine-specific settings - CHANGE THESE FOR EACH MACHINE
MACHINE_ID = "ironcast_berlin"  # Unique identifier for this machine
MACHINE_NAME = "IronCast Berlin"  # Human-readable name
LOCATION = "Berlin, Germany"  # Machine location
SYSTEM_TYPE = "Automated System 4000"  # or "Mini-System 4000"

# API Configuration - POINT TO YOUR MAIN SERVER
API_URL = "http://192.168.175.116:8023"  # Machine computer IP and port
API_KEY = "test_machine_key"  # Test key for local testing

# Sensor Configuration - Machine-specific
SENSOR_PORT = "COM1"  # Serial port for machine sensors
BAUD_RATE = 9600  # Communication speed

# Data Collection Settings
COLLECTION_INTERVAL = 30  # Send data every 30 seconds
RETRY_ATTEMPTS = 3  # Retry failed requests
TIMEOUT_SECONDS = 30  # Request timeout

# Machine Coordinates - Update for each machine
LATITUDE = 52.5200  # Berlin coordinates (example)
LONGITUDE = 13.4050

# Status Thresholds - Machine-specific limits
TEMPERATURE_WARNING = 60.0  # °C
TEMPERATURE_CRITICAL = 80.0  # °C
PRESSURE_WARNING = 3.0  # bar
PRESSURE_CRITICAL = 5.0  # bar
SPEED_MINIMUM = 500  # RPM

# Logging Configuration
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR
LOG_FILE = f"machine_{MACHINE_ID}_log.txt"

# Environment Detection
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"
DEBUG_MODE = not IS_PRODUCTION