import { getStorage } from 'firebase/storage';
import { initializeFirebase } from './index';

const { firebaseApp } = initializeFirebase();

export const storage = getStorage(firebaseApp);
