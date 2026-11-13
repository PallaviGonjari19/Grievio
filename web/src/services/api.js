import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grievio_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry & common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('grievio_refresh_token');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          localStorage.setItem('grievio_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('grievio_access_token');
          localStorage.removeItem('grievio_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// System health check service
export const checkSystemHealth = async () => {
  try {
    const healthUrl = API_BASE_URL.replace('/api/v1', '/api/health/');
    const response = await axios.get(healthUrl, { timeout: 3000 });
    return { online: true, data: response.data };
  } catch (error) {
    return { online: false, error: error.message };
  }
};

export default apiClient;
