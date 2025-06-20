const User = require('../models/User');
const Agency = require('../models/Agency');

// List all users in the current agency
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({ agencyId: req.user.agencyId }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Invite a new user to the agency (admin only)
exports.inviteUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) return res.status(400).json({ message: 'Name, email, and role are required' });
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    // Create user with random password (should send invite email in real SaaS)
    const password = Math.random().toString(36).slice(-8);
    const user = await User.create({ name, email, password, role, agencyId: req.user.agencyId });
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
      'address.street', 'address.city', 'address.state', 'address.country', 'address.postalCode'
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
