import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Button,
} from 'react-native';

export default function SetupForm({ onSave }) {
  const [parentName, setParentName] = useState('');
  const [children, setChildren] = useState(['']);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  const handleSave = () => {
    onSave({
  parentName,
  parentPhone,
  children,
  contactName,
  contactPhone,
});
  };

  return (
  <KeyboardAvoidingView
    style={styles.keyboardContainer}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
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
          placeholder="Your phone number"
          value={parentPhone}
          onChangeText={setParentPhone}
          keyboardType="phone-pad"
        />

        {children.map((child, index) => (
  <View key={index} style={styles.childContainer}>
    <TextInput
      placeholder={`Child ${index + 1} Name`}
      value={child}
      onChangeText={(text) => {
        const updatedChildren = [...children];
        updatedChildren[index] = text;
        setChildren(updatedChildren);
      }}
      style={styles.input}
    />

    {children.length > 1 && index > 0 && (
      <Pressable
        style={styles.removeButton}
        onPress={() => {
          const updatedChildren = children.filter((_, i) => i !== index);
          setChildren(updatedChildren);
        }}
      >
        <Text style={styles.removeButtonText}>Remove Child</Text>
      </Pressable>
    )}
  </View>
))}

<Button
  title="+ Add Another Child"
  onPress={() => setChildren([...children, ''])}
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
    </ScrollView>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  keyboardContainer: {
  flex: 1,
  width: '100%',
},

scrollContainer: {
  flexGrow: 1,
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingTop: 40,
  paddingBottom: 40,
},
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
  childContainer: {
  width: '100%',
  marginBottom: 10,
},

removeButton: {
  alignSelf: 'flex-end',
  marginTop: -5,
  marginBottom: 10,
},

removeButtonText: {
  color: '#080101',
  fontWeight: '600',
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