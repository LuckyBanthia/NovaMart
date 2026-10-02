import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('novamart_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('novamart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('novamart_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('novamart_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Session expired:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('novamart_token', newToken);
      localStorage.setItem('novamart_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('novamart_token', newToken);
      localStorage.setItem('novamart_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('novamart_token');
    localStorage.removeItem('novamart_user');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
