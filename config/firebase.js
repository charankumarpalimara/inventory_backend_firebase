const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      const projectId = process.env.FIREBASE_PROJECT_ID || 'inventory-jewelry-firebase';
      
      // Initialize with service account key (recommended for production)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId
        });
      } else {
        // Initialize with default credentials (for development)
        // This will use Application Default Credentials (ADC)
        admin.initializeApp({
          projectId: projectId
        });
      }
      
      console.log('Firebase Admin SDK initialized successfully');
    }
    
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    console.log('Continuing without Firebase Admin SDK for development...');
    // Don't throw error in development, just log it
    return null;
  }
};

// Get Firebase Admin instance
const getFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    const firebaseAdmin = initializeFirebase();
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin SDK not initialized. Please check your Firebase configuration.');
    }
    return firebaseAdmin;
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
