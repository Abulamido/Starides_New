import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function initializeServerFirebase() {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return {
        firestore: getFirestore(app),
        auth: getAuth(app),
        app
    };
}
