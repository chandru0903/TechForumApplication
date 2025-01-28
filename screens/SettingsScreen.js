import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  Switch,  
} from 'react-native';
import { useDarkMode } from './Context/DarkMode';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './Context/Authentication'; // Make sure to import useAuth
import { useFocusEffect } from '@react-navigation/native';

const SettingsScreen = ({ navigation }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { logout: authLogout } = useAuth(); // Get logout function from auth context
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';
  const [profileData, setProfileData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add animated values
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);

  const handleLogout = async () => {
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
              // Keys to be removed from AsyncStorage
              const keysToRemove = [
                'userId',
                'authToken',
                'userToken',
                'refreshToken',
                'isLoggedIn',
                'tempEmail',
                'tempPassword',
                'userData',
                'profileData',
                'userEmail'
              ];
  
              // Clear all auth-related data from AsyncStorage
              await AsyncStorage.multiRemove(keysToRemove);
              
              // Call auth context logout
              await authLogout();
  
              // Reset navigation to login screen
              navigation.reset({
                index: 0,
                routes: [{ 
                  name: 'login',
                  params: { animated: true }
                }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(
                "Error",
                "Failed to logout. Please try again."
              );
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const fetchProfileData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }
      
      const response = await fetch('http://192.168.151.27/TechForum/backend/profile.php?id=' + userId);
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setProfileData(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Automatically fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchProfileData(); // Call the API when the screen is focused
    }, [])
  );

  // Initial fetch when the screen loads for the first time
  useEffect(() => {
    fetchProfileData();
  }, []);


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
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor },
        {
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim
          }]
        }
      ]}
    >
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={[styles.headerText, { color: textColor }]}>Settings</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={profileData?.profile_image ? { uri: profileData.profile_image } : require('./assets/Profile.png')}
          style={styles.profileImage}
        />
        <Text style={[styles.profileName, { color: textColor }]}>
          {profileData?.full_name || profileData?.username || 'Loading...'} 
        </Text>
      </View>
      
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C5CE7"
            colors={['#6C5CE7']}
            progressBackgroundColor={darkMode ? '#555' : '#fff'}
          />
        }
      >
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
      </ScrollView>

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
        onPress={handleLogout}
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
    </Animated.View>
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
  mainScroll: {
    flex: 1,
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