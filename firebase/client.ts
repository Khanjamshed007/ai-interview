// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBNCkxWp2NrAfaaVjwJNcimw5vhDeCRfQw",
  authDomain: "jdprep-465fa.firebaseapp.com",
  projectId: "jdprep-465fa",
  storageBucket: "jdprep-465fa.firebasestorage.app",
  messagingSenderId: "828321674075",
  appId: "1:828321674075:web:a12e050ba6075109f5a07e",
  measurementId: "G-RW86NBFY2G",
};

// Initialize Firebase
const app = !getApps?.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
