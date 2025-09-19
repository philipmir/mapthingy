import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

// Custom machine status icons
const createCustomIcon = (status) => {
  let color;
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

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
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
    switch (props.status) {
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

function App() {
  const [machines, setMachines] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  // Load initial machine data
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get('/api/machines');
        setMachines(response.data);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      }
    };

    fetchMachines();
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = io('ws://localhost:8000/ws');
    
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

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Calculate status counts
  const statusCounts = machines.reduce((acc, machine) => {
    acc[machine.status] = (acc[machine.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <AppContainer>
      <Header>
        <Title>Global Machine Monitor</Title>
        <Subtitle>Real-time machine status worldwide</Subtitle>
      </Header>
      
      <MapWrapper>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {machines.map((machine) => (
            <Marker
              key={machine.id}
              position={[machine.latitude, machine.longitude]}
              icon={createCustomIcon(machine.status)}
            >
              <Popup>
                <MachinePopup>
                  <MachineName>{machine.name}</MachineName>
                  <MachineDetails>
                    <DetailLabel>Status:</DetailLabel> {machine.status.toUpperCase()}
                  </MachineDetails>
                  <MachineDetails>
                    <DetailLabel>Location:</DetailLabel> {machine.location}
                  </MachineDetails>
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
            <StatusIndicator status="online" />
            Online: {statusCounts.online || 0}
          </StatusItem>
          <StatusItem>
            <StatusIndicator status="warning" />
            Warning: {statusCounts.warning || 0}
          </StatusItem>
          <StatusItem>
            <StatusIndicator status="offline" />
            Offline: {statusCounts.offline || 0}
          </StatusItem>
          <StatusItem>
            <StatusIndicator status="error" />
            Error: {statusCounts.error || 0}
          </StatusItem>
        </StatusPanel>
      </MapWrapper>
    </AppContainer>
  );
}

export default App;
