import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useDarkMode } from './Context/DarkMode';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const SettingsScreen = ({ navigation }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';

  const handleLogout = async (navigation) => {
    try {
      // Show confirmation dialog
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Logout",
            onPress: async () => {
              try {
                // Clear all stored tokens
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('refreshToken');
                
                // Clear user data
                await AsyncStorage.removeItem('userData');
                
                // Clear any other app-specific stored data
                await AsyncStorage.multiRemove([
                  'settings',
                  'preferences',
                  'lastLoginDate',
                  // Add any other keys you need to clear
                ]);
                
                // Optional: Clear any realm/sqlite database if you're using one
                // await clearDatabase();
                
                // Optional: Revoke the token on the server
                await revokeTokenOnServer();
                
                // Navigate to login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
                
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert(
                  "Error",
                  "Failed to logout. Please try again.",
                  [{ text: "OK" }]
                );
              }
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        "Error",
        "An unexpected error occurred.",
        [{ text: "OK" }]
      );
    }
  };
  
  // Optional: Function to revoke token on server
  const revokeTokenOnServer = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await fetch('YOUR_API_ENDPOINT/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to revoke token');
        }
      }
    } catch (error) {
      console.error('Token revocation error:', error);
      // Continue with logout even if token revocation fails
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={[styles.headerText, { color: textColor }]}>Settings</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={require('./assets/Profile.png')}
          style={styles.profileImage}
        />
        <Text style={[styles.profileName, { color: textColor }]}>Chandru</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#757575' }]}>Account Settings</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={[styles.rowText, { color: textColor }]}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={[styles.rowText, { color: textColor }]}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={[styles.rowText, { color: textColor }]}>Notification Settings</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: textColor }]}>Dark mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#757575' }]}>More</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('AboutUs')}
        >
          <Text style={[styles.rowText, { color: textColor }]}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Text style={[styles.rowText, { color: textColor }]}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('TermsConditions')}
        >
          <Text style={[styles.rowText, { color: textColor }]}>Terms and Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => handleLogout(navigation)}
        >
          <View style={styles.logoutContainer}>
            <MaterialIcons
              name="logout"
              size={24}
              color={textColor}
              style={styles.logoutIcon}
            />
            <Text style={[styles.rowText, { color: textColor }]}>Log out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginHorizontal: 15,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  rowText: {
    fontSize: 16,
  },
  logoutContainer: {
    marginTop: 150,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  }
});

export default SettingsScreen;