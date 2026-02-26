import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBstwDEIau7YHLbgFhkLbod9OMkPw3Xgf4",
  authDomain: "iare-2204f.firebaseapp.com",
  projectId: "iare-2204f",
  storageBucket: "iare-2204f.firebasestorage.app",
  messagingSenderId: "962120096501",
  appId: "1:962120096501:web:2eec0d190a65ca499683bc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
