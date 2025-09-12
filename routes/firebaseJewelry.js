const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, checkRole } = require('../middleware/firebaseAuth');
const {
  getAllJewelry,
  getJewelryById,
  createJewelry,
  updateJewelry,
  deleteJewelry,
  getCategories
} = require('../controllers/firebaseJewelryController');

// Get all jewelry (authenticated users)
router.get('/', verifyFirebaseToken, getAllJewelry);

// Get jewelry by ID (authenticated users)
router.get('/:id', verifyFirebaseToken, getJewelryById);

// Create jewelry (admin/worker only)
router.post('/', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), createJewelry);

// Update jewelry (admin/worker only)
router.put('/:id', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), updateJewelry);

// Delete jewelry (admin/worker only)
router.delete('/:id', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), deleteJewelry);

// Get categories (authenticated users)
router.get('/categories', verifyFirebaseToken, getCategories);

module.exports = router;
