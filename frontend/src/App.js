import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';

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
    const boxSpacing = 5.0; // Maximum spacing for clear box formation at zoom level 4
    
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

// Custom machine status icons with system type distinction
const createCustomIcon = (status, systemType) => {
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

  return L.divIcon({
    className: 'custom-marker',
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
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;


const MapWrapper = styled.div`
  flex: 1;
  position: relative;
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

function App() {
  const [machines, setMachines] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

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

  // Calculate status counts
  const statusCounts = machines.reduce((acc, machine) => {
    acc[machine.status] = (acc[machine.status] || 0) + 1;
    return acc;
  }, {});

  // Arrange markers in country boxes
  const arrangedMachines = arrangeMarkersInCountryBoxes(machines);

  return (
    <AppContainer>
      <MapWrapper>
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
              icon={createCustomIcon(machine.status, machine.system_type)}
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
