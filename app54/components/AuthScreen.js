import { Ionicons } from '@expo/vector-icons';
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
  const [showPassword, setShowPassword] = useState(false);
  
  const maskEmail = (emailAddress) => {
  const cleanedEmail = emailAddress.trim().toLowerCase();
  const [name, domain] = cleanedEmail.split('@');

  if (!name || !domain) {
    return 'invalid-email-format';
  }

  return `${name.slice(0, 2)}***@${domain}`;
};

const logAuthEvent = (event, details = {}) => {
  console.log('[AUTH EVENT]', {
    event,
    time: new Date().toISOString(),
    ...details,
  });
};

  const handleSignUp = async () => {
  const normalisedEmail = email.trim().toLowerCase();

  if (normalisedEmail === '' || password.trim() === '') {
    Alert.alert(
      'Missing Information',
      'Please enter your email and password.'
    );
    return;
  }

  logAuthEvent('SIGN_UP_BUTTON_PRESSED', {
    email: maskEmail(normalisedEmail),
  });

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      normalisedEmail,
      password
    );


    logAuthEvent('SIGN_UP_SUCCESS', {
  email: maskEmail(normalisedEmail),
  uid: userCredential.user.uid,
  provider: userCredential.user.providerData?.[0]?.providerId || 'password',
  creationTime: userCredential.user.metadata.creationTime,
  lastSignInTime: userCredential.user.metadata.lastSignInTime,
});

    Alert.alert(
      'Account Created',
      'Your Check My Child account has been created.'
    );

    onAccountCreated(userCredential.user);
  } catch (error) {
    logAuthEvent('SIGN_UP_ERROR', {
      email: maskEmail(normalisedEmail),
      errorCode: error.code,
      errorMessage: error.message,
    });

    Alert.alert('Sign Up Error', error.message);
  }
};

const handleLogin = async () => {
  const normalisedEmail = email.trim().toLowerCase();

  if (normalisedEmail === '' || password.trim() === '') {
    Alert.alert(
      'Missing Information',
      'Please enter your email and password.'
    );
    return;
  }

  logAuthEvent('LOGIN_BUTTON_PRESSED', {
    email: maskEmail(normalisedEmail),
  });

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      normalisedEmail,
      password
    );
    
    logAuthEvent('LOGIN_SUCCESS', {
  email: maskEmail(normalisedEmail),
  uid: userCredential.user.uid,
  provider: userCredential.user.providerData?.[0]?.providerId || 'password',
  creationTime: userCredential.user.metadata.creationTime,
  lastSignInTime: userCredential.user.metadata.lastSignInTime,
});

    Alert.alert('Logged In', 'Welcome back to Check My Child.');
    console.log('Authenticated user:', {
  uid: userCredential.user.uid,
  email: userCredential.user.email,
  creationTime: userCredential.user.metadata.creationTime,
  lastSignInTime: userCredential.user.metadata.lastSignInTime,
});

    onSignedIn(userCredential.user);
  } catch (error) {
    logAuthEvent('LOGIN_ERROR', {
      email: maskEmail(normalisedEmail),
      errorCode: error.code,
      errorMessage: error.message,
    });

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
   await sendPasswordResetEmail(auth, email.trim().toLowerCase());

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
        placeholderTextColor="#5F6B76"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

     <View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Password"
    placeholderTextColor="#5F6B76"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
    autoCapitalize="none"
    autoCorrect={false}
    accessibilityLabel="Password"
  />

  <Pressable
    style={styles.passwordEyeButton}
    onPress={() => setShowPassword(!showPassword)}
    accessibilityRole="button"
    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
    accessibilityHint={
      showPassword
        ? 'Hides the password characters'
        : 'Shows the password characters so you can check them'
    }
  >
    <Ionicons
      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
      size={24}
      color="#096fb8"
    />
  </Pressable>
</View>

      <Pressable
  style={styles.button}
  onPress={handleSignUp}
  accessibilityRole="button"
  accessibilityLabel="Create account"
  accessibilityHint="Creates a new Check My Child account"
>
  <Text style={styles.buttonText}>Create Account</Text>
</Pressable>

<Pressable
  style={[styles.button, { marginTop: 12, backgroundColor: '#096fb8' }]}
  onPress={handleLogin}
  accessibilityRole="button"
  accessibilityLabel="Log in"
  accessibilityHint="Signs in to your existing Check My Child account"
>
  <Text style={styles.buttonText}>Log In</Text>
</Pressable>

<Pressable
  onPress={handleForgotPassword}
  accessibilityRole="button"
  accessibilityLabel="Forgot password"
  accessibilityHint="Sends a password reset link to the email address entered"
>
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
  color: '#1F2933',
},
  passwordContainer: {
  width: '100%',
  backgroundColor: 'white',
  borderRadius: 10,
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
},

passwordInput: {
  flex: 1,
  padding: 14,
  fontSize: 16,
  color: '#1F2933',
},

passwordEyeButton: {
  paddingHorizontal: 14,
  paddingVertical: 14,
  justifyContent: 'center',
  alignItems: 'center',
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