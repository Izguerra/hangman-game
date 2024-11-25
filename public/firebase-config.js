// Your web app's Firebase configuration
// To get these values:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project
// 3. Click the web icon (</>)
// 4. Register your app if you haven't already
// 5. Copy the firebaseConfig object and replace the values below
const firebaseConfig = {
  apiKey: "AIzaSyB2uLF9zd4_Qdoa92-6qCkBbhsVBFCfvrY",
  authDomain: "hangman-ab306.firebaseapp.com",
  projectId: "hangman-ab306",
  storageBucket: "hangman-ab306.firebasestorage.app",
  messagingSenderId: "32978559333",
  appId: "1:32978559333:web:6eda302739e2c062b4018c",
  measurementId: "G-CJ6H1NWTF3"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};
