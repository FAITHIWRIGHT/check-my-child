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
       Check My Child helps protect children who are unable to call for help themselves if a parent or sole carer is unable to ask for help. This includes young children and some children with disabilities or complex needs.
      </Text>

      

      <Pressable style={styles.button} onPress={onBegin}>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
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
    paddingVertical: 15,
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
