const { getFirestore } = require('../config/firebase');

// Get all sales
const getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const db = getFirestore();
    let query = db.collection('sales');

    // Apply date filters
    if (startDate) {
      query = query.where('saleDate', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('saleDate', '<=', new Date(endDate));
    }

    // Get total count
    const snapshot = await query.get();
    const total = snapshot.size;

    // Apply pagination
    const startAfter = (page - 1) * limit;
    let paginatedQuery = query.orderBy('saleDate', 'desc').limit(parseInt(limit));

    if (startAfter > 0) {
      const startAfterSnapshot = await query.orderBy('saleDate', 'desc').limit(startAfter).get();
      const lastDoc = startAfterSnapshot.docs[startAfterSnapshot.docs.length - 1];
      paginatedQuery = paginatedQuery.startAfter(lastDoc);
    }

    const salesSnapshot = await paginatedQuery.get();
    const sales = salesSnapshot.docs.map(doc => ({
      uid: doc.id,
      id: doc.id, // Keep both for compatibility
      ...doc.data()
    }));

    res.json({
      success: true,
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get sale by ID
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const doc = await db.collection('sales').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sale not found' 
      });
    }

    res.json({
      success: true,
      sale: {
        uid: doc.id,
        id: doc.id, // Keep both for compatibility
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Get sale by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Create new sale
const createSale = async (req, res) => {
  try {
    const db = getFirestore();
    const saleData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('sales').add(saleData);

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      sale: {
        id: docRef.id,
        ...saleData
      }
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update sale
const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await db.collection('sales').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Sale updated successfully'
    });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Delete sale
const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    
    await db.collection('sales').doc(id).delete();

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = getFirestore();
    let query = db.collection('sales');

    if (startDate) {
      query = query.where('saleDate', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('saleDate', '<=', new Date(endDate));
    }

    const snapshot = await query.get();
    const sales = snapshot.docs.map(doc => doc.data());

    // Calculate analytics
    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalItems = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const totalTransactions = sales.length;
    const averageSaleValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    res.json({
      success: true,
      analytics: {
        totalSales,
        totalItems,
        totalTransactions,
        averageSaleValue
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getSalesAnalytics
};
