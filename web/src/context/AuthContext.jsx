import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state from localStorage on application mount
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('grievio_access_token');
      if (accessToken) {
        try {
          const res = await apiClient.get('/accounts/me/');
          setUser(res.data);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('grievio_access_token');
          localStorage.removeItem('grievio_refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      // 1. Obtain JWT tokens
      const tokenRes = await apiClient.post('/accounts/token/', { username, password });
      const { access, refresh } = tokenRes.data;

      localStorage.setItem('grievio_access_token', access);
      localStorage.setItem('grievio_refresh_token', refresh);

      // 2. Fetch authenticated profile
      const profileRes = await apiClient.get('/accounts/me/', {
        headers: { Authorization: `Bearer ${access}` },
      });

      setUser(profileRes.data);
      return { success: true, user: profileRes.data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Authentication failed. Please verify your username and password.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('grievio_refresh_token');
      if (refresh) {
        await apiClient.post('/accounts/logout/', { refresh }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('grievio_access_token');
      localStorage.removeItem('grievio_refresh_token');
      setUser(null);
      setAuthError(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get('/accounts/me/');
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isApproved: user?.approval_status === 'APPROVED' || user?.role === 'SUPERADMIN',
        role: user?.role,
        loading,
        authError,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
