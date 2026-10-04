// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "byteai-3fde0.firebaseapp.com",
  projectId: "byteai-3fde0",
  storageBucket: "byteai-3fde0.firebasestorage.app",
  messagingSenderId: "536830081692",
  appId: "1:536830081692:web:3a29bfb03573d829f98b59",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// googleProvider.setCustomParameters({
//   prompt: "select_account",
// });
