import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  get,
  query,
  orderByChild,
  equalTo,
  child,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDn1OTmejSt3k705cFoNFVaN0lX-t0sxlo",
  authDomain: "zeteny-test.firebaseapp.com",
  databaseURL:
    "https://zeteny-test-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zeteny-test",
  storageBucket: "zeteny-test.firebasestorage.app",
  messagingSenderId: "1048302485508",
  appId: "1:1048302485508:web:15f9180a68b97faee97551",
  measurementId: "G-E3H84LKM0D",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, push, set, onValue, get, query, orderByChild, equalTo, child };
