'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getClientFirebase } from '@/firebase/client';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // getClientFirebase is a client-only function that provides the initialized services.
  const { app, auth, firestore } = getClientFirebase();

  return (
    <FirebaseProvider
      firebaseApp={app}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
