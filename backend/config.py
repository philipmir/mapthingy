"""
Configuration management for Machine Monitor
Handles both mock and real API modes
"""
import os
from pathlib import Path
from typing import Literal
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Data source configuration
    use_mock_data: Literal["mock", "real"] = "mock"
    
    # Real API configuration
    api_base_url: str = "https://api.sintercast.com/v1"
    api_key: str = "your_api_key_here"
    api_timeout: int = 30
    ws_url: str = "wss://api.sintercast.com/ws"
    
    # Simulation settings
    simulation_update_interval: int = 15
    simulation_recovery_interval: int = 30
    
    # Database configuration
    database_url: str = "postgresql://user:password@localhost:5432/machine_monitor"
    
    # CORS configuration
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def is_mock_mode(self) -> bool:
        """Check if running in mock data mode"""
        return self.use_mock_data == "mock"
    
    @property
    def is_real_mode(self) -> bool:
        """Check if running in real API mode"""
        return self.use_mock_data == "real"
    
    @property
    def cors_origins_list(self) -> list:
        """Get CORS origins as a list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

# Create global settings instance
settings = Settings()

# Print current mode on import
print(f"\n{'='*60}")
print(f"Machine Monitor Starting")
print(f"{'='*60}")
print(f"Data Mode: {settings.use_mock_data.upper()}")
if settings.is_mock_mode:
    print(f"Using MOCK/SIMULATION data")
    print(f"   Update Interval: {settings.simulation_update_interval}s")
    print(f"   Recovery Interval: {settings.simulation_recovery_interval}s")
else:
    print(f"Using REAL API")
    print(f"   API URL: {settings.api_base_url}")
    print(f"   WebSocket URL: {settings.ws_url}")
print(f"{'='*60}\n")

