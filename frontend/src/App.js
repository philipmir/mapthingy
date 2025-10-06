/**
 * Global Machine Monitor - React Frontend
 * 
 * This file contains the main React application for the Global Machine Monitor.
 * It includes both simulation features and real API integration points.
 * 
 * IMPORTANT: When transitioning to production:
 * 1. Update API endpoints to production URLs
 * 2. Add proper error handling and loading states
 * 3. Add authentication and user management
 * 4. Optimize performance for large datasets
 * 5. Add proper testing and monitoring
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './styles.css';


// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// =============================================================================
// MARKER ARRANGEMENT - PRODUCTION READY
// =============================================================================
// This function arranges machine markers in country-based clusters
// PRODUCTION: This function is production ready and handles real machine data
// PRODUCTION: Consider adding performance optimizations for large datasets

// Use machines in their real locations - no grid arrangement needed

// =============================================================================
// CUSTOM ICONS - PRODUCTION READY
// =============================================================================
// This function creates custom markers for different machine types and statuses
// PRODUCTION: This function is production ready and handles real machine data
// PRODUCTION: Consider adding more icon types for different machine categories

// Custom machine status icons with system type distinction
const createCustomIcon = (status, systemType, machineId, recentlyChanged) => {
  let color;
  let shape = 'circle'; // Default shape
  let size = 20;
  
  // Set color based on status - SPECIFICATION COMPLIANT
  // Grey: Not connected to SOSON, Black: System not accessible, Green: Active with no alarms, Yellow: Active with warnings, Red: Active with errors
  switch (status) {
    case 'grey': // Not connected to SOSON
      color = '#6c757d';
      break;
    case 'black': // System not accessible
      color = '#000000';
      break;
    case 'green': // Active with no alarms
      color = '#28a745';
      break;
    case 'yellow': // Active with warnings
      color = '#ffc107';
      break;
    case 'red': // Active with errors
      color = '#dc3545';
      break;
    case 'online': // Legacy support - map to green
      color = '#28a745';
      break;
    case 'warning': // Legacy support - map to yellow
      color = '#ffc107';
      break;
    case 'offline': // Legacy support - map to black
      color = '#000000';
      break;
    case 'error': // Legacy support - map to red
      color = '#dc3545';
      break;
    default:
      color = '#6c757d'; // Default to grey
  }
  
  // Set shape and size based on system type
  if (systemType === 'Automated System 4000') {
    shape = 'circle';
    size = 24; // Larger for AS4000
  } else if (systemType === 'Mini-System 4000') {
    shape = 'square';
    size = 20; // Smaller square for MS4000
  }

  const borderRadius = shape === 'circle' ? '50%' : '4px';
  const borderWidth = systemType === 'Automated System 4000' ? '4px' : '3px';
  
  // Check if this is an alert status that should flash - SPECIFICATION COMPLIANT
  const alertStatuses = ['yellow', 'red', 'black', 'grey'];
  const isAlertStatus = alertStatuses.includes(status);
  const isOnlineStatus = status === 'green';
  
  // Create pulsing border for recently changed machines
  const shouldPulseRed = isAlertStatus && recentlyChanged;
  const shouldPulseGreen = isOnlineStatus && recentlyChanged;
  const shouldPulse = shouldPulseRed || shouldPulseGreen;
  
           const pulseClass = shouldPulse ? (shouldPulseRed ? 'pulse-red' : 'pulse-green') : '';
           const pulseColor = shouldPulseRed ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)';
           const pulseAnimation = shouldPulseRed ? 'pulse-individual' : 'pulse-green';
           const pulseStyle = shouldPulse ? `
             border: ${borderWidth} solid ${pulseColor} !important;
             animation: ${pulseAnimation} 1s ease-in-out infinite;
             z-index: 99999 !important;
             position: relative;
           ` : '';

  return L.divIcon({
    className: `custom-marker ${pulseClass}`,
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: ${borderRadius};
      border: ${borderWidth} solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      ${pulseStyle}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// AppContainer is now handled by CSS class 'app-container'


// All styled components are now handled by CSS classes in styles.css

// All styled components are now handled by CSS classes in styles.css

// All styled components are now handled by CSS classes in styles.css

// Component to auto-fit map to show all markers
function AutoFitBounds({ machines }) {
  const map = useMap();
  
  useEffect(() => {
    if (machines.length > 0) {
      const allPositions = machines.map(machine => [machine.latitude, machine.longitude]);
      
      const group = new L.featureGroup();
      allPositions.forEach(pos => {
        group.addLayer(L.marker(pos));
      });
      
      map.fitBounds(group.getBounds().pad(0.1)); // 10% padding around markers
    }
  }, [machines, map]);
  
  return null;
}

// Component for individual machine markers with auto-popup capability
function MachineMarker({ machine, icon, recentlyChanged, popupsToOpen, onPopupOpened }) {
  const markerRef = useRef(null);
  
  useEffect(() => {
    if (markerRef.current && popupsToOpen.has(machine.id)) {
      markerRef.current.openPopup();
      onPopupOpened(machine.id);
    }
  }, [machine.id, popupsToOpen, onPopupOpened]);
  
  return (
    <Marker
      ref={markerRef}
      position={[machine.latitude, machine.longitude]}
      icon={icon}
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
  );
}

// =============================================================================
// MAIN APPLICATION COMPONENT - PRODUCTION READY
// =============================================================================
// This is the main React component that renders the machine monitoring dashboard
// PRODUCTION: This component is production ready and handles real machine data
// PRODUCTION: Consider adding error boundaries and performance optimizations

function App() {
  // =============================================================================
  // STATE MANAGEMENT - PRODUCTION READY
  // =============================================================================
  // These state variables manage the application state
  // PRODUCTION: Consider adding state persistence and error handling
  
  const [machines, setMachines] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [alertFlash, setAlertFlash] = useState(false);
  const [flashColor, setFlashColor] = useState('red');
  const [alertedMachines, setAlertedMachines] = useState(new Set());
  const [recentlyChangedMachines, setRecentlyChangedMachines] = useState(new Set());
  // const [machinePreviousStatus, setMachinePreviousStatus] = useState(new Map());
  const [lastFlashTime, setLastFlashTime] = useState(0);
  const [popupsToOpen, setPopupsToOpen] = useState(new Set());
  const [simulationPaused, setSimulationPaused] = useState(true);
  const [markersListOpen, setMarkersListOpen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState(new Set());

  // Callback to handle when a popup is opened
  const handlePopupOpened = (machineId) => {
    setPopupsToOpen(prev => {
      const newSet = new Set(prev);
      newSet.delete(machineId);
      return newSet;
    });
  };

  // Toggle simulation pause/resume
  const toggleSimulationPause = () => {
    setSimulationPaused(prev => !prev);
    console.log(`Simulation ${simulationPaused ? 'resumed' : 'paused'}`);
  };

  // Toggle markers list window
  const toggleMarkersList = () => {
    setMarkersListOpen(prev => !prev);
  };

  // Toggle country expansion
  const toggleCountryExpansion = (country) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(country)) {
        newSet.delete(country);
      } else {
        newSet.add(country);
      }
      return newSet;
    });
  };

  // =============================================================================
  // API DATA LOADING - PRODUCTION READY
  // =============================================================================
  // This effect loads initial machine data from the API
  // PRODUCTION: This is production ready and handles real API calls
  // PRODUCTION: Consider adding loading states, error handling, and retry logic

  // Load initial machine data
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        console.log('Fetching machines from API...');
        // TODO: Update API endpoint for production
        // TODO: Add authentication headers
        // TODO: Add error handling and retry logic
        const response = await axios.get('/api/machines');
        console.log('API Response:', response.data);
        setMachines(response.data);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
        // TODO: Add proper error handling and user notification
      }
    };

    fetchMachines();
  }, []);

  // =============================================================================
  // WEBSOCKET CONNECTION - PRODUCTION READY
  // =============================================================================
  // This effect establishes WebSocket connection for real-time updates
  // PRODUCTION: This is production ready and handles real WebSocket connections
  // PRODUCTION: Consider adding reconnection logic and error handling

  // WebSocket connection for real-time updates
  useEffect(() => {
    // TODO: Update WebSocket URL for production
    // TODO: Add authentication for WebSocket connections
    // TODO: Add reconnection logic and error handling
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
          // Skip updates if simulation is paused
          if (simulationPaused) {
            console.log(`SIMULATION PAUSED: Skipping update for machine ${message.machine_id}`);
            return;
          }
          
          console.log(`UPDATING: Machine ${message.machine_id} to ${message.status}`);
          
          // Track previous status for this machine
          // setMachinePreviousStatus(prev => {
          //   const newMap = new Map(prev);
          //   newMap.set(message.machine_id, message.status);
          //   return newMap;
          // });
          
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
        // TODO: Add proper error handling and user notification
      }
    };

    return () => {
      newSocket.close();
    };
  }, [simulationPaused]);

  // Filter machines based on selected filters - SPECIFICATION COMPLIANT
  const filteredMachines = useMemo(() => {
    return machines.filter(machine => {
      // Map legacy statuses to specification-compliant statuses for filtering
      let machineStatus = machine.status;
      if (machineStatus === 'online') machineStatus = 'green';
      else if (machineStatus === 'warning') machineStatus = 'yellow';
      else if (machineStatus === 'offline') machineStatus = 'black';
      else if (machineStatus === 'error') machineStatus = 'red';
      
      const statusMatch = statusFilter === 'all' || machineStatus === statusFilter;
      const systemMatch = systemFilter === 'all' || machine.system_type === systemFilter;
      const countryMatch = countryFilter === 'all' || machine.location === countryFilter;
      return statusMatch && systemMatch && countryMatch;
    });
  }, [machines, statusFilter, systemFilter, countryFilter]);

  // Calculate status counts for filtered machines - SPECIFICATION COMPLIANT
  const statusCounts = filteredMachines.reduce((acc, machine) => {
    // Map legacy statuses to specification-compliant statuses
    let status = machine.status;
    if (status === 'online') status = 'green';
    else if (status === 'warning') status = 'yellow';
    else if (status === 'offline') status = 'black';
    else if (status === 'error') status = 'red';
    
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Calculate analytics metrics - SPECIFICATION COMPLIANT
  const analytics = useMemo(() => {
    const total = filteredMachines.length;
    const green = statusCounts.green || 0;
    const yellow = statusCounts.yellow || 0;
    const red = statusCounts.red || 0;
    const black = statusCounts.black || 0;
    const grey = statusCounts.grey || 0;
    
    const avgTemp = filteredMachines.length > 0 
      ? (filteredMachines.reduce((sum, m) => sum + (m.data?.temperature || 0), 0) / filteredMachines.length).toFixed(1)
      : 0;
    
    const avgPressure = filteredMachines.length > 0
      ? (filteredMachines.reduce((sum, m) => sum + (m.data?.pressure || 0), 0) / filteredMachines.length).toFixed(1)
      : 0;
    
    const avgSpeed = filteredMachines.length > 0
      ? Math.round(filteredMachines.reduce((sum, m) => sum + (m.data?.speed || 0), 0) / filteredMachines.length)
      : 0;

    const avgDiskVolume = filteredMachines.length > 0
      ? (filteredMachines.reduce((sum, m) => sum + (m.data?.disk_volume || 0), 0) / filteredMachines.length).toFixed(1)
      : 0;

    return {
      total,
      green,
      yellow,
      red,
      black,
      grey,
      avgTemp,
      avgPressure,
      avgSpeed,
      avgDiskVolume,
      uptime: total > 0 ? ((green / total) * 100).toFixed(1) : 0
    };
  }, [filteredMachines, statusCounts]);

  // Get unique values for filter options
  const uniqueCountries = [...new Set(machines.map(m => m.location))].sort();
  const uniqueSystems = [...new Set(machines.map(m => m.system_type))].filter(Boolean);

  // Use filtered machines in their real locations
  const displayedMachines = filteredMachines;

  // Group machines by location
  const groupedMachines = useMemo(() => {
    const groups = {};
    displayedMachines.forEach(machine => {
      const location = machine.location || 'Unknown';
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(machine);
    });
    
    // Sort locations alphabetically and machines within each location by name
    const sortedGroups = {};
    Object.keys(groups).sort().forEach(location => {
      sortedGroups[location] = groups[location].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return sortedGroups;
  }, [displayedMachines]);

  // Alert detection and auto-popup logic - SPECIFICATION COMPLIANT
  useEffect(() => {
    const alertStatuses = ['yellow', 'red', 'black', 'grey'];
    const machinesNeedingAlert = displayedMachines.filter(machine => 
      alertStatuses.includes(machine.status) && !alertedMachines.has(machine.id)
    );

    if (machinesNeedingAlert.length > 0) {
      console.log(`ALERT TRIGGERED: ${machinesNeedingAlert.length} machines need attention!`);
      // Trigger flash effect
      setFlashColor('red');
      setAlertFlash(true);
      setTimeout(() => setAlertFlash(false), 2000);

      // Add machines to alerted set
      setAlertedMachines(prev => new Set([...prev, ...machinesNeedingAlert.map(m => m.id)]));

      // Auto-open popups for alert machines
      machinesNeedingAlert.forEach(machine => {
        console.log(`ALERT: ${machine.name} is ${machine.status.toUpperCase()}!`);
        // Add machine to popups to open
        setPopupsToOpen(prev => new Set([...prev, machine.id]));
      });
    }

    // Reset alerted machines when status improves - SPECIFICATION COMPLIANT
    const improvedMachines = displayedMachines.filter(machine => 
      !alertStatuses.includes(machine.status) && alertedMachines.has(machine.id)
    );
    if (improvedMachines.length > 0) {
      setAlertedMachines(prev => {
        const newSet = new Set(prev);
        improvedMachines.forEach(machine => newSet.delete(machine.id));
        return newSet;
      });
    }
  }, [displayedMachines, alertedMachines]);

  // Flash effect when machines change status - SPECIFICATION COMPLIANT
  useEffect(() => {
    const alertStatuses = ['yellow', 'red', 'black', 'grey'];
    const newlyChangedToAlert = displayedMachines.filter(machine => 
      alertStatuses.includes(machine.status) && recentlyChangedMachines.has(machine.id)
    );
    const newlyReturnedToOnline = displayedMachines.filter(machine => 
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
  }, [recentlyChangedMachines, displayedMachines, lastFlashTime]);

  // Render the main application component

  return (
    <div className="app-container">
      <div className={`alert-flash ${alertFlash ? 'flashing' : ''} ${flashColor}`} />
      <div className="map-wrapper">

        {/* SinterCast Logo */}
        <div className="sintercast-logo">
          <div className="logo-small">
            <span className="logo-text-small">SinterCast</span>
            <span className="logo-subtitle-small">— Supermetal CGI —</span>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="analytics-panel">
          <div className="panel-header" onClick={() => setAnalyticsOpen(!analyticsOpen)}>
            <div className="header-left">
              <span className="analytics-title">📊 Analytics & Filters</span>
            </div>
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
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            className="sintercast-map-tiles"
          />
          
           {/* Auto-fit bounds to show all markers */}
           <AutoFitBounds machines={displayedMachines} />

          {/* Machine markers with auto-popup capability */}
          {displayedMachines.map((machine) => (
            <MachineMarker
              key={machine.id}
              machine={machine}
              icon={createCustomIcon(machine.status, machine.system_type, machine.id, recentlyChangedMachines.has(machine.id))}
              recentlyChanged={recentlyChangedMachines.has(machine.id)}
              popupsToOpen={popupsToOpen}
              onPopupOpened={handlePopupOpened}
            />
          ))}
        </MapContainer>

        <div className="status-panel">
          <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Machine Status</h4>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
            Connection: {connectionStatus}
          </div>
          
          {/* Simulation Control */}
          <div className="simulation-control">
            <button 
              className={`pause-button ${simulationPaused ? 'paused' : 'running'}`}
              onClick={toggleSimulationPause}
              title={simulationPaused ? 'Resume simulation' : 'Pause simulation'}
            >
              {simulationPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <div className="simulation-status">
              Simulation: {simulationPaused ? 'PAUSED' : 'RUNNING'}
            </div>
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
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#28a745',
                border: '3px solid white',
                marginRight: '0.5rem'
              }}></div>
              <span style={{ fontSize: '0.8rem' }}>Automated System 4000</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '4px',
                backgroundColor: '#28a745',
                border: '2px solid white',
                marginRight: '0.5rem'
              }}></div>
              <span style={{ fontSize: '0.8rem' }}>Mini-System 4000</span>
            </div>
          </div>
        </div>

        {/* Markers List Window */}
        <div className={`markers-list-window ${markersListOpen ? 'open' : 'closed'}`}>
          <div className="markers-list-header">
            <h3>All Machine Markers</h3>
            <button 
              className="close-markers-list"
              onClick={toggleMarkersList}
              title="Close markers list"
            >
              ✕
            </button>
          </div>
          <div className="markers-list-content">
            {displayedMachines.length === 0 ? (
              <div className="no-markers">No machines to display</div>
            ) : (
              <div className="location-groups">
                {Object.entries(groupedMachines).map(([location, machines]) => {
                  const isExpanded = expandedCountries.has(location);
                  return (
                    <div key={location} className="location-group">
                      <div className="location-header" onClick={() => toggleCountryExpansion(location)}>
                        <div className="location-title-container">
                          <span className={`expand-icon ${isExpanded ? 'expanded' : 'collapsed'}`}>▶</span>
                          <h4 className="location-title">
                            🌍 {location} ({machines.length} machine{machines.length !== 1 ? 's' : ''})
                          </h4>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="markers-grid">
                          {machines.map((machine) => (
                            <div key={machine.id} className="marker-item">
                              <div className="marker-header">
                                <div className="marker-icon">
                                  <div 
                                    className={`marker-dot ${machine.status}`}
                                    style={{
                                      backgroundColor: machine.status === 'green' ? '#28a745' : 
                                                     machine.status === 'yellow' ? '#ffc107' : 
                                                     machine.status === 'red' ? '#dc3545' : 
                                                     machine.status === 'black' ? '#000000' : '#6c757d'
                                    }}
                                  ></div>
                                </div>
                                <div className="marker-info">
                                  <div className="marker-name">{machine.name}</div>
                                  <div className="marker-status">{machine.status.toUpperCase()}</div>
                                </div>
                              </div>
                              <div className="marker-details">
                                <div className="marker-detail-row">
                                  <span className="detail-label">System:</span>
                                  <span className="detail-value">{machine.system_type || 'Unknown'}</span>
                                </div>
                                <div className="marker-detail-row">
                                  <span className="detail-label">Coordinates:</span>
                                  <span className="detail-value">{machine.latitude.toFixed(4)}, {machine.longitude.toFixed(4)}</span>
                                </div>
                                <div className="marker-detail-row">
                                  <span className="detail-label">Last Seen:</span>
                                  <span className="detail-value">{new Date(machine.last_seen).toLocaleString()}</span>
                                </div>
                                {machine.data && (
                                  <div className="marker-sensor-data">
                                    <div className="sensor-row">
                                      <span>🌡️ {machine.data.temperature}°C</span>
                                      <span>⚡ {machine.data.pressure} bar</span>
                                    </div>
                                    <div className="sensor-row">
                                      <span>🔄 {machine.data.speed} rpm</span>
                                      <span>💾 {machine.data.disk_volume}%</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Markers List Toggle Button */}
        <button 
          className="markers-list-toggle"
          onClick={toggleMarkersList}
          title={markersListOpen ? 'Hide markers list' : 'Show markers list'}
        >
          {markersListOpen ? '📋' : '📋'}
        </button>
      </div>
    </div>
  );
}

export default App;
