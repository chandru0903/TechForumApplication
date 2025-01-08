import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { DarkModeProvider } from './screens/Context/DarkMode';
import { userService } from './screens/services/UserService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './screens/Context/Authentication';

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


const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
    <DarkModeProvider>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="login"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current, next, layouts }) => {
            const translateX = current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0], 
            });

            return {
              cardStyle: {
                transform: [{ translateX }],
                opacity: current.progress, 
              },
            };
          },
          gestureEnabled: true, 
          gestureDirection: 'horizontal', 
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
