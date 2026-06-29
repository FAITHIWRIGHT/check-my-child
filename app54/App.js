import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './components/WelcomeScreen';
import SetupForm from './components/SetupForm';
import { scheduleTestReminderSequence } from './services/NotificationService';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect } from 'react';
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
  const [safetyPlan, setSafetyPlan] = useState(null);
  useEffect(() => {
  const checkSetupStatus = async () => {
    const hasCompletedSetup = await AsyncStorage.getItem('hasCompletedSetup');

    if (hasCompletedSetup === 'true') {
  const savedPlan = await AsyncStorage.getItem('safetyPlan');

  if (savedPlan) {
    setSafetyPlan(JSON.parse(savedPlan));
  }

  setCurrentScreen('home');
}
  };

  checkSetupStatus();
}, []);
 
const handleSetupSave = async (data) => {
  try {
    await AsyncStorage.setItem('safetyPlan', JSON.stringify(data));
    await AsyncStorage.setItem('hasCompletedSetup', 'true');
    setSafetyPlan(data);

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
  } catch (error) {
    Alert.alert(
      'Save Error',
      'Something went wrong while saving your Safety Plan.'
    );
  }
};
const resetApp = async () => {
  await AsyncStorage.removeItem('safetyPlan');
  await AsyncStorage.removeItem('hasCompletedSetup');

  setCurrentScreen('welcome');

  Alert.alert(
    'App Reset',
    'The saved Safety Plan has been cleared for testing.'
  );
};
const checkSavedPlan = async () => {
  const savedPlan = await AsyncStorage.getItem('safetyPlan');

  Alert.alert(
    'Saved Safety Plan',
    savedPlan ? savedPlan : 'No Safety Plan found'
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
  {safetyPlan?.parentName
    ? `Welcome, ${safetyPlan.parentName} 👋`
    : 'Welcome to Check My Child'}
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
      <Text style={styles.resetText} onPress={resetApp}>
    Developer Reset
  </Text>
  <Text style={styles.resetText} onPress={checkSavedPlan}>
  Check Saved Plan
</Text>
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
  resetText: {
  marginTop: 20,
  color: '#0077CC',
  fontSize: 14,
  textDecorationLine: 'underline',
  fontWeight: '600',
},
});