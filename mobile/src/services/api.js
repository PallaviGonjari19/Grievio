import axios from 'axios';
import { Platform } from 'react-native';

// Fallback logic for Android Emulator vs iOS Simulator vs Web
const getDefaultApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getDefaultApiUrl();

let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

const mobileApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

mobileApi.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const checkHealth = async () => {
  try {
    const healthUrl = API_BASE_URL.replace('/api/v1', '/api/health/');
    const res = await axios.get(healthUrl, { timeout: 3000 });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export default mobileApi;

