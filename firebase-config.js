// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGs1zifVt8EH4l8Op1J5TS3y4FsARFK6M",
  authDomain: "hangman-ab306.firebaseapp.com",
  projectId: "hangman-ab306",
  storageBucket: "hangman-ab306.appspot.com",
  messagingSenderId: "250412719350",
  appId: "1:250412719350:web:7632ec4d414b329f3d20d7",
  measurementId: "G-B8HFF6159K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
