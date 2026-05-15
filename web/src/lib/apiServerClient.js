import axios from 'axios';
import pb from './pocketbaseClient'; // Import your pocketbase instance

const apiServerClient = axios.create({
  baseURL: 'http://localhost:3001',
});

// Add this interceptor to fix the 401
apiServerClient.interceptors.request.use((config) => {
  const token = pb.authStore.token; // Get the token from PocketBase
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiServerClient;