import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBn8d0bRAQ4gTAAbgPJPfS1edwkkyFzE6k",
  authDomain: "snapfix-b73c1.firebaseapp.com",
  projectId: "snapfix-b73c1",
  storageBucket: "snapfix-b73c1.firebasestorage.app",
  messagingSenderId: "147507324230",
  appId: "1:147507324230:web:7d9519b644cbabaa64f147",
  measurementId: "G-DKRMTQXSVD"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
