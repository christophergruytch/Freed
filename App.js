// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useStore from './store/useStore';

import HomeScreen from './pages/HomeScreen';
import CheckInScreen from './pages/CheckInScreen';
import JournalScreen from './pages/JournalScreen';
import ProgressScreen from './pages/ProgressScreen';
import SettingsScreen from './pages/SettingsScreen';
import EducationScreen from './pages/EducationScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const loadAllData = useStore((state) => state.loadAllData);

  // Load data once when app starts
  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Check In" component={CheckInScreen} />
        <Tab.Screen name="Journal" component={JournalScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Education" component={EducationScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}