const User = require('../models/User');
const Agency = require('../models/Agency');
const mongoose = require('mongoose');

// List all users in the current agency, with optional role filter
exports.listUsers = async (req, res) => {
  try {
    const filter = { agencyId: req.user.agencyId };
    if (req.query.role) {
      filter.role = req.query.role;
    }
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Invite a new user to the agency (admin only)
exports.inviteUser = async (req, res) => {
  try {
    const {
      name, email, role, licenseNumber, licenseExpiry, assignedVehicle, documents,
      phone, gender, joiningDate, address, status, dateOfBirth, avatarUrl,
      nationality, passportNumber, emergencyContact, assignedAgent, bookings, notes
    } = req.body;
    if (!name || !email || !role) return res.status(400).json({ message: 'Name, email, and role are required' });
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    // Create user with random password (should send invite email in real SaaS)
    const password = Math.random().toString(36).slice(-8);
    const user = await User.create({
      name,
      email,
      password,
      role,
      agencyId: req.user.agencyId,
      licenseNumber,
      licenseExpiry,
      assignedVehicle,
      documents,
      phone,
      gender,
      joiningDate,
      address,
      status,
      dateOfBirth,
      avatarUrl,
      nationality,
      passportNumber,
      emergencyContact,
      assignedAgent,
      bookings,
      notes
    });
    // TODO: Send invite email with password reset link
    res.status(201).json({ message: 'User invited', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove a user from the agency (admin only)
exports.removeUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!user) return res.status(404).json({ message: 'User not found in your agency' });
    // Prevent removing self
    if (String(user._id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot remove yourself' });
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update own profile
exports.updateMe = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'avatarUrl', 'phone', 'dateOfBirth', 'gender',
      'jobTitle', 'department', 'employeeId', 'joiningDate', 'skills', 'linkedin', 'resume',
      // Deprecated single bank fields
      'bankHolder', 'bankName', 'account', 'ifsc', 'upi', 'pan', 'salary',
      // New multi-bank/payment fields
      'bankAccounts', 'paymentMethods',
      'twofa', 'emailVerified', 'notifications', 'language', 'theme', 'privacy',
      // Address fields
      'address.street', 'address.city', 'address.state', 'address.country', 'address.postalCode',
      'nationality', 'passportNumber', 'emergencyContact', 'assignedAgent', 'bookings', 'notes'
    ];
    const updates = {};
    allowedFields.forEach(field => {
      if (field.startsWith('address.')) {
        const key = field.split('.')[1];
        if (!updates.address) updates.address = {};
        if (req.body.address && req.body.address[key] !== undefined) updates.address[key] = req.body.address[key];
      } else if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a single user by ID (agency-restricted)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, agencyId: req.user.agencyId })
      .select('-password')
      .populate('assignedVehicle', 'name numberPlate');
    if (!user) return res.status(404).json({ message: 'User not found in your agency' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a user by ID (admin/agent, agency-restricted)
exports.updateUserById = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'email', 'phone', 'licenseNumber', 'licenseExpiry', 'assignedVehicle',
      'documents', 'gender', 'joiningDate', 'address', 'status', 'dateOfBirth', 'avatarUrl',
      'nationality', 'passportNumber', 'emergencyContact', 'assignedAgent', 'bookings', 'notes'
    ];
    const updates = {};
    allowedFields.forEach(field => {
      if (field === 'address') {
        if (req.body.address) updates.address = req.body.address;
      } else if (field === 'assignedVehicle') {
        // Only set assignedVehicle if it is a valid ObjectId
        if (req.body.assignedVehicle && mongoose.Types.ObjectId.isValid(req.body.assignedVehicle)) {
          updates.assignedVehicle = req.body.assignedVehicle;
        }
        // Otherwise, do not set assignedVehicle (prevents empty string error)
      } else if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, agencyId: req.user.agencyId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found in your agency' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add a document to a user (driver)
exports.addUserDocument = async (req, res) => {
  try {
    console.log('addUserDocument req.file:', req.file);
    console.log('addUserDocument req.body:', req.body);
    const user = await User.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!req.file || !req.file.path) return res.status(400).json({ message: 'File is required' });
    const { type, expiryDate } = req.body;
    const url = req.file.path || req.file.filename || req.file.url;
    const doc = {
      type,
      expiryDate,
      url,
    };
    user.documents.push(doc);
    await user.save();
    res.status(201).json(user.documents[user.documents.length - 1]);
  } catch (err) {
    console.error('addUserDocument error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete a document from a user (driver)
exports.deleteUserDocument = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const doc = user.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.remove();
    await user.save();
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add/update user photo (avatar)
exports.updateUserPhoto = async (req, res) => {
  try {
    console.log('updateUserPhoto called:', {
      params: req.params,
      user: req.user,
      file: req.file,
    });
    const user = await User.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!user) {
      console.error('User not found or agency mismatch', { userId: req.params.id, agencyId: req.user.agencyId });
      return res.status(404).json({ message: 'User not found in your agency', userId: req.params.id, agencyId: req.user.agencyId });
    }
    if (!req.file || !req.file.path) return res.status(400).json({ message: 'Photo file is required' });
    // Save only the relative URL for frontend access
    const filename = req.file.filename;
    user.avatarUrl = '/uploads/' + filename;
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    console.error('updateUserPhoto error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Add this controller to allow users to update their own profile
exports.updateCurrentUser = async (req, res) => {
  try {
    // Only allow updating certain fields for self-update
    const allowedFields = [
      'name', 'email', 'phone', 'avatarUrl', 'jobTitle', 'department', 'employeeId',
      'joiningDate', 'skills', 'linkedin', 'resume', 'bankHolder', 'bankName', 'account',
      'ifsc', 'upi', 'pan', 'salary', 'language', 'theme', 'privacy', 'address',
      'dateOfBirth', 'gender', 'licenseNumber', 'licenseExpiry', 'nationality',
      'passportNumber', 'emergencyContact', 'notes'
    ];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add/update current user's photo (avatar)
exports.updateMyPhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!req.file || !req.file.path) return res.status(400).json({ message: 'Photo file is required' });
    user.avatarUrl = '/uploads/' + req.file.filename;
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
