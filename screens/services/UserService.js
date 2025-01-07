// services/userService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'YOUR_API_BASE_URL'; // e.g., 'https://api.yourapp.com/v1'

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const userService = {
  // Block a user
  blockUser: async (userIdToBlock) => {
    try {
      // Get the auth token
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        throw new ApiError('Authentication required', 401);
      }

      // Make the API call
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/users/block`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          blockedUserId: userIdToBlock,
          timestamp: new Date().toISOString(),
        }
      });

      // Update local storage to maintain blocked users list
      const blockedUsers = JSON.parse(await AsyncStorage.getItem('blockedUsers') || '[]');
      blockedUsers.push(userIdToBlock);
      await AsyncStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));

      return response.data;
    } catch (error) {
      if (error.response) {
        // Handle specific API errors
        switch (error.response.status) {
          case 400:
            throw new ApiError('Invalid request', 400);
          case 401:
            throw new ApiError('Unauthorized', 401);
          case 403:
            throw new ApiError('You don\'t have permission to block this user', 403);
          case 404:
            throw new ApiError('User not found', 404);
          case 429:
            throw new ApiError('Too many requests, please try again later', 429);
          default:
            throw new ApiError('Failed to block user', error.response.status);
        }
      }
      throw new ApiError('Network error, please check your connection', 0);
    }
  },

  // Check if a user is blocked
  isUserBlocked: async (userId) => {
    try {
      const blockedUsers = JSON.parse(await AsyncStorage.getItem('blockedUsers') || '[]');
      return blockedUsers.includes(userId);
    } catch (error) {
      console.error('Error checking blocked status:', error);
      return false;
    }
  },

  // Unblock a user
  unblockUser: async (userIdToUnblock) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        throw new ApiError('Authentication required', 401);
      }

      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/users/unblock`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          unblockedUserId: userIdToUnblock,
          timestamp: new Date().toISOString(),
        }
      });

      // Update local storage
      const blockedUsers = JSON.parse(await AsyncStorage.getItem('blockedUsers') || '[]');
      const updatedBlockedUsers = blockedUsers.filter(id => id !== userIdToUnblock);
      await AsyncStorage.setItem('blockedUsers', JSON.stringify(updatedBlockedUsers));

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new ApiError(error.response.data.message || 'Failed to unblock user', error.response.status);
      }
      throw new ApiError('Network error, please check your connection', 0);
    }
  }
};