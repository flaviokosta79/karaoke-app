// Get the backend URL based on the current environment
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Em desenvolvimento, use o IP da máquina para permitir acesso via mobile
  const host = window.location.hostname;
  console.log('Host atual:', host);
  return `http://${host}:5000`;
};

// Exporta a configuração e loga a URL do backend
export const config = {
  backendUrl: getBackendUrl()
};

console.log('Backend URL:', config.backendUrl);
