import { Pressable, StyleSheet, Text } from 'react-native';

export default function CheckInButton({ onCheckIn }) {
  return (
    <Pressable
  style={styles.button}
  onPress={onCheckIn}
  accessibilityRole="button"
  accessibilityLabel="I'm OK"
  accessibilityHint="Records your daily check-in. If today's check-in is missed, your trusted contact will be notified according to your emergency plan."
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
    borderRadius: 100,
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});