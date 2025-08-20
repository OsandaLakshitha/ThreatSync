const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./models/admin');

// Import database config
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB().then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// Routes
app.use('/api/scan', require('./routes/scan'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/threats', require('./routes/threats'));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Your existing stats route (from your dashboard)
app.get('/api/stats', async (req, res) => {
  try {
    // This is a placeholder - integrate with your existing stats logic
    res.json({
      success: true,
      data: {
        totalScans: 1247,
        threatsBlocked: 892,
        criticalThreats: 45,
        highThreats: 123
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});