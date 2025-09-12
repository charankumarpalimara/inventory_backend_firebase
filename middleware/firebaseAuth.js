const { getAuth } = require('../config/firebase');

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided or invalid format' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: decodedToken.role || 'worker' // Default role
    };

    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check user role
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Get user role from Firestore
    const { getFirestore } = require('../config/firebase');
    const db = getFirestore();
    
    db.collection('users').doc(req.user.uid).get()
      .then(doc => {
        if (!doc.exists) {
          return res.status(403).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        const userData = doc.data();
        const userRole = userData.role || 'worker';

        if (allowedRoles.includes(userRole)) {
          req.user.role = userRole;
          next();
        } else {
          res.status(403).json({ 
            success: false, 
            message: 'Insufficient permissions' 
          });
        }
      })
      .catch(error => {
        console.error('Error checking user role:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error checking permissions' 
        });
      });
  };
};

module.exports = {
  verifyFirebaseToken,
  checkRole
};
