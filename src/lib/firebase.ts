import { initializeApp, getApps } from 'firebase/app';
import { Firestore, getFirestore, collection, addDoc, doc, deleteDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { PantryItem } from './types';

let db: Firestore | undefined;

if (typeof window !== 'undefined' && !getApps().length) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

const pantryCollection = db ? collection(db, 'pantryItems') : null;

export { db };

// Add a pantry item
export const addPantryItem = async (item: Omit<PantryItem, 'id'> & { expiryDate: string }) => {
  if (pantryCollection) {
    const docRef = await addDoc(pantryCollection, item);
    return docRef.id;
  }
  throw new Error('Firestore is not initialized');
};

// Delete a pantry item
export const deletePantryItem = async (id: string) => {
  if (db) {
    const docRef = doc(db, 'pantryItems', id);
    await deleteDoc(docRef);
  } else {
    throw new Error('Firestore is not initialized');
  }
};

// Update a pantry item
export const updatePantryItem = async (id: string, updatedItem: Partial<PantryItem> & { expiryDate: string }) => {
  if (db) {
    const docRef = doc(db, 'pantryItems', id);
    await updateDoc(docRef, updatedItem);
  } else {
    throw new Error('Firestore is not initialized');
  }
};

// Fetch pantry items
export const fetchPantryItems = async (searchQuery: string): Promise<PantryItem[]> => {
  if (db) {
    const q = query(
      collection(db, 'pantryItems'),
      where('name', '>=', searchQuery),
      where('name', '<=', searchQuery + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as PantryItem[];
  }
  throw new Error('Firestore is not initialized');
};
