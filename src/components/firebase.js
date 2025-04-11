// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAU0YLgm0W2X1ebd4g5PSH_oriuzvpp848",
  authDomain: "fotogen-80fd2.firebaseapp.com",
  projectId: "fotogen-80fd2",
  storageBucket: "fotogen-80fd2.firebasestorage.app",
  messagingSenderId: "916008518876",
  appId: "1:916008518876:web:b01b855c8364ccd5e7a019",
  measurementId: "G-5H08E4F04C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
export const db = getFirestore(app);