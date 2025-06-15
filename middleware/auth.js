const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

// Middleware to authenticate JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }
    
    try {
      // Try to decode the token (which should be a base64 encoded string)
      const decodedData = Buffer.from(token, 'base64').toString();
      
      // Expected format is "userId:timestamp" or "userId:timestamp:admin" for admin tokens
      const parts = decodedData.split(':');
      
      if (parts.length < 1) {
        return res.status(401).json({ message: 'Invalid token format.' });
      }
      
      // Parse the user ID from the token
      const userId = parseInt(parts[0]);
      
      if (isNaN(userId) || userId <= 0) {
        return res.status(401).json({ message: 'Invalid user ID in token.' });
      }
      
      // Find user with this ID
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }
      
      // Check if this is an admin token
      const isAdminRequest = parts.length >= 3 && parts[2] === 'admin';
      
      // If this is an admin token but the user is not an admin, reject
      if (isAdminRequest && !user.is_admin) {
        return res.status(403).json({ message: 'Admin privileges required.' });
      }
      
      // Attach user to request
      req.user = {
        id: userId,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin
      };
      
      return next();
    } catch (err) {
      console.error('Token decode error:', err);
      return res.status(401).json({ message: 'Invalid token format or structure.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

// Middleware to check if the user is an admin
const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin privileges required.' });
  }
  next();
};

// Combined middleware for admin authentication
// This applies both auth check and admin check in sequence
const adminAuthMiddleware = [authMiddleware, adminMiddleware];

module.exports = { authMiddleware, adminMiddleware, adminAuthMiddleware }; 