'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { StartupSplash } from '@/components/startup-splash';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // Initialize Firebase only in the browser, and only if it hasn't been initialized yet.
    if (typeof window !== 'undefined' && !firebaseServices) {
      const services = initializeFirebase();
      setFirebaseServices(services);
    }
  }, [firebaseServices]);

  if (!firebaseServices) {
    // Show branded splash screen while waiting for client-side Firebase initialization.
    // This prevents any child components from rendering and attempting to use Firebase prematurely.
    return <StartupSplash />;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
