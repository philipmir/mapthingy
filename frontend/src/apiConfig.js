// API Configuration
// Update this file to change the API endpoint

export const API_CONFIG = {
  // Multiple machine APIs - Add all machine computer APIs here
  MACHINE_APIS: [
    'http://192.168.175.116:8023',  // Original machine
    'http://192.168.175.107:8023',  // INHOUSE107 at Katrineholm SinterCast HQ
  ],
  
  // Endpoints
  ENDPOINTS: {
    MACHINES: '/machines',
    HEALTH: '/health',
    ROOT: '/',
    STATUS_UPDATE: '/machines/'  // Append {machine_id}/status
  },
  
  // Simulation settings
  SIMULATION: {
    UPDATE_INTERVAL: 10000, // Update every 10 seconds when simulation is running
    STATUS_CHANGE_PROBABILITY: 0.40, // 40% chance to change status each update
    DATA_VARIATION: {
      temperature: { min: -2, max: 2 }, // ±2°C variation (no visual effect)
      pressure: { min: -0.3, max: 0.3 }, // ±0.3 bar variation (triggers visual effect at ≥0.1)
      speed: { min: -75, max: 75 }, // ±75 rpm variation (triggers visual effect at ≥25)
      disk_volume: { min: -1, max: 1 } // ±1% variation (no visual effect)
    }
  },
  
  // Polling interval for real-time updates (milliseconds)
  POLL_INTERVAL: 5000, // 5 seconds
  
  // Timeout for API requests (milliseconds)
  TIMEOUT: 30000 // 30 seconds
};

// Helper function to get full API URL for a specific machine API
export const getApiUrl = (endpoint, baseUrl = null) => {
  // If baseUrl provided, use it; otherwise use first API (backward compatibility)
  const url = baseUrl || API_CONFIG.MACHINE_APIS[0];
  return `${url}${endpoint}`;
};


