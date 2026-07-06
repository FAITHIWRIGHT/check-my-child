import { auth } from './firebase/firebaseconfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { db } from './firebase/firebaseconfig';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './components/WelcomeScreen';
import SetupForm from './components/SetupForm';
import { scheduleTestReminderSequence } from './services/NotificationService';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, View, Text, Image } from 'react-native';

import Header from './components/Header';
import StatusCard from './components/StatusCard';
import CheckInButton from './components/CheckInButton';
import SafetyPlanView from './components/SafetyPlanView';
import AuthScreen from './components/AuthScreen';

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
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);

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

  const timer = setTimeout(() => {
    setShowSplash(false);
  }, 2000);

  return () => clearTimeout(timer);
}, []);
const loadSafetyPlanForUser = async (signedInUser) => {
  try {
    const q = query(
      collection(db, 'safetyPlans'),
      where('userId', '==', signedInUser.uid)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const planData = querySnapshot.docs[0].data();

      setSafetyPlan(planData);
      await AsyncStorage.setItem('safetyPlan', JSON.stringify(planData));
      await AsyncStorage.setItem('hasCompletedSetup', 'true');

      setCurrentScreen('home');
    } else {
      setCurrentScreen('setup');
    }
  } catch (error) {
    Alert.alert('Load Error', error.message);
    setCurrentScreen('setup');
  }
};
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      await loadSafetyPlanForUser(currentUser);
    }
  });

  return unsubscribe;
}, []);
  const handleSetupSave = async (data) => {
    try {
      await AsyncStorage.setItem('safetyPlan', JSON.stringify(data));
await AsyncStorage.setItem('hasCompletedSetup', 'true');

await addDoc(collection(db, 'safetyPlans'), {
  ...data,
  userId: user?.uid,
  userEmail: user?.email,
  createdAt: new Date().toISOString(),
});

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
  console.log(error);

  Alert.alert(
    'Save Error',
    error.message
  );
}
  };
const handleLogout = async () => {
  try {
    await signOut(auth);

    await AsyncStorage.removeItem('safetyPlan');
    await AsyncStorage.removeItem('hasCompletedSetup');

    setUser(null);
    setSafetyPlan(null);
    setIsProtected(false);
    setLastCheckIn('Not checked in yet');
    setCurrentScreen('auth');

    Alert.alert('Logged Out', 'You have been logged out successfully.');
  } catch (error) {
    Alert.alert('Logout Error', error.message);
  }
};
  const resetApp = async () => {
    await AsyncStorage.removeItem('safetyPlan');
    await AsyncStorage.removeItem('hasCompletedSetup');

    setSafetyPlan(null);
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
const testSafetyPlanAlert = () => {
  if (!safetyPlan) {
    Alert.alert(
      'No Safety Plan Found',
      'Please create a Safety Plan before testing your alert message.'
    );
    return;
  }

  const firstChildName =
  safetyPlan.children && safetyPlan.children.length > 0
    ? safetyPlan.children[0].name
    : 'your child';

  Alert.alert(
    'TEST Check My Child Alert',
    `Check My Child Alert.

${safetyPlan.parentName} has not completed today's check-in.

This could mean ${firstChildName} may need your help.

Please try to contact ${safetyPlan.parentName} first. If you cannot reach them, follow the emergency plan they have shared with you.

This is a TEST alert. No emergency services have been contacted.`
  );
};
  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLastCheckIn(`Today at ${now}`);
    setIsProtected(true);
    scheduleTestReminderSequence(safetyPlan);

    Alert.alert(
      'Check-In Successful',
      'You have checked in successfully. Your child is protected today. 💚'
    );
  };
if (showSplash) {
  return (
    <View style={styles.splashContainer}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.splashLogo}
      />
    </View>
  );
}
  if (currentScreen === 'welcome') {
  return <WelcomeScreen onBegin={() => setCurrentScreen('auth')} />;
}
if (currentScreen === 'auth') {
  return (
    <AuthScreen
  onSignedIn={(signedInUser) => {
    setUser(signedInUser);
    loadSafetyPlanForUser(signedInUser);
  }}
/>
  );
}
  if (currentScreen === 'setup') {
    return (
      <View style={styles.container}>
        <SetupForm onSave={handleSetupSave} existingPlan={safetyPlan} />

      </View>
    );
  }

  if (currentScreen === 'safetyPlan') {
  return (
    <SafetyPlanView
      safetyPlan={safetyPlan}
      onBack={() => setCurrentScreen('home')}
      onEdit={() => setCurrentScreen('setup')}
    />
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

        <Text
          style={styles.resetText}
          onPress={() => setCurrentScreen('safetyPlan')}
        >
          View Safety Plan
        </Text>
        <Text
  style={styles.resetText}
  onPress={testSafetyPlanAlert}
>
  Test Safety Plan Alert
</Text>

<Text
  style={styles.resetText}
  onPress={handleLogout}
>
  Log Out
</Text>
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
  },
  statusContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  resetText: {
    marginTop: 20,
    color: '#096fb8',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#095e92',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 350,
    height: 350,
  },
});