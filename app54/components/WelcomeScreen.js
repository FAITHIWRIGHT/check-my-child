import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen({ onBegin }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Check My Child 💚</Text>
      <Image
  source={require('../assets/logo.png')}
  style={styles.logo}
/>

      <Text style={styles.text}>
       Check My Child helps protect children who are unable to call for help themselves if a parent or sole carer becomes unable to ask for help.

Once your Safety Plan is active, you'll receive a reminder after 1 hour if you haven't checked in, a second reminder after 2 hours, and if no check-in is received, your trusted contact will receive an emergency SMS after 4 hours asking them to try to contact you first and, if they can't reach you, to check on you and your child as soon as possible.
      </Text>

      

     <Pressable
  style={styles.button}
  onPress={onBegin}
  accessibilityRole="button"
  accessibilityLabel="Get started"
  accessibilityHint="Starts setting up your Check My Child Safety Plan"
>
  <Text style={styles.buttonText}>Get Started</Text>
</Pressable>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#EAF7FF',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },
  logo: {
  width: 170,
  height: 170,
  resizeMode: 'contain',
  marginVertical: 25,
},
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 30,
    paddingHorizontal: 35,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
