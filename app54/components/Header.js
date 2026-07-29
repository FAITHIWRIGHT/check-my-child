import { StyleSheet, Text } from 'react-native';

export default function Header() {
  return (
    <Text style={styles.title}>
      Check My Child 💚 
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#096ec1',
  },
});