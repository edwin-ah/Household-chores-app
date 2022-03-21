import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB13tMvmcujQEIRtLYH6leCv9h1-pT1-ig",
  authDomain: "household-chores-app.firebaseapp.com",
  projectId: "household-chores-app",
  storageBucket: "household-chores-app.appspot.com",
  messagingSenderId: "19764307867",
  appId: "1:19764307867:web:2a69499794efae3e21633e"
};

// init firebase app
initializeApp(firebaseConfig)

// init services
export const db = getFirestore()
export const auth = getAuth()
export const storage = getStorage()