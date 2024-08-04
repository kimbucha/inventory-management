import { initializeApp, getApps, getApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { collection, addDoc, doc, deleteDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { PantryItem } from './types';

// Initialize Firebase app and Firestore only on the client-side
let db: Firestore | null = null;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
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
  } else {
    db = getFirestore(getApp());
  }
}

export { db };

// Firestore operations

const getPantryCollection = () => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  return collection(db, 'pantryItems');
};

// Add a pantry item
export const addPantryItem = async (item: Omit<PantryItem, 'id'>) => {
  const pantryCollection = getPantryCollection();
  const docRef = await addDoc(pantryCollection, item);
  return docRef.id;
};

// Delete a pantry item
export const deletePantryItem = async (id: string) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, 'pantryItems', id);
  await deleteDoc(docRef);
};

// Update a pantry item
export const updatePantryItem = async (id: string, updatedItem: Partial<PantryItem>) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, 'pantryItems', id);
  await updateDoc(docRef, updatedItem);
};

// Fetch pantry items
export const fetchPantryItems = async (searchQuery: string): Promise<PantryItem[]> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
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
};
