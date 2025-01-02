import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useDarkMode } from './Context/DarkMode'; // Import the dark mode context

const SettingsScreen = ({ navigation }) => {
  const { darkMode, toggleDarkMode } = useDarkMode(); // Get dark mode state and toggle function
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={[styles.headerText, { color: textColor }]}>Settings</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={require('./assets/Profile.png')} // Use the local image
          style={styles.profileImage}
        />
        <Text style={[styles.profileName, { color: textColor }]}>Chandru</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#757575' }]}>Account Settings</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('EditProfile')} // Navigate to EditProfile
        >
          <Text style={[styles.rowText, { color: textColor }]}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('ChangePassword')} // Navigate to ChangePassword screen
        >
          <Text style={[styles.rowText, { color: textColor }]}>Change Password</Text>
        </TouchableOpacity>

        
        
               <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Notifications')} // Navigate to NotificationSettings screen
        >
          <Text style={[styles.rowText, { color: textColor }]}>Notification Settings</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: textColor }]}>Dark mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode} // Toggle dark mode on value change
          />
        </View>
        
        
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#757575' }]}>More</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('AboutUs')} // Navigate to About Us screen
        >
          <Text style={[styles.rowText, { color: textColor }]}>About Us</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('PrivacyPolicy')} // Navigate to Privacy Policy screen
        >
          <Text style={[styles.rowText, { color: textColor }]}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('TermsConditions')} // Navigate to Terms and Conditions screen
        >
          <Text style={[styles.rowText, { color: textColor }]}>Terms and Conditions</Text>
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
});

export default SettingsScreen;
