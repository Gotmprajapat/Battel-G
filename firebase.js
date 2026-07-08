import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDno0YmNMKaWHexZtaOIbs5FWvPUFsMcu0",
  authDomain: "profta-a85a6.firebaseapp.com",
  databaseURL: "https://profta-a85a6-default-rtdb.firebaseio.com",
  projectId: "profta-a85a6",
  storageBucket: "profta-a85a6.firebasestorage.app",
  messagingSenderId: "124370996303",
  appId: "1:124370996303:web:9ece8aaed23b92f7b66e3a",
  measurementId: "G-Q3018BMKK3"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export {
  app,
  auth,
  db,
  rtdb
};
