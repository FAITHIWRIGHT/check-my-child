import { StyleSheet, Text, View } from 'react-native';

export default function StatusCard({ isProtected, lastCheckIn }) {
  return (
    <View style={styles.card}>
      <Text style={styles.status}>
        {isProtected ? '🟢 Check-In Complete' : '🔴 Check-In Required'}
      </Text>

      <Text style={styles.label}>Last Check-In:</Text>

      <Text style={styles.time}>
        {lastCheckIn}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginTop: 40,
    marginBottom: 25,
    width: '90%',
    alignItems: 'center',
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
});