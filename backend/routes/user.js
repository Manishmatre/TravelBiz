const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const User = require('../models/User');

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
// Add this route for updating the current user's profile
router.put('/me', userController.updateCurrentUser);
// Add this route for updating a user by ID (admin, agent)
router.put('/:id', authorize('admin', 'agent'), userController.updateUserById);
// Join agency (user can join any agency)
router.put('/:id/agency', async (req, res) => {
  try {
    const { agencyId } = req.body;
    const userId = req.params.id;
    
    // Check if user is updating their own agency or if admin is updating
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    if (!agencyId) {
      return res.status(400).json({ message: 'Agency ID is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { agencyId },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Successfully joined agency', user });
  } catch (error) {
    console.error('Error joining agency:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Upload a document for a user (driver)
router.post('/:id/documents', authorize('admin', 'agent'), upload.single('file'), userController.addUserDocument);
// Delete a document for a user (driver)
router.delete('/:id/documents/:docId', authorize('admin', 'agent'), userController.deleteUserDocument);
// Add this route for updating a user's photo (admin, agent)
router.put('/:id/photo', authorize('admin', 'agent'), upload.single('photo'), userController.updateUserPhoto);
// Add this route for updating the current user's profile photo
router.put('/me/photo', upload.single('photo'), userController.updateMyPhoto);

module.exports = router;
