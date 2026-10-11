import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config. These values identify your project and are safe to ship in
// browser code. Access is protected by your Firebase Authentication settings.
const firebaseConfig = {
  apiKey: "AIzaSyCUKRaYo-pHwMaCuTTq5vWfZQHnmm__aTk",
  authDomain: "fir-938b7.firebaseapp.com",
  projectId: "fir-938b7",
  storageBucket: "fir-938b7.firebasestorage.app",
  messagingSenderId: "762045597003",
  appId: "1:762045597003:web:fd608dd4420f8e2662d4ce",
  measurementId: "G-ZY8V8LLSPN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
