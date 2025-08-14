const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes - require authentication
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes - for future use
router.route('/admin/users')
  .get(protect, getAllUsers); // Remove admin middleware for now

router.route('/admin/users/:id')
  .delete(protect, deleteUser); // Remove admin middleware for now

module.exports = router;