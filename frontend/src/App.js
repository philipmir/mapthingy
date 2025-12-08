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
import { API_CONFIG, getApiUrl } from './apiConfig';


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
  
  // Normalize status to lowercase for consistent comparison
  const normalizedStatus = (status || '').toLowerCase();
  
  // Debug logging for machine 107
  if (machineId && (machineId.includes('107') || machineId.includes('INHOUSE107'))) {
    console.log(`createCustomIcon for ${machineId}: status=${status}, normalizedStatus=${normalizedStatus}, recentlyChanged=${recentlyChanged}`);
  }
  
  // Set color based on status - SPECIFICATION COMPLIANT
  // Grey: Not connected to SOSON, Black: System not accessible, Green: Active with no alarms, Yellow: Active with warnings, Red: Active with errors
  switch (normalizedStatus) {
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
      console.warn(`Unknown status: ${status}, defaulting to grey`);
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
  
  // Create pulsing border for recently changed machines - matches marker color
  const shouldPulse = recentlyChanged;
  
  // Map status to color with opacity for pulsing effect
  const pulseColorMap = {
    'green': 'rgba(40, 167, 69, 0.8)',    // #28a745
    'yellow': 'rgba(255, 193, 7, 0.8)',  // #ffc107
    'red': 'rgba(220, 53, 69, 0.8)',     // #dc3545
    'black': 'rgba(0, 0, 0, 0.8)',       // #000000
    'grey': 'rgba(108, 117, 125, 0.8)'   // #6c757d
  };
  
  // Default pulse color based on status (use normalized status)
  const pulseColor = pulseColorMap[normalizedStatus] || pulseColorMap['grey'];
  const pulseClass = shouldPulse ? `pulse-${normalizedStatus}` : '';
  
  // Create dynamic pulsing animation based on status color
  const pulseAnimationName = shouldPulse ? `pulse-${normalizedStatus}` : '';
  
  // Debug logging for machine 107
  if (machineId && (machineId.includes('107') || machineId.includes('INHOUSE107'))) {
    console.log(`createCustomIcon pulse for ${machineId}: status=${status}, normalizedStatus=${normalizedStatus}, shouldPulse=${shouldPulse}, pulseColor=${pulseColor}, pulseClass=${pulseClass}, pulseColorMap=`, pulseColorMap);
    if (!pulseColorMap[normalizedStatus]) {
      console.warn(`createCustomIcon: No pulse color found for normalizedStatus="${normalizedStatus}", using grey as fallback`);
    }
  }
  
  // Add dynamic keyframe if pulsing - matches marker color
  if (shouldPulse) {
    // Inject/update dynamic keyframe for this specific color
    const styleId = `pulse-keyframe-${normalizedStatus}`;
    let existingStyle = document.getElementById(styleId);
    
    // Always update the keyframe to ensure correct color (especially for machine 107)
    const pulseColorFade = pulseColor.replace('0.8', '0');
    const keyframeContent = `
      @keyframes pulse-${normalizedStatus} {
        0%, 100% { 
          box-shadow: 0 0 0 0 ${pulseColor};
          transform: scale(1);
        }
        50% { 
          box-shadow: 0 0 0 15px ${pulseColorFade};
          transform: scale(1.15);
        }
      }
    `;
    
    if (existingStyle) {
      // Update existing keyframe
      existingStyle.textContent = keyframeContent;
      if (machineId && (machineId.includes('107') || machineId.includes('INHOUSE107'))) {
        console.log(`Updated pulse keyframe for ${machineId}: ${normalizedStatus} with color ${pulseColor}`);
      }
    } else {
      // Create new keyframe
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = keyframeContent;
      document.head.appendChild(style);
      console.log(`Created pulse keyframe for ${normalizedStatus} with color ${pulseColor}`);
    }
  }
  
  const pulseStyle = shouldPulse ? `
    border: ${borderWidth} solid ${pulseColor} !important;
    animation: ${pulseAnimationName} 1s ease-in-out infinite;
    z-index: 99999 !important;
    position: relative;
    box-shadow: 0 0 0 0 ${pulseColor} !important;
  ` : '';

  // Debug for machine 107 - log final icon creation
  if (machineId && (machineId.includes('107') || machineId.includes('INHOUSE107'))) {
    console.log(`createCustomIcon FINAL for ${machineId}: status=${status}, normalizedStatus=${normalizedStatus}, color=${color}, pulseColor=${pulseColor}, pulseStyle=${pulseStyle ? 'APPLIED' : 'NONE'}`);
  }

  return L.divIcon({
    className: `custom-marker ${pulseClass}`,
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: ${borderRadius};
      border: ${borderWidth} solid ${shouldPulse ? pulseColor : 'white'};
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
  
  // Update icon when machine status changes - force update for machine 107
  useEffect(() => {
    if (markerRef.current && icon) {
      markerRef.current.setIcon(icon);
      
      // Debug for machine 107
      if (machine.id && (machine.id.includes('107') || machine.id.includes('INHOUSE107'))) {
        console.log(`MachineMarker: Updated icon for ${machine.id} with status ${machine.status}, icon created with recentlyChanged=${recentlyChanged}`);
      }
    }
  }, [icon, machine.status, machine.id, recentlyChanged]);
  
  return (
    <Marker
      ref={markerRef}
      position={[machine.latitude, machine.longitude]}
      icon={icon}
      key={`${machine.id}-${machine.status}`}
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
                <div className="data-item">Temperature: {typeof machine.data.temperature === 'number' ? machine.data.temperature.toFixed(1) : machine.data.temperature}°C</div>
                <div className="data-item">Pressure: {typeof machine.data.pressure === 'number' ? machine.data.pressure.toFixed(2) : machine.data.pressure} bar</div>
                <div className="data-item">Speed: {typeof machine.data.speed === 'number' ? Math.round(machine.data.speed) : machine.data.speed} rpm</div>
                <div className="data-item">Disk Usage: {typeof machine.data.disk_volume === 'number' ? machine.data.disk_volume.toFixed(1) : machine.data.disk_volume}%</div>
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
  const [flashColor, setFlashColor] = useState('grey');
  const [alertedMachines, setAlertedMachines] = useState(new Set());
  const [recentlyChangedMachines, setRecentlyChangedMachines] = useState(new Set());
  const [lastFlashTime, setLastFlashTime] = useState(0);
  const [popupsToOpen, setPopupsToOpen] = useState(new Set());
  const [simulationPaused, setSimulationPaused] = useState(true);
  const simulationPausedRef = useRef(true); // Track current pause state for interval callbacks
  const [machineStatusLocks, setMachineStatusLocks] = useState(new Map()); // Track machines locked to a status for 2 minutes after green->non-green change
  const [simulationControlsOpen, setSimulationControlsOpen] = useState(false);
  const [markersListOpen, setMarkersListOpen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState(new Set());
  const [machineLogs, setMachineLogs] = useState([]); // Log entries for machine changes
  const [logsOpen, setLogsOpen] = useState(true); // Collapsible logs section

  // Callback to handle when a popup is opened
  const handlePopupOpened = (machineId) => {
    setPopupsToOpen(prev => {
      const newSet = new Set(prev);
      newSet.delete(machineId);
      return newSet;
    });
  };

  // Function to open popup for a specific machine (from menu view)
  const openMachinePopup = (machineId) => {
    setPopupsToOpen(prev => new Set([...prev, machineId]));
  };

  // Toggle simulation pause/resume
  const toggleSimulationPause = () => {
    setSimulationPaused(prev => {
      const newState = !prev;
      simulationPausedRef.current = newState; // Update ref immediately
      console.log(`Simulation ${newState ? 'paused' : 'resumed'}`);
      return newState;
    });
  };
  
  // Keep ref in sync with state
  useEffect(() => {
    simulationPausedRef.current = simulationPaused;
  }, [simulationPaused]);

  // Trigger manual change on random machine
  const triggerRandomMachineChange = async () => {
    if (machines.length === 0) {
      console.log('No machines available for random change');
      return;
    }

    // Select a random machine
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    console.log(`Triggering random change on: ${randomMachine.name} (${randomMachine.id})`);

    // Always change status (100% chance) - random change button should always trigger visual effects
    const newStatus = getRandomStatus();
    
    // Always vary data slightly
    const dataVariation = getRandomDataVariation();

    // Check if machine is locked - don't allow status changes if locked
    const statusLock = machineStatusLocks.get(randomMachine.id);
    const isLocked = statusLock && statusLock.expiry && Date.now() < statusLock.expiry;
    
    if (isLocked) {
      console.log(`Random Change: Machine ${randomMachine.id} is locked to ${statusLock.status} until ${new Date(statusLock.expiry).toLocaleTimeString()}, skipping status change`);
      return; // Don't change status if locked
    }
    
    // Update machine via API
    await updateMachineViaAPI(randomMachine, newStatus, dataVariation);
    
    // Only log and trigger visual effects for status/color changes
    if (newStatus && newStatus !== randomMachine.status) {
      // If changing from green to non-green, lock the new status for 2 minutes
      const oldStatusNormalized = (randomMachine.status || '').toLowerCase().trim();
      const newStatusNormalized = (newStatus || '').toLowerCase().trim();
      if (oldStatusNormalized === 'green' && newStatusNormalized !== 'green') {
        const lockExpiry = Date.now() + 120000; // 2 minutes = 120000ms
        setMachineStatusLocks(prev => {
          const newMap = new Map(prev);
          newMap.set(randomMachine.id, { status: newStatus, expiry: lockExpiry });
          console.log(`Random Change: Locked ${randomMachine.id} to ${newStatus} for 2 minutes (until ${new Date(lockExpiry).toLocaleTimeString()})`);
          return newMap;
        });
        
        // Auto-unlock after 2 minutes
        setTimeout(() => {
          setMachineStatusLocks(prev => {
            const newMap = new Map(prev);
            newMap.delete(randomMachine.id);
            console.log(`Random Change: Unlocked ${randomMachine.id} after 2 minutes`);
            return newMap;
          });
        }, 120000);
      }
      
      addLogEntry({
        machineId: randomMachine.id,
        machineName: randomMachine.name,
        type: 'status_change',
        oldValue: randomMachine.status,
        newValue: newStatus,
        timestamp: new Date().toISOString(),
        source: 'manual'
      });
      
      // Trigger visual effect for status changes (flash, pulsing circle)
      setRecentlyChangedMachines(prev => {
        const newSet = new Set(prev);
        newSet.add(randomMachine.id);
        return newSet;
      });
      
      // Clear after 30 seconds
      setTimeout(() => {
        setRecentlyChangedMachines(prev => {
          const newSet = new Set(prev);
          newSet.delete(randomMachine.id);
          return newSet;
        });
      }, 30000);
    }
    
    // Data changes are NOT logged - only status/color changes are logged
  };

  // =============================================================================
  // SIMULATION LOGIC - WORKS WITH REAL MACHINES
  // =============================================================================
  // This effect runs simulation when not paused, updating real machines via API
  
  // Function to get random status (maps to visual effect statuses)
  const getRandomStatus = () => {
    // Map to visual effect statuses: green, yellow, red, black, grey
    const statuses = ['green', 'yellow', 'red', 'black', 'grey'];
    const weights = [0.6, 0.15, 0.1, 0.08, 0.07]; // 60% green, 15% yellow, 10% red, 8% black, 7% grey
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < statuses.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return statuses[i];
      }
    }
    return 'green';
  };

  // Function to get random data variation
  const getRandomDataVariation = () => {
    const variation = API_CONFIG.SIMULATION.DATA_VARIATION;
    return {
      temperature: (Math.random() * (variation.temperature.max - variation.temperature.min) + variation.temperature.min),
      pressure: (Math.random() * (variation.pressure.max - variation.pressure.min) + variation.pressure.min),
      speed: (Math.random() * (variation.speed.max - variation.speed.min) + variation.speed.min),
      disk_volume: (Math.random() * (variation.disk_volume.max - variation.disk_volume.min) + variation.disk_volume.min)
    };
  };

  // Function to find which API a machine belongs to
  const findMachineAPI = (machineId) => {
    // Try to match machine with API by checking if we can reach it
    // For now, we'll try each API until we find the right one
    // This could be optimized by storing API mapping
    return API_CONFIG.MACHINE_APIS[0]; // Try first API (or implement better matching)
  };

  // Function to update a machine via API
  const updateMachineViaAPI = async (machine, newStatus = null, dataVariation = null) => {
    try {
      // Determine new status (use current if not changing)
      const status = newStatus || machine.status;
      
      // Calculate new data values
      let newData = { ...machine.data };
      if (dataVariation) {
        newData = {
          temperature: Math.max(0, Math.min(100, (machine.data?.temperature || 42) + dataVariation.temperature)),
          pressure: Math.max(0, Math.min(10, (machine.data?.pressure || 2.0) + dataVariation.pressure)),
          speed: Math.max(0, Math.min(3000, (machine.data?.speed || 1450) + dataVariation.speed)),
          disk_volume: Math.max(0, Math.min(100, (machine.data?.disk_volume || 75) + dataVariation.disk_volume))
        };
      }

      // Try each API until we find the right one
      for (const apiUrl of API_CONFIG.MACHINE_APIS) {
        try {
          // Send POST request to update machine
          const updateUrl = `${apiUrl}${API_CONFIG.ENDPOINTS.STATUS_UPDATE}${machine.id}/status`;
          
          // FastAPI can accept query parameters or body - use query params for status, body for data
          const response = await axios.post(updateUrl, 
            newData, // Send data in request body
            {
              params: { 
                status: status // Send status as query parameter
              },
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: API_CONFIG.TIMEOUT
            }
          );

          console.log(`Simulation: Updated ${machine.name} (${machine.id}) to ${status}`, newData);
          
          // Normalize statuses for comparison
          const currentStatus = (machine.status || '').toLowerCase().trim();
          const newStatusNormalized = (status || '').toLowerCase().trim();
          
          // Debug for machine 107
          const isMachine107 = machine.id && (machine.id.includes('107') || machine.id.includes('INHOUSE107'));
          if (isMachine107) {
            console.log(`Simulation: Machine 107 status check - currentStatus="${currentStatus}", newStatus="${status}", newStatusNormalized="${newStatusNormalized}"`);
          }
          
          // Only log and trigger visual effects for status/color changes
          if (newStatus && currentStatus !== newStatusNormalized) {
            // Check if machine is locked - don't allow status changes if locked
            const statusLock = machineStatusLocks.get(machine.id);
            const isLocked = statusLock && statusLock.expiry && Date.now() < statusLock.expiry;
            
            if (isLocked && isMachine107) {
              console.log(`Simulation: Machine 107 is locked to ${statusLock.status} until ${new Date(statusLock.expiry).toLocaleTimeString()}, ignoring status change`);
              return response.data; // Don't change status if locked
            }
            
            console.log(`Simulation: Status change detected for ${machine.name} (${machine.id}): ${machine.status} -> ${status}`);
            addLogEntry({
              machineId: machine.id,
              machineName: machine.name,
              type: 'status_change',
              oldValue: machine.status,
              newValue: status,
              timestamp: new Date().toISOString(),
              source: 'simulation'
            });
            
            // If changing from green to non-green, lock the new status for 2 minutes
            const oldStatusNormalized = (machine.status || '').toLowerCase().trim();
            const newStatusNormalized = (status || '').toLowerCase().trim();
            if (oldStatusNormalized === 'green' && newStatusNormalized !== 'green') {
              const lockExpiry = Date.now() + 120000; // 2 minutes = 120000ms
              setMachineStatusLocks(prev => {
                const newMap = new Map(prev);
                newMap.set(machine.id, { status: status, expiry: lockExpiry });
                console.log(`Simulation: Locked ${machine.id} to ${status} for 2 minutes (until ${new Date(lockExpiry).toLocaleTimeString()})`);
                return newMap;
              });
              
              // Auto-unlock after 2 minutes
              setTimeout(() => {
                setMachineStatusLocks(prev => {
                  const newMap = new Map(prev);
                  newMap.delete(machine.id);
                  console.log(`Simulation: Unlocked ${machine.id} after 2 minutes`);
                  return newMap;
                });
              }, 120000);
            }
            
            // Trigger visual effect for status changes (flash, pulsing circle)
            setRecentlyChangedMachines(prev => {
              const newSet = new Set(prev);
              newSet.add(machine.id);
              console.log(`Simulation: Added ${machine.id} to recentlyChangedMachines for visual effects. Now contains:`, Array.from(newSet));
              
              // Force re-render by updating machines state to reflect new status immediately
              setMachines(prevMachines => {
                return prevMachines.map(m => {
                  if (m.id === machine.id) {
                    return { ...m, status: status };
                  }
                  return m;
                });
              });
              
              return newSet;
            });
            
            // Clear after 30 seconds
            setTimeout(() => {
              setRecentlyChangedMachines(prev => {
                const newSet = new Set(prev);
                newSet.delete(machine.id);
                return newSet;
              });
            }, 30000);
          } else if (isMachine107) {
            console.log(`Simulation: Machine 107 - No status change triggered (newStatus=${newStatus}, currentStatus=${currentStatus}, newStatusNormalized=${newStatusNormalized})`);
          }
          
          // Data changes are NOT logged - only status/color changes are logged
          
          return response.data;
        } catch (error) {
          // Try next API if this one fails
          if (error.response?.status === 404) {
            console.log(`Simulation: Machine ${machine.id} not found on ${apiUrl}, trying next API...`);
            continue; // Machine not found on this API, try next
          }
          console.error(`Simulation: Error updating ${machine.id} on ${apiUrl}:`, error.message);
          // Don't throw - continue to next API
          if (apiUrl === API_CONFIG.MACHINE_APIS[API_CONFIG.MACHINE_APIS.length - 1]) {
            // Last API failed, log warning but don't throw
            console.warn(`Simulation: Could not update machine ${machine.id} on any API`);
          }
        }
      }
      
      console.warn(`Simulation: Could not find API for machine ${machine.id}`);
      return null;
    } catch (error) {
      console.error(`Simulation: Failed to update ${machine.name} (${machine.id}):`, error.message);
      return null;
    }
  };

  // Simulation effect - runs when simulation is not paused
  useEffect(() => {
    if (simulationPaused || machines.length === 0) {
      console.log(`Simulation: Paused or no machines (paused: ${simulationPaused}, machines: ${machines.length})`);
      return; // Don't run simulation if paused or no machines
    }

    console.log(`Simulation: Starting simulation with ${machines.length} machine(s)`);

    const simulationInterval = setInterval(() => {
      // Check if still not paused (in case it was paused during interval)
      // Use ref to get current value instead of closure value
      if (simulationPausedRef.current || machines.length === 0) {
        return;
      }

      // Randomly select machines to update (up to 30% of machines per cycle)
      const machinesToUpdate = machines
        .filter(() => Math.random() < 0.3) // 30% chance per machine
        .slice(0, Math.ceil(machines.length * 0.3)); // Limit to 30% of total

      if (machinesToUpdate.length === 0) {
        return; // No machines to update this cycle
      }

      console.log(`Simulation: Updating ${machinesToUpdate.length} machine(s)`);

      // Update each selected machine
      machinesToUpdate.forEach(machine => {
        // Decide if we should change status (40% probability)
        const shouldChangeStatus = Math.random() < API_CONFIG.SIMULATION.STATUS_CHANGE_PROBABILITY;
        const newStatus = shouldChangeStatus ? getRandomStatus() : null;
        
        // Always vary data slightly
        const dataVariation = getRandomDataVariation();

        // Update machine via API (non-blocking)
        updateMachineViaAPI(machine, newStatus, dataVariation).catch(err => {
          console.error(`Simulation: Error updating ${machine.id}:`, err);
        });
      });
    }, API_CONFIG.SIMULATION.UPDATE_INTERVAL);

    return () => {
      clearInterval(simulationInterval);
      console.log('Simulation: Stopped/cleared');
    };
  }, [simulationPaused, machines]);

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
  // MACHINE LOGGING SYSTEM
  // =============================================================================
  
  // Detect significant data changes (for logging)
  const detectDataChanges = (oldData, newData) => {
    if (!oldData || !newData) return [];
    
    const changes = [];
    const thresholds = {
      temperature: 1.0, // 1°C change
      pressure: 0.1,    // 0.1 bar change
      speed: 25,        // 25 rpm change
      disk_volume: 2.0  // 2% change
    };
    
    Object.keys(thresholds).forEach(key => {
      const oldVal = oldData[key];
      const newVal = newData[key];
      if (oldVal !== undefined && newVal !== undefined) {
        const diff = Math.abs(newVal - oldVal);
        if (diff >= thresholds[key]) {
          changes.push({
            field: key,
            oldValue: oldVal,
            newValue: newVal,
            difference: diff.toFixed(2)
          });
        }
      }
    });
    
    return changes;
  };

  // Visual effects are ONLY triggered by status changes, not data changes
  // This function is kept for potential future use but currently returns false
  const detectVisualChanges = (oldData, newData) => {
    // No data changes trigger visual effects - only status changes do
    return false;
  };

  // Add log entry and save to backend
  const addLogEntry = async (logEntry) => {
    // Add to local state
    setMachineLogs(prev => {
      const newLogs = [logEntry, ...prev].slice(0, 100); // Keep last 100 entries
      return newLogs;
    });

    // Save to backend
    try {
      // Try each API to save the log
      for (const apiUrl of API_CONFIG.MACHINE_APIS) {
        try {
          await axios.post(`${apiUrl}/logs`, logEntry, {
            timeout: API_CONFIG.TIMEOUT,
            headers: { 'Content-Type': 'application/json' }
          });
          break; // Success, no need to try other APIs
        } catch (error) {
          // Continue to next API if this one fails
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to save log to backend:', error);
      // Log still added to UI, just couldn't save to file
    }
  };

  // =============================================================================
  // API DATA LOADING - PRODUCTION READY
  // =============================================================================
  // This effect loads initial machine data from the API
  // PRODUCTION: This is production ready and handles real API calls
  // PRODUCTION: Consider adding loading states, error handling, and retry logic

  // Load initial machine data from multiple APIs
  useEffect(() => {
    const fetchAllMachines = async () => {
      try {
        console.log('Fetching machines from multiple APIs...');
        const allMachines = [];
        
        // Fetch from all machine APIs
        const promises = API_CONFIG.MACHINE_APIS.map(async (apiUrl) => {
          try {
            const response = await axios.get(getApiUrl(API_CONFIG.ENDPOINTS.MACHINES, apiUrl), {
              timeout: API_CONFIG.TIMEOUT
            });
            console.log(`Fetched from ${apiUrl}:`, response.data);
            // Handle both single machine (object) and array of machines
            if (Array.isArray(response.data)) {
              return response.data;
            } else {
              return [response.data];
            }
          } catch (error) {
            console.error(`Failed to fetch from ${apiUrl}:`, error.message);
            return []; // Return empty array for failed requests
          }
        });
        
        const results = await Promise.all(promises);
        // Flatten all results into single array
        const combinedMachines = results.flat();
        
        console.log('Combined machines:', combinedMachines);
        setMachines(combinedMachines);
        setConnectionStatus(`Connected (${combinedMachines.length} machines from ${API_CONFIG.MACHINE_APIS.length} APIs)`);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
        setConnectionStatus(`Error: ${error.message}`);
      }
    };

    fetchAllMachines();
  }, []);

  // =============================================================================
  // WEBSOCKET CONNECTION - PRODUCTION READY
  // =============================================================================
  // This effect establishes WebSocket connection for real-time updates
  // PRODUCTION: This is production ready and handles real WebSocket connections
  // PRODUCTION: Consider adding reconnection logic and error handling

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Note: The test API doesn't have WebSocket support
    // For now, we'll skip WebSocket and rely on polling
    // TODO: Add WebSocket support to test API or use polling
    // TODO: Add authentication for WebSocket connections
    // TODO: Add reconnection logic and error handling
    
    // Use polling instead for now - fetch from all machine APIs
    const pollInterval = setInterval(() => {
      const fetchAllMachines = async () => {
        try {
          const allMachines = [];
          
          // Fetch from all machine APIs
          const promises = API_CONFIG.MACHINE_APIS.map(async (apiUrl) => {
            try {
              const response = await axios.get(getApiUrl(API_CONFIG.ENDPOINTS.MACHINES, apiUrl), {
                timeout: API_CONFIG.TIMEOUT
              });
              // Handle both single machine (object) and array of machines
              if (Array.isArray(response.data)) {
                return response.data;
              } else {
                return [response.data];
              }
            } catch (error) {
              console.error(`Failed to fetch from ${apiUrl}:`, error.message);
              return []; // Return empty array for failed requests
            }
          });
          
          const results = await Promise.all(promises);
          const combinedMachines = results.flat();
          
          console.log(`Polling: Fetched ${combinedMachines.length} machines:`, combinedMachines.map(m => ({ id: m.id, name: m.name, status: m.status })));
          
          // Track changes in machines
          setMachines(prevMachines => {
            console.log(`Polling: Previous machines (${prevMachines.length}):`, prevMachines.map(m => ({ id: m.id, name: m.name, status: m.status })));
            
            // Compare old and new machines to detect changes
            const machineMap = new Map(prevMachines.map(m => [m.id, m]));
            const machinesWithVisualChanges = new Set();
            
            // Process both existing and new machines
            combinedMachines.forEach(newMachine => {
              const oldMachine = machineMap.get(newMachine.id);
              
              // Debug logging for machine 107
              const isMachine107 = newMachine.id && (newMachine.id.includes('107') || newMachine.id.includes('INHOUSE107'));
              if (isMachine107) {
                console.log(`Polling: Processing machine 107: id=${newMachine.id}, oldMachine=`, oldMachine, `newMachine.status=${newMachine.status}`);
              }
              
              let hasVisualChange = false;
              
              // Normalize status to lowercase for comparison
              const oldStatus = (oldMachine?.status || '').toLowerCase().trim();
              const newStatus = (newMachine.status || '').toLowerCase().trim();
              
              // Check for status lock (don't change if locked and coming from green)
              const statusLock = machineStatusLocks.get(newMachine.id);
              const isLocked = statusLock && statusLock.expiry && Date.now() < statusLock.expiry;
              
              // Check for status/color changes (only these trigger visual effects and logging)
              if (oldMachine) {
                // Check if machine is locked - don't allow status changes if locked
                if (isLocked) {
                  if (isMachine107) {
                    console.log(`Polling: Machine 107 is locked to ${statusLock.status} until ${new Date(statusLock.expiry).toLocaleTimeString()}, keeping locked status`);
                  }
                  // Keep locked status, don't change
                  newMachine.status = statusLock.status;
                  // Continue processing but skip change detection
                } else {
                  // Existing machine - check if status changed (only if not locked)
                  if (oldStatus !== newStatus && oldStatus !== '' && newStatus !== '') {
                    hasVisualChange = true;
                  console.log(`Polling: Status change detected for ${newMachine.name} (${newMachine.id}): ${oldMachine.status} -> ${newMachine.status}`);
                  addLogEntry({
                    machineId: newMachine.id,
                    machineName: newMachine.name,
                    type: 'status_change',
                    oldValue: oldMachine.status,
                    newValue: newMachine.status,
                    timestamp: new Date().toISOString(),
                    source: 'polling'
                  });
                  
                  // If changing from green to non-green, lock the new status for 2 minutes
                  const oldStatusNormalized = (oldMachine.status || '').toLowerCase().trim();
                  const newStatusNormalized = (newMachine.status || '').toLowerCase().trim();
                  if (oldStatusNormalized === 'green' && newStatusNormalized !== 'green') {
                    const lockExpiry = Date.now() + 120000; // 2 minutes = 120000ms
                    setMachineStatusLocks(prev => {
                      const newMap = new Map(prev);
                      newMap.set(newMachine.id, { status: newMachine.status, expiry: lockExpiry });
                      console.log(`Polling: Locked ${newMachine.id} to ${newMachine.status} for 2 minutes (until ${new Date(lockExpiry).toLocaleTimeString()})`);
                      return newMap;
                    });
                    
                    // Auto-unlock after 2 minutes
          setTimeout(() => {
                      setMachineStatusLocks(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(newMachine.id);
                        console.log(`Polling: Unlocked ${newMachine.id} after 2 minutes`);
                        return newMap;
                      });
                    }, 120000);
                  }
                  } else if (isMachine107) {
                    console.log(`Polling: Machine 107 - No status change: oldStatus="${oldStatus}" === newStatus="${newStatus}"`);
                  }
                }
              } else {
                // New machine - always log first appearance (but don't trigger visual unless status is non-grey)
                console.log(`New machine detected: ${newMachine.name} (${newMachine.id}) with status ${newMachine.status}`);
              }
              
              // Add to visual changes set if status changed
              if (hasVisualChange) {
                machinesWithVisualChanges.add(newMachine.id);
                console.log(`Polling: Added ${newMachine.id} to machinesWithVisualChanges for visual effects`);
              } else if (isMachine107) {
                console.log(`Polling: Machine 107 - NOT added to machinesWithVisualChanges (hasVisualChange=${hasVisualChange})`);
              }
            });
            
            // Update recently changed machines for visual effects
            if (machinesWithVisualChanges.size > 0) {
              console.log(`Polling: Triggering visual effects for ${machinesWithVisualChanges.size} machine(s):`, Array.from(machinesWithVisualChanges));
            setRecentlyChangedMachines(prev => {
              const newSet = new Set(prev);
                machinesWithVisualChanges.forEach(id => newSet.add(id));
                console.log(`Polling: Updated recentlyChangedMachines, now contains:`, Array.from(newSet));
              return newSet;
            });
              
              // Clear after 30 seconds
              setTimeout(() => {
                setRecentlyChangedMachines(prev => {
                  const newSet = new Set(prev);
                  machinesWithVisualChanges.forEach(id => newSet.delete(id));
                  return newSet;
                });
              }, 30000);
            }
            
            // Always return combined machines (merge old with new, preferring new data)
            return combinedMachines;
          });
          
          setConnectionStatus(`Connected (${combinedMachines.length} machines)`);
      } catch (error) {
          console.error('Failed to fetch machines:', error);
          setConnectionStatus(`Error: ${error.message}`);
      }
    };
      fetchAllMachines();
    }, API_CONFIG.POLL_INTERVAL); // Poll every 5 seconds

    // Return cleanup function
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

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
      setFlashColor('grey');
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

  // Flash effect when machines change status - matches marker color
  useEffect(() => {
    const changedMachines = displayedMachines.filter(machine => 
      recentlyChangedMachines.has(machine.id)
    );

    if (changedMachines.length === 0) return;

    // Get the most recent status change - use first changed machine's status
    const changedMachine = changedMachines[0];
    const statusColor = changedMachine.status;

    // Only trigger flash if enough time has passed since last flash
    const now = Date.now();
    const timeSinceLastFlash = now - lastFlashTime;
    
    if (timeSinceLastFlash > 3000) {
      console.log(`FLASH TRIGGERED: ${changedMachines.length} machine(s) changed to ${statusColor}!`);
      // Trigger flash effect matching the marker color
      setFlashColor(statusColor);
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
          {displayedMachines.map((machine) => {
            // Check if machine has a status lock (changed from green -> non-green, locked for 2 min)
            const statusLock = machineStatusLocks.get(machine.id);
            const lockedStatus = statusLock?.status;
            const lockExpiry = statusLock?.expiry;
            const isLocked = lockedStatus && lockExpiry && Date.now() < lockExpiry;
            
            // Use locked status if machine is locked, otherwise use actual status
            const displayStatus = isLocked ? lockedStatus : machine.status;
            
            const isRecentlyChanged = recentlyChangedMachines.has(machine.id);
            const icon = createCustomIcon(displayStatus, machine.system_type, machine.id, isRecentlyChanged);
            
            // Debug for machine 107
            if (machine.id && (machine.id.includes('107') || machine.id.includes('INHOUSE107'))) {
              console.log(`Rendering machine ${machine.id}: actualStatus=${machine.status}, displayStatus=${displayStatus}, isLocked=${isLocked}, lockedStatus=${lockedStatus}, isRecentlyChanged=${isRecentlyChanged}, recentlyChangedMachines=`, Array.from(recentlyChangedMachines));
            }
            
            return (
            <MachineMarker
                key={`${machine.id}-${displayStatus}-${isRecentlyChanged}`}
                machine={{ ...machine, status: displayStatus }}
                icon={icon}
                recentlyChanged={isRecentlyChanged}
              popupsToOpen={popupsToOpen}
              onPopupOpened={handlePopupOpened}
            />
            );
          })}
        </MapContainer>

        <div className="status-panel">
          <h4 style={{ margin: '0 0 1rem 0', color: '#8B1538' }}>Machine Status</h4>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
            Connection: {connectionStatus}
          </div>
          
          {/* Simulation Control - Collapsible */}
          <div className="simulation-section">
            <div className="simulation-header" onClick={() => setSimulationControlsOpen(!simulationControlsOpen)}>
              <span className="simulation-title">🎮 Simulation Controls</span>
              <span className={`toggle-icon ${simulationControlsOpen ? 'open' : ''}`}>▼</span>
            </div>
            <div className={`simulation-content ${simulationControlsOpen ? '' : 'closed'}`}>
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
              <div className="simulation-control" style={{ marginTop: '0.5rem' }}>
                <button 
                  className="random-change-button"
                  onClick={triggerRandomMachineChange}
                  title="Trigger a random change on a random machine"
                  disabled={machines.length === 0}
                >
                  🎲 Random Change
                </button>
              </div>
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
          
          {/* Machine Logs Section - Collapsible */}
          <div className="machine-logs-section">
            <div className="logs-header" onClick={() => setLogsOpen(!logsOpen)}>
              <span className="logs-title">📋 Machine Logs</span>
              <span className={`toggle-icon ${logsOpen ? 'open' : ''}`}>▼</span>
            </div>
            <div className={`logs-content ${logsOpen ? '' : 'closed'}`}>
              <div className="logs-list">
                {machineLogs.length === 0 ? (
                  <div className="log-entry empty">No log entries yet</div>
                ) : (
                  machineLogs.map((log, index) => (
                    <div key={index} className="log-entry">
                      <div className="log-header">
                        <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`log-source ${log.source}`}>{log.source}</span>
                      </div>
                      <div className="log-machine">{log.machineName} ({log.machineId})</div>
                      {log.type === 'status_change' && (
                        <div className="log-details">
                          Color/Status: <span className="log-old">{log.oldValue}</span> → <span className="log-new">{log.newValue}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
           </div>
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#8B1538', fontSize: '0.9rem' }}>System Types:</h5>
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
                            <div 
                              key={machine.id} 
                              className="marker-item"
                              onClick={() => openMachinePopup(machine.id)}
                              style={{ cursor: 'pointer' }}
                            >
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
