import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const mockData = {
  messages: {
    hello: {
      text: 'Hello World from Firestore (Mock)!',
      created_at: new Date().toISOString()
    }
  }
};

class MockFirestore {
  private data: any;

  constructor(initialData: any) {
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  collection(collectionName: string) {
    return {
      doc: (docId: string) => {
        return {
          get: async () => {
            const exists = this.data[collectionName] && this.data[collectionName][docId];
            return {
              exists,
              data: () => exists ? this.data[collectionName][docId] : null,
              id: docId
            };
          },
          set: async (data: any) => {
            if (!this.data[collectionName]) {
              this.data[collectionName] = {};
            }
            this.data[collectionName][docId] = { ...data };
            return true;
          }
        };
      }
    };
  }
}

let firebaseInitialized = false;
let firestoreDb: any;

export function initFirebase() {
  if (firebaseInitialized) {
    return;
  }

  try {
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_PRIVATE_KEY && 
        process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        } as admin.ServiceAccount),
      });
      firestoreDb = admin.firestore();
      console.log('Firebase initialized with service account');
    } else {
      console.log('Using mock Firestore database for development');
      firestoreDb = new MockFirestore(mockData);
    }
  } catch (error) {
    console.log('Error initializing Firebase, using mock database:', error);
    firestoreDb = new MockFirestore(mockData);
  }

  firebaseInitialized = true;
  
  if (!(firestoreDb instanceof MockFirestore)) {
    initDb();
  }
}

initFirebase();

async function initDb() {
  try {
    const helloRef = firestoreDb.collection('messages').doc('hello');
    const doc = await helloRef.get();
    
    if (!doc.exists) {
      await helloRef.set({
        text: 'Hello World from Firestore!',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Initialized database with Hello World message');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export const db = firestoreDb;
