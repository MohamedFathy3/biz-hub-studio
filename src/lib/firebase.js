// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDX4XGOyu3dy4wRCrUpoarPPtY6HlGp--k",
  authDomain: "chat-a3477.firebaseapp.com",
  projectId: "chat-a3477",
  storageBucket: "chat-a3477.firebasestorage.app",
  messagingSenderId: "721699029637",
  appId: "1:721699029637:web:611a08b476fd5bc6ea1fec",
  measurementId: "G-HNGX18QXEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);