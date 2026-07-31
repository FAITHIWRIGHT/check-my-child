import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const scheduleDailyCheckInReminders = async (
  safetyPlan,
  startTomorrow = false
) => {
  const { status } =
    await Notifications.requestPermissionsAsync();

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

  const [checkInHour, checkInMinute] =
    safetyPlan.checkInTime
      .split(':')
      .map(Number);

  if (
    !Number.isInteger(checkInHour) ||
    !Number.isInteger(checkInMinute) ||
    checkInHour < 0 ||
    checkInHour > 23 ||
    checkInMinute < 0 ||
    checkInMinute > 59
  ) {
    Alert.alert(
      'Invalid Check-In Time',
      'Please review the daily check-in time in your Safety Plan.'
    );
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  console.log(
    '[REMINDERS] Existing notifications cancelled'
  );

  const getReminderTime = (hoursAfterCheckIn) => {
    const minutesInDay = 24 * 60;

    const totalMinutes =
      (
        checkInHour * 60 +
        checkInMinute +
        hoursAfterCheckIn * 60
      ) % minutesInDay;

    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    };
  };

  const reminderOneTime = getReminderTime(1);
  const reminderTwoTime = getReminderTime(2);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check My Child',
      body:
        "You haven't completed today's check-in. Please open the app and tap “I'm OK”.",
      sound: true,
    },
    trigger: {
      type:
        Notifications
          .SchedulableTriggerInputTypes
          .DAILY,
      hour: reminderOneTime.hour,
      minute: reminderOneTime.minute,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title:
        'Check My Child — Second Reminder',
      body:
        "Your daily check-in is still incomplete. Please open Check My Child and tap “I'm OK”.",
      sound: true,
    },
    trigger: {
      type:
        Notifications
          .SchedulableTriggerInputTypes
          .DAILY,
      hour: reminderTwoTime.hour,
      minute: reminderTwoTime.minute,
    },
  });

  const scheduled =
    await Notifications
      .getAllScheduledNotificationsAsync();

  console.log(
    '[REMINDERS] Daily reminders scheduled:',
    {
      checkInTime: safetyPlan.checkInTime,
      reminderOneTime,
      reminderTwoTime,
      totalScheduled: scheduled.length,
      startTomorrowRequested: startTomorrow,
    }
  );

  console.log(
    '[REMINDERS] Scheduled notification details:',
    scheduled
  );
};

export const cancelScheduledCheckInReminders =
  async () => {
    await Notifications
      .cancelAllScheduledNotificationsAsync();

    console.log(
      '[REMINDERS] All scheduled notifications cancelled'
    );
  };