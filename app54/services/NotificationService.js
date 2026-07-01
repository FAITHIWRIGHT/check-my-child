import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const scheduleTestReminderSequence = async (safetyPlan) => {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert(
      'Notifications not allowed',
      'Please allow notifications so Check My Child can remind you to check in.'
    );
    return;
  }
  const parentName = safetyPlan?.parentName || '[Parent Name]';
const firstChild = safetyPlan?.children?.[0];

const childName = firstChild?.name || '[Child Name]';
const childDateOfBirth = firstChild?.dateOfBirth || 'Not provided';
const childNotes = firstChild?.notes || 'No notes added';

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
      body: `Emergency test: ${parentName} has not completed today's check-in. This could mean ${childName} may need your help. Date of birth: ${childDateOfBirth}. Notes: ${childNotes}. Please try to contact ${parentName} first. If you cannot reach them, follow the emergency plan they have shared with you.`,
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