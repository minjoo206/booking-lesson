import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Check if Firebase config is valid
const isFirebaseConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId &&
         firebaseConfig.storageBucket &&
         firebaseConfig.messagingSenderId &&
         firebaseConfig.appId;
};

// Initialize Firebase only if config is valid
let app: FirebaseApp | undefined;
let auth: Auth | null;
let db: Firestore | null;

try {
  if (isFirebaseConfigValid()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn('Firebase configuration is incomplete. Firebase features will be disabled.');
    // Set to null to indicate Firebase is not available
    auth = null;
    db = null;
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  auth = null;
  db = null;
}

// Export Firebase services
export { auth, db };
export default app;
