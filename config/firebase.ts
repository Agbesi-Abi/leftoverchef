

// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBEzQ0Mp4BH9hvv_JgULabLk3-nT_Lv1E0",
  authDomain: "leftoverchef-a7985.firebaseapp.com", 
  projectId: "leftoverchef-a7985",
  storageBucket: "leftoverchef-a7985.firebasestorage.app",
  messagingSenderId: "578110656162",
  appId: "1:578110656162:web:26db08d710e3fbed1211fb",
  measurementId: "G-WHN9TZQEZS"
};

// const app = initializeApp(firebaseConfig);

// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// export { auth };




const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, db, auth };