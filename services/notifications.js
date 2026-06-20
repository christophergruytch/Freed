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
 * Check if a time (HH:mm) falls within quiet hours.
 */
export function isTimeInQuietHours(time, quietHours) {
  if (!quietHours?.enabled) return false;
  if (!time || !quietHours.start || !quietHours.end) return false;

  const [h, m] = time.split(':').map(Number);
  const timeMinutes = h * 60 + m;

  const [sh, sm] = quietHours.start.split(':').map(Number);
  const startMinutes = sh * 60 + sm;

  const [eh, em] = quietHours.end.split(':').map(Number);
  const endMinutes = eh * 60 + em;

  if (startMinutes < endMinutes) {
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  } else {
    // overnight
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }
}

/**
 * Compute 1-2 smart times based on relapse data (high risk hours) or random.
 * Returns array of {hour, minute} objects.
 */
function getSmartReminderTimes(relapseHistory = [], max = 2) {
  const times = [];

  // Try to derive high-risk hours from relapse timestamps
  if (relapseHistory.length > 0) {
    const hourCounts = {};
    relapseHistory.forEach((r) => {
      if (r.timestamp) {
        const h = new Date(r.timestamp).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });

    const sortedHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([h]) => parseInt(h, 10));

    sortedHours.forEach((h) => {
      if (times.length < max) {
        times.push({ hour: h, minute: Math.floor(Math.random() * 60) });
      }
    });
  }

  // Fill remaining with random safe times (avoid night if possible, but keep simple)
  while (times.length < max) {
    const h = Math.floor(Math.random() * 24);
    // Bias away from very late night for motivational
    const minute = Math.floor(Math.random() * 60);
    times.push({ hour: h, minute });
  }

  return times;
}

/**
 * Schedule all reminders (daily + smart ones).
 * Respects quiet hours, daily limits, and notification types.
 */
export async function scheduleReminders({
  enabled = true,
  dailyTime = '20:00',
  customMessage = '',
  types = { daily: true, streak: true, journal: true, motivational: true },
  quietHours = { enabled: false, start: '22:00', end: '07:00' },
  relapseHistory = [],
}) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!enabled) {
    console.log('Notifications disabled.');
    return [];
  }

  const scheduledIds = [];
  let dailyScheduled = false;

  // 1. Daily reminder (if enabled)
  if (types.daily) {
    let time = dailyTime;
    if (!time || !time.includes(':')) time = '20:00';

    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    let minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) {
      hour = 20; minute = 0;
    }

    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    if (!isTimeInQuietHours(timeStr, quietHours)) {
      const body = customMessage?.trim() || "Take a moment to check in with yourself. You're doing great.";

      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Free'd",
            body,
            sound: true,
            data: { type: 'daily' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
        scheduledIds.push(id);
        dailyScheduled = true;
        console.log(`Daily reminder scheduled for ${timeStr}`);
      } catch (e) {
        console.error('Failed daily reminder', e);
      }
    }
  }

  // 2. Smart / additional reminders (streak, journal, motivational) - max 1-2 total
  const smartTypes = [];
  if (types.streak) smartTypes.push('streak');
  if (types.journal) smartTypes.push('journal');
  if (types.motivational) smartTypes.push('motivational');

  const smartTimes = getSmartReminderTimes(relapseHistory, 2);

  for (let i = 0; i < Math.min(smartTypes.length, smartTimes.length); i++) {
    const type = smartTypes[i];
    const { hour, minute } = smartTimes[i];
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    if (isTimeInQuietHours(timeStr, quietHours)) continue;

    let title = "Free'd";
    let body = "You're making progress. Keep going.";

    if (type === 'streak') {
      body = "You're building a strong streak. One day at a time.";
    } else if (type === 'journal') {
      body = "A quick journal entry can help process today's thoughts.";
    } else if (type === 'motivational') {
      // Simple variety - in real use caller can pass better, but hardcoded for now
      const motivationalBodies = [
        "You're stronger than the urge. Choose freedom today.",
        "Small steps lead to big freedom. You've got this.",
        "Every moment you choose differently builds your future self.",
      ];
      body = motivationalBodies[Math.floor(Math.random() * motivationalBodies.length)];
    }

    // data for deep linking
    const data = { type, screen: type === 'journal' ? 'Journal' : null };

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      scheduledIds.push(id);
      console.log(`${type} reminder scheduled at ${timeStr}`);
    } catch (e) {
      console.error(`Failed to schedule ${type}`, e);
    }

    // Hard limit: never more than ~3-4 total scheduled recurring
    if (scheduledIds.length >= 4) break;
  }

  return scheduledIds;
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// For testing - sends a notification 10 seconds from now (keeps "Test" title)
export async function sendTestNotificationIn10Seconds() {
  try {
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
