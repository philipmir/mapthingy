"""
Status Configuration for System Status Portal

This module defines the configurable status criteria as required by the specification.
Status determination is based on system data and can be configured in the web application.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class StatusCriteria:
    """Configurable status criteria for system status determination"""
    
    def __init__(self):
        # Default criteria - can be configured via web interface
        self.criteria = {
            "temperature": {
                "warning_threshold": 60.0,
                "error_threshold": 80.0
            },
            "pressure": {
                "warning_threshold": 3.0,
                "error_threshold": 5.0
            },
            "disk_volume": {
                "warning_threshold": 85.0,
                "error_threshold": 95.0
            },
            "speed": {
                "warning_threshold_low": 500,
                "warning_threshold_high": 2000,
                "error_threshold_low": 200,
                "error_threshold_high": 2500
            },
            "connection": {
                "timeout_minutes": 5,
                "offline_threshold_minutes": 30
            }
        }
    
    def update_criteria(self, new_criteria: Dict[str, Any]) -> bool:
        """Update status criteria from web interface"""
        try:
            self.criteria.update(new_criteria)
            logger.info(f"Updated status criteria: {new_criteria}")
            return True
        except Exception as e:
            logger.error(f"Error updating criteria: {e}")
            return False
    
    def get_criteria(self) -> Dict[str, Any]:
        """Get current status criteria"""
        return self.criteria.copy()

class StatusDeterminer:
    """Determines system status based on configurable criteria"""
    
    def __init__(self, criteria: StatusCriteria):
        self.criteria = criteria
    
    def determine_status(self, system_data: Dict[str, Any]) -> str:
        """
        Determine system status based on specification requirements
        
        Returns:
            'grey': Not connected to SOSON
            'black': System not accessible
            'green': System active with no alarms
            'yellow': System active with warnings
            'red': System active with errors
        """
        try:
            # Check if system is connected to SOSON
            if not self._is_connected_to_soson(system_data):
                return "grey"
            
            # Check if system is accessible
            if not self._is_system_accessible(system_data):
                return "black"
            
            # Check for errors first (highest priority)
            if self._has_errors(system_data):
                return "red"
            
            # Check for warnings
            if self._has_warnings(system_data):
                return "yellow"
            
            # System is healthy
            return "green"
            
        except Exception as e:
            logger.error(f"Error determining status: {e}")
            return "grey"
    
    def _is_connected_to_soson(self, system_data: Dict[str, Any]) -> bool:
        """Check if system is connected to SOSON"""
        # System is connected if it has recent data
        last_seen = system_data.get("last_seen")
        if not last_seen:
            return False
        
        # Check if data is recent (within timeout period)
        timeout_minutes = self.criteria.get_criteria()["connection"]["timeout_minutes"]
        time_since_last_seen = datetime.now() - last_seen
        return time_since_last_seen <= timedelta(minutes=timeout_minutes)
    
    def _is_system_accessible(self, system_data: Dict[str, Any]) -> bool:
        """Check if system is accessible"""
        last_seen = system_data.get("last_seen")
        if not last_seen:
            return False
        
        # Check if system has been offline too long
        offline_threshold = self.criteria.get_criteria()["connection"]["offline_threshold_minutes"]
        time_since_last_seen = datetime.now() - last_seen
        return time_since_last_seen <= timedelta(minutes=offline_threshold)
    
    def _has_errors(self, system_data: Dict[str, Any]) -> bool:
        """Check if system has critical errors"""
        data = system_data.get("data", {})
        criteria = self.criteria.get_criteria()
        
        # Check temperature
        temperature = data.get("temperature", 0)
        if temperature > criteria["temperature"]["error_threshold"]:
            return True
        
        # Check pressure
        pressure = data.get("pressure", 0)
        if pressure > criteria["pressure"]["error_threshold"]:
            return True
        
        # Check disk volume
        disk_volume = data.get("disk_volume", 0)
        if disk_volume > criteria["disk_volume"]["error_threshold"]:
            return True
        
        # Check speed (both too low and too high)
        speed = data.get("speed", 0)
        if (speed < criteria["speed"]["error_threshold_low"] or 
            speed > criteria["speed"]["error_threshold_high"]):
            return True
        
        return False
    
    def _has_warnings(self, system_data: Dict[str, Any]) -> bool:
        """Check if system has warnings"""
        data = system_data.get("data", {})
        criteria = self.criteria.get_criteria()
        
        # Check temperature
        temperature = data.get("temperature", 0)
        if temperature > criteria["temperature"]["warning_threshold"]:
            return True
        
        # Check pressure
        pressure = data.get("pressure", 0)
        if pressure > criteria["pressure"]["warning_threshold"]:
            return True
        
        # Check disk volume
        disk_volume = data.get("disk_volume", 0)
        if disk_volume > criteria["disk_volume"]["warning_threshold"]:
            return True
        
        # Check speed (both too low and too high)
        speed = data.get("speed", 0)
        if (speed < criteria["speed"]["warning_threshold_low"] or 
            speed > criteria["speed"]["warning_threshold_high"]):
            return True
        
        return False

# Global instances
status_criteria = StatusCriteria()
status_determiner = StatusDeterminer(status_criteria)

def get_system_status(system_data: Dict[str, Any]) -> str:
    """Get system status using current criteria"""
    return status_determiner.determine_status(system_data)

def update_status_criteria(new_criteria: Dict[str, Any]) -> bool:
    """Update status criteria from web interface"""
    return status_criteria.update_criteria(new_criteria)

def get_status_criteria() -> Dict[str, Any]:
    """Get current status criteria"""
    return status_criteria.get_criteria()
