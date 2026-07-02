import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDpuykfrRv3uqtimvJcPQABroKwJk5Dyc",
  authDomain: "check-my-child.firebaseapp.com",
  projectId: "check-my-child",
  storageBucket: "check-my-child.firebasestorage.app",
  messagingSenderId: "64987968018",
  appId: "1:64987968018:web:55ef8993767091a28edecb"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);