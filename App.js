import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Import our screen components (we'll create them next)
import HomeScreen from './pages/HomeScreen';
import CheckInScreen from './pages/CheckInScreen';
import JournalScreen from './pages/JournalScreen';
import ProgressScreen from './pages/ProgressScreen';
import SettingsScreen from './pages/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,           // Hide default header
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="CheckIn"
          component={CheckInScreen}
          options={{ tabBarLabel: 'Check In' }}
        />
        <Tab.Screen
          name="Journal"
          component={JournalScreen}
          options={{ tabBarLabel: 'Journal' }}
        />
        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
          options={{ tabBarLabel: 'Progress' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}