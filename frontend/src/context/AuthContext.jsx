import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ss_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('ss_token');
      if (!savedToken) { setLoading(false); return; }
      try {
        const { data } = await api.get('/api/auth/me');
        if (data.success) setUser(data.data);
      } catch {
        localStorage.removeItem('ss_token');
        localStorage.removeItem('ss_user');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('ss_token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      // Fetch full profile
      const profile = await api.get('/api/auth/me');
      if (profile.data.success) setUser(profile.data.data);
    }
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/api/auth/register', formData);
    if (data.success) {
      localStorage.setItem('ss_token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
