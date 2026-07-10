import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth } from '../firebase/firebaseconfig';

export default function AuthScreen({ onSignedIn, onAccountCreated }) {
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

      onAccountCreated(userCredential.user);
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };
    const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Missing Information', 'Please enter your email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      Alert.alert('Logged In', 'Welcome back to Check My Child.');

      onSignedIn(userCredential.user);
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };
  const handleForgotPassword = async () => {
  if (email.trim() === '') {
    Alert.alert(
      'Email Required',
      'Please enter your email address first, then tap Forgot Password.'
    );
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());

    Alert.alert(
      'Password Reset Sent',
      'Please check your email for a password reset link.'
    );
  } catch (error) {
    Alert.alert('Password Reset Error', error.message);
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
      <Pressable
  style={[styles.button, { marginTop: 12, backgroundColor: '#096fb8' }]}
  onPress={handleLogin}
>
  <Text style={styles.buttonText}>Log In</Text>
</Pressable>
<Pressable onPress={handleForgotPassword}>
  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
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
  forgotPasswordText: {
  marginTop: 15,
  color: '#096fb8',
  fontSize: 15,
  textDecorationLine: 'underline',
  fontWeight: '600',
},
});