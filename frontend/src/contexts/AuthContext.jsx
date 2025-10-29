// src/contexts/AuthContext.jsx - Fixed with proper api service
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

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
        console.log('✅ User is logged in:', parsedUser.email);
      } else {
        setUser(null);
        console.log('❌ User not logged in');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // ✅ api.login() returns data directly
      const data = await api.login(credentials);
      
      setUser(data.user);
      console.log('✅ Login successful');
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      // ✅ api.register() returns data directly
      const data = await api.register(userData);
      
      setUser(data.user);
      console.log('✅ Registration successful');
      return data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      // ✅ api.updateProfile() returns data directly
      const data = await api.updateProfile(profileData);
      
      if (data.user) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
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