import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const scheduleTestReminderSequence = async () => {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert(
      'Notifications Not Allowed',
      'Please allow notifications so Check My Child can remind you to check in.'
    );
    return;
  }

  // Clear any reminders left from an earlier test.
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check My Child',
      body: "You haven't completed today's check-in. Please tap “I'm OK” if you are safe.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check My Child — Second Reminder',
      body: "Your daily check-in is still incomplete. Please open Check My Child and tap “I'm OK”.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 120,
    },
  });
};

export const cancelScheduledCheckInReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};