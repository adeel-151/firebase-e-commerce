import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuJxaZySiRpysP0gw0smCn5zSdPWZuRWc",
  authDomain: "e-commerce-3a5c4.firebaseapp.com",
  projectId: "e-commerce-3a5c4",
  storageBucket: "e-commerce-3a5c4.firebasestorage.app",
  messagingSenderId: "684513960280",
  appId: "1:684513960280:web:32f3b03cd2294d9db9452d",
  measurementId: "G-BJ332MQC0T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
