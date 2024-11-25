import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDGs1zifVt8EH4l8Op1J5TS3y4FsARFK6M",
  authDomain: "diagramflow-caacc.firebaseapp.com",
  projectId: "diagramflow-caacc",
  storageBucket: "diagramflow-caacc.firebasestorage.app",
  messagingSenderId: "250412719350",
  appId: "1:250412719350:web:7632ec4d414b329f3d20d7",
  measurementId: "G-B8HFF6159K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;
