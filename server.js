const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeFirebase } = require('./config/firebase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration - Allow all origins for now
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin SDK
try {
  initializeFirebase();
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Routes
app.use('/api/firebase', require('./routes/firebaseAuth')); // Firebase auth routes
app.use('/api/jewelry', require('./routes/firebaseJewelry')); // Firebase jewelry routes
app.use('/api/sales', require('./routes/firebaseSales')); // Firebase sales routes
app.use('/api/customers', require('./routes/firebaseCustomers')); // Firebase customer routes
app.use('/api/rates', require('./routes/firebaseRates')); // Firebase rates routes
app.use('/api/analytics', require('./routes/firebaseAnalytics')); // Firebase analytics routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Jewelry Inventory API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
