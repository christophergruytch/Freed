import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should behave when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus, ios } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // On iOS, we need to explicitly request alert + sound permissions
  if (existingStatus !== 'granted' || (Platform.OS === 'ios' && ios && !ios.allowsAlert)) {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Notifications are needed for daily reminders and encouragement.');
    return false;
  }

  return true;
}

export async function getNotificationPermissionStatus() {
  const permissions = await Notifications.getPermissionsAsync();
  
  // On iOS, return more detailed info
  if (Platform.OS === 'ios' && permissions.ios) {
    return {
      status: permissions.status,
      allowsAlert: permissions.ios.allowsAlert,
      allowsSound: permissions.ios.allowsSound,
      allowsBadge: permissions.ios.allowsBadge,
    };
  }
  
  return permissions.status;
}

/**
 * Schedule the daily reminder based on user settings.
 * @param {Object} options
 * @param {boolean} options.enabled
 * @param {string} options.time - "HH:mm"
 * @param {string} options.customMessage - optional custom body
 */
export async function scheduleDailyReminder({ enabled, time, customMessage }) {
  // Always cancel existing notifications first to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!enabled) {
    console.log("Daily reminders are disabled.");
    return null;
  }

  // Basic validation for time format
  if (!time || !time.includes(':')) {
    console.warn("Invalid notification time format. Using default 20:00.");
    time = '20:00';
  }

  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    console.warn("Invalid hour/minute. Defaulting to 20:00");
    return scheduleDailyReminder({ enabled: true, time: '20:00', customMessage });
  }

  const defaultBody = "Take a moment to check in with yourself. You're doing great.";

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Check-in",
        body: customMessage?.trim() ? customMessage.trim() : defaultBody,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log(`Daily reminder scheduled for ${time}. ID: ${identifier}`);
    return identifier;
  } catch (error) {
    console.error("Failed to schedule daily reminder:", error);
    
    // Give more helpful error if it's a trigger format issue
    if (error.message?.includes('trigger')) {
      alert("Failed to schedule notification due to an internal configuration issue. Please restart the app and try again.");
    } else {
      alert("Failed to schedule notification. Please check your notification permissions.");
    }
    return null;
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// For testing - sends a notification 10 seconds from now
export async function sendTestNotificationIn10Seconds() {
  try {
    // Always try to ensure we have permissions before scheduling
    const hasPermission = await requestNotificationPermissions();
    
    if (!hasPermission) {
      alert("Notification permission was not granted. Please enable notifications for this app in your device Settings.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification scheduled from the app. It should appear in ~10 seconds.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
      },
    });
    
    alert("Test notification scheduled!\n\nIt should appear in about 10 seconds.\n\nIf you don't see it, make sure the app is allowed to show notifications in your device Settings, then try again.");
  } catch (error) {
    console.error("Failed to schedule test notification:", error);
    alert("Failed to schedule test notification. Please check your notification permissions in device settings and try again.");
  }
}
