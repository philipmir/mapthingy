/**
 * Global Machine Monitor - Dark Theme Design
 * 
 * Alternative design with dark theme and neon accents
 * Same functionality as App.js but with different visual styling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './styles.css';

// Import different map designs
import App from './App';
import AppMinimal from './AppMinimal';
import AppIndustrial from './AppIndustrial';
import AppModern from './AppModern';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Function to arrange markers in country boxes - same as default App.js
const arrangeMarkersInCountryBoxes = (machines) => {
  const arranged = [];
  
  // Group machines by country
  const machinesByCountry = {};
  machines.forEach(machine => {
    const country = machine.location;
    if (!machinesByCountry[country]) {
      machinesByCountry[country] = [];
    }
    machinesByCountry[country].push(machine);
  });
  
  // Create a box for each country with unique positions to avoid overlap
  const countries = Object.keys(machinesByCountry);
  const countryPositions = {
    'China': { lat: 35.0, lng: 105.0 },
    'Sweden': { lat: 60.0, lng: 15.0 },
    'USA': { lat: 40.0, lng: -100.0 },
    'Korea': { lat: 35.5, lng: 127.5 },
    'Brazil': { lat: -15.0, lng: -47.0 },
    'Mexico': { lat: 23.0, lng: -102.0 },
    'Turkey': { lat: 39.0, lng: 35.0 },
    'Spain': { lat: 40.0, lng: -3.0 },
    'Italy': { lat: 41.5, lng: 12.5 },
    'India': { lat: 20.0, lng: 77.0 },
    'Japan': { lat: 36.0, lng: 138.0 },
    'Portugal': { lat: 39.5, lng: -8.0 }
  };
  
  countries.forEach((country, countryIndex) => {
    const countryMachines = machinesByCountry[country];
    
    // Use predefined position for this country, or fallback to first machine location
    const position = countryPositions[country] || { lat: countryMachines[0].latitude, lng: countryMachines[0].longitude };
    const centerLat = position.lat;
    const centerLng = position.lng;
    
    // All machines in this country - arrange in tight box around the center
    const boxSpacing = 3.5; // Balanced spacing - more compact than original but not too tight
    
    // Calculate grid dimensions for this country's machines
    const cols = Math.ceil(Math.sqrt(countryMachines.length));
    const rows = Math.ceil(countryMachines.length / cols);
    
    countryMachines.forEach((machine, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      const offsetLat = (row - (rows - 1) / 2) * boxSpacing;
      const offsetLng = (col - (cols - 1) / 2) * boxSpacing;
      
      arranged.push({
        ...machine,
        latitude: centerLat + offsetLat,
        longitude: centerLng + offsetLng,
        boxCountry: country,
        boxIndex: index,
        boxTotal: countryMachines.length
      });
    });
  });
  
  return arranged;
};

// Create custom icons for different machine statuses with neon glow effects
const createCustomIcon = (status, systemType, machineId, recentlyChanged) => {
  let color;
  let glowColor;
  let shape = 'circle'; // Default shape
  let size = 20;
  
  // Set color based on status with neon glow - SPECIFICATION COMPLIANT
  // Grey: Not connected to SOSON, Black: System not accessible, Green: Active with no alarms, Yellow: Active with warnings, Red: Active with errors
  switch (status) {
    case 'grey': // Not connected to SOSON
      color = '#888888';
      glowColor = '#88888844';
      break;
    case 'black': // System not accessible
      color = '#000000';
      glowColor = '#00000044';
      break;
    case 'green': // Active with no alarms
      color = '#00ff88';
      glowColor = '#00ff8844';
      break;
    case 'yellow': // Active with warnings
      color = '#ffaa00';
      glowColor = '#ffaa0044';
      break;
    case 'red': // Active with errors
      color = '#ff4444';
      glowColor = '#ff444444';
      break;
    case 'online': // Legacy support - map to green
      color = '#00ff88';
      glowColor = '#00ff8844';
      break;
    case 'warning': // Legacy support - map to yellow
      color = '#ffaa00';
      glowColor = '#ffaa0044';
      break;
    case 'offline': // Legacy support - map to black
      color = '#000000';
      glowColor = '#00000044';
      break;
    case 'error': // Legacy support - map to red
      color = '#ff4444';
      glowColor = '#ff444444';
      break;
    default:
      color = '#888888'; // Default to grey
      glowColor = '#88888844';
  }
  
  // Set shape based on system type
  if (systemType === 'Mini-System 4000') {
    shape = 'square';
  } else if (systemType === 'Industrial System') {
    shape = 'diamond';
  }
  
  // Set size based on system type
  if (systemType === 'Mini-System 4000') {
    size = 24; // Larger for neon effect
  } else if (systemType === 'Industrial System') {
    size = 28; // Even larger for industrial systems
  }
  
  // Determine if this machine should pulse
  const shouldPulse = recentlyChanged;
  const pulseClass = shouldPulse ? 'pulse-red' : '';
  const pulseColor = shouldPulse ? 'rgba(255, 0, 0, 0.8)' : color;
  const pulseAnimation = shouldPulse ? 'pulse-individual' : '';
  
  // Set border radius based on shape
  let borderRadius = '50%'; // Default circle
  if (shape === 'square') {
    borderRadius = '4px';
  } else if (shape === 'diamond') {
    borderRadius = '0px';
  }
  
  const borderWidth = shouldPulse ? '3px' : '2px';

  const pulseStyle = shouldPulse ? `
    border: ${borderWidth} solid ${pulseColor} !important;
    animation: ${pulseAnimation} 1s ease-in-out infinite;
    z-index: 99999 !important;
    position: relative;
  ` : '';

  return L.divIcon({
    className: `custom-marker ${pulseClass}`,
    html: `<div style="
      background: radial-gradient(circle, ${color} 0%, ${color}dd 100%);
      width: ${size}px;
      height: ${size}px;
      border-radius: ${borderRadius};
      border: ${borderWidth} solid ${color};
      box-shadow: 0 0 20px ${glowColor}, 0 0 40px ${glowColor}, 0 0 60px ${glowColor};
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      animation: pulse 2s infinite;
      ${pulseStyle}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// All styled components are now handled by CSS classes in styles.css

// Component to auto-fit map to show all markers
function AutoFitBounds({ machines }) {
  const map = useMap();
  
  useEffect(() => {
    if (machines && machines.length > 0) {
      const bounds = L.latLngBounds(
        machines.map(machine => [machine.latitude, machine.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, machines]);
  
  return null;
}

function AppDark() {
  const [machines, setMachines] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [alertFlash, setAlertFlash] = useState(false);
  const [flashColor, setFlashColor] = useState('red');
  const [recentlyChangedMachines, setRecentlyChangedMachines] = useState(new Set());
  const [alertedMachines, setAlertedMachines] = useState(new Set());
  const [machinePreviousStatus, setMachinePreviousStatus] = useState(new Map());
  const [lastFlashTime, setLastFlashTime] = useState(0);
  const [styleSwitcherOpen, setStyleSwitcherOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('dark');

  // Style options
  const styles = [
    { id: 'default', name: 'Default', component: App },
    { id: 'dark', name: 'Dark', component: AppDark },
    { id: 'minimal', name: 'Minimal', component: AppMinimal },
    { id: 'industrial', name: 'Industrial', component: AppIndustrial },
    { id: 'modern', name: 'Modern', component: AppModern }
  ];

  const CurrentStyleComponent = styles.find(style => style.id === currentStyle)?.component;

  // WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = new WebSocket('ws://127.0.0.1:8000/ws');
    
    newSocket.onopen = () => {
      setConnectionStatus('Connected');
      console.log('Connected to server');
    };

    newSocket.onclose = () => {
      setConnectionStatus('Disconnected');
      console.log('Disconnected from server');
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('RECEIVED:', message);
        if (message.type === 'machine_update') {
          console.log(`UPDATING: Machine ${message.machine_id} to ${message.status}`);
          
          // Track previous status for this machine
          setMachinePreviousStatus(prev => {
            const newMap = new Map(prev);
            newMap.set(message.machine_id, message.status);
            return newMap;
          });
          
          // Track this machine as recently changed for pulsing animation
          setRecentlyChangedMachines(prev => new Set([...prev, message.machine_id]));
          
          // Remove from recently changed after 30 seconds
          setTimeout(() => {
            setRecentlyChangedMachines(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.machine_id);
              return newSet;
            });
          }, 30000);
          
          setMachines(prevMachines => 
            prevMachines.map(machine => 
              machine.id === message.machine_id 
                ? { 
                    ...machine, 
                    status: message.status, 
                    data: { ...machine.data, ...message.data },
                    last_seen: new Date(message.timestamp)
                  }
                : machine
            )
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/machines');
        setMachines(response.data);
        setConnectionStatus('Connected');
      } catch (error) {
        console.error('Error fetching machines:', error);
        setConnectionStatus('Error');
      }
    };
    
    fetchMachines();
  }, []);

  // Filter machines based on selected filters
  const filteredMachines = useMemo(() => {
    let filtered = machines;
    
    if (statusFilter !== 'all') {
      // Map legacy status values to specification-compliant ones for filtering
      const statusMap = {
        'online': 'green',
        'warning': 'yellow', 
        'offline': 'black',
        'error': 'red'
      };
      
      filtered = filtered.filter(machine => {
        const machineStatus = statusMap[machine.status] || machine.status;
        return machineStatus === statusFilter;
      });
    }
    
    if (systemFilter !== 'all') {
      filtered = filtered.filter(machine => machine.system_type === systemFilter);
    }
    
    if (countryFilter !== 'all') {
      filtered = filtered.filter(machine => machine.location === countryFilter);
    }
    
    return filtered;
  }, [machines, statusFilter, systemFilter, countryFilter]);

  // Arrange filtered machines in country boxes
  const arrangedMachines = useMemo(() => {
    return arrangeMarkersInCountryBoxes(filteredMachines);
  }, [filteredMachines]);

  // Flash effect when machines change status - SPECIFICATION COMPLIANT
  useEffect(() => {
    const alertStatuses = ['yellow', 'red', 'black', 'grey'];
    const newlyChangedToAlert = arrangedMachines.filter(machine => 
      alertStatuses.includes(machine.status) && recentlyChangedMachines.has(machine.id)
    );
    const newlyReturnedToOnline = arrangedMachines.filter(machine => 
      machine.status === 'green' && recentlyChangedMachines.has(machine.id)
    );

    // Only trigger flash if there are changes - prioritize green for recoveries
    const now = Date.now();
    const timeSinceLastFlash = now - lastFlashTime;
    
    if (newlyReturnedToOnline.length > 0 && timeSinceLastFlash > 3000) {
      console.log(`GREEN FLASH TRIGGERED: ${newlyReturnedToOnline.length} machines returned to online status!`);
      // Trigger green flash effect for machines returning to online
      setFlashColor('green');
      setAlertFlash(true);
      setLastFlashTime(now);
      setTimeout(() => setAlertFlash(false), 2000);
    } else if (newlyChangedToAlert.length > 0 && timeSinceLastFlash > 3000) {
      console.log(`RED FLASH TRIGGERED: ${newlyChangedToAlert.length} machines just changed to alert status!`);
      // Trigger red flash effect for newly changed machines
      setFlashColor('red');
      setAlertFlash(true);
      setLastFlashTime(now);
      setTimeout(() => setAlertFlash(false), 2000);
    }
  }, [recentlyChangedMachines, arrangedMachines]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = machines.length;
    const statusCounts = machines.reduce((acc, machine) => {
      // Map legacy status values to specification-compliant ones
      const statusMap = {
        'online': 'green',
        'warning': 'yellow',
        'offline': 'black', 
        'error': 'red'
      };
      const status = statusMap[machine.status] || machine.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const onlineCount = statusCounts.green || 0;
    const uptime = total > 0 ? Math.round((onlineCount / total) * 100) : 0;
    
    const avgTemp = machines.length > 0 
      ? Math.round(machines.reduce((sum, m) => sum + (m.data?.temperature || 0), 0) / machines.length)
      : 0;
    
    const avgPressure = machines.length > 0 
      ? Math.round(machines.reduce((sum, m) => sum + (m.data?.pressure || 0), 0) / machines.length * 10) / 10
      : 0;
    
    const avgSpeed = machines.length > 0 
      ? Math.round(machines.reduce((sum, m) => sum + (m.data?.speed || 0), 0) / machines.length)
      : 0;
    
    const avgDiskVolume = machines.length > 0 
      ? Math.round(machines.reduce((sum, m) => sum + (m.data?.disk_volume || 0), 0) / machines.length * 10) / 10
      : 0;
    
    return {
      total,
      uptime,
      avgTemp,
      avgPressure,
      avgSpeed,
      avgDiskVolume
    };
  }, [machines]);

  // Get unique systems and countries for filters
  const uniqueSystems = useMemo(() => {
    return [...new Set(machines.map(m => m.system_type))].filter(Boolean);
  }, [machines]);
  
  const uniqueCountries = useMemo(() => {
    return [...new Set(machines.map(m => m.location))].filter(Boolean);
  }, [machines]);

  // Status counts for display
  const statusCounts = useMemo(() => {
    return machines.reduce((acc, machine) => {
      // Map legacy status values to specification-compliant ones
      const statusMap = {
        'online': 'green',
        'warning': 'yellow',
        'offline': 'black',
        'error': 'red'
      };
      const status = statusMap[machine.status] || machine.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [machines]);

  // If a different style is selected, render that component
  if (CurrentStyleComponent && currentStyle !== 'dark') {
    return <CurrentStyleComponent />;
  }

  return (
    <div className="app-container dark-theme">
      <div className={`alert-flash ${alertFlash ? 'flashing' : ''} ${flashColor}`} />
      <div className="map-wrapper">
        {/* Style Switcher */}
        <div className="style-switcher">
          <div className="style-switcher-header" onClick={() => setStyleSwitcherOpen(!styleSwitcherOpen)}>
            <span className="style-label">Style:</span>
            <span className={`style-toggle-icon ${styleSwitcherOpen ? 'open' : ''}`}>▼</span>
          </div>
          <div className={`style-switcher-content ${styleSwitcherOpen ? '' : 'closed'}`}>
            {styles.map(style => (
              <button
                key={style.id}
                className={`style-button ${currentStyle === style.id ? 'active' : ''}`}
                onClick={() => setCurrentStyle(style.id)}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="analytics-panel">
          <div className="panel-header" onClick={() => setAnalyticsOpen(!analyticsOpen)}>
            <span>📊 Analytics & Filters</span>
            <span className={`toggle-icon ${analyticsOpen ? 'open' : ''}`}>▼</span>
          </div>
          <div className={`panel-content ${analyticsOpen ? '' : 'closed'}`}>
            <div className="filter-section">
              <label className="filter-label">Status Filter</label>
              <select 
                className="filter-select"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="grey">Not Connected</option>
                <option value="black">Not Accessible</option>
                <option value="green">Active (No Alarms)</option>
                <option value="yellow">Active (Warnings)</option>
                <option value="red">Active (Errors)</option>
              </select>
            </div>
            
            <div className="filter-section">
              <label className="filter-label">System Type</label>
              <select 
                className="filter-select"
                value={systemFilter} 
                onChange={(e) => setSystemFilter(e.target.value)}
              >
                <option value="all">All Systems</option>
                {uniqueSystems.map(system => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-section">
              <label className="filter-label">Country</label>
              <select 
                className="filter-select"
                value={countryFilter} 
                onChange={(e) => setCountryFilter(e.target.value)}
              >
                <option value="all">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
              <div className="metric-card">
                <div className="metric-label">Total Machines</div>
                <div className="metric-value">{analytics.total}</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">System Uptime</div>
                <div className="metric-value">{analytics.uptime}%</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Avg Temperature</div>
                <div className="metric-value">{analytics.avgTemp}°C</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Avg Pressure</div>
                <div className="metric-value">{analytics.avgPressure} bar</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Avg Speed</div>
                <div className="metric-value">{analytics.avgSpeed} rpm</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Avg Disk Space</div>
                <div className="metric-value">{analytics.avgDiskVolume}%</div>
              </div>
            </div>
          </div>
        </div>

        <MapContainer
          center={[0, 0]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          <AutoFitBounds machines={arrangedMachines} />
          
          {arrangedMachines.map(machine => (
            <Marker
              key={machine.id}
              position={[machine.latitude, machine.longitude]}
              icon={createCustomIcon(machine.status, machine.system_type, machine.id, recentlyChangedMachines.has(machine.id))}
            >
              <Popup>
                <div className="machine-popup">
                  <h3 className="machine-name">{machine.name}</h3>
                  
                  {/* Basic System Information */}
                  <div className="machine-details">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{machine.status.toUpperCase()}</span>
                  </div>
                  <div className="machine-details">
                    <span className="detail-label">System Type:</span>
                    <span className="detail-value">{machine.system_type || 'Unknown'}</span>
                  </div>
                  <div className="machine-details">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{machine.location}</span>
                  </div>
                  <div className="machine-details">
                    <span className="detail-label">Last Seen:</span>
                    <span className="detail-value">{new Date(machine.last_seen).toLocaleString()}</span>
                  </div>
                  
                  {/* Specification Required Data */}
                  <div className="system-info-section">
                    <h4 className="system-info-title">System Information</h4>
                    
                    <div className="machine-details">
                      <span className="detail-label">API Version:</span>
                      <span className="detail-value">{machine.data?.api_version || 'N/A'}</span>
                    </div>
                    <div className="machine-details">
                      <span className="detail-label">Windows Version:</span>
                      <span className="detail-value">{machine.data?.windows_version || 'N/A'}</span>
                    </div>
                    <div className="machine-details">
                      <span className="detail-label">Uptime:</span>
                      <span className="detail-value">{machine.data?.uptime_days || 0} days</span>
                    </div>
                    <div className="machine-details">
                      <span className="detail-label">Computer Name:</span>
                      <span className="detail-value">{machine.data?.computer_name || 'N/A'}</span>
                    </div>
                    <div className="machine-details">
                      <span className="detail-label">Actual Time:</span>
                      <span className="detail-value">{machine.data?.actual_time ? new Date(machine.data.actual_time).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="machine-details">
                      <span className="detail-label">Time Zone:</span>
                      <span className="detail-value">{machine.data?.timezone || 'N/A'}</span>
                    </div>
                    <div className="machine-details">
                      <span className="detail-label">Daylight Saving:</span>
                      <span className="detail-value">{machine.data?.timezone_supports_daylight_saving ? 'Yes' : 'No'}</span>
                    </div>
                    
                    {/* Disk Information */}
                    {machine.data?.disk_usage && machine.data.disk_usage.length > 0 && (
                      <div className="disk-info">
                        <strong>Disk Information:</strong>
                        {machine.data.disk_usage.map((disk, index) => (
                          <div key={index} className="disk-item">
                            <span>{disk.mountPoint} ({disk.label})</span>
                            <span>{disk.usedPercentage}% used</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Sensor Data */}
                    {machine.data && (
                      <div className="data-grid">
                        <div className="data-item">Temperature: {machine.data.temperature}°C</div>
                        <div className="data-item">Pressure: {machine.data.pressure} bar</div>
                        <div className="data-item">Speed: {machine.data.speed} rpm</div>
                        <div className="data-item">Disk Usage: {machine.data.disk_volume}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="status-panel">
          <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Machine Status</h4>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
            Connection: {connectionStatus}
          </div>
          
           <div className="status-item">
             <div className="status-indicator grey"></div>
             Not Connected: {statusCounts.grey || 0}
           </div>
           <div className="status-item">
             <div className="status-indicator black"></div>
             Not Accessible: {statusCounts.black || 0}
           </div>
           <div className="status-item">
             <div className="status-indicator green"></div>
             Active (No Alarms): {statusCounts.green || 0}
           </div>
           <div className="status-item">
             <div className="status-indicator yellow"></div>
             Active (Warnings): {statusCounts.yellow || 0}
           </div>
           <div className="status-item">
             <div className="status-indicator red"></div>
             Active (Errors): {statusCounts.red || 0}
           </div>
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '0.9rem' }}>System Types:</h5>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                border: '2px solid white',
                marginRight: '0.5rem'
              }}></div>
              <span style={{ fontSize: '0.8rem' }}>Mini-System 4000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppDark;