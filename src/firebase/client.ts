// THIS IS A NEW FILE
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This function is exclusively for client-side execution.
function initializeClientApp() {
  if (getApps().length) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

// Memoize the initialized app
const app = initializeClientApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export function getClientFirebase(): { app: FirebaseApp; auth: Auth; firestore: Firestore } {
  return { app, auth, firestore };
}
