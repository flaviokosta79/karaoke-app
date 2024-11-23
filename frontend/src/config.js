// Get the backend URL based on the current environment
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_BACKEND_URL;
  }

  // For development, use the local network IP if accessing from mobile
  const isLocalNetwork = !window.location.hostname.includes('localhost');
  if (isLocalNetwork) {
    // Use the same hostname as the frontend
    return `http://${window.location.hostname}:5000`;
  }

  // When running locally, connect to the local backend
  return 'http://192.168.101.246:5000';
};

export const config = {
  backendUrl: getBackendUrl(),
};
