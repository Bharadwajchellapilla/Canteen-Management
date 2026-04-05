import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuration with direct process.env mapping
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Debugging kosam (Optional): Browser console lo values vastunnayo ledo chudachhu
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing! Check your Vercel Environment Variables.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Instances
export const database = getDatabase(app);
export const auth = getAuth(app); 
export const storage = getStorage(app);

export default app;