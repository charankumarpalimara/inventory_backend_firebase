const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const {
  getAnalytics
} = require('../controllers/firebaseAnalyticsController');

// Get comprehensive analytics (authenticated users)
router.get('/', verifyFirebaseToken, getAnalytics);

module.exports = router;
