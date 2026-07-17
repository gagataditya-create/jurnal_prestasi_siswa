import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- KONFIGURASI FIREBASE USER ---
const firebaseConfig = {
  apiKey: "AIzaSyAbZcPJHnaARMEjg23iwViwtfzjwb23vKg",
  authDomain: "project-umum-a58eb.firebaseapp.com",
  projectId: "project-umum-a58eb",
  storageBucket: "project-umum-a58eb.firebasestorage.app",
  messagingSenderId: "778774567319",
  appId: "1:778774567319:web:1c2b35335ce1c3550bccd2"
};

// --- MENGHIDUPKAN MESIN ---
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- ERROR HANDLER BAGI FIRESTORE ---
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
