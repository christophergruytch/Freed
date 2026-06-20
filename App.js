// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppState, View, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Feather } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import useStore from './store/useStore';
import DailyCheckInModal from './components/DailyCheckInModal';
import CustomTabBar from './components/CustomTabBar';
import { 
  requestNotificationPermissions, 
  scheduleReminders 
} from './services/notifications';

import OnboardingScreen from './pages/OnboardingScreen';
import HomeScreen from './pages/HomeScreen';
import JournalScreen from './pages/JournalScreen';
import ProgressScreen from './pages/ProgressScreen';
import SettingsScreen from './pages/SettingsScreen';
import EducationScreen from './pages/EducationScreen';
import CommunityScreen from './pages/CommunityScreen';
import FacingTemptationScreen from './pages/FacingTemptationScreen';
import ProfileScreen from './pages/ProfileScreen';
import { theme } from './theme';

const Tab = createBottomTabNavigator();

// Simple non-animated full-screen wrapper for Settings (no Reanimated animation per request)
function SettingsOverlay({ onClose }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.background }}>
      <SettingsScreen onClose={onClose} />
    </View>
  );
}

export default function App() {
  const { hasCompletedOnboarding, activeDays, addActiveDay } = useStore();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemptation, setShowTemptation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const checkForNewDay = () => {
    // Use local date, not UTC (toISOString can shift the day in some timezones)
    const today = new Date();
    const dateStr = 
      today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');

    if (!activeDays.includes(dateStr)) {
      addActiveDay(dateStr);
      setShowCheckInModal(true);
    }
  };

  useEffect(() => {
    if (hasCompletedOnboarding) {
      // Check on initial mount
      checkForNewDay();

      // Request notification permissions and schedule based on user settings + data
      const setupNotifications = async () => {
        const hasPermission = await requestNotificationPermissions();
        
        if (hasPermission) {
          const state = useStore.getState();
          const { 
            notificationsEnabled = true, 
            notificationTime = '20:00', 
            customNotificationMessage = '',
            quietHours,
            notificationTypes,
            relapseHistory = [],
          } = state;
          
          await scheduleReminders({
            enabled: notificationsEnabled,
            dailyTime: notificationTime,
            customMessage: customNotificationMessage,
            types: notificationTypes || { daily: true, streak: true, journal: true, motivational: true },
            quietHours: quietHours || { enabled: false, start: '22:00', end: '07:00' },
            relapseHistory,
          });
        } else {
          console.log("Notification permissions not granted.");
        }
      };
      setupNotifications();

      // Handle notification taps for deep linking (e.g. open Journal)
      const notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data || {};
        if (data.screen === 'Journal') {
          console.log('User tapped journal notification - open Journal tab');
        }
        console.log('Notification tapped with data:', data);
      });

      // Also check when app comes back to foreground
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          checkForNewDay();
          setupNotifications();
        }
      });

      return () => {
        subscription.remove();
        if (notificationSubscription) notificationSubscription.remove();
      };
    }
  }, [hasCompletedOnboarding, activeDays]);

  const closeCheckInModal = () => {
    setShowCheckInModal(false);
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <SafeAreaProvider>
      <>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
          >
            <Tab.Screen 
              name="Home" 
              children={() => <HomeScreen 
                onOpenTemptation={() => setShowTemptation(true)} 
                onOpenProfile={() => setShowProfile(true)} 
              />} 
            />
            <Tab.Screen name="Journal" component={JournalScreen} />
            <Tab.Screen name="Insights" component={ProgressScreen} />
            <Tab.Screen name="Support" component={CommunityScreen} />
            <Tab.Screen name="Learn" component={EducationScreen} />
          </Tab.Navigator>
        </NavigationContainer>

        <DailyCheckInModal
          visible={showCheckInModal}
          onClose={closeCheckInModal}
          activeDays={activeDays}
        />

        {showSettings && (
          <SettingsOverlay onClose={() => setShowSettings(false)} />
        )}

        {showTemptation && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' }}>
            <FacingTemptationScreen onClose={() => setShowTemptation(false)} />
          </View>
        )}

        {showProfile && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.background }}>
            <ProfileScreen
              onClose={() => setShowProfile(false)}
              onOpenSettings={() => {
                setShowProfile(false);
                setShowSettings(true);
              }}
            />
          </View>
        )}
      </>
    </SafeAreaProvider>
  );
}