import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDarkMode } from './Context/DarkMode'; // Import the dark mode context

const ChangePasswordScreen = () => {
  const { darkMode } = useDarkMode(); // Get dark mode state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    Alert.alert('Success', 'Password changed successfully.');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={[styles.headerText, { color: textColor }]}>Change Password</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: textColor }]}>Current Password</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor={darkMode ? '#ccc' : '#888'}
        />

        <Text style={[styles.label, { color: textColor }]}>New Password</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={darkMode ? '#ccc' : '#888'}
        />

        <Text style={[styles.label, { color: textColor }]}>Confirm Password</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={darkMode ? '#ccc' : '#888'}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
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
