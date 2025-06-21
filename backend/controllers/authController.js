const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, agencyId: user.agencyId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, agencyId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password, role });
    const token = generateToken(user);
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, agencyId: user.agencyId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, agencyId: user.agencyId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  agencyId: user.agencyId
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 