import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, View, Text } from 'react-native';

import Header from './components/Header';
import StatusCard from './components/StatusCard';
import CheckInButton from './components/CheckInButton';

export default function App() {
  const [lastCheckIn, setLastCheckIn] = useState('Not checked in yet');
  const [isProtected, setIsProtected] = useState(false);

  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLastCheckIn(`Today at ${now}`);
    setIsProtected(true);

    Alert.alert(
      'Check-In Successful',
      'You have checked in successfully. Your child is protected today. 💙'
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <Text style={styles.subtitle}>
        Welcome to the first version of our app.
      </Text>

      <Text style={styles.message}>
        Press the "I'm OK" button every day to let your trusted contacts know you're safe.
      </Text>

      <CheckInButton onCheckIn={handleCheckIn} />
      <StatusCard
        isProtected={isProtected}
        lastCheckIn={lastCheckIn}
      />

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
});