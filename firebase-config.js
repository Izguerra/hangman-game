// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGs1zifVt8EH4l8Op1J5TS3y4FsARFK6M",
  authDomain: "diagramflow-caacc.firebaseapp.com",
  projectId: "diagramflow-caacc",
  storageBucket: "diagramflow-caacc.firebasestorage.app",
  messagingSenderId: "250412719350",
  appId: "1:250412719350:web:7632ec4d414b329f3d20d7",
  measurementId: "G-B8HFF6159K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore for use in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
