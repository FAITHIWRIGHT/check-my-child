import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseconfig';

export default function AuthScreen({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Missing Information', 'Please enter your email and password.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      Alert.alert('Account Created', 'Your Check My Child account has been created.');

      onSignedIn(userCredential.user);
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#096fb8',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});