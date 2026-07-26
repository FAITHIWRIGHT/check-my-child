import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function SubscriptionScreen({
  onSubscribe,
  onRestore,
  onBack,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Activate My Safety Plan</Text>

        <Text style={styles.intro}>
          Activate your Safety Plan to begin using Check My Child’s safeguarding
          service.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your subscription includes:</Text>

          <Text style={styles.item}>✓ Daily “I’m OK” check-ins</Text>

          <Text style={styles.item}>
            ✓ Reminder notifications before a check-in is missed
          </Text>

          <Text style={styles.item}>
            ✓ Missed check-in escalation
          </Text>

          <Text style={styles.item}>
            ✓ Unlimited automatic emergency SMS alerts to your trusted contact if a check-in is missed
          </Text>

          <Text style={styles.item}>
            ✓ One free Test My Safety Plan message
          </Text>
        </View>

        <Text style={styles.price}>£4.99 per month</Text>

        <Text style={styles.paymentText}>
          Payment will be handled securely through Apple.
        </Text>

        <Pressable
          style={styles.subscribeButton}
          onPress={onSubscribe}
          accessibilityRole="button"
          accessibilityLabel="Subscribe and activate Safety Plan"
        >
          <Text style={styles.subscribeButtonText}>
            Subscribe and Activate
          </Text>
        </Pressable>

        <Pressable
          style={styles.restoreButton}
          onPress={onRestore}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to Safety Plan"
        >
          <Text style={styles.backButtonText}>Back to Safety Plan</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF7FF',
  },

  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F4F4F',
    marginBottom: 16,
  },

  intro: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    color: '#444',
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F4F4F',
    marginBottom: 14,
  },

  item: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },

  price: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F4F4F',
    marginBottom: 8,
  },

  paymentText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },

  subscribeButton: {
    backgroundColor: '#4F9E92',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 14,
  },

  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  restoreButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  restoreButtonText: {
    color: '#4F9E92',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  backButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  backButtonText: {
    color: '#555',
    fontSize: 15,
  },
});