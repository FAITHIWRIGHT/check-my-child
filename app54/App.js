import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
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
  setCurrentScreen('safetyPlanIntro');
}
  } catch (error) {
    Alert.alert('Load Error', error.message);
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
    console.log('Today check-in search results:', querySnapshot.empty);

    if (!querySnapshot.empty) {
      const checkInData = querySnapshot.docs[0].data();

      setIsProtected(true);

      if (checkInData.checkedInAt?.toDate) {
        const checkInTime = checkInData.checkedInAt.toDate().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        setLastCheckIn(`Today at ${checkInTime}`);
      } else {
        setLastCheckIn('Checked in today');
      }
    } else {
      setIsProtected(false);
      setLastCheckIn('Not checked in yet');
    }
  } catch (error) {
    console.log(error);
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

await addDoc(collection(db, 'safetyPlans'), {
  ...data,
  userId: currentUser.uid,
  userEmail: currentUser.email,
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
  const testSafetyPlanAlert = async () => {
  try {
    if (!safetyPlan) {
      Alert.alert(
        'No Safety Plan Found',
        'Please create a Safety Plan before testing your alert message.'
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
        'Please add a trusted contact phone number to your Safety Plan.'
      );
      return;
    }

    const trustedContactNumber = savedContactPhone.startsWith('0')
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
      emergencyPlan,
    });

    console.log('Test SMS result:', result.data);

    Alert.alert(
      'Test SMS Sent',
      'Your test Safety Plan alert has been sent to your trusted contact.'
    );
  } catch (error) {
    console.log('Test SMS error:', error);

    Alert.alert(
      'Test SMS Error',
      error?.message || 'The test message could not be sent.'
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

    const displayTime = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLastCheckIn(`Today at ${displayTime}`);
    setIsProtected(true);

    Alert.alert(
      'Check-In Successful',
      'You have checked in successfully. Your child is protected today. 💚'
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