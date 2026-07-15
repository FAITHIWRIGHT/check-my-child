import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const scheduleDailyCheckInReminders = async (
  safetyPlan,
  startTomorrow = false
) => {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert(
      'Notifications Not Allowed',
      'Please allow notifications so Check My Child can remind you to check in.'
    );
    return;
  }

  if (!safetyPlan?.checkInTime) {
    Alert.alert(
      'Check-In Time Missing',
      'Please add your usual daily check-in time to your Safety Plan.'
    );
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hour, minute] = safetyPlan.checkInTime
    .split(':')
    .map(Number);

  const now = new Date();

  const reminderOneDate = new Date();
  reminderOneDate.setHours(hour + 2, minute, 0, 0);

  const reminderTwoDate = new Date();
  reminderTwoDate.setHours(hour + 4, minute, 0, 0);

  if (startTomorrow) {
  reminderOneDate.setDate(reminderOneDate.getDate() + 1);
  reminderTwoDate.setDate(reminderTwoDate.getDate() + 1);
} else {
  if (reminderOneDate <= now) {
    reminderOneDate.setDate(reminderOneDate.getDate() + 1);
  }

  if (reminderTwoDate <= now) {
    reminderTwoDate.setDate(reminderTwoDate.getDate() + 1);
  }
}

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check My Child',
      body: "You haven't completed today's check-in. Please open the app and tap “I'm OK”.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderOneDate,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check My Child — Second Reminder',
      body: "Your daily check-in is still incomplete. Please open Check My Child and tap “I'm OK”.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderTwoDate,
    },
  });

  console.log(
    'Daily reminders scheduled:',
    reminderOneDate,
    reminderTwoDate
  );
};

export const cancelScheduledCheckInReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};