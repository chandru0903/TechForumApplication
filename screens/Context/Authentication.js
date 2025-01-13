import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  useEffect(() => {
    loadStoredAuth();
  }, []);
 
  const loadStoredAuth = async () => {
    try {
      const [storedUserId, storedToken] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('authToken')
      ]);
      
      if (storedUserId && storedToken) {
        setUserId(storedUserId);
        setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${apiUrl}/login.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.userId) {
        const token = data.token || `temp-token-${Date.now()}`;
        
        await Promise.all([
          AsyncStorage.setItem('userId', data.userId.toString()),
          AsyncStorage.setItem('authToken', token)
        ]);
        
        setUserId(data.userId.toString());
        setAuthToken(token);
        
        return { success: true, userId: data.userId };
      }

      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('userId'),
        AsyncStorage.removeItem('authToken')
      ]);
      setUserId(null);
      setAuthToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await fetch(`${apiUrl}/register.php`, {  // Corrected template literal
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      // Check if the response status indicates an error
      if (!response.ok) {
        const errorMessage = await response.text(); // Read the full response text for debugging
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        console.error(`Response Body: ${errorMessage}`);
        return { success: false, message: `Server error: ${response.statusText}` };  // Corrected string interpolation
      }

      const data = await response.json();

      // Check if the server indicates success
      if (!data.success) {
        console.error('Server Response:', data);
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: `Connection error: ${error.message}` };  // Corrected string interpolation
    }
  };

  const value = {
    userId,
    isLoading,
    login,
    logout,
    register,
    loadStoredAuth,
    setUserId,
    setIsLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
