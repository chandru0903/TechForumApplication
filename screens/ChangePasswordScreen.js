import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDarkMode } from './Context/DarkMode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePasswordScreen = () => {
  const { darkMode } = useDarkMode();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const themeStyles = darkMode
    ? {
        container: { backgroundColor: '#333' },
        text: { color: '#fff' },
        input: { backgroundColor: '#444', borderColor: '#555', color: '#fff' },
        placeholder: '#aaa',
        header: { color: '#fff' },
        button: { backgroundColor: '#555' },
        buttonText: { color: '#fff' },
      }
    : {
        container: { backgroundColor: '#f9f9f9' },
        text: { color: '#000' },
        input: { backgroundColor: '#fff', borderColor: '#ddd', color: '#000' },
        placeholder: '#666',
        header: { color: '#003f8a' },
        button: { backgroundColor: '#003f8a' },
        buttonText: { color: '#fff' },
      };

      const handlePasswordChange = async () => {
        // Input validation
        if (!currentPassword || !newPassword || !confirmPassword) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
      
        if (newPassword !== confirmPassword) {
          Alert.alert('Error', 'New passwords do not match');
          return;
        }
      
        if (newPassword.length < 6) {
          Alert.alert('Error', 'New password must be at least 6 characters long');
          return;
        }
      
        try {
          const userId = await AsyncStorage.getItem('userId');
          
          const response = await fetch('http://192.168.151.27/TechForum/backend/change_password.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              current_password: currentPassword,
              new_password: newPassword
            }),
          });
      
          const data = await response.json();
      
          if (data.success) {
            Alert.alert('Success', data.message);
            // Clear inputs after successful change
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          } else {
            Alert.alert('Error', data.message);
          }
        } catch (error) {
          console.error('Password change error:', error);
          Alert.alert('Error', 'Failed to change password. Please try again.');
        }
        navigation.goBack();
      };
  return (
    <View style={[styles.container, themeStyles.container]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, themeStyles.header]}>Change Password</Text>
      </View>
      <View style={styles.form}>
        <Text style={[styles.label, themeStyles.text]}>Current Password</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor={themeStyles.placeholder}
          secureTextEntry
        />
        <Text style={[styles.label, themeStyles.text]}>New Password</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={themeStyles.placeholder}
          secureTextEntry
        />
        <Text style={[styles.label, themeStyles.text]}>Confirm New Password</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={themeStyles.placeholder}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.saveButton, themeStyles.button]} onPress={handlePasswordChange}>
          <Text style={[styles.saveButtonText, themeStyles.buttonText]}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;