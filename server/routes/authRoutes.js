const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create admin user if it's the first user
    const isFirstUser = (await User.countDocuments({})) === 0;
    const user = await User.create({
      name,
      email,
      password,
      isAdmin: isFirstUser // First user will be admin
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers
    });

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    console.log('User lookup result:', {
      found: !!user,
      email: email,
      userDetails: user ? {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        hasPassword: !!user.password,
        storedPassword: user.password // Only for debugging, remove in production
      } : null
    });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = user.matchPassword(password);
    console.log('Password comparison:', {
      enteredPassword: password,
      storedPassword: user.password,
      match: isMatch
    });

    if (!isMatch) {
      console.log('Login failed: Password does not match');
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = generateToken(user._id);
    console.log('Login successful, token generated');
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: token
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: 'User not found' });
  }
});

// Debug route to check users (remove in production)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    console.log('All users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Debug route to check specific user (remove in production)
router.get('/debug/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    console.log('User lookup result:', {
      found: !!user,
      email: req.params.email,
      userDetails: user ? {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        hasPassword: !!user.password,
        password: user.password // Only for debugging, remove in production
      } : null
    });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = router;
