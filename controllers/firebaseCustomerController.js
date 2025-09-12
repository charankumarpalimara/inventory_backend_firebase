const { getFirestore } = require('../config/firebase');

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const db = getFirestore();
    let query = db.collection('customers');

    if (search) {
      query = query.where('name', '>=', search).where('name', '<=', search + '\uf8ff');
    }

    // Get total count
    const snapshot = await query.get();
    const total = snapshot.size;

    // Apply pagination
    const startAfter = (page - 1) * limit;
    let paginatedQuery = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

    if (startAfter > 0) {
      const startAfterSnapshot = await query.orderBy('createdAt', 'desc').limit(startAfter).get();
      const lastDoc = startAfterSnapshot.docs[startAfterSnapshot.docs.length - 1];
      paginatedQuery = paginatedQuery.startAfter(lastDoc);
    }

    const customersSnapshot = await paginatedQuery.get();
    const customers = customersSnapshot.docs.map(doc => ({
      uid: doc.id,
      id: doc.id, // Keep both for compatibility
      ...doc.data()
    }));

    res.json({
      success: true,
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const doc = await db.collection('customers').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    res.json({
      success: true,
      customer: {
        uid: doc.id,
        id: doc.id, // Keep both for compatibility
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const db = getFirestore();
    const customerData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('customers').add(customerData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: {
        id: docRef.id,
        ...customerData
      }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await db.collection('customers').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    
    await db.collection('customers').doc(id).delete();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
