import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SafetyPlanIntro({ onContinue }) {
  return (
    <View style={styles.container}>
        <Image
  source={require('../assets/logo.png')}
  style={styles.logo}
/>
      <Text style={styles.title}>
        Let&apos;s Create Your Family&apos;s Safety Plan
      </Text>

      <Text style={styles.message}>
        Before you begin using Check My Child, let&apos;s create your
        family&apos;s Safety Plan.
      </Text>

      <Text style={styles.message}>
        This information will only be used if a daily check-in is missed. It
        helps your trusted contact understand who may need help and follow the
        emergency plan you have created.
      </Text>

      <Pressable style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Create My Safety Plan</Text>
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
  logo: {
  width: 160,
  height: 160,
  resizeMode: 'contain',
  marginBottom: 20,
},
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#095e92',
    marginBottom: 20,
  },
  message: {
    fontSize: 17,
    textAlign: 'center',
    color: '#555',
    marginBottom: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2E9B57',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});