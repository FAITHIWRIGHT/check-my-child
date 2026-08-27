import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { deleteUser, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

import AuthScreen from './components/AuthScreen';
import CheckInButton from './components/CheckInButton';
import Header from './components/Header';
import SafetyPlanIntro from './components/SafetyPlanIntro';
import SafetyPlanView from './components/SafetyPlanView';
import SetupForm from './components/SetupForm';
import StatusCard from './components/StatusCard';
import SubscriptionScreen from './components/SubscriptionScreen';
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

const REVENUECAT_ENTITLEMENT_ID =
  'Check My Child Premium';

const REVENUECAT_MONTHLY_PACKAGE_ID =
  '$rc_monthly';

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function App() {
  const [lastCheckIn, setLastCheckIn] = useState(
    'Not checked in yet'
  );
  const [isProtected, setIsProtected] = useState(false);
  const [currentScreen, setCurrentScreen] =
    useState('welcome');
  const [safetyPlan, setSafetyPlan] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [pendingSafetyPlan, setPendingSafetyPlan] =
    useState(null);
  const [isPurchasing, setIsPurchasing] =
    useState(false);
  const [isRestoring, setIsRestoring] =
    useState(false);

  const functions = getFunctions();

  useEffect(() => {
    const configureRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        await Purchases.configure({
          apiKey: 'appl_wkMZAaNBOMqTSCRqtftnnmsLjJD',
        });

        console.log(
          '[REVENUECAT] Configured successfully'
        );
      } catch (error) {
        console.log(
          '[REVENUECAT] Configuration error:',
          error
        );
      }
    };

    configureRevenueCat();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

const loadSafetyPlanForUser = async (
  signedInUser
) => {
  try {
    const uidPlanRef = doc(
      db,
      'safetyPlans',
      signedInUser.uid
    );

    const uidPlanSnapshot =
      await getDoc(uidPlanRef);

    if (uidPlanSnapshot.exists()) {
      const planData =
        uidPlanSnapshot.data();

      /*
       * The Safety Plan exists, but we must also
       * confirm that the user's RevenueCat
       * subscription is still active.
       */
      await Purchases.logIn(
        signedInUser.uid
      );

      const customerInfo =
        await Purchases.getCustomerInfo();

      const hasActiveEntitlement =
        Boolean(
          customerInfo?.entitlements?.active?.[
            REVENUECAT_ENTITLEMENT_ID
          ]
        );

      setSafetyPlan(planData);

      await AsyncStorage.setItem(
        'safetyPlan',
        JSON.stringify(planData)
      );

      await AsyncStorage.setItem(
        'hasCompletedSetup',
        'true'
      );

      if (!hasActiveEntitlement) {
        /*
         * Keep the Safety Plan stored, but don't
         * allow the safeguarding service to remain
         * active without a subscription.
         */
        await setDoc(
          uidPlanRef,
          {
            subscriptionActive: false,
            escalationEnabled: false,
            subscriptionVerifiedAt:
              serverTimestamp(),
          },
          { merge: true }
        );

        const inactivePlan = {
          ...planData,
          subscriptionActive: false,
          escalationEnabled: false,
        };

        setSafetyPlan(inactivePlan);
        setPendingSafetyPlan(inactivePlan);

        await AsyncStorage.setItem(
          'safetyPlan',
          JSON.stringify(inactivePlan)
        );

        await AsyncStorage.setItem(
          'pendingSafetyPlan',
          JSON.stringify(inactivePlan)
        );

        await cancelScheduledCheckInReminders();

        setCurrentScreen('subscription');
        return;
      }

      /*
       * RevenueCat confirms that the subscription
       * is active.
       */
      if (
        planData.subscriptionActive !== true ||
        planData.escalationEnabled !== true
      ) {
        await setDoc(
          uidPlanRef,
          {
            subscriptionActive: true,
            escalationEnabled: true,
            subscriptionVerifiedAt:
              serverTimestamp(),
          },
          { merge: true }
        );
      }

      const activePlan = {
        ...planData,
        subscriptionActive: true,
        escalationEnabled: true,
      };

      setSafetyPlan(activePlan);

      await AsyncStorage.setItem(
        'safetyPlan',
        JSON.stringify(activePlan)
      );

      await AsyncStorage.removeItem(
        'pendingSafetyPlan'
      );

      setPendingSafetyPlan(null);
      setCurrentScreen('home');
    } else {
      setSafetyPlan(null);

      await AsyncStorage.removeItem(
        'safetyPlan'
      );

      await AsyncStorage.removeItem(
        'hasCompletedSetup'
      );

      await AsyncStorage.removeItem(
        'pendingSafetyPlan'
      );

      setPendingSafetyPlan(null);
      setCurrentScreen('safetyPlanIntro');
    }
  } catch (error) {
    console.log(
      'Load Safety Plan error:',
      error
    );

    Alert.alert(
      'Load Error',
      error?.message ||
        'Your Safety Plan could not be loaded.'
    );

    setCurrentScreen('safetyPlanIntro');
  }
};

  const loadTodayCheckInForUser = async (
    signedInUser
  ) => {
    try {
      const today = getLocalDateString();

      const checkInQuery = query(
        collection(db, 'checkIns'),
        where(
          'userId',
          '==',
          signedInUser.uid
        ),
        where(
          'checkedInDate',
          '==',
          today
        )
      );

      const querySnapshot =
        await getDocs(checkInQuery);

      console.log('[CHECK-IN]', {
        today,
        foundCheckIn:
          !querySnapshot.empty,
        uid: signedInUser.uid,
      });

      const savedPlanString =
        await AsyncStorage.getItem(
          'safetyPlan'
        );

      const savedPlan = savedPlanString
        ? JSON.parse(savedPlanString)
        : null;

      if (!querySnapshot.empty) {
        const checkInData =
          querySnapshot.docs[0].data();

        setIsProtected(true);

        if (
          checkInData.checkedInAt?.toDate
        ) {
          const checkInTime =
            checkInData.checkedInAt
              .toDate()
              .toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

          setLastCheckIn(
            `Today at ${checkInTime}`
          );
        } else {
          setLastCheckIn(
            'Checked in today'
          );
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
        setLastCheckIn(
          'Not checked in yet'
        );

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
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);

            await loadSafetyPlanForUser(
              currentUser
            );

            await loadTodayCheckInForUser(
              currentUser
            );
          }
        }
      );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const notificationResponseListener =
      Notifications.addNotificationResponseReceivedListener(
        () => {
          console.log(
            '[NOTIFICATION] Notification tapped'
          );

          if (auth.currentUser) {
            setCurrentScreen('home');
          } else {
            setCurrentScreen('auth');
          }
        }
      );

    return () => {
      notificationResponseListener.remove();
    };
  }, []);

  const startAutomaticEscalationTest =
    async () => {
      try {
        const currentUser =
          auth.currentUser || user;

        if (!currentUser) {
          Alert.alert(
            'Login Required',
            'Please log in before starting the escalation test.'
          );
          return;
        }

        const today =
          getLocalDateString();

        const todayCheckInQuery = query(
          collection(db, 'checkIns'),
          where(
            'userId',
            '==',
            currentUser.uid
          ),
          where(
            'checkedInDate',
            '==',
            today
          )
        );

        const todayCheckInSnapshot =
          await getDocs(
            todayCheckInQuery
          );

        if (
          !todayCheckInSnapshot.empty
        ) {
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
        const dueAtMs =
          startedAtMs +
          3 * 60 * 1000;

        await setDoc(
          doc(
            db,
            'safetyPlans',
            currentUser.uid
          ),
          {
            escalationEnabled: true,
            testEscalationStartedAtMs:
              startedAtMs,
            testEscalationDueAtMs:
              dueAtMs,
            testEscalationSent: false,
            testEscalationCancelled:
              false,
            escalationError: null,
          },
          { merge: true }
        );

        await scheduleDailyCheckInReminders(
          safetyPlan
        );

        Alert.alert(
          'Escalation Test Started',
          'Do not check in. If the test works, the emergency SMS should be sent automatically in approximately three to four minutes.'
        );
      } catch (error) {
        console.log(
          'Escalation test error:',
          error
        );

        Alert.alert(
          'Escalation Test Error',
          error?.message ||
            'The escalation test could not be started.'
        );
      }
    };

 const handleSetupSave = async (data) => {
  try {
    const currentUser =
      auth.currentUser || user;

    if (!currentUser) {
      setUser(null);
      setSafetyPlan(null);
      setCurrentScreen('auth');

      Alert.alert(
        'Login Required',
        'Please log in before saving your Safety Plan.'
      );
      return;
    }

    /*
     * Existing active subscribers can edit and save
     * their Safety Plan without purchasing again.
     */
    if (
      safetyPlan?.subscriptionActive === true
    ) {
      await setDoc(
        doc(
          db,
          'safetyPlans',
          currentUser.uid
        ),
        {
          ...data,
          userId: currentUser.uid,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      const updatedPlan = {
        ...safetyPlan,
        ...data,
        userId: currentUser.uid,
      };

      await AsyncStorage.setItem(
        'safetyPlan',
        JSON.stringify(updatedPlan)
      );

      await AsyncStorage.removeItem(
        'pendingSafetyPlan'
      );

      setSafetyPlan(updatedPlan);
      setPendingSafetyPlan(null);

      await cancelScheduledCheckInReminders();

      await scheduleDailyCheckInReminders(
        updatedPlan
      );

      setCurrentScreen('home');

      Alert.alert(
        'Safety Plan Updated',
        'Your Safety Plan changes have been saved.'
      );

      return;
    }

    /*
     * A new user has not subscribed yet, so keep the
     * completed plan pending and show the purchase screen.
     */
    setPendingSafetyPlan(data);

    await AsyncStorage.setItem(
      'pendingSafetyPlan',
      JSON.stringify(data)
    );

    setCurrentScreen('subscription');
  } catch (error) {
    console.log(
      'Safety Plan save error:',
      error
    );

    Alert.alert(
      'Save Error',
      error?.message ||
        'Your Safety Plan could not be saved.'
    );
  }
};

  const activateSafetyPlanAfterPurchase =
    async (
      currentUser,
      planData,
      customerInfo
    ) => {
      const activeEntitlement =
        customerInfo?.entitlements?.active?.[
          REVENUECAT_ENTITLEMENT_ID
        ];

      if (!activeEntitlement) {
        throw new Error(
          'RevenueCat did not confirm an active Check My Child subscription.'
        );
      }

      const planToSave = {
        ...planData,
        userId: currentUser.uid,
        subscriptionActive: true,
        escalationEnabled: true,
        revenueCatEntitlementId:
          REVENUECAT_ENTITLEMENT_ID,
        revenueCatProductIdentifier:
          activeEntitlement.productIdentifier ||
          null,
        revenueCatAppUserId:
          currentUser.uid,
      };

      await setDoc(
        doc(
          db,
          'safetyPlans',
          currentUser.uid
        ),
        {
          ...planToSave,
          activatedAt:
            serverTimestamp(),
          subscriptionVerifiedAt:
            serverTimestamp(),
        }
      );

      await AsyncStorage.setItem(
        'safetyPlan',
        JSON.stringify(planToSave)
      );

      await AsyncStorage.setItem(
        'hasCompletedSetup',
        'true'
      );

      await AsyncStorage.removeItem(
        'pendingSafetyPlan'
      );

      setSafetyPlan(planToSave);
      setPendingSafetyPlan(null);
      setIsProtected(false);
      setLastCheckIn(
        'Not checked in yet'
      );

      await scheduleDailyCheckInReminders(
        planToSave
      );

      setCurrentScreen('home');
    };

  const handleSubscriptionPurchase =
    async () => {
      if (isPurchasing || isRestoring) {
        return;
      }

      try {
        setIsPurchasing(true);

        const currentUser =
          auth.currentUser || user;

        if (!currentUser) {
          Alert.alert(
            'Login Required',
            'Please log in before subscribing and activating your Safety Plan.'
          );

          setCurrentScreen('auth');
          return;
        }

        if (!pendingSafetyPlan) {
          Alert.alert(
            'Safety Plan Missing',
            'Please complete your Safety Plan before subscribing.'
          );

          setCurrentScreen('setup');
          return;
        }

        await Purchases.logIn(
          currentUser.uid
        );

        const offerings =
          await Purchases.getOfferings();

        const currentOffering =
          offerings.current ||
          offerings.all?.default;

        if (!currentOffering) {
          throw new Error(
            'The Check My Child subscription offering is not currently available.'
          );
        }

        const monthlyPackage =
          currentOffering.monthly ||
          currentOffering.availablePackages?.find(
            (availablePackage) =>
              availablePackage.identifier ===
              REVENUECAT_MONTHLY_PACKAGE_ID
          );

        if (!monthlyPackage) {
          throw new Error(
            'The monthly Check My Child subscription could not be found.'
          );
        }

        const {
          customerInfo,
        } =
          await Purchases.purchasePackage(
            monthlyPackage
          );

        const hasActiveEntitlement =
          Boolean(
            customerInfo?.entitlements?.active?.[
              REVENUECAT_ENTITLEMENT_ID
            ]
          );

        if (!hasActiveEntitlement) {
          throw new Error(
            'Apple completed the purchase process, but the subscription could not be verified.'
          );
        }

        await activateSafetyPlanAfterPurchase(
          currentUser,
          pendingSafetyPlan,
          customerInfo
        );

        Alert.alert(
          'Safety Plan Activated',
          'Your subscription is active and your Safety Plan has been activated.'
        );
      } catch (error) {
        console.log(
          '[REVENUECAT] Purchase error:',
          error
        );

        if (error?.userCancelled) {
          console.log(
            '[REVENUECAT] Purchase cancelled by user'
          );
          return;
        }

        Alert.alert(
          'Subscription Not Completed',
          error?.message ||
            'Your subscription could not be completed. Your Safety Plan has not been activated.'
        );
      } finally {
        setIsPurchasing(false);
      }
    };

  const handleRestorePurchases =
    async () => {
      if (isPurchasing || isRestoring) {
        return;
      }

      try {
        setIsRestoring(true);

        const currentUser =
          auth.currentUser || user;

        if (!currentUser) {
          Alert.alert(
            'Login Required',
            'Please log in before restoring your subscription.'
          );

          setCurrentScreen('auth');
          return;
        }

        if (!pendingSafetyPlan) {
          Alert.alert(
            'Complete Your Safety Plan',
            'Please complete your Safety Plan before restoring and activating your subscription.'
          );

          setCurrentScreen('setup');
          return;
        }

        await Purchases.logIn(
          currentUser.uid
        );

        const customerInfo =
          await Purchases.restorePurchases();

        const hasActiveEntitlement =
          Boolean(
            customerInfo?.entitlements?.active?.[
              REVENUECAT_ENTITLEMENT_ID
            ]
          );

        if (!hasActiveEntitlement) {
          Alert.alert(
            'No Active Subscription Found',
            'Apple did not find an active Check My Child subscription to restore.'
          );
          return;
        }

        await activateSafetyPlanAfterPurchase(
          currentUser,
          pendingSafetyPlan,
          customerInfo
        );

        Alert.alert(
          'Purchase Restored',
          'Your subscription has been restored and your Safety Plan is active.'
        );
      } catch (error) {
        console.log(
          '[REVENUECAT] Restore error:',
          error
        );

        Alert.alert(
          'Restore Unsuccessful',
          error?.message ||
            'Your previous purchase could not be restored.'
        );
      } finally {
        setIsRestoring(false);
      }
    };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      await AsyncStorage.removeItem(
        'safetyPlan'
      );
      await AsyncStorage.removeItem(
        'hasCompletedSetup'
      );

      setUser(null);
      setSafetyPlan(null);
      setIsProtected(false);
      setLastCheckIn(
        'Not checked in yet'
      );
      setCurrentScreen('auth');

      Alert.alert(
        'Logged Out',
        'You have been logged out successfully.'
      );
    } catch (error) {
      Alert.alert(
        'Logout Error',
        error?.message ||
          'You could not be logged out.'
      );
    }
  };
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? Your Safety Plan and check-in history will be deleted and this cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser =
                auth.currentUser || user;

              if (!currentUser) {
                Alert.alert(
                  'Account Not Found',
                  'Please sign in again before deleting your account.'
                );
                setCurrentScreen('auth');
                return;
              }

              const checkInQuery = query(
                collection(db, 'checkIns'),
                where(
                  'userId',
                  '==',
                  currentUser.uid
                )
              );

              const checkInSnapshot =
                await getDocs(checkInQuery);

              for (
                const checkInDocument of
                  checkInSnapshot.docs
              ) {
                await deleteDoc(
                  doc(
                    db,
                    'checkIns',
                    checkInDocument.id
                  )
                );
              }

              await deleteDoc(
                doc(
                  db,
                  'safetyPlans',
                  currentUser.uid
                )
              );

              await deleteUser(
                currentUser
              );

              await cancelScheduledCheckInReminders();

              await AsyncStorage.removeItem(
                'safetyPlan'
              );
              await AsyncStorage.removeItem(
                'hasCompletedSetup'
              );
              await AsyncStorage.removeItem(
                'pendingSafetyPlan'
              );

              setUser(null);
              setSafetyPlan(null);
              setPendingSafetyPlan(null);
              setIsProtected(false);
              setLastCheckIn(
                'Not checked in yet'
              );
              setCurrentScreen('auth');

              Alert.alert(
                'Account Deleted',
                'Your Check My Child account and associated app data have been permanently deleted.'
              );
            } catch (error) {
              console.log(
                'Delete account error:',
                error
              );

              if (
                error?.code ===
                'auth/requires-recent-login'
              ) {
                Alert.alert(
                  'Please Sign In Again',
                  'For security, please log out and sign back in, then choose Delete Account again.'
                );
                return;
              }

              Alert.alert(
                'Account Deletion Error',
                error?.message ||
                  'Your account could not be deleted. Please try again.'
              );
            }
          },
        },
      ]
    );
  };
  const resetApp = async () => {
    await AsyncStorage.removeItem(
      'safetyPlan'
    );
    await AsyncStorage.removeItem(
      'hasCompletedSetup'
    );

    setSafetyPlan(null);
    setCurrentScreen('welcome');

    Alert.alert(
      'App Reset',
      'The saved Safety Plan has been cleared for testing.'
    );
  };

  const checkSavedPlan = async () => {
    const savedPlan =
      await AsyncStorage.getItem(
        'safetyPlan'
      );

    Alert.alert(
      'Saved Safety Plan',
      savedPlan
        ? savedPlan
        : 'No Safety Plan found'
    );
  };

  const testSafetyPlanAlert =
    async () => {
      try {
        const currentUser =
          auth.currentUser || user;

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

        const safetyPlanSnapshot =
          await getDoc(
            safetyPlanRef
          );

        if (
          safetyPlanSnapshot.exists() &&
          safetyPlanSnapshot.data()
            .freeTestAlertUsed === true
        ) {
          Alert.alert(
            'Free Test Already Used',
            'You have already used the one free Safety Plan test included with your account.'
          );
          return;
        }

        const firstChild =
          safetyPlan.children?.[0];

        const firstChildName =
          firstChild?.name ||
          'your child';

        const emergencyPlan =
          safetyPlan?.emergencyPlan ||
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
          savedContactPhone.startsWith(
            '0'
          )
            ? `+44${savedContactPhone.slice(
                1
              )}`
            : savedContactPhone;

        const sendTestSms =
          httpsCallable(
            functions,
            'sendTestSafetyPlanSms'
          );

        const result =
          await sendTestSms({
            to: trustedContactNumber,
            parentName:
              safetyPlan.parentName,
            childName:
              firstChildName,
            trustedContactName:
              safetyPlan.contactName,
            emergencyPlan,
          });

        console.log(
          'Test SMS result:',
          result.data
        );

        await setDoc(
          safetyPlanRef,
          {
            freeTestAlertUsed: true,
            freeTestAlertUsedAt:
              serverTimestamp(),
          },
          { merge: true }
        );

        setSafetyPlan(
          (previousPlan) => ({
            ...previousPlan,
            freeTestAlertUsed: true,
          })
        );

        Alert.alert(
          'Test SMS Sent',
          'Your free test Safety Plan alert has been sent to your trusted contact.'
        );
      } catch (error) {
        console.log(
          'Test SMS error:',
          error
        );

        Alert.alert(
          'Test SMS Error',
          error?.message ||
            'The test message could not be sent. Your free test has not been marked as used.'
        );
      }
    };

  const testEmergencyAlert =
    async () => {
      try {
        if (!safetyPlan) {
          Alert.alert(
            'No Safety Plan Found',
            'Please create a Safety Plan before testing.'
          );
          return;
        }

        const firstChild =
          safetyPlan.children?.[0];

        const firstChildName =
          firstChild?.name ||
          'your child';

        const emergencyPlan =
          safetyPlan?.emergencyPlan ||
          'No emergency instructions provided.';

        const savedContactPhone =
          safetyPlan.contactPhone?.trim();

        if (!savedContactPhone) {
          Alert.alert(
            'Trusted Contact Number Missing',
            'Please add a trusted contact phone number.'
          );
          return;
        }

        const trustedContactNumber =
          savedContactPhone.startsWith(
            '0'
          )
            ? `+44${savedContactPhone.slice(
                1
              )}`
            : savedContactPhone;

        const sendEmergencySms =
          httpsCallable(
            functions,
            'sendEmergencySafetyPlanSms'
          );

        const result =
          await sendEmergencySms({
            to: trustedContactNumber,
            parentName:
              safetyPlan.parentName,
            childName:
              firstChildName,
            trustedContactName:
              safetyPlan.contactName,
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
          error?.message ||
            'The emergency alert could not be sent.'
        );
      }
    };

  const handleCheckIn = async () => {
    try {
      const currentUser =
        auth.currentUser || user;

      if (!currentUser) {
        Alert.alert(
          'Login Required',
          'Please log in before completing your daily check-in.'
        );
        setCurrentScreen('auth');
        return;
      }

      const now = new Date();

      await addDoc(
        collection(db, 'checkIns'),
        {
          userId: currentUser.uid,
          userEmail:
            currentUser.email,
          checkedInAt:
            serverTimestamp(),
          checkedInDate:
            getLocalDateString(now),
          status: 'checked_in',
        }
      );

      await setDoc(
        doc(
          db,
          'safetyPlans',
          currentUser.uid
        ),
        {
          testEscalationCancelled:
            true,
          testEscalationCancelledAt:
            new Date().toISOString(),
        },
        { merge: true }
      );

      await cancelScheduledCheckInReminders();

      await scheduleDailyCheckInReminders(
        safetyPlan,
        true
      );

      const displayTime =
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

      setLastCheckIn(
        `Today at ${displayTime}`
      );
      setIsProtected(true);

      Alert.alert(
        'Check-In Successful',
        'Thank you for checking in today. Your daily check in has been recorded. 💚'
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Check-In Error',
        error?.message ||
          'Your check-in could not be recorded.'
      );
    }
  };

  if (showSplash) {
    return (
      <View
        style={
          styles.splashContainer
        }
      >
        <Image
          source={require(
            './assets/logo.png'
          )}
          style={styles.splashLogo}
        />
      </View>
    );
  }

  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onBegin={() =>
          setCurrentScreen('auth')
        }
      />
    );
  }

  if (currentScreen === 'auth') {
    return (
      <AuthScreen
        onAccountCreated={(
          signedInUser
        ) => {
          setUser(signedInUser);
          setCurrentScreen(
            'safetyPlanIntro'
          );
        }}
        onSignedIn={(
          signedInUser
        ) => {
          setUser(signedInUser);
          loadSafetyPlanForUser(
            signedInUser
          );
        }}
      />
    );
  }

  if (
    currentScreen ===
    'safetyPlanIntro'
  ) {
    return (
      <SafetyPlanIntro
        onContinue={() =>
          setCurrentScreen('setup')
        }
      />
    );
  }

  if (currentScreen === 'setup') {
    return (
      <View style={styles.container}>
        <SetupForm
          onSave={handleSetupSave}
          existingPlan={safetyPlan}
        />
      </View>
    );
  }

  if (
    currentScreen ===
    'subscription'
  ) {
    return (
      <SubscriptionScreen
        onSubscribe={
          handleSubscriptionPurchase
        }
        onRestore={
          handleRestorePurchases
        }
        onBack={() =>
          setCurrentScreen('setup')
        }
        isPurchasing={
          isPurchasing
        }
        isRestoring={
          isRestoring
        }
      />
    );
  }

  if (
    currentScreen === 'safetyPlan'
  ) {
    return (
      <SafetyPlanView
        safetyPlan={safetyPlan}
        onBack={() =>
          setCurrentScreen('home')
        }
        onEdit={() =>
          setCurrentScreen('setup')
        }
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
        Complete your daily check-in
        today. If a check-in is
        missed, your emergency plan
        will begin, helping ensure
        your child is not left
        without support.
      </Text>

      <View
        style={
          styles.statusContainer
        }
      >
        <CheckInButton
          onCheckIn={handleCheckIn}
        />

        <StatusCard
          isProtected={isProtected}
          lastCheckIn={lastCheckIn}
        />

        <View
          style={
            styles.actionButtonRow
          }
        >
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.viewPlanButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={() =>
              setCurrentScreen(
                'safetyPlan'
              )
            }
            accessibilityRole="button"
            accessibilityLabel="View Safety Plan"
            accessibilityHint="Opens your saved Safety Plan."
          >
            <Ionicons
              name="document-text-outline"
              size={32}
              color="#096FB8"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />

            <Text
              style={
                styles.viewPlanButtonText
              }
            >
              View{'\n'}Safety Plan
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.testPlanButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={
              testSafetyPlanAlert
            }
            accessibilityRole="button"
            accessibilityLabel="Test My Safety Plan"
            accessibilityHint="Sends a test SMS to your trusted contact so you can check that your Safety Plan is working."
          >
            <Ionicons
              name="paper-plane-outline"
              size={32}
              color="#218C2A"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />

            <Text
              style={
                styles.testPlanButtonText
              }
            >
              Test My{'\n'}Safety Plan
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.logoutButton,
              pressed &&
                styles.actionButtonPressed,
            ]}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Log Out"
            accessibilityHint="Logs you out of Check My Child."
          >
            <Ionicons
              name="log-out-outline"
              size={34}
              color="#5D6670"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />

            <Text
              style={
                styles.logoutButtonText
              }
            >
              Log Out
            </Text>
          </Pressable>
        </View>
         <Pressable
          style={({ pressed }) => [
            styles.deleteAccountButton,
            pressed &&
              styles.actionButtonPressed,
          ]}
          onPress={handleDeleteAccount}
          accessibilityRole="button"
          accessibilityLabel="Delete Account"
          accessibilityHint="Permanently deletes your Check My Child account and associated app data."
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color="#B42318"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />

          <Text
            style={
              styles.deleteAccountButtonText
            }
          >
            Delete Account
          </Text>
        </Pressable>
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
    marginBottom: 10,
  },

  statusContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
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

  actionButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent:
      'space-between',
    alignItems: 'stretch',
    marginTop: 28,
    gap: 10,
  },

  actionButton: {
    flex: 1,
    minHeight: 128,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  actionButtonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  viewPlanButton: {
    backgroundColor: '#EAF4FF',
    borderColor: '#C7DFF4',
  },

  testPlanButton: {
    backgroundColor: '#ECF9E9',
    borderColor: '#CBE9C5',
  },

  logoutButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D8DDE2',
  },

  viewPlanButtonText: {
    color: '#096FB8',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },

  testPlanButtonText: {
    color: '#218C2A',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },

  logoutButtonText: {

    color: '#5D6670',

    fontSize: 15,

    lineHeight: 20,

    fontWeight: '700',

    textAlign: 'center',

    marginTop: 10,

  },

  deleteAccountButton: {
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  deleteAccountButtonText: {
    color: '#B42318',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

});