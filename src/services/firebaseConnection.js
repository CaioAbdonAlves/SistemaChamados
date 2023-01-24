import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC7DgYJUn3Z8XRQXp_3cUWBR-aoFU4-M_0",
  authDomain: "sistema-4ecbe.firebaseapp.com",
  projectId: "sistema-4ecbe",
  storageBucket: "sistema-4ecbe.appspot.com",
  messagingSenderId: "711369414672",
  appId: "1:711369414672:web:72858fb590c87758b59295",
  measurementId: "G-DGDXB6G87L"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };