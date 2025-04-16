import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load admin data if token exists
  useEffect(() => {
    const loadAdmin = async () => {
      if (token) {
        try {
          const res = await authAPI.getAdmin();
          setCurrentAdmin(res.data);
          setError(null);
        } catch (err) {
          console.error('Error loading admin:', err);
          localStorage.removeItem('token');
          setToken(null);
          setCurrentAdmin(null);
          setError('Session expired. Please login again.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadAdmin();
  }, [token]);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      const res = await authAPI.login(username, password);
      const { token } = res.data;
      
      // Save token and refresh admin data
      localStorage.setItem('token', token);
      setToken(token);
      
      // Load admin data
      const adminRes = await authAPI.getAdmin();
      setCurrentAdmin(adminRes.data);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function - THIS IS THE KEY FIX THAT WAS MISSING
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Clear state
    setToken(null);
    setCurrentAdmin(null);
    setError(null);
    
    // Additional cleanup if needed
    console.log('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      currentAdmin,
      token,
      loading,
      error,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);