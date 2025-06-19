const express = require('express');
const router = express.Router();
const Agency = require('../models/Agency');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');

// Create agency and link to user
router.post('/', protect, async (req, res) => {
  try {
    const { name, address, phone, website } = req.body;
    if (!name) return res.status(400).json({ message: 'Agency name is required' });
    const agency = new Agency({
      name,
      address,
      phone,
      website,
      owner: req.user._id
    });
    await agency.save();
    // Link user to agency
    await User.findByIdAndUpdate(req.user._id, { agencyId: agency._id });
    res.status(201).json(agency);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create agency' });
  }
});

module.exports = router;
