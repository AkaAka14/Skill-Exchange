import axios from 'axios';

const apiServerClient = axios.create({
  baseURL: 'http://localhost:3001', // This matches your API port in the terminal
});

apiServerClient.interceptors.request.use(config => {
    const token = localStorage.getItem('pocketbaseToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Add interceptors here if you need to pass tokens later
export default apiServerClient;