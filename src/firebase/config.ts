import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDAittuNjAXLLwOl-ruP0SbbClBLp6WcsE",
  authDomain: "web-pledge-wall.firebaseapp.com",
  projectId: "web-pledge-wall",
  storageBucket: "web-pledge-wall.firebasestorage.app",
  messagingSenderId: "1015461911889",
  appId: "1:1015461911889:web:afb31ade37323571874770",
  measurementId: "G-J387421HR3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app

