const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'לא נמצא משתמש עם טוקן זה'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'טוקן לא תקין'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'טוקן פג תוקף'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'לא מורשה - טוקן לא תקין'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'לא מורשה - אין טוקן'
    });
  }
};

// Admin middleware (for future use)
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'לא מורשה - נדרשות הרשאות מנהל'
    });
  }
};

// Optional middleware - don't require authentication but get user if token exists
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid but continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = {
  protect,
  admin,
  optionalAuth
};