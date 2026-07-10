import { useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function SetupForm({ onSave, existingPlan }) {
  const [parentName, setParentName] = useState(existingPlan?.parentName || '');

  const [children, setChildren] = useState(
  existingPlan?.children || [
    {
      name: '',
      dateOfBirth: '',
      notes: '',
    },
  ]
);

  const [contactName, setContactName] = useState(existingPlan?.contactName || '');

  const [contactPhone, setContactPhone] = useState(existingPlan?.contactPhone || '');

  const [parentPhone, setParentPhone] = useState(existingPlan?.parentPhone || '');


  const handleSave = () => {
  if (
    parentName.trim() === '' ||
    parentPhone.trim() === '' ||
    contactName.trim() === '' ||
    contactPhone.trim() === '' ||
    children.length === 0 ||
    children.some(
      child =>
        child.name.trim() === '' ||
        child.dateOfBirth.trim() === ''
    )
  ) {
    Alert.alert(
      'Missing Information',
      'Please complete all required fields marked with * before saving your Safety Plan.'
    );
    return;
  }

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
        <Text style={styles.title}>Set Up Your Safety Plan
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your name*"
          value={parentName}
          onChangeText={setParentName}
        />

        <TextInput
          style={styles.input}
          placeholder="Your phone number*"
          value={parentPhone}
          onChangeText={setParentPhone}
          keyboardType="phone-pad"
        />

        {children.map((child, index) => (
  <View key={index} style={styles.childContainer}>
    <Text style={styles.childTitle}>Child {index + 1}</Text>

    <TextInput
      placeholder="Child's name*"
      value={child.name}
      onChangeText={(text) => {
        const updatedChildren = [...children];
        updatedChildren[index].name = text;
        setChildren(updatedChildren);
      }}
      style={styles.input}
    />

    <TextInput
      placeholder="Date of birth*"
      value={child.dateOfBirth}
      onChangeText={(text) => {
        const updatedChildren = [...children];
        updatedChildren[index].dateOfBirth = text;
        setChildren(updatedChildren);
      }}
      style={styles.input}
    />

    <TextInput
      placeholder="Emergency Plan (e.g. medical needs, spare key/home access info)"
      value={child.notes}
      onChangeText={(text) => {
        const updatedChildren = [...children];
        updatedChildren[index].notes = text;
        setChildren(updatedChildren);
      }}
      style={styles.notesInput}
      multiline
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
  onPress={() => setChildren([...children, { name: '', dateOfBirth: '', notes: '' }])}
/>

        <TextInput
          style={styles.input}
          placeholder="Trusted contact name*"
          value={contactName}
          onChangeText={setContactName}
        />

        <TextInput
          style={styles.input}
          placeholder="Trusted contact phone*"
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
childTitle: {
  width: '100%',
  fontSize: 16,
  fontWeight: 'bold',
  color: '#2E7D32',
  marginBottom: 8,
},

notesInput: {
  width: '100%',
  backgroundColor: '#F2F2F2',
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
  fontSize: 16,
  minHeight: 80,
  textAlignVertical: 'top',
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