const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, checkRole } = require('../middleware/firebaseAuth');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/firebaseCustomerController');

// Get all customers (authenticated users)
router.get('/', verifyFirebaseToken, getAllCustomers);

// Get customer by ID (authenticated users)
router.get('/:id', verifyFirebaseToken, getCustomerById);

// Create customer (admin/worker only)
router.post('/', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), createCustomer);

// Update customer (admin/worker only)
router.put('/:id', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), updateCustomer);

// Delete customer (admin/worker only)
router.delete('/:id', verifyFirebaseToken, checkRole(['admin', 'superadmin', 'worker']), deleteCustomer);

module.exports = router;
