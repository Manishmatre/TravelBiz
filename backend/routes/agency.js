const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const agencyController = require('../controllers/agencyController');
const upload = require('../middlewares/upload');
const Agency = require('../models/Agency'); // Agency model
const User = require('../models/User'); // User model

// Apply protect middleware to all routes
router.use(protect);

// Create agency and link to user
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, website } = req.body;
    if (!name) return res.status(400).json({ message: 'Agency name is required' });
    
    // Check if user already has an agency
    const existingAgency = await Agency.findOne({ owner: req.user._id });
    if (existingAgency) {
      return res.status(400).json({ message: 'You already have an agency' });
    }
    
    const agency = new Agency({
      name,
      address,
      phone,
      website,
      owner: req.user._id,
      email: req.user.email // Use user's email as default agency email
    });
    
    await agency.save();
    
    // Link user to agency and set as admin
    await User.findByIdAndUpdate(req.user._id, { 
      agencyId: agency._id,
      role: 'admin' // Set user as admin of this agency
    });
    
    res.status(201).json(agency);
  } catch (error) {
    console.error('Error creating agency:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get agency profile (admin/agent)
router.get('/profile', authorize('admin', 'agent'), agencyController.getAgencyProfile);

// Update agency profile (admin only)
router.put(
  '/profile',
  authorize('admin'),
  upload.single('logo'),  // Handle file upload if present
  agencyController.updateAgencyProfile
);

// Get agency stats (for dashboard)
router.get('/stats', authorize('admin', 'agent'), agencyController.getAgencyStats);

module.exports = router;
