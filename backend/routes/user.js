const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// All routes protected
router.use(protect);

// List all users in agency (admin, agent)
router.get('/', authorize('admin', 'agent'), userController.listUsers);
// Get a single user by ID (admin, agent)
router.get('/:id', authorize('admin', 'agent'), userController.getUserById);
// Invite user (admin only)
router.post('/invite', authorize('admin'), userController.inviteUser);
// Remove user (admin only)
router.delete('/:id', authorize('admin'), userController.removeUser);
// Add this route for updating own profile
router.put('/me', userController.updateMe);
// Add this route for updating a user by ID (admin, agent)
router.put('/:id', authorize('admin', 'agent'), userController.updateUserById);
// Upload a document for a user (driver)
router.post('/:id/documents', authorize('admin', 'agent'), upload.single('file'), userController.addUserDocument);
// Delete a document for a user (driver)
router.delete('/:id/documents/:docId', authorize('admin', 'agent'), userController.deleteUserDocument);
// Add this route for updating a user's photo (admin, agent)
router.put('/:id/photo', authorize('admin', 'agent'), upload.single('photo'), userController.updateUserPhoto);

module.exports = router;
