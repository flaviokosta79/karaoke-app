// Get the backend URL based on the current environment
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Para desenvolvimento, sempre use localhost:5000
  return 'http://localhost:5000';
};

export const config = {
  backendUrl: getBackendUrl()
};
