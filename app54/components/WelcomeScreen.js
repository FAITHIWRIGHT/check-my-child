import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function WelcomeScreen({ onBegin }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Check My Child 💚</Text>

      <Text style={styles.text}>
        Check My Child helps protect young children if a parent or sole carer
        is unable to ask for help.
      </Text>

      <Text style={styles.text}>
        Before we begin, let's set up your family's safety plan.
      </Text>

      <Pressable style={styles.button} onPress={onBegin}>
        <Text style={styles.buttonText}>Begin Setup</Text>
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
    color: '#0077CC',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
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