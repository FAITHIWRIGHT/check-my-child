import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SafetyPlanView({ safetyPlan, onBack, onEdit }) {

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Family Safety Plan</Text>

        <Text style={styles.sectionTitle}>Parent / Carer</Text>
        <Text style={styles.text}>Name: {safetyPlan.parentName}</Text>
        <Text style={styles.text}>Phone: {safetyPlan.parentPhone}</Text>
<Text style={styles.label}>Usual Daily Check-In Time</Text>
<Text style={styles.value}>
  {safetyPlan?.checkInTime || 'Not set'}
</Text>
        <Text style={styles.sectionTitle}>Children</Text>
        {safetyPlan.children?.map((child, index) => (
          <View key={index} style={styles.childCard}>
            <Text style={styles.childTitle}>Child {index + 1}</Text>
            <Text style={styles.text}>Name: {child.name}</Text>
            <Text style={styles.text}>Date of Birth: {child.dateOfBirth}</Text>
            <Text style={styles.text}>
              Notes: {child.notes ? child.notes : 'No notes added'}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Trusted Contact</Text>
        <Text style={styles.text}>Name: {safetyPlan.contactName}</Text>
        <Text style={styles.text}>Phone: {safetyPlan.contactPhone}</Text>
<Pressable style={styles.button} onPress={onEdit}>
  <Text style={styles.buttonText}>Edit Safety Plan</Text>
</Pressable>

        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EAF7FF',
    alignItems: 'center',
    padding: 25,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077CC',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 15,
    marginBottom: 8,
  },
  childCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  childTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});