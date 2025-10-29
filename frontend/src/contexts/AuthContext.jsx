// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (accessToken && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // console.log('✅ User is logged in:', parsedUser.email);
      } else {
        setUser(null);
        // console.log('❌ User not logged in');
      }
    } catch (error) {
      // console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await API.post('accounts/login/', credentials);
      
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        // console.log('✅ Login successful');
        return response.data;
      }
      throw new Error('No tokens received');
    } catch (error) {
      // console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await API.post('accounts/register/', userData);
      
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        // console.log('✅ Registration successful');
        return response.data;
      }
      throw new Error('No tokens received');
    } catch (error) {
      // console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await API.post('accounts/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      // console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      // console.log('✅ Logged out successfully');
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await API.patch('accounts/profile/', profileData);
      
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUserProfile,
    checkAuth,
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;