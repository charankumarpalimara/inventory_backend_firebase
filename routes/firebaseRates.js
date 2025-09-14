const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, checkRole } = require('../middleware/firebaseAuth');
const {
  getRates,
  updateRates,
  getRateHistory
} = require('../controllers/firebaseRateController');

// Get current rates (authenticated users)
router.get('/', verifyFirebaseToken, getRates);

// Update rates (admin/superadmin only)
router.put('/', verifyFirebaseToken, checkRole(['admin', 'superadmin']), updateRates);

// Get rate history (authenticated users)
router.get('/history', verifyFirebaseToken, getRateHistory);

module.exports = router;
