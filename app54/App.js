import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function App() {
const [lastCheckIn, setLastCheckIn] = useState ("Not checked in yet");
const [isProtected, setIsProtected] = useState(false);

return (
<View style={styles.container}>
<Text style={styles.title}>🩵 Check My Child</Text>

<Text style={styles.subtitle}>
Welcome to the first version of our app.
</Text>

<Text style={styles.message}>
Press the "I'm OK" button every day to let your trusted contacts know you're safe.
</Text> 
<Text style={styles.info}>

  Status: 🟢 Protected Today

</Text>
<Text style={styles.info}>

  Last Check-In: {lastCheckIn}
  
</Text>

<Pressable

  style={styles.button}

  onPress={() => {
    setLastCheckIn(new Date().toLocaleString()) ;
     setIsProtected(true) ;

    Alert.alert(

      "Check-In Successful",

      "You've checked in successfully. Your child is protected today. 💙"

    );

  }}
  >
  <Text style={styles.buttonText}>I'm OK</Text> 
</Pressable>

<StatusBar style="auto" />
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor:'#EAF7FF',
alignItems: 'center',
justifyContent: 'center',
padding: 25,
},
title: {
fontSize: 34,
fontWeight: 'bold',
color: '#0077CC',
marginBottom: 20,
},
subtitle: {
fontSize: 22,
textAlign: 'center',
marginBottom: 15,
},
message: {
fontSize: 18,
textAlign: 'center',
color: '#555',
marginBottom: 40,
},
button: {
backgroundColor: '#28A745',
paddingVertical: 18,
paddingHorizontal: 50,
borderRadius: 15,
},
buttonText: {
color: 'white',
fontSize: 24,
fontWeight: 'bold',
},
});
