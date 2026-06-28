import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

export default function SetupForm({ onSave }) {
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleSave = () => {
    onSave({
      parentName,
      childName,
      contactName,
      contactPhone,
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Set Up Your Safety Plan</Text>

      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={parentName}
        onChangeText={setParentName}
      />

      <TextInput
        style={styles.input}
        placeholder="Child's name"
        value={childName}
        onChangeText={setChildName}
      />

      <TextInput
        style={styles.input}
        placeholder="Trusted contact name"
        value={contactName}
        onChangeText={setContactName}
      />

      <TextInput
        style={styles.input}
        placeholder="Trusted contact phone"
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
      />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Safety Plan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '95%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});