import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUserId();
  }, []);

  const loadStoredUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('id');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    } catch (error) {
      console.error('Failed to load stored user ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // First, log the request being sent
      console.log('Sending login request:', {
        url: `${apiUrl}/login.php`,
        email,
        // Don't log password for security
      });

      const response = await fetch(`${apiUrl}/login.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Log the raw response for debugging
      const rawResponse = await response.text();
      console.log('Raw server response:', rawResponse);

      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response that caused error:', rawResponse);
        return {
          success: false,
          message: 'Server returned invalid JSON response. Please check server logs.',
        };
      }

      if (data.success && data.userId) {
        await AsyncStorage.setItem('id', data.userId.toString());
        setUserId(data.userId.toString());
        return { success: true };
      }

      return { 
        success: false, 
        message: data.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: `Connection error: ${error.message}`,
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      setUserId(null);
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
    loadStoredUserId,
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