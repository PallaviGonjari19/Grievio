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

export const lookupCollegeCode = async (code) => {
  const res = await mobileApi.get(`/institutions/lookup/?code=${code.trim().toUpperCase()}`);
  return res.data;
};

export const loginUser = async (username, password) => {
  const tokenRes = await mobileApi.post('/accounts/token/', { username, password });
  const { access, refresh } = tokenRes.data;
  setAuthToken(access);
  const profileRes = await mobileApi.get('/accounts/me/');
  return { tokens: tokenRes.data, user: profileRes.data };
};

export const registerUser = async (data) => {
  const res = await mobileApi.post('/accounts/register/', data);
  return res.data;
};

export const fetchComplaints = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/complaints/?${query}` : '/complaints/';
  const res = await mobileApi.get(url);
  return res.data.results || res.data;
};

export const fetchComplaintDetail = async (id) => {
  const res = await mobileApi.get(`/complaints/${id}/`);
  return res.data;
};

export const createComplaint = async (data) => {
  const res = await mobileApi.post('/complaints/', data);
  return res.data;
};

export const updateComplaintStatus = async (id, payload) => {
  const res = await mobileApi.patch(`/complaints/${id}/status/`, payload);
  return res.data;
};

export const addComplaintComment = async (id, message, isInternal = false) => {
  const res = await mobileApi.post(`/complaints/${id}/comments/`, {
    message,
    is_internal: isInternal,
  });
  return res.data;
};

export const fetchDepartments = async () => {
  const res = await mobileApi.get('/departments/');
  return res.data.results || res.data;
};

export const fetchCategories = async (deptId) => {
  const res = await mobileApi.get(`/departments/categories/?department=${deptId}`);
  return res.data.results || res.data;
};

export const fetchLocations = async () => {
  const res = await mobileApi.get('/institutions/locations/');
  return res.data.results || res.data;
};

export default mobileApi;

