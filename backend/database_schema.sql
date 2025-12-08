-- Database Schema for System Status Portal
-- Matches specification requirements for 2-month data retention

-- Systems table (matches specification requirements)
CREATE TABLE systems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'offline',
    system_type VARCHAR(100),
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- System data table (matches specification data structure)
CREATE TABLE system_data (
    id SERIAL PRIMARY KEY,
    system_id INTEGER REFERENCES systems(id) ON DELETE CASCADE,
    api_version VARCHAR(50),
    windows_version VARCHAR(100),
    uptime_days INTEGER,
    computer_name VARCHAR(255),
    timezone VARCHAR(100),
    timezone_display_name VARCHAR(255),
    timezone_standard_name VARCHAR(255),
    timezone_daylight_name VARCHAR(255),
    timezone_base_utc_offset_ticks BIGINT,
    timezone_supports_daylight_saving BOOLEAN DEFAULT FALSE,
    actual_time TIMESTAMP,
    utc_time TIMESTAMP,
    disk_usage JSONB,
    memory_usage JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Disk information table (matches specification requirements)
CREATE TABLE disk_info (
    id SERIAL PRIMARY KEY,
    system_data_id INTEGER REFERENCES system_data(id) ON DELETE CASCADE,
    mount_point VARCHAR(255),
    disk_type VARCHAR(50),
    disk_label VARCHAR(255),
    disk_format VARCHAR(50),
    free_space BIGINT,
    total_size BIGINT,
    used_percentage DECIMAL(5,2)
);

-- System status history (for 2-month retention)
CREATE TABLE system_status_history (
    id SERIAL PRIMARY KEY,
    system_id INTEGER REFERENCES systems(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    data JSONB,
    reason VARCHAR(255)
);

-- System alerts table
CREATE TABLE system_alerts (
    id SERIAL PRIMARY KEY,
    system_id INTEGER REFERENCES systems(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_systems_status ON systems(status);
CREATE INDEX idx_systems_location ON systems(location);
CREATE INDEX idx_system_data_timestamp ON system_data(timestamp);
CREATE INDEX idx_system_data_system_id ON system_data(system_id);
CREATE INDEX idx_status_history_timestamp ON system_status_history(timestamp);
CREATE INDEX idx_status_history_system_id ON system_status_history(system_id);
CREATE INDEX idx_alerts_timestamp ON system_alerts(timestamp);
CREATE INDEX idx_alerts_system_id ON system_alerts(system_id);

-- Function to clean up old data (2-month retention)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete system data older than 2 months
    DELETE FROM system_data 
    WHERE timestamp < NOW() - INTERVAL '2 months';
    
    -- Delete status history older than 2 months
    DELETE FROM system_status_history 
    WHERE timestamp < NOW() - INTERVAL '2 months';
    
    -- Delete old alerts (keep for 1 month)
    DELETE FROM system_alerts 
    WHERE timestamp < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');
