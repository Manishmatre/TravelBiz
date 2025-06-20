const Agency = require('../models/Agency');
const User = require('../models/User');

// Get agency profile (for admins/agents of the agency)
exports.getAgencyProfile = async (req, res) => {
  try {
    const agency = await Agency.findById(req.user.agencyId)
      .select('-__v')
      .populate('owner', 'name email');

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    res.json(agency);
  } catch (error) {
    console.error('Error fetching agency profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update agency profile (admin only)
exports.updateAgencyProfile = async (req, res) => {
  try {
    // Only allow admins to update the agency profile
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update agency profile' });
    }

    const updates = {};
    const {
      name, description,
      address, phone, email, website,
      socialMedia, primaryColor, secondaryColor,
      businessHours
    } = req.body;

    // Basic info
    if (name) updates.name = name;
    if (description) updates.description = description;

    // Contact info
    if (address) updates.address = address;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;
    if (website) updates.website = website;

    // Social media
    if (socialMedia) updates.socialMedia = socialMedia;

    // Branding
    if (primaryColor) updates.primaryColor = primaryColor;
    if (secondaryColor) updates.secondaryColor = secondaryColor;
    if (req.file) {
      // Handle file upload (you'll need to implement this based on your file storage solution)
      // For example, if using Cloudinary:
      // const result = await cloudinary.uploader.upload(req.file.path);
      // updates.logo = result.secure_url;
      updates.logo = req.file.path; // Temporary, update with actual file URL
    }

    // Business hours
    if (businessHours) updates.businessHours = businessHours;

    // Update the agency
    const agency = await Agency.findByIdAndUpdate(
      req.user.agencyId,
      { $set: updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    res.json({ message: 'Agency profile updated successfully', agency });
  } catch (error) {
    console.error('Error updating agency profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get agency stats (for dashboard)
exports.getAgencyStats = async (req, res) => {
  try {
    const stats = {
      totalClients: 0,
      totalVehicles: 0,
      totalBookings: 0,
      activeBookings: 0,
    };

    // You can add more stats queries here based on your models
    // For example:
    // stats.totalClients = await Client.countDocuments({ agencyId: req.user.agencyId });
    // stats.totalVehicles = await Vehicle.countDocuments({ agencyId: req.user.agencyId });
    // etc.

    res.json(stats);
  } catch (error) {
    console.error('Error fetching agency stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
