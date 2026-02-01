// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXNo5CkkA3Nv0EkReI2x9bcVyiHMzRkgk",
  authDomain: "historia-869e8.firebaseapp.com",
  projectId: "historia-869e8",
  storageBucket: "historia-869e8.firebasestorage.app",
  messagingSenderId: "280278024339",
  appId: "1:280278024339:web:94ea894b89085d62a30d66",
  measurementId: "G-NFE6N031S9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional — only runs in browser)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firestore
export const db = getFirestore(app);

export { app, analytics };
