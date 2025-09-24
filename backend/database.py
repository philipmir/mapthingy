"""
Database models and operations for machine monitoring
"""
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./machine_monitor.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Machine(Base):
    """Machine model for storing machine information"""
    __tablename__ = "machines"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="offline")
    location = Column(String(100), nullable=False)
    system_type = Column(String(50))
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert machine to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status,
            "location": self.location,
            "system_type": self.system_type,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "data": {}  # Will be populated from machine_data table
        }

class MachineData(Base):
    """Machine data model for storing sensor readings"""
    __tablename__ = "machine_data"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(50), nullable=False)
    temperature = Column(Float)
    pressure = Column(Float)
    speed = Column(Integer)
    disk_volume = Column(Float)  # Disk volume percentage
    timestamp = Column(DateTime, default=datetime.utcnow)
    raw_data = Column(JSON)  # Store additional sensor data
    
    def to_dict(self):
        """Convert machine data to dictionary"""
        return {
            "temperature": self.temperature,
            "pressure": self.pressure,
            "speed": self.speed,
            "disk_volume": self.disk_volume,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "raw_data": self.raw_data
        }

class MachineStatusHistory(Base):
    """Machine status history for tracking status changes"""
    __tablename__ = "machine_status_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    data = Column(JSON)  # Store additional status data
    reason = Column(String(255))  # Reason for status change
    
    def to_dict(self):
        """Convert status history to dictionary"""
        return {
            "machine_id": self.machine_id,
            "status": self.status,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "data": self.data,
            "reason": self.reason
        }

