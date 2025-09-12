const { getFirestore } = require('../config/firebase');

// Get all jewelry items
const getAllJewelry = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const db = getFirestore();
    let query = db.collection('jewelry');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }

    if (search) {
      // Note: Firestore doesn't support full-text search, so we'll do basic filtering
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

    const jewelrySnapshot = await paginatedQuery.get();
    const jewelry = jewelrySnapshot.docs.map(doc => ({
      uid: doc.id,
      id: doc.id, // Keep both for compatibility
      ...doc.data()
    }));

    res.json({
      success: true,
      jewelry,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get jewelry error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get jewelry by ID
const getJewelryById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const doc = await db.collection('jewelry').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Jewelry not found' 
      });
    }

    res.json({
      success: true,
      jewelry: {
        uid: doc.id,
        id: doc.id, // Keep both for compatibility
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Get jewelry by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Create new jewelry item
const createJewelry = async (req, res) => {
  try {
    const db = getFirestore();
    const jewelryData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('jewelry').add(jewelryData);

    res.status(201).json({
      success: true,
      message: 'Jewelry created successfully',
      jewelry: {
        id: docRef.id,
        ...jewelryData
      }
    });
  } catch (error) {
    console.error('Create jewelry error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update jewelry item
const updateJewelry = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await db.collection('jewelry').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Jewelry updated successfully'
    });
  } catch (error) {
    console.error('Update jewelry error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Delete jewelry item
const deleteJewelry = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    
    await db.collection('jewelry').doc(id).delete();

    res.json({
      success: true,
      message: 'Jewelry deleted successfully'
    });
  } catch (error) {
    console.error('Delete jewelry error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get jewelry categories
const getCategories = async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('jewelry').get();
    
    const categories = [...new Set(snapshot.docs.map(doc => doc.data().category).filter(Boolean))];

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getAllJewelry,
  getJewelryById,
  createJewelry,
  updateJewelry,
  deleteJewelry,
  getCategories
};
