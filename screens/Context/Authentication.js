import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadStoredUserId();
  }, []);

  // Existing functions remain the same
  const loadStoredUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        // Fetch profile data when userId is loaded
        await fetchUserProfile(storedUserId);
      }
    } catch (error) {
      console.error('Failed to load stored user ID:', error);
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
        await AsyncStorage.setItem('userId', data.userId.toString());
        setUserId(data.userId.toString());
        // Fetch profile data after successful login
        await fetchUserProfile(data.userId.toString());
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: `Connection error: ${error.message}`
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      setUserId(null);
      setUserProfile(null); // Clear profile data on logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // New function to fetch user profile
  const fetchUserProfile = async (currentUserId) => {
    try {
      const response = await fetch(`${apiUrl}/getUserProfile.php`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-ID': currentUserId, // Pass userId in header
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUserProfile(data.data);
        return data.data;
      } else {
        console.error('Failed to fetch profile:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // New function to update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${apiUrl}/updateProfile.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-ID': userId,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUserProfile(prevProfile => ({
          ...prevProfile,
          ...data.data
        }));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: `Connection error: ${error.message}`
      };
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
    userProfile, // Add userProfile to context
    login,
    logout,
    register,
    loadStoredUserId,
    setUserId,
    setIsLoading,
    fetchUserProfile, // Make fetchUserProfile available
    updateProfile, // Make updateProfile available
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