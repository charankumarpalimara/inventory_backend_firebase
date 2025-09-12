const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, checkRole } = require('../middleware/firebaseAuth');
const {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getSalesAnalytics
} = require('../controllers/firebaseSalesController');

// Get all sales (authenticated users)
router.get('/', verifyFirebaseToken, getAllSales);

// Get sale by ID (authenticated users)
router.get('/:id', verifyFirebaseToken, getSaleById);

// Create sale (admin/worker only)
router.post('/', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), createSale);

// Update sale (admin/worker only)
router.put('/:id', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), updateSale);

// Delete sale (admin/worker only)
router.delete('/:id', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), deleteSale);

// Get sales analytics (authenticated users)
router.get('/analytics', verifyFirebaseToken, getSalesAnalytics);

module.exports = router;
