const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes protected
router.use(protect);

// List all users in agency (admin, agent)
router.get('/', authorize('admin', 'agent'), userController.listUsers);
// Invite user (admin only)
router.post('/invite', authorize('admin'), userController.inviteUser);
// Remove user (admin only)
router.delete('/:id', authorize('admin'), userController.removeUser);
// Add this route for updating own profile
router.put('/me', userController.updateMe);

module.exports = router;
