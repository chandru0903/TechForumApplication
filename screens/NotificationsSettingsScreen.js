import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useDarkMode } from './Context/DarkMode'; // Import the dark mode context

const NotificationSettingsScreen = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [vibrate, setVibrate] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { darkMode } = useDarkMode(); // Get dark mode state

  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={[styles.headerText, { color: textColor }]}>Notification Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#757575' }]}>Push Notifications</Text>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: textColor }]}>Enable push notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
        </View>
        
        <Text style={[styles.sectionTitle, { color: '#757575' }]}>Sound Notifications</Text>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: textColor }]}>Enable sound for notifications</Text>
          <Switch
            value={soundNotifications}
            onValueChange={setSoundNotifications}
          />
        </View>
        
        <Text style={[styles.sectionTitle, { color: '#757575' }]}>Vibrate</Text>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: textColor }]}>Enable vibration for notifications</Text>
          <Switch
            value={vibrate}
            onValueChange={setVibrate}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: '#757575' }]}>Email Notifications</Text>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: textColor }]}>Enable email notifications</Text>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={() => alert('Settings saved!')}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 13,
    marginVertical: 10,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#003f8a',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationSettingsScreen;
