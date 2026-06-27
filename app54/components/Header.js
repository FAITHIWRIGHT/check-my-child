import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <Text style={styles.title}>
      ❤️ Check My Child
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0077CC',
  },
});