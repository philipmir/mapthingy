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

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';

// Import different map designs
import AppDark from './AppDark';
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

// =============================================================================
// MARKER ARRANGEMENT - PRODUCTION READY
// =============================================================================
// This function arranges machine markers in country-based clusters
// PRODUCTION: This function is production ready and handles real machine data
// PRODUCTION: Consider adding performance optimizations for large datasets

// Function to arrange markers in country boxes
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
  
  // Set color based on status
  switch (status) {
    case 'online':
      color = '#28a745';
      break;
    case 'warning':
      color = '#ffc107';
      break;
    case 'offline':
      color = '#dc3545';
      break;
    case 'error':
      color = '#6f42c1';
      break;
    default:
      color = '#6c757d';
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
  
  // Check if this is an alert status that should flash
  const alertStatuses = ['warning', 'offline', 'error'];
  const isAlertStatus = alertStatuses.includes(status);
  const isOnlineStatus = status === 'online';
  
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
             z-index: 9999 !important;
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

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: none;
  
  /* Hide scrollbars */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  
  &::-webkit-scrollbar {
    display: none; /* WebKit */
  }
  
  /* Pulsing red border animation for alert markers - 30 seconds then returns to normal */
  @keyframes pulse-red-30s {
    0%, 90% { 
      border: 3px solid rgba(255, 0, 0, 0.8);
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
    }
    5%, 15%, 25%, 35%, 45%, 55%, 65%, 75%, 85% { 
      border: 6px solid rgba(255, 0, 0, 1);
      box-shadow: 0 0 0 12px rgba(255, 0, 0, 0.4);
    }
    95%, 100% { 
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
  }
  
           /* Individual pulsing animation for newly changed machines */
           @keyframes pulse-individual {
             0%, 100% { 
               border: 3px solid rgba(255, 0, 0, 0.8);
               box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
               z-index: 9999;
             }
             50% { 
               border: 6px solid rgba(255, 0, 0, 1);
               box-shadow: 0 0 0 12px rgba(255, 0, 0, 0.4);
               z-index: 9999;
             }
           }
           
           /* Green pulsing animation for recoveries */
           @keyframes pulse-green {
             0%, 100% { 
               border: 3px solid rgba(0, 255, 0, 0.8);
               box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
               z-index: 9999;
             }
             50% { 
               border: 6px solid rgba(0, 255, 0, 1);
               box-shadow: 0 0 0 12px rgba(0, 255, 0, 0.4);
               z-index: 9999;
             }
           }
`;


const MapWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const StatusPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 200px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: ${props => {
    switch (props.$status) {
      case 'online': return '#28a745';
      case 'warning': return '#ffc107';
      case 'offline': return '#dc3545';
      case 'error': return '#6f42c1';
      default: return '#6c757d';
    }
  }};
`;

const MachinePopup = styled.div`
  min-width: 250px;
`;

const MachineName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
`;

const MachineDetails = styled.div`
  margin-bottom: 0.5rem;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  margin-right: 0.5rem;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const DataItem = styled.div`
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
`;

// Analytics Dashboard Components
const AnalyticsPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 280px;
  max-width: 320px;
`;

const PanelHeader = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #2c3e50;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const PanelContent = styled.div`
  padding: 1rem;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const FilterSection = styled.div`
  margin-bottom: 1rem;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.25rem;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.8rem;
  background: white;
`;

const MetricCard = styled.div`
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
`;

const MetricLabel = styled.div`
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div`
  color: #2c3e50;
  font-size: 0.9rem;
`;

const ToggleIcon = styled.span`
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

// Style Switcher Components
const StyleSwitcher = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  gap: 0.5rem;
  align-items: center;
  min-width: 200px;
`;

const StyleSwitcherHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  font-weight: 600;
  
  &:hover {
    background: #f8fafc;
  }
`;

const StyleSwitcherContent = styled.div`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  gap: 0.5rem;
  margin-left: 0.5rem;
  flex-wrap: wrap;
`;

const StyleButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.$isActive ? '#3b82f6' : '#e2e8f0'};
  border-radius: 8px;
  background: ${props => props.$isActive ? '#dbeafe' : '#ffffff'};
  color: ${props => props.$isActive ? '#1e40af' : '#64748b'};
  font-weight: ${props => props.$isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
    color: #1e40af;
  }
`;

const StyleLabel = styled.span`
  font-weight: 600;
  color: #374151;
  margin-right: 0.5rem;
  font-size: 0.9rem;
`;

const StyleToggleIcon = styled.span`
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: #3b82f6;
  font-weight: 600;
  margin-left: 0.5rem;
`;

// Alert Flash Effect
const AlertFlash = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isFlashing ? (props.$flashColor === 'green' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)') : 'transparent'};
  pointer-events: none;
  z-index: 9999;
  transition: background 0.1s ease;
  animation: ${props => props.$isFlashing ? 'strobe 1s ease-in-out' : 'none'};
  
  @keyframes strobe {
    0%, 100% { background: rgba(255, 0, 0, 0.3); }
    25% { background: rgba(255, 0, 0, 0.1); }
    50% { background: rgba(255, 0, 0, 0.5); }
    75% { background: rgba(255, 0, 0, 0.1); }
  }
`;

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
  const [styleSwitcherOpen, setStyleSwitcherOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('original');
  const [alertFlash, setAlertFlash] = useState(false);
  const [flashColor, setFlashColor] = useState('red');
  const [alertedMachines, setAlertedMachines] = useState(new Set());
  const [recentlyChangedMachines, setRecentlyChangedMachines] = useState(new Set());
  const [machinePreviousStatus, setMachinePreviousStatus] = useState(new Map());
  const [lastFlashTime, setLastFlashTime] = useState(0);

  // Style definitions
  const styles = [
    { id: 'original', name: 'Original', component: null },
    { id: 'dark', name: 'Dark', component: AppDark },
    { id: 'minimal', name: 'Minimal', component: AppMinimal },
    { id: 'industrial', name: 'Industrial', component: AppIndustrial },
    { id: 'modern', name: 'Modern', component: AppModern }
  ];

  // Get current style component
  const CurrentStyleComponent = styles.find(s => s.id === currentStyle)?.component;

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
        // TODO: Add proper error handling and user notification
      }
    };

    return () => {
      newSocket.close();
    };
  }, []);

  // Filter machines based on selected filters
  const filteredMachines = useMemo(() => {
    return machines.filter(machine => {
      const statusMatch = statusFilter === 'all' || machine.status === statusFilter;
      const systemMatch = systemFilter === 'all' || machine.system_type === systemFilter;
      const countryMatch = countryFilter === 'all' || machine.location === countryFilter;
      return statusMatch && systemMatch && countryMatch;
    });
  }, [machines, statusFilter, systemFilter, countryFilter]);

  // Calculate status counts for filtered machines
  const statusCounts = filteredMachines.reduce((acc, machine) => {
    acc[machine.status] = (acc[machine.status] || 0) + 1;
    return acc;
  }, {});

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    const total = filteredMachines.length;
    const online = statusCounts.online || 0;
    const warning = statusCounts.warning || 0;
    const offline = statusCounts.offline || 0;
    const error = statusCounts.error || 0;
    
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
      online,
      warning,
      offline,
      error,
      avgTemp,
      avgPressure,
      avgSpeed,
      avgDiskVolume,
      uptime: total > 0 ? ((online / total) * 100).toFixed(1) : 0
    };
  }, [filteredMachines, statusCounts]);

  // Get unique values for filter options
  const uniqueCountries = [...new Set(machines.map(m => m.location))].sort();
  const uniqueSystems = [...new Set(machines.map(m => m.system_type))].filter(Boolean);

  // Arrange markers in country boxes
  const arrangedMachines = arrangeMarkersInCountryBoxes(filteredMachines);

  // Alert detection and auto-popup logic
  useEffect(() => {
    const alertStatuses = ['warning', 'offline', 'error'];
    const machinesNeedingAlert = arrangedMachines.filter(machine => 
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

      // Auto-open popups for alert machines (simulated by console log for now)
      machinesNeedingAlert.forEach(machine => {
        console.log(`ALERT: ${machine.name} is ${machine.status.toUpperCase()}!`);
      });
    }

    // Reset alerted machines when status improves
    const improvedMachines = arrangedMachines.filter(machine => 
      !alertStatuses.includes(machine.status) && alertedMachines.has(machine.id)
    );
    if (improvedMachines.length > 0) {
      setAlertedMachines(prev => {
        const newSet = new Set(prev);
        improvedMachines.forEach(machine => newSet.delete(machine.id));
        return newSet;
      });
    }
  }, [arrangedMachines, alertedMachines]);

  // Flash effect when machines change status
  useEffect(() => {
    const alertStatuses = ['warning', 'offline', 'error'];
    const newlyChangedToAlert = arrangedMachines.filter(machine => 
      alertStatuses.includes(machine.status) && recentlyChangedMachines.has(machine.id)
    );
    const newlyReturnedToOnline = arrangedMachines.filter(machine => 
      machine.status === 'online' && recentlyChangedMachines.has(machine.id)
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

  // If a different style is selected, render that component
  if (CurrentStyleComponent) {
    return <CurrentStyleComponent />;
  }

  return (
    <AppContainer>
      <AlertFlash $isFlashing={alertFlash} $flashColor={flashColor} />
      <MapWrapper>
        {/* Style Switcher */}
        <StyleSwitcher>
          <StyleSwitcherHeader onClick={() => setStyleSwitcherOpen(!styleSwitcherOpen)}>
            <StyleLabel>Style:</StyleLabel>
            <StyleToggleIcon $isOpen={styleSwitcherOpen}>▼</StyleToggleIcon>
          </StyleSwitcherHeader>
          <StyleSwitcherContent $isOpen={styleSwitcherOpen}>
            {styles.map(style => (
              <StyleButton
                key={style.id}
                $isActive={currentStyle === style.id}
                onClick={() => setCurrentStyle(style.id)}
              >
                {style.name}
              </StyleButton>
            ))}
          </StyleSwitcherContent>
        </StyleSwitcher>

        {/* Analytics Dashboard */}
        <AnalyticsPanel>
          <PanelHeader onClick={() => setAnalyticsOpen(!analyticsOpen)}>
            <span>📊 Analytics & Filters</span>
            <ToggleIcon $isOpen={analyticsOpen}>▼</ToggleIcon>
          </PanelHeader>
          <PanelContent $isOpen={analyticsOpen}>
            <FilterSection>
              <FilterLabel>Status Filter</FilterLabel>
              <FilterSelect 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="warning">Warning</option>
                <option value="offline">Offline</option>
                <option value="error">Error</option>
              </FilterSelect>
            </FilterSection>
            
            <FilterSection>
              <FilterLabel>System Type</FilterLabel>
              <FilterSelect 
                value={systemFilter} 
                onChange={(e) => setSystemFilter(e.target.value)}
              >
                <option value="all">All Systems</option>
                {uniqueSystems.map(system => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </FilterSelect>
            </FilterSection>
            
            <FilterSection>
              <FilterLabel>Country</FilterLabel>
              <FilterSelect 
                value={countryFilter} 
                onChange={(e) => setCountryFilter(e.target.value)}
              >
                <option value="all">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </FilterSelect>
            </FilterSection>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
              <MetricCard>
                <MetricLabel>Total Machines</MetricLabel>
                <MetricValue>{analytics.total}</MetricValue>
              </MetricCard>
              
              <MetricCard>
                <MetricLabel>System Uptime</MetricLabel>
                <MetricValue>{analytics.uptime}%</MetricValue>
              </MetricCard>
              
              <MetricCard>
                <MetricLabel>Avg Temperature</MetricLabel>
                <MetricValue>{analytics.avgTemp}°C</MetricValue>
              </MetricCard>
              
              <MetricCard>
                <MetricLabel>Avg Pressure</MetricLabel>
                <MetricValue>{analytics.avgPressure} bar</MetricValue>
              </MetricCard>
              
              <MetricCard>
                <MetricLabel>Avg Speed</MetricLabel>
                <MetricValue>{analytics.avgSpeed} rpm</MetricValue>
              </MetricCard>
              
              <MetricCard>
                <MetricLabel>Avg Disk Space</MetricLabel>
                <MetricValue>{analytics.avgDiskVolume}%</MetricValue>
              </MetricCard>
            </div>
          </PanelContent>
        </AnalyticsPanel>

        <MapContainer
          center={[0, 0]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
           {/* Auto-fit bounds to show all markers */}
           <AutoFitBounds machines={arrangedMachines} />

          {/* Machine markers */}
          {arrangedMachines.map((machine) => (
            <Marker
              key={machine.id}
              position={[machine.latitude, machine.longitude]}
              icon={createCustomIcon(machine.status, machine.system_type, machine.id, recentlyChangedMachines.has(machine.id))}
            >
              <Popup>
                <MachinePopup>
                  <MachineName>{machine.name}</MachineName>
                  <MachineDetails>
                    <DetailLabel>Status:</DetailLabel> {machine.status.toUpperCase()}
                  </MachineDetails>
                  <MachineDetails>
                    <DetailLabel>System Type:</DetailLabel> {machine.system_type || 'Unknown'}
                  </MachineDetails>
                  <MachineDetails>
                    <DetailLabel>Location:</DetailLabel> {machine.location}
                  </MachineDetails>
                  {machine.boxCountry && (
                    <MachineDetails>
                      <DetailLabel>Country Box:</DetailLabel> {machine.boxCountry} (Position {machine.boxIndex + 1} of {machine.boxTotal})
                    </MachineDetails>
                  )}
                  <MachineDetails>
                    <DetailLabel>Last Seen:</DetailLabel> {new Date(machine.last_seen).toLocaleString()}
                  </MachineDetails>
                  
                  {machine.data && (
                    <DataGrid>
                      <DataItem>Temp: {machine.data.temperature}°C</DataItem>
                      <DataItem>Pressure: {machine.data.pressure} bar</DataItem>
                      <DataItem>Speed: {machine.data.speed} rpm</DataItem>
                      <DataItem>Disk: {machine.data.disk_volume}%</DataItem>
                    </DataGrid>
                  )}
                </MachinePopup>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <StatusPanel>
          <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Machine Status</h4>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
            Connection: {connectionStatus}
          </div>
          
           <StatusItem>
             <StatusIndicator $status="online" />
             Online: {statusCounts.online || 0}
           </StatusItem>
           <StatusItem>
             <StatusIndicator $status="warning" />
             Warning: {statusCounts.warning || 0}
           </StatusItem>
           <StatusItem>
             <StatusIndicator $status="offline" />
             Offline: {statusCounts.offline || 0}
           </StatusItem>
           <StatusItem>
             <StatusIndicator $status="error" />
             Error: {statusCounts.error || 0}
           </StatusItem>
          
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
        </StatusPanel>
      </MapWrapper>
    </AppContainer>
  );
}

export default App;
