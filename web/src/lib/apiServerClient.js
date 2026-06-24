import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

const apiServerClient = {
  get:    (url, config)         => instance.get(url, config).then(r => r.data),
  post:   (url, data, config)   => instance.post(url, data, config).then(r => r.data),
  patch:  (url, data, config)   => instance.patch(url, data, config).then(r => r.data),
  put:    (url, data, config)   => instance.put(url, data, config).then(r => r.data),
  delete: (url, config)         => instance.delete(url, config).then(r => r.data),

  instance,
};

export default apiServerClient;