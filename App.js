import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { DarkModeProvider } from './screens/Context/DarkMode';
import { userService } from './screens/services/UserService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './screens/Context/Authentication';
import { Easing } from 'react-native-reanimated';


// Import all screens
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import NotificationsScreen from './screens/NotificationsSettingsScreen';
import CommunityScreen from './screens/CommunityScreen';
import WritePostScreen from './screens/WritePostScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReportScreen from './screens/ReportScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import Login from './screens/login';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPassword from './screens/ForgotPassword';
import EmailVerification from './screens/EmailVerification';
import ForgotPasswordChange from './screens/ForgotPasswordChange';
import SavedScreen from './screens/SavedScreen';
import CommunitiesScreen from './screens/CommunitiesScreen';
import RegisterEmailVerify from './screens/RegisterEmailVerify';
import ForumScreen from './screens/ForumScreen';
import SearchScreen from './screens/SearchScreen';
// Import Loading Screen component

import LoadingScreen from './screens/LoadingScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('login');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (isLoggedIn === 'true' && authToken) {
        setInitialRoute('HomeScreen');
      } else {
        setInitialRoute('login');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Initialization error:', error);
      setInitialRoute('login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen isVisible={true} />;
  }

  return (
    <AuthProvider>
      <DarkModeProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
    cardStyleInterpolator: ({ current, layouts }) => {
      const translateX = current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [layouts.screen.width, 0], // From off-screen to on-screen
      });

      const opacity = current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 2], 
      });

      return {
        cardStyle: {
          transform: [{ translateX }],
          opacity,
        },
      };
    },
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: 450, // Adjust duration for smoothness
          easing: Easing.out(Easing.cubic), // Cubic easing for smooth acceleration and deceleration
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 450,
          easing: Easing.out(Easing.cubic),
        },
      },
    },
  }}
>
            <Stack.Screen name="Community" component={CommunityScreen}/>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen}/>
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile"component={EditProfileScreen} options={{ title: 'Edit Profile' }}/>
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen}/>
            <Stack.Screen name="WritePost" component={WritePostScreen}/>
            <Stack.Screen name="Profile" component={ProfileScreen}/>
            <Stack.Screen name="Report" component={ReportScreen}/>
            <Stack.Screen name="Welcome" component={WelcomeScreen}/>
            <Stack.Screen name="login" component={Login}/>
            <Stack.Screen name="Register" component={RegisterScreen}/>
            <Stack.Screen name="ForgotPassword" component={ForgotPassword}/>
            <Stack.Screen name="EmailVerification" component={EmailVerification}/>
            <Stack.Screen name="ForgotPasswordChange" component={ForgotPasswordChange}/>
            <Stack.Screen name="Saved" component={SavedScreen}/>
            <Stack.Screen name="Communities" component={CommunitiesScreen}/>
            <Stack.Screen name="RegisterEmailVerify" component={RegisterEmailVerify}/>
            <Stack.Screen name="Forum" component={ForumScreen}/>
          
            <Stack.Screen name="Search" component={SearchScreen}/>
          </Stack.Navigator>
        </NavigationContainer>
      </DarkModeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#1E252B',
  },
});