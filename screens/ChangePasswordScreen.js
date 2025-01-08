import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDarkMode } from './Context/DarkMode'; // Import the dark mode context

const ChangePasswordScreen = () => {
  const { darkMode } = useDarkMode(); // Get dark mode state
  const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [userId] = useState('1'); 

  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    try {
      const result = await api.changePassword(userId, currentPassword, newPassword);
      if (result.success) {
        Alert.alert('Success', 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', 'Current password is incorrect');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    }
  };

  const handleSave = async () => {
    try {
      const profileData = {
        full_name: name,
        username,
        bio,
        website,
        profile_image: profileImage,
        social_links: JSON.stringify(socialLinks),
      };
      
      const result = await api.updateProfile(userId, profileData);
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating profile');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
      <Text style={[styles.sectionHeader, themeStyles.text]}>Change Password</Text>
      </View>
<TextInput
  style={[styles.input, themeStyles.input]}
  value={currentPassword}
  onChangeText={setCurrentPassword}
  placeholder="Current Password"
  placeholderTextColor={themeStyles.placeholder}
  secureTextEntry
/>
<TextInput
  style={[styles.input, themeStyles.input]}
  value={newPassword}
  onChangeText={setNewPassword}
  placeholder="New Password"
  placeholderTextColor={themeStyles.placeholder}
  secureTextEntry
/>
<TextInput
  style={[styles.input, themeStyles.input]}
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  placeholder="Confirm New Password"
  placeholderTextColor={themeStyles.placeholder}
  secureTextEntry
/>
<TouchableOpacity style={styles.changePasswordButton} onPress={handlePasswordChange}>
  <Text style={styles.changePasswordButtonText}>Change Password</Text>
</TouchableOpacity>
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
  form: {
    padding: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#003f8a',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
