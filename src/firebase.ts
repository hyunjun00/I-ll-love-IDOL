import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAHTKo6WaCCynbwQb2nR2P2bvVtDGR4sGc",
  authDomain: "i-llloveidol.firebaseapp.com",
  projectId: "i-llloveidol",
  storageBucket: "i-llloveidol.appspot.com",
  messagingSenderId: "15508393935",
  appId: "1:15508393935:web:fdf745cb7fe0bd3e24ccba"
};

const app = initializeApp(firebaseConfig);

export const auth=getAuth(app);

export const storage=getStorage(app);

export const db=getFirestore(app);