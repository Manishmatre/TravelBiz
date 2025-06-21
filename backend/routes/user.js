const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const User = require('../models/User');

// All routes are protected and require a valid token
router.use(protect);

// Routes for admin and agent roles
router.get('/', authorize('admin', 'agent'), userController.listUsers);
router.get('/:id', authorize('admin', 'agent'), userController.getUserById);
router.put('/:id', authorize('admin', 'agent'), userController.updateUserById);
router.delete('/:id', authorize('admin'), userController.removeUser);
router.post('/invite', authorize('admin'), userController.inviteUser);

// Routes for document and photo management (admin and agent roles)
router.post('/:id/documents', authorize('admin', 'agent'), upload.single('file'), userController.addUserDocument);
router.delete('/:id/documents/:docId', authorize('admin', 'agent'), userController.deleteUserDocument);
router.put('/:id/photo', authorize('admin', 'agent'), upload.single('photo'), userController.updateUserPhoto);

// Routes for the current user
router.put('/me', userController.updateCurrentUser);
router.put('/me/photo', upload.single('photo'), userController.updateMyPhoto);

// New route for driver dashboard
router.get('/driver/dashboard', userController.getDriverDashboard);

// Route for a user to join an agency
router.put('/:id/agency', async (req, res) => {
  try {
    const { agencyId } = req.body;
    const userId = req.params.id;

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

module.exports = router;
