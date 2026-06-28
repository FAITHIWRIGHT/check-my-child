import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function CheckInButton({ onCheckIn }) {
  return (
    <Pressable
      style={styles.button}
      onPress={onCheckIn}
    >
      <Text style={styles.buttonText}> I'm OK</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#29cc00',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 50,
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});