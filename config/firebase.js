const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Initialize with service account key (recommended for production)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      } else {
        // Initialize with default credentials (for development)
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      
      console.log('Firebase Admin SDK initialized successfully');
    }
    
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

// Get Firebase Admin instance
const getFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    return initializeFirebase();
  }
  return admin;
};

// Get Firestore instance
const getFirestore = () => {
  return getFirebaseAdmin().firestore();
};

// Get Auth instance
const getAuth = () => {
  return getFirebaseAdmin().auth();
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getFirestore,
  getAuth
};
