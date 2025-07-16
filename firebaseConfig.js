import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4eNqfU2Uceh3-QA4U3gkVOyKBsf5OpSo",
  authDomain: "mirrord-79259.firebaseapp.com",
  projectId: "mirrord-79259",
  storageBucket: "mirrord-79259.firebasestorage.app",
  messagingSenderId: "75248323458",
  appId: "1:75248323458:web:08fc4971b23c3477a71d9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;