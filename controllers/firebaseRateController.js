const { getFirestore } = require('../config/firebase');

// Get current rates
const getRates = async (req, res) => {
  try {
    const db = getFirestore();
    const ratesDoc = await db.collection('settings').doc('rates').get();
    
    if (!ratesDoc.exists) {
      // Return default rates if no rates are set
      const defaultRates = {
        gold: { price: 5500, lastUpdated: new Date().toISOString() },
        silver: { price: 75, lastUpdated: new Date().toISOString() }
      };
      
      // Save default rates
      await db.collection('settings').doc('rates').set(defaultRates);
      
      return res.json({
        success: true,
        rates: defaultRates
      });
    }
    
    const rates = ratesDoc.data();
    res.json({
      success: true,
      rates
    });
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update rates
const updateRates = async (req, res) => {
  try {
    const { gold, silver } = req.body;
    const db = getFirestore();
    
    if (gold === undefined || silver === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Gold and silver rates are required'
      });
    }
    
    if (gold < 0 || silver < 0) {
      return res.status(400).json({
        success: false,
        message: 'Rates cannot be negative'
      });
    }
    
    const newRates = {
      gold: { 
        price: parseFloat(gold), 
        lastUpdated: new Date().toISOString() 
      },
      silver: { 
        price: parseFloat(silver), 
        lastUpdated: new Date().toISOString() 
      }
    };
    
    await db.collection('settings').doc('rates').set(newRates);
    
    res.json({
      success: true,
      message: 'Rates updated successfully',
      rates: newRates
    });
  } catch (error) {
    console.error('Update rates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get rate history
const getRateHistory = async (req, res) => {
  try {
    const db = getFirestore();
    const historySnapshot = await db.collection('rateHistory')
      .orderBy('timestamp', 'desc')
      .limit(30)
      .get();
    
    const history = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get rate history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getRates,
  updateRates,
  getRateHistory
};
