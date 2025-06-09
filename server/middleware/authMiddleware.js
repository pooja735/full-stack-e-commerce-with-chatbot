const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Temporary middleware that allows all requests
// TODO: Implement proper authentication
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token.substring(0, 20) + '...');
    }

    if (!token) {
      console.log('No token provided in headers:', req.headers);
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);

      const user = await User.findById(decoded.id);
      console.log('User found:', user ? { id: user._id, email: user.email, isAdmin: user.isAdmin } : 'null');
      
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Set the full user document in request
      req.user = user;
      
      console.log('User authenticated:', user.email, 'Admin:', user.isAdmin);
      next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, auth failed' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      console.log('No user in request');
      return res.status(401).json({ message: 'Not authorized, no user' });
    }

    if (!req.user.isAdmin) {
      console.log('User is not admin:', req.user.email);
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    console.log('Admin access granted for:', req.user.email);
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(401).json({ message: 'Not authorized, admin check failed' });
  }
};

module.exports = { protect, isAdmin };
