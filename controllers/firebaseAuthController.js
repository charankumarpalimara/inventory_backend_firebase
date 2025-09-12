const { getAuth, getFirestore } = require('../config/firebase');

// Get current user info from Firebase
const getCurrentUser = async (req, res) => {
  try {
    const { uid } = req.user;
    const db = getFirestore();
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userDoc.data();
    
    res.json({
      success: true,
      user: {
        uid: uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Create user by admin (for user management)
const createUser = async (req, res) => {
  try {
    const { email, password, name, role = 'worker', phone = '' } = req.body;
    const auth = getAuth();
    const db = getFirestore();

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Save user data to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      role,
      phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email,
        name,
        role,
        phone
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, email } = req.body;
    const auth = getAuth();
    const db = getFirestore();

    // Update user in Firebase Auth if email changed
    if (email) {
      await auth.updateUser(id, {
        email,
        displayName: name
      });
    } else if (name) {
      await auth.updateUser(id, {
        displayName: name
      });
    }

    // Update user data in Firestore
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (email) updateData.email = email;

    await db.collection('users').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const auth = getAuth();
    const db = getFirestore();

    // Delete user from Firebase Auth
    await auth.deleteUser(id);

    // Delete user data from Firestore
    await db.collection('users').doc(id).delete();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const db = getFirestore();
    const usersSnapshot = await db.collection('users').get();
    
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
};

module.exports = {
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers
};
