import * as Notifications from 'expo-notifications';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, View, Text } from 'react-native';

import Header from './components/Header';
import StatusCard from './components/StatusCard';
import CheckInButton from './components/CheckInButton';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function App() {
  const [lastCheckIn, setLastCheckIn] = useState('Not checked in yet');
  const [isProtected, setIsProtected] = useState(false);
  const scheduleTestReminder = async () => {
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
    body: "Second reminder: We still haven't received your check-in. Please tap 'I'm OK' if you're safe today.",
    sound: true,
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 20,
  },
  });
  // Emergency escalation test
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Check My Child Alert',
    body: "Emergency escalation commencing: Faith has not completed today's check-in. This could mean Kassidy may need your help. Please try to contact Faith first. If you cannot reach her, follow the emergency plan she has shared with you to ensure Kassidy's safety.",
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

  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLastCheckIn(`Today at ${now}`);
    setIsProtected(true);

    Alert.alert(
      'Check-In Successful',
      'You have checked in successfully. Your child is protected today. 💚'
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <Text style={styles.subtitle}>
        Welcome to the first version of our app.
      </Text>

      <Text style={styles.message}>
        Complete your daily check-in to confirm you're safe. If a check-in is missed, your emergency plan can begin, helping ensure your child is not left without support.
       </Text>

      <View style={styles.statusContainer}>
      <CheckInButton onCheckIn={scheduleTestReminder} />
    
      <StatusCard
        isProtected={isProtected}
        lastCheckIn={lastCheckIn}
      />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF7FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  subtitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
  }.color = '#555',
  statusContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
});