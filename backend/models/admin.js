const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('./User');
const PasswordRequest = require('./PasswordRequest');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new user
router.post('/create-user', adminAuth, [
  body('username').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['user', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this username or email already exists' 
      });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role
    });

    await user.save();

    res.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle user status (active/revoked)
router.put('/toggle-user-status/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'revoked'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change user password
router.put('/change-password/:userId', adminAuth, [
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get password reset requests
router.get('/password-requests', adminAuth, async (req, res) => {
  try {
    const requests = await PasswordRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get password requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark password request as resolved
router.put('/password-requests/:requestId/resolve', adminAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await PasswordRequest.findByIdAndUpdate(
      requestId,
      { 
        status: 'resolved',
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Resolve password request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;