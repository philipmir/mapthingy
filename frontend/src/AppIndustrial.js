/**
 * Global Machine Monitor - Industrial Theme Design
 * 
 * Industrial theme with metallic colors, bold typography, and technical styling
 * Same functionality as App.js but with different visual styling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';

// Import different map designs
import App from './App';
import AppDark from './AppDark';
import AppMinimal from './AppMinimal';
import AppModern from './AppModern';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

// Industrial custom machine status icons
const createCustomIcon = (status, systemType, machineId, recentlyChanged) => {
  let color;
  let shape = 'circle';
  let size = 20;
  
  // Set color based on status - industrial colors
  switch (status) {
    case 'online':
      color = '#10b981';
      break;
    case 'warning':
      color = '#f59e0b';
      break;
    case 'offline':
      color = '#ef4444';
      break;
    case 'error':
      color = '#8b5cf6';
      break;
    default:
      color = '#6b7280';
  }
  
  // Set shape and size based on system type
  if (systemType === 'Automated System 4000') {
    shape = 'circle';
    size = 26; // Larger for AS4000
  } else if (systemType === 'Mini-System 4000') {
    shape = 'square';
    size = 22; // Smaller square for MS4000
  }

  const borderRadius = shape === 'circle' ? '50%' : '3px';
  const borderWidth = systemType === 'Automated System 4000' ? '4px' : '3px';
  
  // Check if this is an alert status that should flash
  const alertStatuses = ['warning', 'offline', 'error'];
  const isAlertStatus = alertStatuses.includes(status);
  
  // Create pulsing red border for recently changed machines with alert status
  const shouldPulse = isAlertStatus && recentlyChanged;
  const pulseClass = shouldPulse ? 'pulse-red' : '';
  const pulseStyle = shouldPulse ? `
    border: ${borderWidth} solid rgba(255, 0, 0, 0.8) !important;
    animation: pulse-individual 1s ease-in-out infinite;
  ` : '';

  return L.divIcon({
    className: `custom-marker ${pulseClass}`,
    html: `<div style="
      background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
      width: ${size}px;
      height: ${size}px;
      border-radius: ${borderRadius};
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-weight: bold;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      ${pulseStyle}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Industrial styled components
const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #f9fafb;
  font-family: 'Courier New', monospace;
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
    }
    50% { 
      border: 6px solid rgba(255, 0, 0, 1);
      box-shadow: 0 0 0 12px rgba(255, 0, 0, 0.4);
    }
  }
`;

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
  background: #1f2937;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const StatusPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px #4b5563;
  z-index: 1000;
  min-width: 220px;
  border: 2px solid #4b5563;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.75rem;
  background: linear-gradient(135deg, ${props => {
    switch (props.$status) {
      case 'online': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'offline': return '#ef4444';
      case 'error': return '#8b5cf6';
      default: return '#6b7280';
    }
  }} 0%, ${props => {
    switch (props.$status) {
      case 'online': return '#10b981dd';
      case 'warning': return '#f59e0bdd';
      case 'offline': return '#ef4444dd';
      case 'error': return '#8b5cf6dd';
      default: return '#6b7280dd';
    }
  }} 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
`;

const MachinePopup = styled.div`
  min-width: 280px;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #f9fafb;
  border-radius: 8px;
  padding: 1.25rem;
  border: 2px solid #4b5563;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
`;

const MachineName = styled.h3`
  margin: 0 0 0.75rem 0;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MachineDetails = styled.div`
  margin-bottom: 0.75rem;
  color: #d1d5db;
  font-weight: 500;
`;

const DetailLabel = styled.span`
  font-weight: 700;
  margin-right: 0.5rem;
  color: #ffffff;
  text-transform: uppercase;
  font-size: 0.85rem;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

const DataItem = styled.div`
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
  color: #ffffff;
  border: 1px solid #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Analytics Dashboard Components
const AnalyticsPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px #4b5563;
  z-index: 1000;
  min-width: 300px;
  max-width: 340px;
  border: 2px solid #4b5563;
`;

const PanelHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid #4b5563;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  }
`;

const PanelContent = styled.div`
  padding: 1.5rem;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const FilterSection = styled.div`
  margin-bottom: 1.25rem;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #d1d5db;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #4b5563;
  border-radius: 4px;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  }
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  border: 1px solid #6b7280;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

const MetricLabel = styled.div`
  font-weight: 700;
  color: #d1d5db;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div`
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
`;

const ToggleIcon = styled.span`
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: #10b981;
  font-weight: 700;
`;

// Style Switcher Components
const StyleSwitcher = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px #4b5563;
  border: 2px solid #4b5563;
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
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
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
  border: 2px solid ${props => props.$isActive ? '#10b981' : '#4b5563'};
  border-radius: 4px;
  background: ${props => props.$isActive ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'};
  color: ${props => props.$isActive ? '#10b981' : '#d1d5db'};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  
  &:hover {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
`;

const StyleLabel = styled.span`
  font-weight: 700;
  color: #ffffff;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyleToggleIcon = styled.span`
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: #10b981;
  font-weight: 700;
  margin-left: 0.5rem;
`;

// Alert Flash Effect
const AlertFlash = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isFlashing ? 'rgba(255, 0, 0, 0.4)' : 'transparent'};
  pointer-events: none;
  z-index: 9999;
  transition: background 0.1s ease;
  animation: ${props => props.$isFlashing ? 'strobe 1s ease-in-out' : 'none'};
  
  @keyframes strobe {
    0%, 100% { background: rgba(255, 0, 0, 0.4); }
    25% { background: rgba(255, 0, 0, 0.1); }
    50% { background: rgba(255, 0, 0, 0.6); }
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

function AppIndustrial() {
  const [machines, setMachines] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [styleSwitcherOpen, setStyleSwitcherOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('industrial');
  const [alertFlash, setAlertFlash] = useState(false);
  const [alertedMachines, setAlertedMachines] = useState(new Set());
  const [recentlyChangedMachines, setRecentlyChangedMachines] = useState(new Set());

  // Style definitions
  const styles = [
    { id: 'original', name: 'Original', component: App },
    { id: 'dark', name: 'Dark', component: AppDark },
    { id: 'minimal', name: 'Minimal', component: AppMinimal },
    { id: 'industrial', name: 'Industrial', component: null },
    { id: 'modern', name: 'Modern', component: AppModern }
  ];

  // Load initial machine data
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        console.log('Fetching machines from API...');
        const response = await axios.get('/api/machines');
        console.log('API Response:', response.data);
        setMachines(response.data);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      }
    };

    fetchMachines();
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = io('ws://127.0.0.1:8000/ws');
    
    newSocket.on('connect', () => {
      setConnectionStatus('Connected');
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
      console.log('Disconnected from server');
    });

    newSocket.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        if (message.type === 'machine_update') {
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
    });

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
      // Trigger flash effect
      setAlertFlash(true);
      setTimeout(() => setAlertFlash(false), 2000);

      // Add machines to alerted set
      setAlertedMachines(prev => new Set([...prev, ...machinesNeedingAlert.map(m => m.id)]));

      // Auto-open popups for alert machines
      machinesNeedingAlert.forEach(machine => {
        console.log(`🚨 ALERT: ${machine.name} is ${machine.status.toUpperCase()}!`);
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

  // Flash effect when machines change to alert status
  useEffect(() => {
    const alertStatuses = ['warning', 'offline', 'error'];
    const newlyChangedToAlert = arrangedMachines.filter(machine => 
      alertStatuses.includes(machine.status) && recentlyChangedMachines.has(machine.id)
    );

    if (newlyChangedToAlert.length > 0) {
      console.log(`FLASH TRIGGERED: ${newlyChangedToAlert.length} machines just changed to alert status!`);
      // Trigger flash effect for newly changed machines
      setAlertFlash(true);
      setTimeout(() => setAlertFlash(false), 2000);
    }
  }, [recentlyChangedMachines, arrangedMachines]);

  // Get current style component
  const CurrentStyleComponent = styles.find(s => s.id === currentStyle)?.component;

  // If a different style is selected, render that component
  if (CurrentStyleComponent) {
    return <CurrentStyleComponent />;
  }

  return (
    <AppContainer>
      <AlertFlash $isFlashing={alertFlash} />
      <MapWrapper>
        {/* Style Switcher */}
        <StyleSwitcher>
          <StyleSwitcherHeader onClick={() => setStyleSwitcherOpen(!styleSwitcherOpen)}>
            <StyleLabel>STYLE:</StyleLabel>
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
            <span>⚙️ ANALYTICS & FILTERS</span>
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

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #4b5563' }}>
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
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
          <h4 style={{ margin: '0 0 1.25rem 0', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Machine Status</h4>
          <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: '#d1d5db', fontWeight: '600' }}>
            Connection: <span style={{ color: connectionStatus === 'Connected' ? '#10b981' : '#ef4444' }}>{connectionStatus.toUpperCase()}</span>
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
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '2px solid #4b5563' }}>
            <h5 style={{ margin: '0 0 0.75rem 0', color: '#ffffff', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Types:</h5>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #10b981dd 100%)',
                border: '3px solid #ffffff',
                marginRight: '0.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}></div>
              <span style={{ fontSize: '0.85rem', color: '#d1d5db', fontWeight: '600' }}>Automated System 4000</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                background: 'linear-gradient(135deg, #10b981 0%, #10b981dd 100%)',
                border: '3px solid #ffffff',
                marginRight: '0.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}></div>
              <span style={{ fontSize: '0.85rem', color: '#d1d5db', fontWeight: '600' }}>Mini-System 4000</span>
            </div>
          </div>
        </StatusPanel>
      </MapWrapper>
    </AppContainer>
  );
}

export default AppIndustrial;
