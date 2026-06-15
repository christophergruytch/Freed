// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppState, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import useStore from './store/useStore';
import DailyCheckInModal from './components/DailyCheckInModal';
import CustomTabBar from './components/CustomTabBar';
import { 
  requestNotificationPermissions, 
  scheduleDailyReminder 
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

// Small animated overlay wrapper for premium Settings entrance (Reanimated)
function SettingsOverlay({ onClose }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 180 });
    scale.value = withSpring(1, { damping: 18, stiffness: 140 });
  }, []);

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 140 });
    scale.value = withTiming(0.97, { duration: 140 });
    setTimeout(onClose, 160);
  };

  return (
    <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' }, backdropStyle]}>
      <Animated.View style={[{ flex: 1 }, contentStyle]}>
        <SettingsScreen onClose={handleClose} />
      </Animated.View>
    </Animated.View>
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

      // Request notification permissions and schedule based on user settings
      const setupNotifications = async () => {
        const hasPermission = await requestNotificationPermissions();
        
        if (hasPermission) {
          const { 
            notificationsEnabled = true, 
            notificationTime = '20:00', 
            customNotificationMessage = '' 
          } = useStore.getState();
          
          await scheduleDailyReminder({
            enabled: notificationsEnabled,
            time: notificationTime,
            customMessage: customNotificationMessage,
          });
        } else {
          console.log("Notification permissions not granted.");
        }
      };
      setupNotifications();

      // Also check when app comes back to foreground
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          checkForNewDay();
        }
      });

      return () => subscription.remove();
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
                onOpenSettings={() => setShowSettings(true)} 
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