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
    ROOT: '/'
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


