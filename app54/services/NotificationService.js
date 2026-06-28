import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const scheduleTestReminderSequence = async () => {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert(
      'Notifications not allowed',
      'Please allow notifications so Check My Child can remind you to check in.'
    );
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check My Child',
      body: "It's time to check in. Tap 'I'm OK' if you're safe today.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check My Child',
      body: "Second reminder: you still need to check in today.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 20,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check My Child Alert',
      body: "Emergency test: [Parent Name] has not completed today's check-in. This could mean [Child Name] may need your help. Please try to contact [Parent Name] first. If you cannot reach them, follow the emergency plan they have shared with you.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 30,
    },
  });

  Alert.alert(
    'Test Sequence Set',
    'Two reminders and one emergency test alert will appear at 10, 20, and 30 seconds.'
  );
};