# Database operations
class DatabaseManager:
    """Database manager for machine operations"""
    
    def __init__(self):
        self.engine = engine
        self.SessionLocal = SessionLocal
    
    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    async def get_all_machines(self) -> list:
        """Get all machines from database"""
        db = self.get_session()
        try:
            machines = db.query(Machine).all()
            result = []
            
            for machine in machines:
                machine_dict = machine.to_dict()
                
                # Get latest machine data
                latest_data = db.query(MachineData).filter(
                    MachineData.machine_id == machine.id
                ).order_by(MachineData.timestamp.desc()).first()
                
                if latest_data:
                    machine_dict["data"] = {
                        "temperature": latest_data.temperature,
                        "pressure": latest_data.pressure,
                        "speed": latest_data.speed,
                        "disk_volume": latest_data.disk_volume
                    }
                
                result.append(machine_dict)
            
            logger.info(f"Retrieved {len(result)} machines from database")
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving machines: {e}")
            return []
        finally:
            db.close()
    
    async def get_machine_by_id(self, machine_id: str) -> dict:
        """Get specific machine by ID"""
        db = self.get_session()
        try:
            machine = db.query(Machine).filter(Machine.id == machine_id).first()
            if not machine:
                return {}
            
            machine_dict = machine.to_dict()
            
            # Get latest machine data
            latest_data = db.query(MachineData).filter(
                MachineData.machine_id == machine_id
            ).order_by(MachineData.timestamp.desc()).first()
            
            if latest_data:
                machine_dict["data"] = {
                    "temperature": latest_data.temperature,
                    "pressure": latest_data.pressure,
                    "speed": latest_data.speed,
                    "disk_volume": latest_data.disk_volume
                }
            
            return machine_dict
            
        except Exception as e:
            logger.error(f"Error retrieving machine {machine_id}: {e}")
            return {}
        finally:
            db.close()
    
    async def update_machine_status(self, machine_id: str, status: str, data: dict = None) -> bool:
        """Update machine status in database"""
        db = self.get_session()
        try:
            machine = db.query(Machine).filter(Machine.id == machine_id).first()
            if not machine:
                logger.warning(f"Machine {machine_id} not found")
                return False
            
            # Update machine status
            old_status = machine.status
            machine.status = status
            machine.last_seen = datetime.utcnow()
            machine.updated_at = datetime.utcnow()
            
            # Store machine data if provided
            if data:
                machine_data = MachineData(
                    machine_id=machine_id,
                    temperature=data.get("temperature"),
                    pressure=data.get("pressure"),
                    speed=data.get("speed"),
                    disk_volume=data.get("disk_volume"),
                    raw_data=data
                )
                db.add(machine_data)
            
            # Store status history if status changed
            if old_status != status:
                status_history = MachineStatusHistory(
                    machine_id=machine_id,
                    status=status,
                    data=data,
                    reason=f"Status changed from {old_status} to {status}"
                )
                db.add(status_history)
            
            db.commit()
            logger.info(f"Updated machine {machine_id} status to {status}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating machine {machine_id}: {e}")
            db.rollback()
            return False
        finally:
            db.close()
    
    async def add_machine(self, machine_data: dict) -> bool:
        """Add new machine to database"""
        db = self.get_session()
        try:
            machine = Machine(
                id=machine_data["id"],
                name=machine_data["name"],
                latitude=machine_data["latitude"],
                longitude=machine_data["longitude"],
                status=machine_data.get("status", "offline"),
                location=machine_data["location"],
                system_type=machine_data.get("system_type")
            )
            db.add(machine)
            db.commit()
            
            logger.info(f"Added new machine: {machine_data['id']}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding machine: {e}")
            db.rollback()
            return False
        finally:
            db.close()
    
    async def get_machine_history(self, machine_id: str, hours: int = 24) -> list:
        """Get machine data history"""
        db = self.get_session()
        try:
            from datetime import timedelta
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            history = db.query(MachineData).filter(
                MachineData.machine_id == machine_id,
                MachineData.timestamp >= cutoff_time
            ).order_by(MachineData.timestamp.desc()).all()
            
            result = [data.to_dict() for data in history]
            logger.debug(f"Retrieved {len(result)} history records for machine {machine_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving machine history: {e}")
            return []
        finally:
            db.close()
    
    async def get_status_history(self, machine_id: str, hours: int = 24) -> list:
        """Get machine status history"""
        db = self.get_session()
        try:
            from datetime import timedelta
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            history = db.query(MachineStatusHistory).filter(
                MachineStatusHistory.machine_id == machine_id,
                MachineStatusHistory.timestamp >= cutoff_time
            ).order_by(MachineStatusHistory.timestamp.desc()).all()
            
            result = [status.to_dict() for status in history]
            logger.debug(f"Retrieved {len(result)} status history records for machine {machine_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving status history: {e}")
            return []
        finally:
            db.close()
    
    async def get_analytics(self, hours: int = 24) -> dict:
        """Get analytics data for dashboard"""
        db = self.get_session()
        try:
            from datetime import timedelta
            from sqlalchemy import func
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            # Get status counts
            status_counts = db.query(
                Machine.status,
                func.count(Machine.id).label('count')
            ).group_by(Machine.status).all()
            
            # Get average metrics
            avg_metrics = db.query(
                func.avg(MachineData.temperature).label('avg_temp'),
                func.avg(MachineData.pressure).label('avg_pressure'),
                func.avg(MachineData.speed).label('avg_speed'),
                func.avg(MachineData.disk_volume).label('avg_disk_volume')
            ).filter(
                MachineData.timestamp >= cutoff_time
            ).first()
            
            # Get total machines
            total_machines = db.query(Machine).count()
            
            # Get online machines
            online_machines = db.query(Machine).filter(Machine.status == "online").count()
            
            uptime = (online_machines / total_machines * 100) if total_machines > 0 else 0
            
            analytics = {
                "total_machines": total_machines,
                "online_machines": online_machines,
                "uptime_percentage": round(uptime, 2),
                "status_counts": {status: count for status, count in status_counts},
                "avg_temperature": round(avg_metrics.avg_temp or 0, 2),
                "avg_pressure": round(avg_metrics.avg_pressure or 0, 2),
                "avg_speed": round(avg_metrics.avg_speed or 0, 2),
                "avg_disk_volume": round(avg_metrics.avg_disk_volume or 0, 2),
                "time_range_hours": hours
            }
            
            logger.info(f"Generated analytics for {total_machines} machines")
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating analytics: {e}")
            return {}
        finally:
            db.close()

# Initialize database
def init_database():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

# Global database manager instance
db_manager = DatabaseManager()
