import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDpuykfrRv3uqtimvJcPQABroKwJk5Dyc",
  authDomain: "check-my-child.firebaseapp.com",
  projectId: "check-my-child",
  storageBucket: "check-my-child.firebasestorage.app",
  messagingSenderId: "64987968018",
  appId: "1:64987968018:web:55ef8993767091a28edecb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);