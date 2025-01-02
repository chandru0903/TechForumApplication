import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { DarkModeProvider } from './screens/Context/DarkMode';

import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import NotificationsScreen from './screens/NotificationsSettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <DarkModeProvider>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="HomeScreen"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current, next, layouts }) => {
            const translateX = current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, -5], // Smooth slide in
            });

            return {
              cardStyle: {
                transform: [{ translateX }],
                opacity: current.progress, // Smooth fade effect
              },
            };
          },
          gestureEnabled: true, // Enable gesture navigation for smooth transitions
          gestureDirection: 'horizontal', // Horizontal swipe gesture
        }}
      >
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: 'Edit Profile' }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          />
      </Stack.Navigator>
    </NavigationContainer>
    </DarkModeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Full screen usage
    backgroundColor: '#1E252B',
  },
});
