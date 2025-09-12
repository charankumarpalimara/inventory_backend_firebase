const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, checkRole } = require('../middleware/firebaseAuth');
const {
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers
} = require('../controllers/firebaseAuthController');

// Get current user (requires authentication)
router.get('/me', verifyFirebaseToken, getCurrentUser);

// Get all users (admin only)
router.get('/users', verifyFirebaseToken, checkRole(['admin', 'superadmin']), getAllUsers);

// Create user (admin only)
router.post('/users', verifyFirebaseToken, checkRole(['admin', 'superadmin']), createUser);

// Update user (admin only)
router.put('/users/:id', verifyFirebaseToken, checkRole(['admin', 'superadmin']), updateUser);

// Delete user (admin only)
router.delete('/users/:id', verifyFirebaseToken, checkRole(['admin', 'superadmin']), deleteUser);

module.exports = router;
