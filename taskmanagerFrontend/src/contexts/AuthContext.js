import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Load user data from localStorage
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
      
      // Verify token is valid by making a request to a protected endpoint
      api.get('/dashboard')
        .then(() => {
          // Token is valid, user is authenticated
          if (!userStr) {
            setUser({ token });
          }
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { data } = response.data;
      
      localStorage.setItem('token', data);
      api.defaults.headers.common['Authorization'] = `Bearer ${data}`;
      
      // Store user info for dashboard display
      const userInfo = {
        token: data,
        email: credentials.email,
        name: credentials.email.split('@')[0] // Extract name from email
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const signup = async (userData) => {
    try {
      await api.post('/auth/signup', userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
