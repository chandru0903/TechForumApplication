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
        
        // Check if token needs to be refreshed
        await refreshAuthTokenIfNeeded(storedToken);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuthTokenIfNeeded = async (token) => {
    try {
      const tokenExpiryDate = await AsyncStorage.getItem('tokenExpiryDate');
      const expiryDate = new Date(tokenExpiryDate);
      const currentDate = new Date();

      // Check if token is nearing expiration (e.g., within 7 days)
      if (expiryDate - currentDate < 7 * 24 * 60 * 60 * 1000) {
        // Call API to refresh token
        const response = await fetch(`${apiUrl}/refresh-token.php`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.success && data.newToken) {
          await AsyncStorage.setItem('authToken', data.newToken);
          await AsyncStorage.setItem('tokenExpiryDate', new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()); // 6 months expiry
          setAuthToken(data.newToken);
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
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
        const expiryDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 months expiry
        
        await Promise.all([
          AsyncStorage.setItem('userId', data.userId.toString()),
          AsyncStorage.setItem('authToken', token),
          AsyncStorage.setItem('tokenExpiryDate', expiryDate.toISOString())
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
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('tokenExpiryDate')
      ]);
      setUserId(null);
      setAuthToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await fetch(`${apiUrl}/register.php`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        console.error(`Response Body: ${errorMessage}`);
        return { success: false, message: `Server error: ${response.statusText}` };
      }

      const data = await response.json();

      if (!data.success) {
        console.error('Server Response:', data);
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: `Connection error: ${error.message}` };
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