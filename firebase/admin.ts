import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth"; // Use Admin SDK for Auth
import { getFirestore } from "firebase-admin/firestore"; // Use Admin SDK for Firestore

const initFirebaseAdmin = () => {
  const apps = getApps();

  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return {
    auth: getAuth(), // Admin SDK Auth
    db: getFirestore(), // Admin SDK Firestore
  };
};

export const { auth, db } = initFirebaseAdmin();