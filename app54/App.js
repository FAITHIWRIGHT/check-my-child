import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import AuthScreen from './components/AuthScreen';
import CheckInButton from './components/CheckInButton';
import Header from './components/Header';
import SafetyPlanIntro from './components/SafetyPlanIntro';
import SafetyPlanView from './components/SafetyPlanView';
import SetupForm from './components/SetupForm';
import StatusCard from './components/StatusCard';
import WelcomeScreen from './components/WelcomeScreen';
import { auth, db } from './firebase/firebaseconfig';
import {
  cancelScheduledCheckInReminders,
  scheduleDailyCheckInReminders,
} from './services/NotificationService';

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
  const functions = getFunctions();

 useEffect(() => {
  
  const timer = setTimeout(() => {
    setShowSplash(false);
  }, 2000);

  return () => clearTimeout(timer);
}, []);
const loadSafetyPlanForUser = async (signedInUser) => {
  try {
    const uidPlanRef = doc(
      db,
      'safetyPlans',
      signedInUser.uid
    );

    const uidPlanSnapshot = await getDoc(uidPlanRef);

    if (uidPlanSnapshot.exists()) {
      const planData = uidPlanSnapshot.data();

      setSafetyPlan(planData);

      await AsyncStorage.setItem(
        'safetyPlan',
        JSON.stringify(planData)
      );

      await AsyncStorage.setItem(
        'hasCompletedSetup',
        'true'
      );

      setCurrentScreen('home');
    } else {
      setSafetyPlan(null);

      await AsyncStorage.removeItem('safetyPlan');
      await AsyncStorage.removeItem('hasCompletedSetup');

      setCurrentScreen('safetyPlanIntro');
    }
  } catch (error) {
    console.log('Load Safety Plan error:', error);

    Alert.alert(
      'Load Error',
      error?.message ||
        'Your Safety Plan could not be loaded.'
    );

    setCurrentScreen('safetyPlanIntro');
  }
};
const loadTodayCheckInForUser = async (signedInUser) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const q = query(
      collection(db, 'checkIns'),
      where('userId', '==', signedInUser.uid),
      where('checkedInDate', '==', today)
    );

    const querySnapshot = await getDocs(q);

    console.log(
      'Today check-in search results:',
      querySnapshot.empty
    );

    const savedPlanString =
      await AsyncStorage.getItem('safetyPlan');

    const savedPlan = savedPlanString
      ? JSON.parse(savedPlanString)
      : null;

    if (!querySnapshot.empty) {
      const checkInData = querySnapshot.docs[0].data();

      setIsProtected(true);

      if (checkInData.checkedInAt?.toDate) {
        const checkInTime =
          checkInData.checkedInAt
            .toDate()
            .toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

        setLastCheckIn(`Today at ${checkInTime}`);
      } else {
        setLastCheckIn('Checked in today');
      }

      await cancelScheduledCheckInReminders();

      if (savedPlan) {
        await scheduleDailyCheckInReminders(
          savedPlan,
          true
        );
      }
    } else {
      setIsProtected(false);
      setLastCheckIn('Not checked in yet');

      if (savedPlan) {
        await scheduleDailyCheckInReminders(
          savedPlan
        );
      }
    }
  } catch (error) {
    console.log(
      'Load today check-in error:',
      error
    );
  }
};
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
   if (currentUser) {
  setUser(currentUser);

  await loadSafetyPlanForUser(currentUser);
await loadTodayCheckInForUser(currentUser);
}
  });

  return unsubscribe;
}, []);
const startAutomaticEscalationTest = async () => {
  try {
    const currentUser = auth.currentUser || user;
    
    if (!currentUser) {
      Alert.alert(
        'Login Required',
        'Please log in before starting the escalation test.'
      );
      return;
    }
const today = new Date().toISOString().split('T')[0];

const todayCheckInQuery = query(
  collection(db, 'checkIns'),
  where('userId', '==', currentUser.uid),
  where('checkedInDate', '==', today)
);

const todayCheckInSnapshot = await getDocs(todayCheckInQuery);

if (!todayCheckInSnapshot.empty) {
  Alert.alert(
    'Already Checked In',
    'You have already completed today’s check-in, so no reminder or escalation sequence will start.'
  );
  return;
}
    if (!safetyPlan) {
      Alert.alert(
        'No Safety Plan Found',
        'Please create a Safety Plan before starting the escalation test.'
      );
      return;
    }

    const startedAtMs = Date.now();
    const dueAtMs = startedAtMs + 3 * 60 * 1000;

    await setDoc(
      doc(db, 'safetyPlans', currentUser.uid),
      {
        escalationEnabled: true,
        testEscalationStartedAtMs: startedAtMs,
        testEscalationDueAtMs: dueAtMs,
        testEscalationSent: false,
        testEscalationCancelled: false,
        escalationError: null,
      },
      { merge: true }
    );
await scheduleDailyCheckInReminders(safetyPlan);
    Alert.alert(
      'Escalation Test Started',
      'Do not check in. If the test works, the emergency SMS should be sent automatically in approximately three to four minutes.'
    );
  } catch (error) {
    console.log('Escalation test error:', error);

    Alert.alert(
      'Escalation Test Error',
      error?.message || 'The escalation test could not be started.'
    );
  }
};
  const handleSetupSave = async (data) => {
    try {
      await AsyncStorage.setItem('safetyPlan', JSON.stringify(data));
await AsyncStorage.setItem('hasCompletedSetup', 'true');

const currentUser = auth.currentUser;

if (!currentUser) {
  await AsyncStorage.removeItem('safetyPlan');
  await AsyncStorage.removeItem('hasCompletedSetup');

  setUser(null);
  setSafetyPlan(null);
  setCurrentScreen('auth');

  Alert.alert(
    'Login Required',
    'Please log in before saving your Safety Plan.'
  );
  return;
}

await setDoc(
  doc(db, 'safetyPlans', currentUser.uid),
  {
    ...data,
    userId: currentUser.uid,
    userEmail: currentUser.email,

    escalationEnabled: true,

  

    updatedAt: new Date().toISOString(),
  },
  { merge: true }
);

setSafetyPlan(data);
await scheduleDailyCheckInReminders(data);
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
  const testSafetyPlanAlert = async () => {
  try {
    const currentUser = auth.currentUser || user;

    if (!currentUser) {
      Alert.alert(
        'Login Required',
        'Please log in before testing your Safety Plan.'
      );

      setCurrentScreen('auth');
      return;
    }

    if (!safetyPlan) {
      Alert.alert(
        'No Safety Plan Found',
        'Please create a Safety Plan before testing your alert message.'
      );
      return;
    }

    const safetyPlanRef = doc(
      db,
      'safetyPlans',
      currentUser.uid
    );

    const safetyPlanSnapshot = await getDoc(safetyPlanRef);

    if (
      safetyPlanSnapshot.exists() &&
      safetyPlanSnapshot.data().freeTestAlertUsed === true
    ) {
      Alert.alert(
        'Free Test Already Used',
        'You have already used the one free Safety Plan test included with your account.'
      );
      return;
    }

    const firstChild = safetyPlan.children?.[0];
    const firstChildName =
      firstChild?.name || 'your child';

    const emergencyPlan =
      firstChild?.notes ||
      'No emergency instructions provided.';

    const savedContactPhone =
      safetyPlan.contactPhone?.trim();

    if (!savedContactPhone) {
      Alert.alert(
        'Trusted Contact Number Missing',
        'Please add a trusted contact phone number to your Safety Plan.'
      );
      return;
    }

    const trustedContactNumber =
      savedContactPhone.startsWith('0')
        ? `+44${savedContactPhone.slice(1)}`
        : savedContactPhone;

    const sendTestSms = httpsCallable(
      functions,
      'sendTestSafetyPlanSms'
    );

    const result = await sendTestSms({
      to: trustedContactNumber,
      parentName: safetyPlan.parentName,
      childName: firstChildName,
      trustedContactName: safetyPlan.contactName,
      emergencyPlan,
    });

    console.log('Test SMS result:', result.data);

    await setDoc(
      safetyPlanRef,
      {
        freeTestAlertUsed: true,
        freeTestAlertUsedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setSafetyPlan((previousPlan) => ({
      ...previousPlan,
      freeTestAlertUsed: true,
    }));

    Alert.alert(
      'Test SMS Sent',
      'Your free test Safety Plan alert has been sent to your trusted contact.'
    );
  } catch (error) {
    console.log('Test SMS error:', error);

    Alert.alert(
      'Test SMS Error',
      error?.message ||
        'The test message could not be sent. Your free test has not been marked as used.'
    );
  }
};

const testEmergencyAlert = async () => {
  try {
    if (!safetyPlan) {
      Alert.alert(
        'No Safety Plan Found',
        'Please create a Safety Plan before testing.'
      );
      return;
    }

    const firstChild = safetyPlan.children?.[0];

    const firstChildName = firstChild?.name || 'your child';

    const emergencyPlan =
      firstChild?.notes || 'No emergency instructions provided.';

    const savedContactPhone = safetyPlan.contactPhone?.trim();

    if (!savedContactPhone) {
      Alert.alert(
        'Trusted Contact Number Missing',
        'Please add a trusted contact phone number.'
      );
      return;
    }

    const trustedContactNumber = savedContactPhone.startsWith('0')
      ? `+44${savedContactPhone.slice(1)}`
      : savedContactPhone;

    const sendEmergencySms = httpsCallable(
      functions,
      'sendEmergencySafetyPlanSms'
    );

    const result = await sendEmergencySms({
      to: trustedContactNumber,
      parentName: safetyPlan.parentName,
      childName: firstChildName,
      trustedContactName: safetyPlan.contactName,
      emergencyPlan,
    });

    console.log(result.data);

    Alert.alert(
      'Emergency Alert Sent',
      'The REAL emergency alert has been sent.'
    );

  } catch (error) {
    console.log(error);

    Alert.alert(
      'Emergency Alert Error',
      error.message
    );
  }
};

 const handleCheckIn = async () => {
  try {
    const currentUser = auth.currentUser || user;

    if (!currentUser) {
      Alert.alert(
        'Login Required',
        'Please log in before completing your daily check-in.'
      );
      setCurrentScreen('auth');
      return;
    }

    const now = new Date();

    await addDoc(collection(db, 'checkIns'), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      checkedInAt: serverTimestamp(),
      checkedInDate: now.toISOString().split('T')[0],
      status: 'checked_in',
    });
    await setDoc(
  doc(db, 'safetyPlans', currentUser.uid),
  {
    
    testEscalationCancelled: true,
    testEscalationCancelledAt: new Date().toISOString(),
  },
  { merge: true }
);
await cancelScheduledCheckInReminders();
await scheduleDailyCheckInReminders(safetyPlan, true);

    const displayTime = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLastCheckIn(`Today at ${displayTime}`);
    setIsProtected(true);

    Alert.alert(
      'Check-In Successful',
      'Thank you for checking in today. Your daily check in has been recorded. 💚'
    );
  } catch (error) {
    console.log(error);

    Alert.alert(
      'Check-In Error',
      error.message
    );
  }
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
      onAccountCreated={(signedInUser) => {
        setUser(signedInUser);
        setCurrentScreen('safetyPlanIntro');
      }}
      onSignedIn={(signedInUser) => {
        setUser(signedInUser);
        loadSafetyPlanForUser(signedInUser);
      }}
    />
  );
}
if (currentScreen === 'safetyPlanIntro') {
  return (
    <SafetyPlanIntro
      onContinue={() => setCurrentScreen('setup')}
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
        Complete your daily check-in today. If a check-in is missed, your emergency plan will begin, helping ensure your child is not left without support.
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
  Send Test Safety Plan SMS Alert
</Text>

<Text
  style={styles.resetText}
  onPress={handleLogout}
>
  Log Out
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