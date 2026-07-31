import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SafetyPlanView({
  safetyPlan,
  onBack,
  onEdit,
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          Family Safety Plan
        </Text>

        <Text style={styles.sectionTitle}>
          Parent / Carer
        </Text>

        <Text style={styles.text}>
          Name: {safetyPlan?.parentName || 'Not set'}
        </Text>

        <Text style={styles.text}>
          Phone: {safetyPlan?.parentPhone || 'Not set'}
        </Text>

        <Text style={styles.label}>
          Usual Daily Check-In Time
        </Text>

        <Text style={styles.value}>
          {safetyPlan?.checkInTime || 'Not set'}
        </Text>

        <Text style={styles.sectionTitle}>
          Children
        </Text>

        {safetyPlan?.children?.length ? (
          safetyPlan.children.map((child, index) => (
            <View
              key={`${child?.name || 'child'}-${index}`}
              style={styles.childCard}
            >
              <Text style={styles.childTitle}>
                Child {index + 1}
              </Text>

              <Text style={styles.text}>
                Name: {child?.name || 'Not set'}
              </Text>

              <Text style={styles.text}>
                Date of Birth:{' '}
                {child?.dateOfBirth || 'Not set'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>
            No child details added
          </Text>
        )}

        <Text style={styles.sectionTitle}>
          Emergency Plan
        </Text>

        <Text style={styles.text}>
          {safetyPlan?.emergencyPlan ||
            'No emergency plan added'}
        </Text>

        <Text style={styles.sectionTitle}>
          Trusted Contact
        </Text>

        <Text style={styles.text}>
          Name: {safetyPlan?.contactName || 'Not set'}
        </Text>

        <Text style={styles.text}>
          Phone: {safetyPlan?.contactPhone || 'Not set'}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit Safety Plan"
          accessibilityHint="Opens your Safety Plan so you can make changes."
        >
          <Text style={styles.buttonText}>
            Edit Safety Plan
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          accessibilityHint="Returns to the main Check My Child screen."
        >
          <Text style={styles.buttonText}>
            Back to Home
          </Text>
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

  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 15,
    marginBottom: 6,
  },

  value: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },

  childCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  childTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },

  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 5,
  },

  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center',
  },

  backButton: {
    backgroundColor: '#5D6670',
    marginTop: 12,
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});