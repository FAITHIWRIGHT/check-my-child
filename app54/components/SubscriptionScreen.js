import {
  ActivityIndicator,
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
  isPurchasing = false,
  isRestoring = false,
}) {
  const isBusy = isPurchasing || isRestoring;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Activate My Safety Plan
        </Text>

        <Text style={styles.intro}>
          Activate your Safety Plan to begin using Check My Child’s
          safeguarding service.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Your subscription includes:
          </Text>

          <Text style={styles.item}>
            ✓ Daily “I’m OK” check-ins
          </Text>

          <Text style={styles.item}>
            ✓ Daily check-in reminder notifications
          </Text>

          <Text style={styles.item}>
            ✓ Missed check-in escalation
          </Text>

          <Text style={styles.item}>
            ✓ Automatic emergency SMS alerts to your trusted contact
            when a check-in is missed
          </Text>

          <Text style={styles.item}>
            ✓ One free Test My Safety Plan message
          </Text>
        </View>

        <Text style={styles.price}>
          £5.99 per month
        </Text>

        <Text style={styles.paymentText}>
          Payment renews automatically each month unless cancelled.
          Payment is handled securely through Apple.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.subscribeButton,
            (pressed || isBusy) && styles.buttonPressed,
          ]}
          onPress={onSubscribe}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Subscribe and activate Safety Plan"
          accessibilityHint="Opens Apple’s subscription purchase screen."
          accessibilityState={{ disabled: isBusy }}
        >
          {isPurchasing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" />

              <Text style={styles.subscribeButtonText}>
                Processing…
              </Text>
            </View>
          ) : (
            <Text style={styles.subscribeButtonText}>
              Subscribe and Activate
            </Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.restoreButton,
            (pressed || isBusy) && styles.buttonPressed,
          ]}
          onPress={onRestore}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          accessibilityHint="Checks Apple for a previous Check My Child subscription."
          accessibilityState={{ disabled: isBusy }}
        >
          {isRestoring ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#4F9E92" />

              <Text style={styles.restoreButtonText}>
                Restoring…
              </Text>
            </View>
          ) : (
            <Text style={styles.restoreButtonText}>
              Restore Purchases
            </Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onBack}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Go back to Safety Plan"
          accessibilityHint="Returns to your Safety Plan form."
          accessibilityState={{ disabled: isBusy }}
        >
          <Text style={styles.backButtonText}>
            Back to Safety Plan
          </Text>
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
    lineHeight: 20,
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
    justifyContent: 'center',
    minHeight: 56,
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
    justifyContent: 'center',
    minHeight: 50,
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

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  buttonPressed: {
    opacity: 0.65,
  },
});