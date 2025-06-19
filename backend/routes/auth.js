const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Signup
router.post('/signup', authController.signup);
// Login
router.post('/login', authController.login);
// Get current user (protected)
router.get('/me', protect, authController.getMe);

module.exports = router; 