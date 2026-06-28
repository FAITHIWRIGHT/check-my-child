import WelcomeScreen from './components/WelcomeScreen';
import SetupForm from './components/SetupForm';
import { scheduleTestReminderSequence } from './services/NotificationService';
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
  const [currentScreen, setCurrentScreen] = useState('welcome');
 
const handleSetupSave = (data) => {
  console.log(data);

  Alert.alert(
    'Safety Plan Saved',
    `Welcome ${data.parentName}! Your safety plan has been saved.`,
    [
      {
        text: 'Continue',
        onPress: () => setCurrentScreen('home'),
      },
    ]
  );
};
  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLastCheckIn(`Today at ${now}`);
    setIsProtected(true);
    scheduleTestReminderSequence();

    Alert.alert(
      'Check-In Successful',
      'You have checked in successfully. Your child is protected today. 💚'
    );
  };
  if (currentScreen === 'welcome') {
  return <WelcomeScreen onBegin={() => setCurrentScreen('setup')} />;
}

if (currentScreen === 'setup') {
  return (
    <View style={styles.container}>
      <SetupForm onSave={handleSetupSave} />
    </View>
  );
}

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
      <CheckInButton onCheckIn={handleCheckIn} />
    
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