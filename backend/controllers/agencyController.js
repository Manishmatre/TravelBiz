const Agency = require('../models/Agency');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');

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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update agency profile' });
    }

    const {
      name, description, address, phone, email, website,
      socialMedia, primaryColor, secondaryColor, businessHours,
      licenseNumber, taxId, establishedDate, emergencyContact,
      coverImage, services, certifications
    } = req.body;

    const updates = {
      name, description, address, phone, email, website,
      socialMedia, primaryColor, secondaryColor, businessHours,
      licenseNumber, taxId, establishedDate, emergencyContact,
      coverImage, services, certifications
    };
    
    // Filter out undefined values to prevent overwriting existing data
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    // Handle file upload for logo
    if (req.files && req.files.logo) {
      updates.logo = req.files.logo[0].path;
    }
    // Handle file upload for cover image
    if (req.files && req.files.coverImage) {
      updates.coverImage = req.files.coverImage[0].path;
    }

    const agency = await Agency.findByIdAndUpdate(
      req.user.agencyId,
      { $set: updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    res.json(agency);
  } catch (error) {
    console.error('Error updating agency profile:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Get agency stats
exports.getAgencyStats = async (req, res) => {
  try {
    const agencyId = req.user.agencyId;
    
    const totalClients = await Client.countDocuments({ agencyId: agencyId });
    const totalVehicles = await Vehicle.countDocuments({ agencyId: agencyId });
    const totalBookings = await Booking.countDocuments({ agencyId: agencyId });
    const completedBookings = await Booking.countDocuments({ agencyId: agencyId, status: 'Completed' });

    res.json({
      totalClients,
      totalVehicles,
      totalBookings,
      completedBookings,
    });
  } catch (error) {
    console.error('Error fetching agency stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
