import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; // 👈 Idi add chey
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Nee config ikkada untundi...
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);    // 👈 Ee line kachithanga undali!
export const storage = getStorage(app);
export default app;